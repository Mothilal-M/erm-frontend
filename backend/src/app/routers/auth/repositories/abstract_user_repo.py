from abc import ABC, abstractmethod
from datetime import date
from uuid import UUID

from src.app.routers.auth.schemas import UserSchema


class UserRepoAbstract(ABC):
    """
    Abstract base class for user-related database operations.

    This class provides abstract methods to interact with the user data
    stored in the database.
    """

    @abstractmethod
    async def get_user(self, user_id: UUID) -> UserSchema:
        """
        Retrieves a user by their unique identifier (UUID).

        Args:
            user_id (UUID): The unique identifier of the user.

        Returns:
            UserModel: An instance of the UserModel containing the user data.

        Raises:
            DoesNotExist: If the user is not found.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_employee_by_email(self, email: str):
        """Retrieves an active employee record by email.

        Args:
            email (str): The email address to look up.

        Returns:
            The employee record, or None if not found.
        """
        raise NotImplementedError

    @abstractmethod
    async def create_employee(self, name: str, email: str, role: str, employee_status: str, join_date: date):
        """Creates a new employee record.

        Args:
            name (str): The employee's full name.
            email (str): The employee's email address.
            role (str): The employee's role (e.g., "admin").
            employee_status (str): The employee's status (e.g., "active").
            join_date (date): The employee's join date.

        Returns:
            The newly created employee record.
        """
        raise NotImplementedError
