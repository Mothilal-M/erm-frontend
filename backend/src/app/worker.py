import os

from injectq.integrations.taskiq import setup_taskiq
from redis.asyncio import Redis
from snowflakekit import SnowflakeConfig, SnowflakeGenerator
from taskiq import (
    InMemoryBroker,
    SimpleRetryMiddleware,
    TaskiqEvents,
    TaskiqState,
)
from taskiq_redis import ListQueueBroker, RedisAsyncResultBackend
from tortoise import Tortoise

from src.app.core import get_settings, logger
from src.app.core.config.worker_middleware import MonitoringMiddleware
from src.app.core.di import container, ensure_app_modules
from src.app.core.snowflake import SnowflakeID, snowflake_id_factory
from src.app.db import TORTOISE_ORM
from src.tests.task_tests.setup import register_fake_repos


env = os.environ.get("ENVIRONMENT")
_IS_TEST = env and env == "pytest"

settings = get_settings()

redis_async_result = RedisAsyncResultBackend(
    redis_url=settings.REDIS_URL,
)

# Or you can use PubSubBroker if you need broadcasting
broker = ListQueueBroker(
    url=settings.REDIS_URL,
    queue_name=f"{settings.APP_NAME}-queue",
).with_result_backend(redis_async_result)
broker.add_middlewares(
    [
        MonitoringMiddleware(),
        SimpleRetryMiddleware(default_retry_count=3),
        # PrometheusMiddleware(server_addr="0.0.0.0", server_port=9000),
    ]
)

# this is for testing
if _IS_TEST:
    broker = InMemoryBroker()

redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    # password=settings.REDIS_PASSWORD,
    # db=settings.REDIS_DB,
)


# Setup id generator
def create_snowflake_generator(config: SnowflakeConfig) -> SnowflakeGenerator:
    return SnowflakeGenerator(config=config)


config = SnowflakeConfig(
    epoch=1609459200000,
    node_id=1,
    worker_id=1,
    time_bits=39,
    node_bits=5,
    worker_bits=8,
)

ensure_app_modules()
setup_taskiq(container, broker)
if _IS_TEST:
    register_fake_repos(container)

# save into container
container.bind_instance(SnowflakeConfig, config)
container.bind_factory(SnowflakeGenerator, create_snowflake_generator)
container.bind_factory(SnowflakeID, snowflake_id_factory)
container.bind_instance(Redis, redis_client)


@broker.on_event(TaskiqEvents.WORKER_STARTUP)
async def startup(state: TaskiqState) -> None:
    if _IS_TEST:
        return
    await redis_client.ping()
    logger.info("Got redis connection")
    # setup database
    await Tortoise.init(config=TORTOISE_ORM)


@broker.on_event(TaskiqEvents.WORKER_SHUTDOWN)
async def shutdown(state: TaskiqState) -> None:
    if _IS_TEST:
        return
    # Here we close our pool on shutdown event.
    state.redis.disconnect()
    await Tortoise.close_connections()
