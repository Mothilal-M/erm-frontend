from src.app.core.exceptions import UserAccountError
from src.app.db.tables.erm_tables import EmployeeTable
from src.app.utils.schemas import AuthUserSchema


async def resolve_employee(user: AuthUserSchema) -> EmployeeTable:
    """
    Resolves the EmployeeTable record for an authenticated user.
    Uses the email from the Firebase token to look up the employee.
    Intended to be called from service layer, not as a FastAPI dependency.
    """
    employee = await EmployeeTable.filter(email=user.email, status=True).first()
    if not employee:
        raise UserAccountError(
            message="No employee record found for this user",
            error_code="EMPLOYEE_NOT_FOUND",
        )
    await employee.fetch_related("department")
    return employee
