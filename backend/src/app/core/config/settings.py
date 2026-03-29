import logging
import os
from functools import lru_cache

from pydantic_settings import BaseSettings


IS_PRODUCTION = False
# TODO: Change the logger name to the appropriate name
LOGGER_NAME = os.getenv("LOGGER_NAME", "backend_base")

logger = logging.getLogger(LOGGER_NAME)


class Settings(BaseSettings):
    """
    This class defines the configuration settings for the application.

    Attributes:
        APP_NAME (str): The name of the application.
        APP_VERSION (str): The version of the application.
        MODE (str): The mode in which the application is running (e.g., development, production).
        LOG_LEVEL (int): The logging level for the application.
        SUMMARY (str): A brief summary of the application. Default is "Backend Base".

        ORIGINS (str): CORS allowed origins.
        ALLOWED_HOST (str): CORS allowed hosts.

        POSTGRES_HOST (str | None): The hostname for the PostgreSQL database.
        POSTGRES_USER (str | None): The username for the PostgreSQL database.
        POSTGRES_PASSWORD (str | None): The password for the PostgreSQL database.
        POSTGRES_DB (str | None): The database name for the PostgreSQL database.
        POSTGRES_PORT (str | None): The port for the PostgreSQL database.

        REDIS_URL (str): The URL for the Redis server.

        OPENAI_API_KEY (str): The API key for OpenAI.

        SENTRY_DSN (str): The DSN for Sentry error tracking.

    Config:
        extra (str): Configuration for handling extra fields. Default is "allow".
    """

    APP_NAME: str
    APP_VERSION: str
    MODE: str
    # CRITICAL = 50
    # FATAL = CRITICAL
    # ERROR = 40
    # WARNING = 30
    # WARN = WARNING
    # INFO = 20
    # DEBUG = 10
    # NOTSET = 0
    LOG_LEVEL: int

    SUMMARY: str = "Backend Base"

    #################################
    ###### CORS Config ##############
    #################################
    ORIGINS: str
    ALLOWED_HOST: str

    #################################
    ###### Database Config ##########
    #################################
    POSTGRES_HOST: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "erm"
    POSTGRES_PORT: str = "5432"
    POSTGRES_SCHEMA: str = "erm"

    #################################
    ###### REDIS Config ##########
    #################################
    REDIS_URL: str
    REDIS_HOST: str
    REDIS_PORT: int
    ###############################
    # OPEN AI
    ###############################
    OPENAI_API_KEY: str

    ###############################
    # GEMINI
    ###############################
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TEMPERATURE: float = 0.4
    GEMINI_MAX_OUTPUT_TOKENS: int = 2048

    #################################
    ###### sentry Config ############
    #################################
    SENTRY_DSN: str

    #################################
    ###### Firebase Config ##########
    #################################
    FIREBASE_CREDENTIALS_PATH: str = "./firebase-credentials.json"

    #################################
    ###### ERM Config ###############
    #################################
    DEFAULT_EMPLOYEE_ID: int = 1

    class Config:
        extra = "allow"


@lru_cache
def get_settings() -> Settings:
    """
    Retrieve and return the application settings.
    If not in production, load settings from a specific environment file.
    Returns:
        Settings: An instance of the Settings class containing
        application configurations.
    """
    if not IS_PRODUCTION:
        logger.info("Loading settings from .env file")
        return Settings(
            _env_file="./.env",
        )

    logger.debug("Loading settings from environment variables")
    return Settings()
