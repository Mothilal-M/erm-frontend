from injectq import singleton

from src.app.db.tables.erm_tables import DepartmentTable, EmployeeTable
from src.app.routers.employee_management.schemas import (
    DepartmentListResponseSchema,
    DepartmentResponseSchema,
)


def _to_schema(dept: DepartmentTable, employee_count: int) -> DepartmentResponseSchema:
    return DepartmentResponseSchema(
        id=dept.id,
        name=dept.name,
        description=dept.description,
        head=dept.head,
        color=dept.color,
        employee_count=employee_count,
    )


@singleton
class DepartmentRepo:

    async def list_departments(self) -> DepartmentListResponseSchema:
        departments = await DepartmentTable.all()
        result = []
        total_employees = 0
        for dept in departments:
            count = await EmployeeTable.filter(department=dept, status=True).count()
            total_employees += count
            result.append(_to_schema(dept, count))
        return DepartmentListResponseSchema(
            departments=result,
            total=len(result),
            total_employees=total_employees,
        )

    async def create_department(self, data: dict) -> DepartmentResponseSchema:
        dept = await DepartmentTable.create(**data)
        return _to_schema(dept, 0)

    async def update_department(self, department_id: int, data: dict) -> DepartmentResponseSchema:
        dept = await DepartmentTable.get(id=department_id)
        for key, value in data.items():
            setattr(dept, key, value)
        await dept.save()
        count = await EmployeeTable.filter(department=dept, status=True).count()
        return _to_schema(dept, count)

    async def delete_department(self, department_id: int) -> None:
        dept = await DepartmentTable.get(id=department_id)
        await dept.delete()
