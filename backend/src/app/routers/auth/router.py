from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Request
from injectq.integrations.fastapi import InjectFastAPI

from src.app.core.auth.authentication import get_current_user
from src.app.routers.auth.schemas import UserSchema
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
