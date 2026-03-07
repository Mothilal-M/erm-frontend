import pytest
from injectq.testing import test_container as injectq_test_container

from src.app.core.snowflake import (
    SnowflakeID,
    generate_snowflake_id,
    snowflake_id_factory,
)


class _StubSnowflakeGenerator:
    """Simple stub mirroring the snowflakekit generator api for tests."""

    def __init__(self, value: int):
        self._value = value

    async def generate(self) -> int:
        return self._value


@pytest.mark.asyncio
async def test_snowflake_id_factory_returns_wrapped_int():
    generator = _StubSnowflakeGenerator(42)

    result = await snowflake_id_factory(generator)  # type: ignore[arg-type]

    assert isinstance(result, int)
    assert result == SnowflakeID(42)


@pytest.mark.asyncio
async def test_generate_snowflake_id_uses_container_factory():
    with injectq_test_container() as temp_container:

        async def fake_factory() -> SnowflakeID:
            return SnowflakeID(77)

        temp_container.bind_factory(SnowflakeID, fake_factory)

        result = await generate_snowflake_id(di_container=temp_container)

        assert result == SnowflakeID(77)
