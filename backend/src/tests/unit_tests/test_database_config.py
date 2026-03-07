"""
Test database configuration and setup.
"""

import pytest

from src.app.core.config.settings import get_settings
from src.app.db.setup_database import get_database_config


def test_sqlite_config():
    """Test SQLite database configuration."""
    settings = get_settings()

    # Ensure we're using SQLite for tests
    assert settings.DATABASE_TYPE.lower() == "sqlite"

    # Get database config
    config = get_database_config()

    # Verify SQLite engine is configured
    assert config["engine"] == "tortoise.backends.sqlite"
    assert "file_path" in config["credentials"]


def test_database_config_structure():
    """Test that database config has required structure."""
    config = get_database_config()

    # All database configs should have engine and credentials
    assert "engine" in config
    assert "credentials" in config
    assert isinstance(config["credentials"], dict)


@pytest.mark.skip(reason="PostgreSQL not configured in test environment")
def test_postgresql_config():
    """Test PostgreSQL database configuration (skip if not configured)."""
    # This test would run when DATABASE_TYPE=postgresql
    # Keeping it here for reference when switching to PostgreSQL
    config = get_database_config()
    assert config["engine"] == "tortoise.backends.asyncpg"
    assert all(
        key in config["credentials"] for key in ["host", "port", "user", "password", "database"]
    )
