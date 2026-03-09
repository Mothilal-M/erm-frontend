from fastapi import FastAPI

from src.app.routers.attendance import get_router as get_attendance_router
from src.app.routers.auth import get_router as get_auth_router
from src.app.routers.employee_management import get_router as get_employee_router
from src.app.routers.leave import get_router as get_leave_router


def init_routes(app: FastAPI):
    """
    Initialize the routes for the FastAPI application.

    Args:
        app (FastAPI): The FastAPI application instance to which the routes
        will be added.
    """
    app.include_router(get_auth_router())
    app.include_router(get_employee_router())
    app.include_router(get_attendance_router())
    app.include_router(get_leave_router())
