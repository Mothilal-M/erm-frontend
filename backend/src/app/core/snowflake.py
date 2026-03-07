"""Snowflake ID helpers powered by InjectQ factories."""

from __future__ import annotations

from typing import NewType

from injectq import InjectQ
from snowflakekit import SnowflakeGenerator

from src.app.core.di import container


SnowflakeID = NewType("SnowflakeID", int)


async def snowflake_id_factory(generator: SnowflakeGenerator) -> SnowflakeID:
    """Factory bound in DI that produces a fresh Snowflake ID each call."""

    return SnowflakeID(await generator.generate())


async def generate_snowflake_id(*, di_container: InjectQ | None = None) -> SnowflakeID:
    """Convenience helper to request a Snowflake ID via the InjectQ factory."""

    active_container = di_container or container
    return await active_container.aget(SnowflakeID)


__all__ = [
    "SnowflakeID",
    "generate_snowflake_id",
    "snowflake_id_factory",
]
