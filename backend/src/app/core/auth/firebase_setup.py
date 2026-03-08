import firebase_admin
from firebase_admin import auth, credentials

from src.app.core.config.settings import get_settings


_firebase_app = None


def init_firebase() -> firebase_admin.App:
    """Initialize Firebase Admin SDK. Safe to call multiple times."""
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    settings = get_settings()
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    _firebase_app = firebase_admin.initialize_app(cred)
    return _firebase_app


def get_firebase_auth():
    """Return the firebase_admin.auth module (for token verification & user management)."""
    if _firebase_app is None:
        init_firebase()
    return auth
