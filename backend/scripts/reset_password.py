"""
Reset a Firebase user's password.
Usage: python -m scripts.reset_password <email> [password]

If no password is provided, defaults to Change@Me1
"""

import sys

from firebase_admin import auth as firebase_auth

from src.app.core.auth.firebase_setup import init_firebase

init_firebase()

email = sys.argv[1] if len(sys.argv) > 1 else None
password = sys.argv[2] if len(sys.argv) > 2 else "Change@Me1"

if not email:
    print("Usage: python -m scripts.reset_password <email> [password]")
    sys.exit(1)

try:
    user = firebase_auth.get_user_by_email(email)
    firebase_auth.update_user(user.uid, password=password)
    print(f"Password updated for {email}")
except firebase_auth.UserNotFoundError:
    print(f"No Firebase user found with email: {email}")
    print("Creating user...")
    firebase_auth.create_user(email=email, password=password)
    print(f"Created Firebase user: {email} with provided password")
except Exception as e:
    print(f"Error: {e}")
