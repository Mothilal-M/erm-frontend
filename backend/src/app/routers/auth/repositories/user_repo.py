from uuid import UUID

from injectq import singleton

from src.app.routers.auth.schemas import UserSchema

from .abstract_user_repo import UserRepoAbstract


@singleton
class UserRepo(UserRepoAbstract):
    """
    Repository class for user-related database operations.

    This class provides methods to interact with the user data
    stored in the database.
    """

    async def get_user(self, user_id: UUID) -> UserSchema:
        pass
