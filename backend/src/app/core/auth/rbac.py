from collections.abc import Callable

from fastapi import Depends

from src.app.core.auth.authentication import get_current_user
from src.app.core.exceptions import UserPermissionError
from src.app.utils.schemas import AuthUserSchema


def require_role(*allowed_roles: str) -> Callable:
    """
    FastAPI dependency factory that enforces role-based access.

    Usage:
        user: AuthUserSchema = Depends(require_role("admin", "manager"))
    """

    def role_checker(
        user: AuthUserSchema = Depends(get_current_user),
    ) -> AuthUserSchema:
        if user.role not in allowed_roles:
            allowed = ", ".join(allowed_roles)
            raise UserPermissionError(
                message=f"Role '{user.role}' is not authorized. Required: {allowed}"
            )
        return user

    return role_checker
