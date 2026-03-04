from typing import Annotated

from fastapi import APIRouter, Request
from fastapi.responses import ORJSONResponse
from injectq.integrations.fastapi import InjectFastAPI

from src.app.routers.employee_management.schemas import (
    EmployeeCreateSchema,
    EmployeeUpdateSchema,
    InviteUserSchema,
)
from src.app.routers.employee_management.services import EmployeeService

router = APIRouter(tags=["Employee Management"])


@router.get(
    "/v1/employee-management",
    summary="List all employees with statistics",
    description="Retrieve a list of all employees along with aggregated statistics including total, active, inactive, and invited counts",
)
async def list_employees(
    request: Request,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
):
    result = await service.list_employees_with_stats()
    return ORJSONResponse(result)


@router.get(
    "/v1/employee-management/{employee_id}",
    summary="Retrieve employee details by ID",
    description="Fetch detailed information for a specific employee by their unique identifier",
)
async def get_employee(
    request: Request,
    employee_id: int,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
):
    result = await service.get_employee(employee_id)
    return ORJSONResponse(result)


@router.post(
    "/v1/employee-management",
    status_code=201,
    summary="Create a new employee record",
    description="Create a new employee with the provided details including name, email, department, and role",
)
async def create_employee(
    request: Request,
    payload: EmployeeCreateSchema,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
):
    result = await service.create_employee(payload.model_dump(by_alias=False))
    return ORJSONResponse(result, status_code=201)


@router.patch(
    "/v1/employee-management/{employee_id}",
    summary="Update employee information",
    description="Partially update an existing employee record with the provided fields",
)
async def update_employee(
    request: Request,
    employee_id: int,
    payload: EmployeeUpdateSchema,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
):
    data = payload.model_dump(by_alias=False, exclude_none=True)
    result = await service.update_employee(employee_id, data)
    return ORJSONResponse(result)


@router.delete(
    "/v1/employee-management/{employee_id}",
    summary="Soft delete an employee",
    description="Mark an employee as inactive by performing a soft delete operation",
)
async def delete_employee(
    request: Request,
    employee_id: int,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
):
    await service.delete_employee(employee_id)
    return ORJSONResponse({"message": "Employee deleted successfully"})


@router.post(
    "/v1/employee-management/invite",
    status_code=201,
    summary="Invite a new user via email",
    description="Send an invitation to a new user and create a placeholder employee record with invited status",
)
async def invite_user(
    request: Request,
    payload: InviteUserSchema,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
):
    result = await service.invite_user(payload.model_dump(by_alias=False))
    return ORJSONResponse(result, status_code=201)


@router.get(
    "/v1/employee/performance",
    summary="Get employee performance metrics",
    description="Retrieve performance data including sprint history, velocity scores, and recognition badges",
)
async def get_performance(
    request: Request,
    service: Annotated[EmployeeService, InjectFastAPI(EmployeeService)],
):
    result = await service.get_performance()
    return ORJSONResponse(result)
