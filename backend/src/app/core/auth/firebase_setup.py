import firebase_admin
from firebase_admin import auth, credentials

from src.app.core.config.settings import get_settings


_state: dict[str, firebase_admin.App | None] = {"app": None}


def init_firebase() -> firebase_admin.App:
    """Initialize Firebase Admin SDK. Safe to call multiple times."""
    if _state["app"] is not None:
        return _state["app"]

    settings = get_settings()
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    _state["app"] = firebase_admin.initialize_app(cred)
    return _state["app"]


def get_firebase_auth():
    """Return the firebase_admin.auth module (for token verification & user management)."""
    if _state["app"] is None:
        init_firebase()
    return auth
