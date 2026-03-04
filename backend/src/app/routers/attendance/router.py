from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import ORJSONResponse
from injectq.integrations.fastapi import InjectFastAPI

from src.app.core.auth.erm_auth import get_current_employee
from src.app.db.tables.erm_tables import EmployeeTable
from src.app.routers.attendance.schemas import (
    AdminEditEntrySchema,
    AdminFlagEntrySchema,
    AdminManualEntrySchema,
    ClockInSchema,
    ClockOutSchema,
)
from src.app.routers.attendance.services import AttendanceService

router = APIRouter(tags=["Attendance"])


@router.get(
    "/v1/attendance/status",
    summary="Get current clock-in status",
    description="Check whether the current employee is clocked in, along with elapsed time and auto-expiry details",
)
async def get_status(
    request: Request,
    employee: Annotated[EmployeeTable, Depends(get_current_employee)],
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
):
    result = await service.get_status(employee)
    return ORJSONResponse(result)


@router.post(
    "/v1/attendance/clock-in",
    summary="Clock in for the day",
    description="Start a new attendance session for the current employee. Fails if already clocked in",
)
async def clock_in(
    request: Request,
    payload: ClockInSchema,
    employee: Annotated[EmployeeTable, Depends(get_current_employee)],
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
):
    result = await service.clock_in(employee, payload.model_dump(by_alias=False))
    return ORJSONResponse(result)


@router.post(
    "/v1/attendance/clock-out",
    summary="Clock out and end session",
    description="End the current attendance session, calculate duration, and record an optional work summary",
)
async def clock_out(
    request: Request,
    payload: ClockOutSchema,
    employee: Annotated[EmployeeTable, Depends(get_current_employee)],
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
):
    result = await service.clock_out(employee, payload.model_dump(by_alias=False))
    return ORJSONResponse(result)


@router.get(
    "/v1/attendance/today",
    summary="Get today's attendance entries",
    description="Retrieve all attendance entries for the current employee for today, including clock-in/out times and work summaries",
)
async def get_today(
    request: Request,
    employee: Annotated[EmployeeTable, Depends(get_current_employee)],
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
):
    result = await service.get_today(employee)
    return ORJSONResponse(result)


@router.get(
    "/v1/attendance/history",
    summary="Get paginated attendance history",
    description="Retrieve the current employee's attendance history with optional year and month filters and pagination support",
)
async def get_history(
    request: Request,
    employee: Annotated[EmployeeTable, Depends(get_current_employee)],
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
    page: int = Query(1, ge=1),
    month: int | None = Query(None),
    year: int | None = Query(None),
):
    result = await service.get_history(employee, year, month, page)
    return ORJSONResponse(result)


@router.get(
    "/v1/attendance/admin/logs",
    summary="Admin: list all attendance logs",
    description="Retrieve paginated attendance logs for all employees with optional filters for status, date range, employee, and department",
)
async def admin_logs(
    request: Request,
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
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
    return ORJSONResponse(result)


@router.patch(
    "/v1/attendance/admin/logs/{entry_id}",
    summary="Admin: edit an attendance entry",
    description="Update clock-in/out times, work summary, or add an edit reason for an existing attendance entry",
)
async def admin_edit_entry(
    request: Request,
    entry_id: int,
    payload: AdminEditEntrySchema,
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
):
    result = await service.admin_edit_entry(
        entry_id, payload.model_dump(by_alias=False, exclude_none=True)
    )
    return ORJSONResponse(result)


@router.patch(
    "/v1/attendance/admin/logs/{entry_id}/flag",
    summary="Admin: flag or unflag an entry",
    description="Toggle the flagged status of an attendance entry with an optional reason for flagging",
)
async def admin_flag_entry(
    request: Request,
    entry_id: int,
    payload: AdminFlagEntrySchema,
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
):
    result = await service.admin_flag_entry(
        entry_id, payload.model_dump(by_alias=False)
    )
    return ORJSONResponse(result)


@router.post(
    "/v1/attendance/admin/manual-entry",
    status_code=201,
    summary="Admin: create manual attendance entry",
    description="Create a manual attendance entry for an employee with specified clock-in/out times",
)
async def admin_manual_entry(
    request: Request,
    payload: AdminManualEntrySchema,
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
):
    result = await service.admin_manual_entry(payload.model_dump(by_alias=False))
    return ORJSONResponse(result, status_code=201)


@router.get(
    "/v1/attendance/admin/live",
    summary="Admin: view live clocked-in employees",
    description="Get a real-time list of all employees currently clocked in and those who have not clocked in today",
)
async def admin_live(
    request: Request,
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
):
    result = await service.get_admin_live()
    return ORJSONResponse(result)


@router.get(
    "/v1/attendance/admin/summary",
    summary="Admin: get attendance summary stats",
    description="Retrieve aggregated attendance statistics including present count, absent count, live sessions, and flagged entries",
)
async def admin_summary(
    request: Request,
    service: Annotated[AttendanceService, InjectFastAPI(AttendanceService)],
):
    result = await service.get_admin_summary()
    return ORJSONResponse(result)
