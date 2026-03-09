from injectq import InjectQ

from src.app.routers.auth.repositories import UserRepo
from src.tests.fake_data.fake_user_repo import FakeUserRepo


def register_fake_repos(container: InjectQ):
    """
    Registers fake repositories for testing purposes.

    This function binds the `FakeUserRepo` to the `UserRepo` interface using the provided container.

    Args:
        container (InjectQ): The dependency container used to bind the fake repositories.
    """
    container.bind_instance(UserRepo, FakeUserRepo())
