from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from fastapi import APIRouter


def get_router() -> "APIRouter":
    from .router import router as _router

    return _router


__all__ = ["get_router"]
