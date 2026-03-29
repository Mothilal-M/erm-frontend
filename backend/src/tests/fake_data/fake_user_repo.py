from datetime import date
from uuid import UUID

from src.app.core.exceptions import ResourceNotFoundError
from src.app.routers.auth.repositories import (
    UserRepoAbstract,
)
from src.app.routers.auth.schemas import EmployeeRecord, UserSchema


class FakeUserRepo(UserRepoAbstract):
    async def get_user(self, user_id: UUID) -> UserSchema:
        if user_id == UUID("123e4567-e89b-12d3-a456-426614174000"):
            return UserSchema(
                user_id=UUID("123e4567-e89b-12d3-a456-426614174000"),
                fullname="testuser",
                phone="1234567890",
                token="X" * 32,
                type=0,
                email="testuser@example.com",
            )

        raise ResourceNotFoundError("User not found")

    async def get_employee_by_email(self, email: str) -> EmployeeRecord | None:
        if email == "existing@example.com":
            return EmployeeRecord(
                id=1,
                name="Existing User",
                email=email,
                role="employee",
                employee_status="active",
            )
        return None

    async def create_employee(
        self, name: str, email: str, role: str, employee_status: str, join_date: date
    ) -> EmployeeRecord:
        return EmployeeRecord(
            id=2,
            name=name,
            email=email,
            role=role,
            employee_status=employee_status,
        )

    async def count_active_employees(self) -> int:
        return 1
