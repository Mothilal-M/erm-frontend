from typing import TYPE_CHECKING


if TYPE_CHECKING:  # pragma: no cover - only for typing hints
    from fastapi import FastAPI


def init_routes(app: "FastAPI") -> None:
    """Lazy-load router wiring to avoid circular imports."""

    from .setup_router import init_routes as _init_routes

    _init_routes(app)


__all__ = ["init_routes"]
