from src.app.utils.schemas import AuthUserSchema

# TODO: Remove this hardcoded user and restore Firebase auth before production
_DEV_USER = AuthUserSchema(
    name="John Doe",
    role="admin",
    company=1,
    uuid="dev-uuid-001",
    user_id="dev-user-001",
    email="john@example.com",
    email_verified=True,
    firebase={},
    uid="dev-uid-001",
)


def get_current_user() -> AuthUserSchema:
    """Temporary hardcoded auth for development/testing. Returns admin user."""
    return _DEV_USER
