from types import SimpleNamespace

from src.app.core.auth.authentication import get_firebase_user
from src.app.db.tables.erm_tables import EmployeeTable
from src.tests.integration_tests.test_main import app, client


# ruff: noqa: PLR2004
def test_get_user_api():
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    response = client.get(f"v1/users/{user_id}")

    assert response.status_code == 200
    user_data = response.json()
    data = user_data["data"]
    assert data["user_id"] == user_id
    assert data["fullname"] == "testuser"
    assert data["email"] == "testuser@example.com"


def test_get_invalid_input():
    user_id = "nonexistent-uuid"
    response = client.get(f"v1/users/{user_id}")
    assert response.status_code == 422


def test_get_not_found():
    user_id = "90387798-cbc0-4df7-9ce2-308fd9ee9fbf"
    response = client.get(f"v1/users/{user_id}")
    assert response.status_code == 404


class _FakeQuerySet:
    def __init__(self, first_result=None, count_result=0):
        self.first_result = first_result
        self.count_result = count_result

    async def first(self):
        return self.first_result

    async def count(self):
        return self.count_result


def _override_firebase_user(token: dict):
    async def _override():
        return token

    app.dependency_overrides[get_firebase_user] = _override


def test_register_success_first_user_becomes_admin(monkeypatch):
    _override_firebase_user(
        {
            "email": "new-admin@example.com",
            "uid": "firebase-uid-1",
            "email_verified": True,
        }
    )

    def fake_filter(_cls, **kwargs):
        if kwargs.get("email") == "new-admin@example.com":
            return _FakeQuerySet(first_result=None)
        return _FakeQuerySet(count_result=0)

    async def fake_create(_cls, **kwargs):
        return SimpleNamespace(name=kwargs["name"], role=kwargs["role"])

    monkeypatch.setattr(EmployeeTable, "filter", classmethod(fake_filter))
    monkeypatch.setattr(EmployeeTable, "create", classmethod(fake_create))

    try:
        response = client.post("v1/auth/register", json={"name": "New Admin"})
    finally:
        app.dependency_overrides.pop(get_firebase_user, None)

    assert response.status_code == 201
    payload = response.json()["data"]
    assert payload["email"] == "new-admin@example.com"
    assert payload["role"] == "admin"


def test_register_success_existing_org_user_gets_employee_role(monkeypatch):
    _override_firebase_user(
        {
            "email": "new-user@example.com",
            "uid": "firebase-uid-2",
            "email_verified": True,
        }
    )

    def fake_filter(_cls, **kwargs):
        if kwargs.get("email") == "new-user@example.com":
            return _FakeQuerySet(first_result=None)
        return _FakeQuerySet(count_result=2)

    async def fake_create(_cls, **kwargs):
        return SimpleNamespace(name=kwargs["name"], role=kwargs["role"])

    monkeypatch.setattr(EmployeeTable, "filter", classmethod(fake_filter))
    monkeypatch.setattr(EmployeeTable, "create", classmethod(fake_create))

    try:
        response = client.post("v1/auth/register", json={"name": "New Employee"})
    finally:
        app.dependency_overrides.pop(get_firebase_user, None)

    assert response.status_code == 201
    payload = response.json()["data"]
    assert payload["role"] == "employee"


def test_register_duplicate_registration(monkeypatch):
    _override_firebase_user(
        {
            "email": "existing@example.com",
            "uid": "firebase-uid-3",
            "email_verified": True,
        }
    )

    existing_user = SimpleNamespace(id=1, email="existing@example.com")

    def fake_filter(_cls, **kwargs):
        if kwargs.get("email") == "existing@example.com":
            return _FakeQuerySet(first_result=existing_user)
        return _FakeQuerySet(count_result=1)

    monkeypatch.setattr(EmployeeTable, "filter", classmethod(fake_filter))

    try:
        response = client.post("v1/auth/register", json={"name": "Already Exists"})
    finally:
        app.dependency_overrides.pop(get_firebase_user, None)

    assert response.status_code == 403
    error = response.json()["error"]
    assert error["code"] == "DUPLICATE_REQUEST"


def test_register_missing_required_claims_returns_400():
    _override_firebase_user(
        {
            "uid": "",
            "email": "",
            "email_verified": True,
        }
    )

    try:
        response = client.post("v1/auth/register", json={"name": "Missing Claims"})
    finally:
        app.dependency_overrides.pop(get_firebase_user, None)

    assert response.status_code == 400
    error = response.json()["error"]
    assert "uid and email" in error["message"]
