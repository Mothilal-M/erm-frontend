from fastapi import Depends

from src.app.core.auth.authentication import get_current_user
from src.app.core.exceptions import UserAccountError
from src.app.db.tables.erm_tables import EmployeeTable
from src.app.utils.schemas import AuthUserSchema


async def get_authenticated_employee(
    user: AuthUserSchema = Depends(get_current_user),
) -> EmployeeTable:
    """
    Resolves the EmployeeTable record for the currently authenticated Firebase user.
    Uses the email from the Firebase token to look up the employee.
    """
    employee = await EmployeeTable.filter(email=user.email, status=True).first()
    if not employee:
        raise UserAccountError(
            message="No employee record found for this user",
            error_code="EMPLOYEE_NOT_FOUND",
        )
    await employee.fetch_related("department")
    return employee
