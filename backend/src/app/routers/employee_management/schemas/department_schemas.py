from pydantic import Field

from src.app.utils.schemas.camel_schema import CamelModel


class DepartmentCreateSchema(CamelModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field("", max_length=500)
    head: str = Field("", max_length=255)
    color: str = Field("slate", max_length=20)


class DepartmentUpdateSchema(CamelModel):
    name: str | None = None
    description: str | None = None
    head: str | None = None
    color: str | None = None


class DepartmentResponseSchema(CamelModel):
    id: int
    name: str
    description: str
    head: str
    color: str
    employee_count: int


class DepartmentListResponseSchema(CamelModel):
    departments: list[DepartmentResponseSchema]
    total: int
    total_employees: int
