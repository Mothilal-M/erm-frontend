from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from injectq.integrations.fastapi import InjectFastAPI

from src.app.core.auth.authentication import get_current_user
from src.app.core.auth.rbac import require_role
from src.app.routers.leave.schemas import (
    AdminEmployeeItem,
    AdminLeaveSummaryResponse,
    ApprovalActionResponse,
    ApprovalItem,
    DayDetailResponse,
    EmployeeLeaveProfileResponse,
    LeaveApprovalActionSchema,
    LeaveRequestResponse,
    LeaveRequestSchema,
    LeaveSettingsResponse,
    LeaveSettingsUpdateSchema,
    ManualLeaveRecordSchema,
    ManualRecordResponse,
    MonthlyAttendanceResponse,
)
from src.app.routers.leave.services import LeaveService
from src.app.utils import generate_swagger_responses, success_response
from src.app.utils.schemas import AuthUserSchema


router = APIRouter(tags=["Leave Management"])


@router.get(
    "/v1/leave/attendance",
    responses=generate_swagger_responses(MonthlyAttendanceResponse),
    summary="Get monthly attendance overview",
    description=(
        "Retrieve a day-by-day attendance overview for a given"
        " month including present, absent, and on-leave counts"
    ),
    openapi_extra={},
)
async def monthly_attendance(
    request: Request,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
    user: AuthUserSchema = Depends(get_current_user),
    year: int = Query(...),
    month: int = Query(...),
):
    result = await service.get_monthly_attendance(year, month)
    return success_response(result.model_dump(by_alias=True), request)


@router.get(
    "/v1/leave/admin/summary",
    responses=generate_swagger_responses(AdminLeaveSummaryResponse),
    summary="Admin: leave management dashboard",
    description=(
        "Retrieve aggregated leave statistics including breakdown"
        " by type, department stats, top leave takers,"
        " and pending approvals"
    ),
    openapi_extra={},
)
async def admin_summary(
    request: Request,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
    user: AuthUserSchema = Depends(require_role("admin", "manager")),
):
    result = await service.get_admin_summary()
    return success_response(result.model_dump(by_alias=True), request)


@router.get(
    "/v1/leave/admin/approvals",
    responses=generate_swagger_responses(ApprovalItem),
    summary="Admin: list leave approval requests",
    description=(
        "Retrieve all leave requests with their approval"
        " status, employee details, and leave type information"
    ),
    openapi_extra={},
)
async def admin_approvals(
    request: Request,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
    user: AuthUserSchema = Depends(require_role("admin", "manager")),
):
    result = await service.get_approvals()
    return success_response([item.model_dump(by_alias=True) for item in result], request)


@router.patch(
    "/v1/leave/admin/approvals/{request_id}",
    responses=generate_swagger_responses(ApprovalActionResponse),
    summary="Admin: approve or reject a leave request",
    description=(
        "Update the status of a leave request to approved"
        " or rejected, with an optional review note"
    ),
    openapi_extra={},
)
async def approve_or_reject(
    request: Request,
    request_id: int,
    payload: LeaveApprovalActionSchema,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
    user: AuthUserSchema = Depends(require_role("admin", "manager")),
):
    result = await service.approve_or_reject(request_id, payload.status, payload.note)
    return success_response(result.model_dump(by_alias=True), request)


@router.post(
    "/v1/leave/admin/manual-record",
    responses=generate_swagger_responses(ManualRecordResponse),
    summary="Admin: create manual leave record",
    description="Create a leave record directly with auto-approved status for an employee",
    openapi_extra={},
    status_code=201,
)
async def manual_record(
    request: Request,
    payload: ManualLeaveRecordSchema,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
    user: AuthUserSchema = Depends(require_role("admin")),
):
    result = await service.manual_record(payload)
    return success_response(result.model_dump(by_alias=True), request, status_code=201)


@router.get(
    "/v1/leave/admin/employees",
    responses=generate_swagger_responses(AdminEmployeeItem),
    summary="Admin: list employees for selection",
    description=(
        "Retrieve a simplified list of active employees"
        " for use in dropdowns and selection fields"
    ),
    openapi_extra={},
)
async def admin_employees(
    request: Request,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
    user: AuthUserSchema = Depends(require_role("admin", "manager")),
):
    result = await service.get_admin_employees()
    return success_response([item.model_dump(by_alias=True) for item in result], request)


@router.get(
    "/v1/leave/employee/profile",
    responses=generate_swagger_responses(EmployeeLeaveProfileResponse),
    summary="Get current employee leave profile",
    description=(
        "Retrieve the current employee's leave balances,"
        " monthly attendance stats, and leave history"
    ),
    openapi_extra={},
)
async def employee_profile(
    request: Request,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
    user: AuthUserSchema = Depends(get_current_user),
):
    result = await service.get_employee_profile(user)
    return success_response(result.model_dump(by_alias=True), request)


@router.post(
    "/v1/leave/employee/request",
    responses=generate_swagger_responses(LeaveRequestResponse),
    summary="Submit a new leave request",
    description=(
        "Submit a leave request with type, date range,"
        " and reason. Automatically updates pending balance"
    ),
    openapi_extra={},
    status_code=201,
)
async def employee_request(
    request: Request,
    payload: LeaveRequestSchema,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
    user: AuthUserSchema = Depends(get_current_user),
):
    result = await service.submit_leave_request(user, payload)
    return success_response(result.model_dump(by_alias=True), request, status_code=201)


@router.get(
    "/v1/leave/admin/settings",
    responses=generate_swagger_responses(LeaveSettingsResponse),
    summary="Get leave policy settings",
    description=(
        "Retrieve the current leave policy configuration"
        " including quotas, carry-forward rules,"
        " and blackout dates"
    ),
    openapi_extra={},
)
async def get_settings(
    request: Request,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
    user: AuthUserSchema = Depends(require_role("admin")),
):
    result = await service.get_settings()
    return success_response(result.model_dump(by_alias=True), request)


@router.patch(
    "/v1/leave/admin/settings",
    responses=generate_swagger_responses(LeaveSettingsResponse),
    summary="Update leave policy settings",
    description=(
        "Partially update leave policy settings such as"
        " quotas, carry-forward limits, and feature toggles"
    ),
    openapi_extra={},
)
async def update_settings(
    request: Request,
    payload: LeaveSettingsUpdateSchema,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
    user: AuthUserSchema = Depends(require_role("admin")),
):
    result = await service.update_settings(payload.model_dump(by_alias=False, exclude_none=True))
    return success_response(result.model_dump(by_alias=True), request)


@router.get(
    "/v1/leave/attendance/day",
    responses=generate_swagger_responses(DayDetailResponse),
    summary="Get attendance for a specific day",
    description=(
        "Retrieve per-employee attendance breakdown for a"
        " specific date including present, on-leave,"
        " and absent lists"
    ),
    openapi_extra={},
)
async def attendance_day_detail(
    request: Request,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
    user: AuthUserSchema = Depends(require_role("admin", "manager")),
    date: str = Query(...),
):
    result = await service.get_day_detail(date)
    return success_response(result.model_dump(by_alias=True), request)
