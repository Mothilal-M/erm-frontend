from abc import ABC, abstractmethod
from datetime import date
from uuid import UUID

from src.app.routers.auth.schemas import EmployeeRecord, UserSchema


class UserRepoAbstract(ABC):
    """Abstract base class for user-related database operations."""

    @abstractmethod
    async def get_user(self, user_id: UUID) -> UserSchema:
        """Retrieves a user by their unique identifier (UUID).

        Args:
            user_id (UUID): The unique identifier of the user.

        Returns:
            UserSchema: The user data.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_employee_by_email(self, email: str) -> EmployeeRecord | None:
        """Retrieves an active employee record by email.

        Args:
            email (str): The email address to look up.

        Returns:
            EmployeeRecord | None: The employee record, or None if not found.
        """
        raise NotImplementedError

    @abstractmethod
    async def create_employee(
        self, name: str, email: str, role: str, employee_status: str, join_date: date
    ) -> EmployeeRecord:
        """Creates a new employee record.

        Args:
            name (str): The employee's full name.
            email (str): The employee's email address.
            role (str): The employee's role.
            employee_status (str): The employee's status.
            join_date (date): The employee's join date.

        Returns:
            EmployeeRecord: The newly created employee record.
        """
        raise NotImplementedError
