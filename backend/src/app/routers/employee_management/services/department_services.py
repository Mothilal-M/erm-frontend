from injectq import inject, singleton

from src.app.routers.employee_management.repositories import DepartmentRepo
from src.app.routers.employee_management.schemas import (
    DepartmentCreateSchema,
    DepartmentListResponseSchema,
    DepartmentResponseSchema,
    DepartmentUpdateSchema,
)


@singleton
class DepartmentService:

    @inject
    def __init__(self, repo: DepartmentRepo):
        self._repo = repo

    async def list_departments(self) -> DepartmentListResponseSchema:
        return await self._repo.list_departments()

    async def create_department(self, data: DepartmentCreateSchema) -> DepartmentResponseSchema:
        return await self._repo.create_department(data.model_dump(by_alias=False))

    async def update_department(
        self, department_id: int, data: DepartmentUpdateSchema
    ) -> DepartmentResponseSchema:
        return await self._repo.update_department(
            department_id, data.model_dump(by_alias=False, exclude_none=True)
        )

    async def delete_department(self, department_id: int) -> None:
        await self._repo.delete_department(department_id)
