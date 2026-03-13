from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.app.core.auth.firebase_setup import get_firebase_auth
from src.app.core.exceptions import ResourceNotFoundError, UserAccountError
from src.app.db.tables.erm_tables import EmployeeTable
from src.app.utils.schemas import AuthUserSchema


_bearer_scheme = HTTPBearer()


def _verify_firebase_token(credentials: HTTPAuthorizationCredentials) -> dict:
    """Verify Firebase ID token and return decoded token dict."""
    firebase_auth = get_firebase_auth()
    try:
        return firebase_auth.verify_id_token(credentials.credentials)
    except Exception:
        raise UserAccountError(
            message="Invalid or expired authentication token",
            error_code="INVALID_TOKEN",
        )


async def get_firebase_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> dict:
    """
    Verify the Firebase ID token and return the decoded token.
    Does NOT require an employee record — used for registration.
    """
    return _verify_firebase_token(credentials)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> AuthUserSchema:
    """
    Verify the Firebase ID token from the Authorization header and
    return an AuthUserSchema populated from the token + employee record.
    Raises ResourceNotFoundError if the user has no employee record.
    """
    decoded_token = _verify_firebase_token(credentials)

    uid = decoded_token.get("uid", "")
    email = decoded_token.get("email", "")
    name = decoded_token.get("name", "") or decoded_token.get("email", "").split("@")[0]
    email_verified = decoded_token.get("email_verified", False)

    # Look up employee record to get role
    employee = await EmployeeTable.filter(email=email, status=True).first()
    if not employee:
        raise ResourceNotFoundError("User not registered")

    return AuthUserSchema(
        name=employee.name or name,
        role=employee.role,
        company=1,
        uuid=uid,
        user_id=uid,
        email=email,
        email_verified=email_verified,
        firebase=decoded_token,
        uid=uid,
    )
