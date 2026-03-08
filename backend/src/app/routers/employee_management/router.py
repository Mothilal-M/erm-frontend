from typing import Annotated

from fastapi import APIRouter, Depends, Request
from injectq.integrations.fastapi import InjectFastAPI

from src.app.core.auth.rbac import require_role
from src.app.routers.employee_management.schemas import (
    DeleteEmployeeResponse,
    EmployeeCreateSchema,
    EmployeeListResponseSchema,
    EmployeeResponseSchema,
    EmployeeUpdateSchema,
    InviteUserSchema,
    PerformanceResponse,
)
from src.app.routers.employee_management.services import EmployeeService
from src.app.utils import generate_swagger_responses, success_response
from src.app.utils.schemas import AuthUserSchema


router = APIRouter(tags=["Employee Management"])


@router.get(
    "/v1/employee-management",
    responses=generate_swagger_responses(EmployeeListResponseSchema),
    summary="List all employees with statistics",
    description="Retrieve a list of all employees along with aggregated statistics including total, active, inactive, and invited counts",
    openapi_extra={},
)
async def list_employees(
    request: Request,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
    user: AuthUserSchema = Depends(require_role("admin", "manager")),
):
    result = await service.list_employees_with_stats()
    return success_response(result.model_dump(by_alias=True), request)


@router.get(
    "/v1/employee-management/{employee_id}",
    responses=generate_swagger_responses(EmployeeResponseSchema),
    summary="Retrieve employee details by ID",
    description="Fetch detailed information for a specific employee by their unique identifier",
    openapi_extra={},
)
async def get_employee(
    request: Request,
    employee_id: int,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
    user: AuthUserSchema = Depends(require_role("admin", "manager")),
):
    result = await service.get_employee(employee_id)
    return success_response(result.model_dump(by_alias=True), request)


@router.post(
    "/v1/employee-management",
    responses=generate_swagger_responses(EmployeeResponseSchema),
    summary="Create a new employee record",
    description="Create a new employee with the provided details including name, email, department, and role",
    openapi_extra={},
    status_code=201,
)
async def create_employee(
    request: Request,
    payload: EmployeeCreateSchema,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
    user: AuthUserSchema = Depends(require_role("admin")),
):
    result = await service.create_employee(payload)
    return success_response(result.model_dump(by_alias=True), request, status_code=201)


@router.patch(
    "/v1/employee-management/{employee_id}",
    responses=generate_swagger_responses(EmployeeResponseSchema),
    summary="Update employee information",
    description="Partially update an existing employee record with the provided fields",
    openapi_extra={},
)
async def update_employee(
    request: Request,
    employee_id: int,
    payload: EmployeeUpdateSchema,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
    user: AuthUserSchema = Depends(require_role("admin")),
):
    result = await service.update_employee(employee_id, payload)
    return success_response(result.model_dump(by_alias=True), request)


@router.delete(
    "/v1/employee-management/{employee_id}",
    responses=generate_swagger_responses(DeleteEmployeeResponse),
    summary="Soft delete an employee",
    description="Mark an employee as inactive by performing a soft delete operation",
    openapi_extra={},
)
async def delete_employee(
    request: Request,
    employee_id: int,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
    user: AuthUserSchema = Depends(require_role("admin")),
):
    await service.delete_employee(employee_id)
    return success_response(
        DeleteEmployeeResponse(message="Employee deleted successfully").model_dump(by_alias=True),
        request,
    )


@router.post(
    "/v1/employee-management/invite",
    responses=generate_swagger_responses(EmployeeResponseSchema),
    summary="Invite a new user via email",
    description="Send an invitation to a new user and create a placeholder employee record with invited status",
    openapi_extra={},
    status_code=201,
)
async def invite_user(
    request: Request,
    payload: InviteUserSchema,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
    user: AuthUserSchema = Depends(require_role("admin")),
):
    result = await service.invite_user(payload)
    return success_response(result.model_dump(by_alias=True), request, status_code=201)


@router.get(
    "/v1/employee/performance",
    responses=generate_swagger_responses(PerformanceResponse),
    summary="Get employee performance metrics",
    description="Retrieve performance data including sprint history, velocity scores, and recognition badges",
    openapi_extra={},
)
async def get_performance(
    request: Request,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
    user: AuthUserSchema = Depends(require_role("admin", "manager", "employee")),
):
    result = await service.get_performance()
    return success_response(result.model_dump(by_alias=True), request)
