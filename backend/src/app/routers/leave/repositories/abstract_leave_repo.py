from abc import ABC, abstractmethod
from datetime import date

from src.app.routers.leave.schemas import (
    AdminEmployeeItem,
    ApprovalActionResponse,
    CreatedLeaveRequestRecord,
    DayAttendanceRecord,
    DayLeaveRecord,
    LeaveBalanceRecord,
    LeaveEmployeeRecord,
    LeaveHistoryItem,
    LeaveRequestRecord,
    LeaveSettingsRecord,
    LeaveTypeRecord,
    MonthAttendanceLogRecord,
)


class LeaveRepoAbstract(ABC):
    """Abstract base class defining the interface for leave repository operations."""

    @abstractmethod
    async def get_or_create_leave_type(self, name: str) -> LeaveTypeRecord:
        """Retrieves or creates a leave type by name.

        Returns:
            LeaveTypeRecord: The leave type record.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_leave_requests(self, **filters) -> list[LeaveRequestRecord]:
        """Retrieves leave requests filtered by the provided criteria.

        Returns:
            list[LeaveRequestRecord]: A list of leave request records.
        """
        raise NotImplementedError

    @abstractmethod
    async def create_leave_request(self, data: dict) -> CreatedLeaveRequestRecord:
        """Creates a new leave request record.

        Returns:
            CreatedLeaveRequestRecord: The created request's ID and year.
        """
        raise NotImplementedError

    @abstractmethod
    async def approve_or_reject_request(
        self, request_id: int, status: str, note: str | None
    ) -> ApprovalActionResponse:
        """Approves or rejects a leave request and updates the balance.

        Returns:
            ApprovalActionResponse: The updated request ID and status.
        """
        raise NotImplementedError

    @abstractmethod
    async def add_balance_used(
        self, employee_id: int, leave_type_id: int, year: int, days: float
    ) -> None:
        """Adds to the 'used' balance for an employee's leave type."""
        raise NotImplementedError

    @abstractmethod
    async def add_balance_pending(
        self, employee_id: int, leave_type_id: int, year: int, days: float
    ) -> None:
        """Adds to the 'pending' balance for an employee's leave type."""
        raise NotImplementedError

    @abstractmethod
    async def ensure_default_balances(
        self, employee_id: int, year: int, quotas: dict[str, int]
    ) -> None:
        """Creates default leave balances from settings quotas if none exist."""
        raise NotImplementedError

    @abstractmethod
    async def get_settings(self) -> LeaveSettingsRecord:
        """Retrieves the current leave management settings.

        Returns:
            LeaveSettingsRecord: The settings data.
        """
        raise NotImplementedError

    @abstractmethod
    async def update_settings(self, data: dict) -> LeaveSettingsRecord:
        """Updates the leave management settings.

        Returns:
            LeaveSettingsRecord: The updated settings data.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_leave_balances(self, employee_id: int, year: int) -> list[LeaveBalanceRecord]:
        """Retrieves all leave balances for a specific employee and year.

        Returns:
            list[LeaveBalanceRecord]: The leave balance records.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_active_employees(self) -> list[LeaveEmployeeRecord]:
        """Retrieves all employees with active status.

        Returns:
            list[LeaveEmployeeRecord]: A list of active employee records.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_employees_simple(self) -> list[AdminEmployeeItem]:
        """Retrieves all employees for selection dropdowns.

        Returns:
            list[AdminEmployeeItem]: A list of employees.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_attendance_for_month(
        self, year: int, month: int
    ) -> list[MonthAttendanceLogRecord]:
        """Retrieves attendance log entries for a given month.

        Returns:
            list[MonthAttendanceLogRecord]: Attendance records.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_leave_requests_for_month(
        self, year: int, month: int
    ) -> list[LeaveRequestRecord]:
        """Retrieves leave requests overlapping a given month.

        Returns:
            list[LeaveRequestRecord]: Leave request records.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_attendance_for_date(self, target_date: date) -> list[DayAttendanceRecord]:
        """Retrieves attendance entries for a specific date.

        Returns:
            list[DayAttendanceRecord]: Attendance records with employee details.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_leave_requests_for_date(self, target_date: date) -> list[DayLeaveRecord]:
        """Retrieves leave requests covering a specific date.

        Returns:
            list[DayLeaveRecord]: Leave records with employee details.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_employee_leave_history(self, employee_id: int) -> list[LeaveHistoryItem]:
        """Retrieves the leave request history for a specific employee.

        Returns:
            list[LeaveHistoryItem]: Leave history items.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_employee_attendance_dates_for_range(
        self, employee_id: int, date_from: date, date_to: date
    ) -> set[date]:
        """Retrieves distinct attendance dates for an employee within a date range.

        Returns:
            set[date]: Set of dates with attendance entries.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_employee_with_department(self, employee_id: int) -> LeaveEmployeeRecord:
        """Retrieves a single employee with department data.

        Returns:
            LeaveEmployeeRecord: The employee record.
        """
        raise NotImplementedError
