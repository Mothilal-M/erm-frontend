from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from injectq.integrations.fastapi import InjectFastAPI

from src.app.core.auth.authentication import get_current_user, get_firebase_user
from src.app.core.exceptions import ResourceDuplicationError
from src.app.db.tables.erm_tables import EmployeeTable
from src.app.routers.auth.schemas import RegisterSchema, UserSchema
from src.app.routers.auth.services import UserService
from src.app.utils import generate_swagger_responses, success_response
from src.app.utils.schemas.user_schemas import AuthUserSchema


router = APIRouter(
    tags=["User"],
)


@router.get(
    "/v1/auth/me",
    responses=generate_swagger_responses(AuthUserSchema),
    summary="Get current authenticated user",
    description=(
        "Returns the authenticated user's profile from" " the Firebase token and employee record"
    ),
    openapi_extra={},
)
async def get_me(
    request: Request,
    user: AuthUserSchema = Depends(get_current_user),
):
    return success_response(user.model_dump(exclude={"firebase"}), request)


@router.post(
    "/v1/auth/register",
    responses=generate_swagger_responses(AuthUserSchema),
    summary="Register a new user (self-signup)",
    description=(
        "Creates a new employee record for a Firebase-authenticated user "
        "who signed up directly (not invited). Only the first user is assigned admin role."
    ),
    openapi_extra={},
)
async def register(
    request: Request,
    body: RegisterSchema,
    token: dict = Depends(get_firebase_user),
):
    email = token.get("email", "")
    uid = token.get("uid", "")
    email_verified = token.get("email_verified", False)

    if not uid or not email:
        raise HTTPException(
            status_code=400,
            detail="Missing required token claims: uid and email",
        )

    if not email_verified:
        raise HTTPException(
            status_code=400,
            detail="Email must be verified before registration",
        )

    # Check if user already has an employee record
    existing = await EmployeeTable.filter(email=email, status=True).first()
    if existing:
        raise ResourceDuplicationError("Account already registered")

    # Bootstrap rule: only the first active employee becomes admin.
    active_employees_count = await EmployeeTable.filter(status=True).count()
    assigned_role = "admin" if active_employees_count == 0 else "employee"

    # Create employee record with the computed role.
    employee = await EmployeeTable.create(
        name=body.name,
        email=email,
        role=assigned_role,
        employee_status="active",
        join_date=date.today(),
    )

    user = AuthUserSchema(
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
    return success_response(user.model_dump(exclude={"firebase"}), request, status_code=201)


@router.get(
    "/v1/users/{user_id}",
    responses=generate_swagger_responses(UserSchema),
    summary="Retrieve user profile information",
    description="Fetch detailed user profile data including account info and metadata",
    openapi_extra={},
)
async def user_details(
    request: Request,
    user_id: UUID,
    service: Annotated[UserService, InjectFastAPI(UserService)],
    user: AuthUserSchema = Depends(get_current_user),
):
    user = await service.get_user(user_id)
    return success_response(user.model_dump(), request)
