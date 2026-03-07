from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from injectq.integrations.fastapi import InjectFastAPI

from src.app.core.auth.employee_resolver import get_authenticated_employee
from src.app.core.auth.rbac import require_role
from src.app.db.tables.erm_tables import EmployeeTable
from src.app.routers.attendance.schemas import (
    AdminAttendanceSummaryResponse,
    AdminEditEntrySchema,
    AdminFlagEntrySchema,
    AdminLiveResponse,
    AdminLogsResponse,
    AdminManualEntrySchema,
    AttendanceEntryWithEmployeeSchema,
    AttendanceHistoryResponse,
    AttendanceStatusResponse,
    ClockInResponse,
    ClockInSchema,
    ClockOutResponse,
    ClockOutSchema,
    TodayAttendanceResponse,
)
from src.app.routers.attendance.services import AttendanceService
from src.app.utils import generate_swagger_responses, success_response
from src.app.utils.schemas import AuthUserSchema

router = APIRouter(tags=["Attendance"])


@router.get(
    "/v1/attendance/status",
    responses=generate_swagger_responses(AttendanceStatusResponse),
    summary="Get current clock-in status",
    description="Check whether the current employee is clocked in, along with elapsed time and auto-expiry details",
    openapi_extra={},
)
async def get_status(
    request: Request,
    employee: Annotated[EmployeeTable, Depends(get_authenticated_employee)],
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
):
    result = await service.get_status(employee)
    return success_response(result.model_dump(by_alias=True), request)


@router.post(
    "/v1/attendance/clock-in",
    responses=generate_swagger_responses(ClockInResponse),
    summary="Clock in for the day",
    description="Start a new attendance session for the current employee. Fails if already clocked in",
    openapi_extra={},
)
async def clock_in(
    request: Request,
    payload: ClockInSchema,
    employee: Annotated[EmployeeTable, Depends(get_authenticated_employee)],
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
):
    result = await service.clock_in(employee, payload)
    return success_response(result.model_dump(by_alias=True), request)


@router.post(
    "/v1/attendance/clock-out",
    responses=generate_swagger_responses(ClockOutResponse),
    summary="Clock out and end session",
    description="End the current attendance session, calculate duration, and record an optional work summary",
    openapi_extra={},
)
async def clock_out(
    request: Request,
    payload: ClockOutSchema,
    employee: Annotated[EmployeeTable, Depends(get_authenticated_employee)],
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
):
    result = await service.clock_out(employee, payload)
    return success_response(result.model_dump(by_alias=True), request)


@router.get(
    "/v1/attendance/today",
    responses=generate_swagger_responses(TodayAttendanceResponse),
    summary="Get today's attendance entries",
    description="Retrieve all attendance entries for the current employee for today, including clock-in/out times and work summaries",
    openapi_extra={},
)
async def get_today(
    request: Request,
    employee: Annotated[EmployeeTable, Depends(get_authenticated_employee)],
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
):
    result = await service.get_today(employee)
    return success_response(result.model_dump(by_alias=True), request)


@router.get(
    "/v1/attendance/history",
    responses=generate_swagger_responses(AttendanceHistoryResponse),
    summary="Get paginated attendance history",
    description="Retrieve the current employee's attendance history with optional year and month filters and pagination support",
    openapi_extra={},
)
async def get_history(
    request: Request,
    employee: Annotated[EmployeeTable, Depends(get_authenticated_employee)],
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
    page: int = Query(1, ge=1),
    month: int | None = Query(None),
    year: int | None = Query(None),
):
    result = await service.get_history(employee, year, month, page)
    return success_response(result.model_dump(by_alias=True), request)


@router.get(
    "/v1/attendance/admin/logs",
    responses=generate_swagger_responses(AdminLogsResponse),
    summary="Admin: list all attendance logs",
    description="Retrieve paginated attendance logs for all employees with optional filters for status, date range, employee, and department",
    openapi_extra={},
)
async def admin_logs(
    request: Request,
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
    user: AuthUserSchema = Depends(require_role("admin", "manager")),
    page: int = Query(1, ge=1),
    status: str | None = Query(None),
    date: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    employee_id: int | None = Query(None),
    department_id: int | None = Query(None),
):
    result = await service.get_admin_logs(
        page=page,
        status=status,
        date_filter=date,
        date_from=date_from,
        date_to=date_to,
        employee_id=employee_id,
        department_id=department_id,
    )
    return success_response(result.model_dump(by_alias=True), request)


@router.patch(
    "/v1/attendance/admin/logs/{entry_id}",
    responses=generate_swagger_responses(AttendanceEntryWithEmployeeSchema),
    summary="Admin: edit an attendance entry",
    description="Update clock-in/out times, work summary, or add an edit reason for an existing attendance entry",
    openapi_extra={},
)
async def admin_edit_entry(
    request: Request,
    entry_id: int,
    payload: AdminEditEntrySchema,
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
    user: AuthUserSchema = Depends(require_role("admin")),
):
    result = await service.admin_edit_entry(
        entry_id, payload.model_dump(by_alias=False, exclude_none=True)
    )
    return success_response(result.model_dump(by_alias=True), request)


@router.patch(
    "/v1/attendance/admin/logs/{entry_id}/flag",
    responses=generate_swagger_responses(AttendanceEntryWithEmployeeSchema),
    summary="Admin: flag or unflag an entry",
    description="Toggle the flagged status of an attendance entry with an optional reason for flagging",
    openapi_extra={},
)
async def admin_flag_entry(
    request: Request,
    entry_id: int,
    payload: AdminFlagEntrySchema,
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
    user: AuthUserSchema = Depends(require_role("admin")),
):
    result = await service.admin_flag_entry(
        entry_id, payload.model_dump(by_alias=False)
    )
    return success_response(result.model_dump(by_alias=True), request)


@router.post(
    "/v1/attendance/admin/manual-entry",
    responses=generate_swagger_responses(AttendanceEntryWithEmployeeSchema),
    summary="Admin: create manual attendance entry",
    description="Create a manual attendance entry for an employee with specified clock-in/out times",
    openapi_extra={},
    status_code=201,
)
async def admin_manual_entry(
    request: Request,
    payload: AdminManualEntrySchema,
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
    user: AuthUserSchema = Depends(require_role("admin")),
):
    result = await service.admin_manual_entry(payload.model_dump(by_alias=False))
    return success_response(result.model_dump(by_alias=True), request, status_code=201)


@router.get(
    "/v1/attendance/admin/live",
    responses=generate_swagger_responses(AdminLiveResponse),
    summary="Admin: view live clocked-in employees",
    description="Get a real-time list of all employees currently clocked in and those who have not clocked in today",
    openapi_extra={},
)
async def admin_live(
    request: Request,
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
    user: AuthUserSchema = Depends(require_role("admin", "manager")),
):
    result = await service.get_admin_live()
    return success_response(result.model_dump(by_alias=True), request)


@router.get(
    "/v1/attendance/admin/summary",
    responses=generate_swagger_responses(AdminAttendanceSummaryResponse),
    summary="Admin: get attendance summary stats",
    description="Retrieve aggregated attendance statistics including present count, absent count, live sessions, and flagged entries",
    openapi_extra={},
)
async def admin_summary(
    request: Request,
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
    user: AuthUserSchema = Depends(require_role("admin", "manager")),
):
    result = await service.get_admin_summary()
    return success_response(result.model_dump(by_alias=True), request)
