import logging
import os

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
    """Converts an EmployeeTable record to an EmployeeResponseSchema.

    Args:
        emp (EmployeeTable): The employee database record with department prefetched.

    Returns:
        EmployeeResponseSchema: The serialized employee data.
    """
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
        """Initializes the EmployeeService with an EmployeeRepo instance.

        Args:
            repo (EmployeeRepo): The employee repository for database operations.
        """
        self._repo = repo

    async def list_employees_with_stats(self) -> EmployeeListResponseSchema:
        """Retrieves all employees with aggregated statistics.

        Returns:
            EmployeeListResponseSchema: A list of employees along with stats
                for total, active, inactive, and invited counts.
        """
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
        """Retrieves a single employee by their unique identifier.

        Args:
            employee_id (int): The unique identifier of the employee.

        Returns:
            EmployeeResponseSchema: The employee's details.
        """
        emp = await self._repo.get_employee(employee_id)
        return _to_employee_schema(emp)

    async def create_employee(self, data: EmployeeCreateSchema) -> EmployeeResponseSchema:
        """Creates a new employee record and a corresponding Firebase account.

        Args:
            data (EmployeeCreateSchema): The employee creation data including
                name, email, department, and role.

        Returns:
            EmployeeResponseSchema: The newly created employee's details.
        """
        self._create_firebase_user(data.email, data.name)
        emp = await self._repo.create_employee(data.model_dump(by_alias=False))
        return _to_employee_schema(emp)

    async def update_employee(
        self, employee_id: int, data: EmployeeUpdateSchema
    ) -> EmployeeResponseSchema:
        """Updates an existing employee record with the provided fields.

        Args:
            employee_id (int): The unique identifier of the employee to update.
            data (EmployeeUpdateSchema): The fields to update.

        Returns:
            EmployeeResponseSchema: The updated employee's details.
        """
        emp = await self._repo.update_employee(
            employee_id, data.model_dump(by_alias=False, exclude_none=True)
        )
        return _to_employee_schema(emp)

    async def delete_employee(self, employee_id: int) -> None:
        """Soft-deletes an employee by marking them as inactive.

        Args:
            employee_id (int): The unique identifier of the employee to delete.
        """
        await self._repo.delete_employee(employee_id)

    async def invite_user(self, data: InviteUserSchema) -> EmployeeResponseSchema:
        """Invites a new user by creating a Firebase account and an employee placeholder.

        Args:
            data (InviteUserSchema): The invitation data including email,
                department, and role.

        Returns:
            EmployeeResponseSchema: The newly created invited employee's details.
        """
        self._create_firebase_user(data.email)
        emp = await self._repo.create_invited_employee(data.model_dump(by_alias=False))
        return _to_employee_schema(emp)

    @staticmethod
    def _create_firebase_user(email: str, display_name: str | None = None) -> None:
        """Creates a Firebase user account and sends a password-setup email.

        Skips creation if the user already exists in Firebase.

        Args:
            email (str): The email address for the new Firebase user.
            display_name (str | None): Optional display name. Defaults to email prefix.
        """
        logger = logging.getLogger(__name__)
        default_password = os.environ.get("DEFAULT_EMPLOYEE_PASSWORD", "Change@Me1")
        try:
            firebase_auth.get_user_by_email(email)
            logger.info("Firebase user already exists for %s", email)
        except firebase_auth.UserNotFoundError:
            firebase_auth.create_user(
                email=email,
                password=default_password,
                display_name=display_name or email.split("@")[0],
            )
            try:
                link = firebase_auth.generate_password_reset_link(email)
                logger.info("Password setup email link generated for %s: %s", email, link)
            except Exception:
                logger.warning("Could not generate password reset link for %s", email)
            logger.info("Firebase user created for %s", email)
        except Exception:
            logger.exception("Failed to create Firebase user for %s", email)

    async def get_performance(self) -> PerformanceResponse:
        """Retrieves mock employee performance metrics.

        Returns:
            PerformanceResponse: Performance data including sprint history,
                velocity scores, and recognition badges.
        """
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
                SprintHistoryItemSchema(
                    sprint="Sprint 10", allocated=8, completed=7, efficiency=88
                ),
                SprintHistoryItemSchema(
                    sprint="Sprint 11", allocated=9, completed=8, efficiency=89
                ),
                SprintHistoryItemSchema(
                    sprint="Sprint 12", allocated=8, completed=5, efficiency=85
                ),
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
