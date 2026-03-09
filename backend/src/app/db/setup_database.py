from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise

from src.app.core import get_settings, logger
from src.app.db.tables.erm_constants import ERM_TABLES


def get_database_config():
    """
    Generate PostgreSQL database configuration for Tortoise ORM.

    Returns:
        dict: Database connection configuration for Tortoise ORM.
    """
    settings = get_settings()

    logger.info(f"Using PostgreSQL database at: {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}")
    return {
        "engine": "tortoise.backends.asyncpg",
        "credentials": {
            "host": settings.POSTGRES_HOST,
            "port": settings.POSTGRES_PORT,
            "user": settings.POSTGRES_USER,
            "password": settings.POSTGRES_PASSWORD,
            "database": settings.POSTGRES_DB,
            "schema": settings.POSTGRES_SCHEMA,
            "minsize": 1,
            "maxsize": 5,
            "max_inactive_connection_lifetime": 300,
            "max_queries": 50000,
        },
    }


TORTOISE_ORM = {
    "connections": {
        "master": get_database_config(),
    },
    "routers": ["src.app.db.router.Router"],
    "apps": {
        "tables": {
            "models": [*ERM_TABLES, "aerich.models"],
            "default_connection": "master",
        },
    },
}


def setup_db(app: FastAPI):
    """
    Set up the database for the FastAPI application using Tortoise ORM.

    This function initializes the Tortoise ORM with the given FastAPI application.
    It registers the Tortoise ORM with the application using the provided configuration.

    Args:
        app (FastAPI): The FastAPI application instance to set up the database for.

    Returns:
        None
    """
    # init tortoise orm
    register_tortoise(
        app,
        config=TORTOISE_ORM,
        generate_schemas=True,
        add_exception_handlers=False,
    )

    logger.info("Database setup complete")
