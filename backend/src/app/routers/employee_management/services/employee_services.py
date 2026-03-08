import logging

from firebase_admin import auth as firebase_auth
from injectq import inject, singleton

from src.app.db.tables.erm_tables import EmployeeTable
from src.app.routers.employee_management.repositories import EmployeeRepo
from src.app.routers.employee_management.schemas import (
    EmployeeCreateSchema,
    EmployeeListResponseSchema,
    EmployeeResponseSchema,
    EmployeeStatsSchema,
    EmployeeUpdateSchema,
    InviteUserSchema,
    PerformanceResponse,
    PerformanceScoresSchema,
    PerformanceSprintSchema,
    RecognitionSchema,
    SprintHistoryItemSchema,
)


def _to_employee_schema(emp: EmployeeTable) -> EmployeeResponseSchema:
    return EmployeeResponseSchema(
        id=emp.id,
        name=emp.name,
        email=emp.email,
        phone=emp.phone,
        department=emp.department.name if emp.department else "",
        role=emp.role,
        join_date=emp.join_date.isoformat() if emp.join_date else None,
        status=emp.employee_status,
    )


@singleton
class EmployeeService:
    """Service class for employee-related business logic and operations."""

    @inject
    def __init__(self, repo: EmployeeRepo):
        self._repo = repo

    async def list_employees_with_stats(self) -> EmployeeListResponseSchema:
        employees = await self._repo.list_employees()
        serialized = [_to_employee_schema(e) for e in employees]

        active = sum(1 for e in employees if e.employee_status == "active")
        inactive = sum(1 for e in employees if e.employee_status == "inactive")
        invited = sum(1 for e in employees if e.employee_status == "invited")

        return EmployeeListResponseSchema(
            employees=serialized,
            stats=EmployeeStatsSchema(
                total=len(employees),
                active=active,
                inactive=inactive,
                invited=invited,
            ),
        )

    async def get_employee(self, employee_id: int) -> EmployeeResponseSchema:
        emp = await self._repo.get_employee(employee_id)
        return _to_employee_schema(emp)

    async def create_employee(self, data: EmployeeCreateSchema) -> EmployeeResponseSchema:
        # Create Firebase account so the employee can log in
        self._create_firebase_user(data.email, data.name)
        emp = await self._repo.create_employee(data.model_dump(by_alias=False))
        return _to_employee_schema(emp)

    async def update_employee(self, employee_id: int, data: EmployeeUpdateSchema) -> EmployeeResponseSchema:
        emp = await self._repo.update_employee(employee_id, data.model_dump(by_alias=False, exclude_none=True))
        return _to_employee_schema(emp)

    async def delete_employee(self, employee_id: int) -> None:
        await self._repo.delete_employee(employee_id)

    async def invite_user(self, data: InviteUserSchema) -> EmployeeResponseSchema:
        # Create Firebase account and send password-reset email as invitation
        self._create_firebase_user(data.email)
        emp = await self._repo.create_invited_employee(data.model_dump(by_alias=False))
        return _to_employee_schema(emp)

    @staticmethod
    def _create_firebase_user(email: str, display_name: str | None = None) -> None:
        """Create a Firebase user account. If the user already exists, skip silently."""
        logger = logging.getLogger(__name__)
        try:
            firebase_auth.get_user_by_email(email)
            logger.info("Firebase user already exists for %s", email)
        except firebase_auth.UserNotFoundError:
            firebase_auth.create_user(
                email=email,
                display_name=display_name or email.split("@")[0],
            )
            # Send password reset email so the employee can set their password
            link = firebase_auth.generate_password_reset_link(email)
            logger.info("Firebase user created for %s. Password reset link: %s", email, link)
        except Exception:
            logger.exception("Failed to create Firebase user for %s", email)

    async def get_performance(self) -> PerformanceResponse:
        return PerformanceResponse(
            current_sprint=PerformanceSprintSchema(
                id=1,
                name="Sprint 12",
                sprint_number=12,
                project_name="ERM Platform",
                allocated=8,
                completed=5,
                in_progress=2,
                pending=1,
                efficiency=85,
                on_time_rate=90,
                estimated_hours=40,
                actual_hours=38,
            ),
            sprint_history=[
                SprintHistoryItemSchema(sprint="Sprint 9", allocated=7, completed=6, efficiency=86),
                SprintHistoryItemSchema(sprint="Sprint 10", allocated=8, completed=7, efficiency=88),
                SprintHistoryItemSchema(sprint="Sprint 11", allocated=9, completed=8, efficiency=89),
                SprintHistoryItemSchema(sprint="Sprint 12", allocated=8, completed=5, efficiency=85),
            ],
            performance=PerformanceScoresSchema(
                velocity_score=82,
                quality_score=90,
                collaboration_score=88,
                overall_score=87,
            ),
            recognition=[
                RecognitionSchema(
                    id=1,
                    title="Bug Squasher",
                    given_by="Sarah Chen",
                    date="2026-02-20",
                    type="badge",
                    emoji="🐛",
                    message="Fixed 15 critical bugs this sprint!",
                    color="red",
                ),
                RecognitionSchema(
                    id=2,
                    title="Team Player",
                    given_by="Mike Johnson",
                    date="2026-02-18",
                    type="kudos",
                    emoji="🤝",
                    message="Great collaboration on the dashboard feature.",
                    color="blue",
                ),
            ],
        )
