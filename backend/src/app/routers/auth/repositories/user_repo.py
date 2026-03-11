from datetime import date
from uuid import UUID

from injectq import singleton

from src.app.db.tables.erm_tables import EmployeeTable
from src.app.routers.auth.schemas import EmployeeRecord, UserSchema

from .abstract_user_repo import UserRepoAbstract


@singleton
class UserRepo(UserRepoAbstract):
    """Repository class for user-related database operations.

    This class provides methods to interact with the user data
    stored in the database.
    """

    async def get_user(self, user_id: UUID) -> UserSchema:
        """Retrieves a user by their unique identifier (UUID).

        Args:
            user_id (UUID): The unique identifier of the user to retrieve.

        Returns:
            UserSchema: The user data.

        Raises:
            NotImplementedError: Not yet implemented.
        """
        raise NotImplementedError

    async def get_employee_by_email(self, email: str) -> EmployeeRecord | None:
        """Retrieves an active employee record by email address.

        Args:
            email (str): The email address to look up.

        Returns:
            EmployeeRecord | None: The matching employee record, or None if not found.
        """
        emp = await EmployeeTable.filter(email=email, status=True).first()
        if not emp:
            return None
        return EmployeeRecord(
            id=emp.id,
            name=emp.name,
            email=emp.email,
            role=emp.role,
            employee_status=emp.employee_status,
        )

    async def create_employee(
        self, name: str, email: str, role: str, employee_status: str, join_date: date
    ) -> EmployeeRecord:
        """Creates a new employee record in the database.

        Args:
            name (str): The employee's full name.
            email (str): The employee's email address.
            role (str): The employee's role (e.g., "admin", "employee").
            employee_status (str): The employee's status (e.g., "active", "invited").
            join_date (date): The employee's join date.

        Returns:
            EmployeeRecord: The newly created employee record.
        """
        emp = await EmployeeTable.create(
            name=name,
            email=email,
            role=role,
            employee_status=employee_status,
            join_date=join_date,
        )
        return EmployeeRecord(
            id=emp.id,
            name=emp.name,
            email=emp.email,
            role=emp.role,
            employee_status=emp.employee_status,
        )
