from pydantic import BaseModel

from src.app.core.exceptions import UserAccountError
from src.app.db.tables.erm_tables import EmployeeTable
from src.app.utils.schemas import AuthUserSchema


class ResolvedEmployee(BaseModel):
    """Minimal employee identity returned by resolve_employee."""

    id: int


async def resolve_employee(user: AuthUserSchema) -> ResolvedEmployee:
    """Resolves the employee ID for an authenticated user.

    Uses the email from the Firebase token to look up the employee.
    Intended to be called from service layer, not as a FastAPI dependency.

    Args:
        user (AuthUserSchema): The authenticated user's profile.

    Returns:
        ResolvedEmployee: The employee's ID.

    Raises:
        UserAccountError: If no employee record found for this user.
    """
    employee = await EmployeeTable.filter(email=user.email, status=True).first()
    if not employee:
        raise UserAccountError(
            message="No employee record found for this user",
            error_code="EMPLOYEE_NOT_FOUND",
        )
    return ResolvedEmployee(id=employee.id)
