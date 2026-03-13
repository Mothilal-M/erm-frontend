from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import ORJSONResponse
from injectq.integrations.fastapi import setup_fastapi
from redis.asyncio import Redis
from snowflakekit import SnowflakeConfig, SnowflakeGenerator
from tortoise import Tortoise

from src.app.core import get_settings, init_errors_handler, init_logger, setup_middleware
from src.app.core.auth.firebase_setup import init_firebase
from src.app.core.di import container, ensure_app_modules
from src.app.core.snowflake import SnowflakeID, snowflake_id_factory
from src.app.db import setup_db
from src.app.routers import init_routes


settings = get_settings()
redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the cache
    # RedisCacheBackend(settings.REDIS_URL)
    yield
    # Clean up
    # await close_caches()
    # close all the connections
    await Tortoise.close_connections()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.MODE == "DEVELOPMENT",
    summary=settings.SUMMARY,
    docs_url="/docs",
    redoc_url="/redocs",
    root_path="/erm-service",
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)

ensure_app_modules()
setup_fastapi(container, app)
setup_middleware(app)

# init Firebase Admin SDK
init_firebase()

setup_db(app)

init_logger(settings.LOG_LEVEL)

# init error handler
init_errors_handler(app)

# init routes
init_routes(app)


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

container.bind_instance(SnowflakeConfig, config)
container.bind_factory(SnowflakeGenerator, create_snowflake_generator)
container.bind_factory(SnowflakeID, snowflake_id_factory)
container.bind_instance(Redis, redis_client)
