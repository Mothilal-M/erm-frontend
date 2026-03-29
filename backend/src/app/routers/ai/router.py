from typing import Annotated

from fastapi import APIRouter, Depends, Request
from injectq.integrations.fastapi import InjectFastAPI

from src.app.core.auth.authentication import get_current_user
from src.app.routers.ai.schemas import (
    AIAnalyticsResponse,
    AIChatRequest,
    AIChatResponse,
    AIInsightsPageResponse,
    AIRecommendationsPageResponse,
    AIRequestContext,
    SprintAnalyticsResponse,
    SprintInsightsResponse,
)
from src.app.routers.ai.services import GeminiAIService
from src.app.utils import generate_swagger_responses, success_response
from src.app.utils.schemas import AuthUserSchema


router = APIRouter(tags=["AI"])


@router.post(
    "/v1/ai/sprint-insights",
    responses=generate_swagger_responses(SprintInsightsResponse),
    summary="Generate sprint insights using Gemini",
    description=(
        "Generate AI-driven sprint insights including auto-estimates, "
        "risk assessment, recommendations, and predicted completion."
    ),
    openapi_extra={},
)
async def sprint_insights(
    request: Request,
    payload: AIRequestContext,
    service: Annotated[GeminiAIService, InjectFastAPI(GeminiAIService)],
    user: AuthUserSchema = Depends(get_current_user),
):
    _ = user
    result = await service.get_sprint_insights(payload)
    return success_response(result.model_dump(by_alias=True), request)


@router.post(
    "/v1/ai/sprint-analytics",
    responses=generate_swagger_responses(SprintAnalyticsResponse),
    summary="Generate sprint analytics using Gemini",
    description=(
        "Generate sprint analytics including velocity metrics, burndown data, "
        "team capacity, task distribution, and on-time trend history."
    ),
    openapi_extra={},
)
async def sprint_analytics(
    request: Request,
    payload: AIRequestContext,
    service: Annotated[GeminiAIService, InjectFastAPI(GeminiAIService)],
    user: AuthUserSchema = Depends(get_current_user),
):
    _ = user
    result = await service.get_sprint_analytics(payload)
    return success_response(result.model_dump(by_alias=True), request)


@router.post(
    "/v1/ai/insights",
    responses=generate_swagger_responses(AIInsightsPageResponse),
    summary="Generate portfolio insights using Gemini",
    description=(
        "Generate AI insight cards for portfolio-level visibility with confidence, "
        "category tagging, and actionable signals."
    ),
    openapi_extra={},
)
async def insights_page(
    request: Request,
    payload: AIRequestContext,
    service: Annotated[GeminiAIService, InjectFastAPI(GeminiAIService)],
    user: AuthUserSchema = Depends(get_current_user),
):
    _ = user
    result = await service.get_insights_page(payload)
    return success_response(result.model_dump(by_alias=True), request)


@router.post(
    "/v1/ai/recommendations",
    responses=generate_swagger_responses(AIRecommendationsPageResponse),
    summary="Generate AI recommendations using Gemini",
    description=(
        "Generate prioritized recommendations with impact, effort, status, "
        "and estimated savings for sprint execution improvements."
    ),
    openapi_extra={},
)
async def recommendations_page(
    request: Request,
    payload: AIRequestContext,
    service: Annotated[GeminiAIService, InjectFastAPI(GeminiAIService)],
    user: AuthUserSchema = Depends(get_current_user),
):
    _ = user
    result = await service.get_recommendations_page(payload)
    return success_response(result.model_dump(by_alias=True), request)


@router.post(
    "/v1/ai/analytics",
    responses=generate_swagger_responses(AIAnalyticsResponse),
    summary="Generate AI analytics using Gemini",
    description=(
        "Generate AI analytics sections including metrics, predictions, "
        "ML model metadata, and pipeline status indicators."
    ),
    openapi_extra={},
)
async def analytics_page(
    request: Request,
    payload: AIRequestContext,
    service: Annotated[GeminiAIService, InjectFastAPI(GeminiAIService)],
    user: AuthUserSchema = Depends(get_current_user),
):
    _ = user
    result = await service.get_analytics_page(payload)
    return success_response(result.model_dump(by_alias=True), request)


@router.post(
    "/v1/ai/chat",
    responses=generate_swagger_responses(AIChatResponse),
    summary="Chat with Gemini assistant",
    description=(
        "Send a natural-language prompt to the sprint assistant and receive "
        "a concise, actionable AI response."
    ),
    openapi_extra={},
)
async def ai_chat(
    request: Request,
    payload: AIChatRequest,
    service: Annotated[GeminiAIService, InjectFastAPI(GeminiAIService)],
    user: AuthUserSchema = Depends(get_current_user),
):
    _ = user
    result = await service.chat(payload)
    return success_response(result.model_dump(by_alias=True), request)
