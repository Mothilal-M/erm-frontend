from fastapi import Request

from src.app.core import get_settings
from src.app.db.tables.erm_tables import EmployeeTable


async def get_current_employee(request: Request) -> EmployeeTable:
    employee_id = request.headers.get("X-Employee-Id")
    if not employee_id:
        employee_id = get_settings().DEFAULT_EMPLOYEE_ID
    return await EmployeeTable.get(id=int(employee_id))
