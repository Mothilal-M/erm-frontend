from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.app.core.auth.firebase_setup import get_firebase_auth
from src.app.core.exceptions import UserAccountError
from src.app.db.tables.erm_tables import EmployeeTable
from src.app.utils.schemas import AuthUserSchema

_bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> AuthUserSchema:
    """
    Verify the Firebase ID token from the Authorization header and
    return an AuthUserSchema populated from the token + employee record.
    """
    firebase_auth = get_firebase_auth()

    try:
        decoded_token = firebase_auth.verify_id_token(credentials.credentials)
    except Exception:
        raise UserAccountError(
            message="Invalid or expired authentication token",
            error_code="INVALID_TOKEN",
        )

    uid = decoded_token.get("uid", "")
    email = decoded_token.get("email", "")
    name = decoded_token.get("name", "") or decoded_token.get("email", "").split("@")[0]
    email_verified = decoded_token.get("email_verified", False)

    # Look up employee record to get role
    employee = await EmployeeTable.filter(email=email, status=True).first()
    role = employee.role if employee else "employee"

    return AuthUserSchema(
        name=name,
        role=role,
        company=1,
        uuid=uid,
        user_id=uid,
        email=email,
        email_verified=email_verified,
        firebase=decoded_token,
        uid=uid,
    )
