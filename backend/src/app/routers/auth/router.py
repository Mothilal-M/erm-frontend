from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Request
from fastapi.logger import logger
from injectq.integrations.fastapi import InjectFastAPI
from taskiq import AsyncTaskiqTask

from backend.src.app.core.auth.authentication import get_current_user
from backend.src.app.utils.schemas.user_schemas import AuthUserSchema
from src.app.routers.auth.schemas import UserSchema
from src.app.routers.auth.services import UserService
from src.app.tasks.user_tasks import add_task_math
from src.app.utils import generate_swagger_responses, success_response


# dependencies=[Depends(get_current_user)]
router = APIRouter(
    tags=["User"],
)


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
    user: AuthUserSchema = Depends(get_current_user)
):
    user = await service.get_user(user_id)
    return success_response(user.model_dump(), request)
