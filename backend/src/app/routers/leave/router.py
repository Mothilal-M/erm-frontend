from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import ORJSONResponse
from injectq.integrations.fastapi import InjectFastAPI

from src.app.core.auth.erm_auth import get_current_employee
from src.app.db.tables.erm_tables import EmployeeTable
from src.app.routers.leave.schemas import (
    LeaveApprovalActionSchema,
    LeaveRequestSchema,
    LeaveSettingsUpdateSchema,
    ManualLeaveRecordSchema,
)
from src.app.routers.leave.services import LeaveService

router = APIRouter(tags=["Leave Management"])


@router.get(
    "/v1/leave/attendance",
    summary="Get monthly attendance overview",
    description="Retrieve a day-by-day attendance overview for a given month including present, absent, and on-leave counts",
)
async def monthly_attendance(
    request: Request,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
    year: int = Query(...),
    month: int = Query(...),
):
    result = await service.get_monthly_attendance(year, month)
    return ORJSONResponse(result)


@router.get(
    "/v1/leave/admin/summary",
    summary="Admin: leave management dashboard",
    description="Retrieve aggregated leave statistics including breakdown by type, department stats, top leave takers, and pending approvals",
)
async def admin_summary(
    request: Request,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
):
    result = await service.get_admin_summary()
    return ORJSONResponse(result)


@router.get(
    "/v1/leave/admin/approvals",
    summary="Admin: list leave approval requests",
    description="Retrieve all leave requests with their approval status, employee details, and leave type information",
)
async def admin_approvals(
    request: Request,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
):
    result = await service.get_approvals()
    return ORJSONResponse(result)


@router.patch(
    "/v1/leave/admin/approvals/{request_id}",
    summary="Admin: approve or reject a leave request",
    description="Update the status of a leave request to approved or rejected, with an optional review note",
)
async def approve_or_reject(
    request: Request,
    request_id: int,
    payload: LeaveApprovalActionSchema,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
):
    result = await service.approve_or_reject(
        request_id, payload.status, payload.note
    )
    return ORJSONResponse(result)


@router.post(
    "/v1/leave/admin/manual-record",
    status_code=201,
    summary="Admin: create manual leave record",
    description="Create a leave record directly with auto-approved status for an employee",
)
async def manual_record(
    request: Request,
    payload: ManualLeaveRecordSchema,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
):
    result = await service.manual_record(payload.model_dump(by_alias=False))
    return ORJSONResponse(result, status_code=201)


@router.get(
    "/v1/leave/admin/employees",
    summary="Admin: list employees for selection",
    description="Retrieve a simplified list of active employees for use in dropdowns and selection fields",
)
async def admin_employees(
    request: Request,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
):
    result = await service.get_admin_employees()
    return ORJSONResponse(result)


@router.get(
    "/v1/leave/employee/profile",
    summary="Get current employee leave profile",
    description="Retrieve the current employee's leave balances, monthly attendance stats, and leave history",
)
async def employee_profile(
    request: Request,
    employee: Annotated[EmployeeTable, Depends(get_current_employee)],
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
):
    result = await service.get_employee_profile(employee)
    return ORJSONResponse(result)


@router.post(
    "/v1/leave/employee/request",
    status_code=201,
    summary="Submit a new leave request",
    description="Submit a leave request with type, date range, and reason. Automatically updates pending leave balance",
)
async def employee_request(
    request: Request,
    payload: LeaveRequestSchema,
    employee: Annotated[EmployeeTable, Depends(get_current_employee)],
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
):
    result = await service.submit_leave_request(
        employee, payload.model_dump(by_alias=False)
    )
    return ORJSONResponse(result, status_code=201)


@router.get(
    "/v1/leave/admin/settings",
    summary="Get leave policy settings",
    description="Retrieve the current leave policy configuration including quotas, carry-forward rules, and blackout dates",
)
async def get_settings(
    request: Request,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
):
    result = await service.get_settings()
    return ORJSONResponse(result)


@router.patch(
    "/v1/leave/admin/settings",
    summary="Update leave policy settings",
    description="Partially update leave policy settings such as quotas, carry-forward limits, and feature toggles",
)
async def update_settings(
    request: Request,
    payload: LeaveSettingsUpdateSchema,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
):
    result = await service.update_settings(
        payload.model_dump(by_alias=False, exclude_none=True)
    )
    return ORJSONResponse(result)


@router.get(
    "/v1/leave/attendance/day",
    summary="Get attendance for a specific day",
    description="Retrieve per-employee attendance breakdown for a specific date including present, on-leave, and absent lists",
)
async def attendance_day_detail(
    request: Request,
    service: Annotated[LeaveService, InjectFastAPI(LeaveService)],
    date: str = Query(...),
):
    result = await service.get_day_detail(date)
    return ORJSONResponse(result)
