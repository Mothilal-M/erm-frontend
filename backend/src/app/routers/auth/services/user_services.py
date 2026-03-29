from datetime import date
from uuid import UUID

from injectq import inject, singleton

from src.app.core import logger
from src.app.core.exceptions import ResourceDuplicationError
from src.app.routers.auth.repositories import UserRepo
from src.app.routers.auth.schemas import UserSchema
from src.app.utils.schemas.user_schemas import AuthUserSchema


@singleton
class UserService:
    """Service class for user-related business logic and operations.

    This class acts as an intermediary between the controllers and the
    UserRepository, facilitating user-related operations.
    """

    @inject
    def __init__(self, user_repo: UserRepo):
        """Initializes the UserService with a UserRepository instance.

        Args:
            user_repo (UserRepo): An instance of UserRepo to perform database operations.
        """
        self._user_repo = user_repo

    async def get_user(self, user_id: UUID) -> UserSchema:
        """Retrieves a user by their unique identifier (UUID).

        Args:
            user_id (UUID): The unique identifier of the user to retrieve.

        Returns:
            UserSchema: An instance containing the user's data.
        """
        logger.debug(f"Fetching user with ID: {user_id}")
        return await self._user_repo.get_user(user_id)

    async def register_user(self, name: str, token: dict) -> AuthUserSchema:
        """Register a new user (self-signup).

        Only the first active employee is assigned admin role; subsequent
        self-registrations are assigned employee role.

        Args:
            name (str): Full name of the user.
            token (dict): Decoded Firebase token containing email, uid, email_verified.

        Returns:
            AuthUserSchema: The newly created user's auth profile.

        Raises:
            ResourceDuplicationError: If an employee record already exists for this email.
        """
        email = token.get("email", "")
        uid = token.get("uid", "")
        email_verified = token.get("email_verified", False)

        existing = await self._user_repo.get_employee_by_email(email)
        if existing:
            raise ResourceDuplicationError("Account already registered")

        active_employees_count = await self._user_repo.count_active_employees()
        assigned_role = "admin" if active_employees_count == 0 else "employee"

        employee = await self._user_repo.create_employee(
            name=name,
            email=email,
            role=assigned_role,
            employee_status="active",
            join_date=date.today(),
        )

        return AuthUserSchema(
            name=employee.name,
            role=employee.role,
            company=1,
            uuid=uid,
            user_id=uid,
            email=email,
            email_verified=email_verified,
            firebase=token,
            uid=uid,
        )
