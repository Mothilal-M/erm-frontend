from pydantic import Field

from src.app.utils.schemas.camel_schema import CamelModel


class EmployeeCreateSchema(CamelModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., min_length=1, max_length=255)
    phone: str = Field("", max_length=50)
    department: str = Field(..., min_length=1)
    role: str = Field("employee")
    join_date: str | None = None


class EmployeeUpdateSchema(CamelModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    department: str | None = None
    role: str | None = None
    join_date: str | None = None
    employee_status: str | None = None


class InviteUserSchema(CamelModel):
    email: str = Field(..., min_length=1, max_length=255)
    role: str = Field("employee")
    department: str | None = None


class EmployeeResponseSchema(CamelModel):
    id: int
    name: str
    email: str
    phone: str
    department: str
    role: str
    join_date: str | None = None
    status: str


class EmployeeStatsSchema(CamelModel):
    total: int
    active: int
    inactive: int
    invited: int


class EmployeeListResponseSchema(CamelModel):
    employees: list[EmployeeResponseSchema]
    stats: EmployeeStatsSchema


class DeleteEmployeeResponse(CamelModel):
    message: str


class PerformanceSprintSchema(CamelModel):
    id: int
    name: str
    sprint_number: int
    project_name: str
    allocated: int
    completed: int
    in_progress: int
    pending: int
    efficiency: int
    on_time_rate: int
    estimated_hours: int
    actual_hours: int


class SprintHistoryItemSchema(CamelModel):
    sprint: str
    allocated: int
    completed: int
    efficiency: int


class PerformanceScoresSchema(CamelModel):
    velocity_score: int
    quality_score: int
    collaboration_score: int
    overall_score: int


class RecognitionSchema(CamelModel):
    id: int
    title: str
    given_by: str
    date: str
    type: str
    emoji: str
    message: str
    color: str


class PerformanceResponse(CamelModel):
    current_sprint: PerformanceSprintSchema
    sprint_history: list[SprintHistoryItemSchema]
    performance: PerformanceScoresSchema
    recognition: list[RecognitionSchema]
