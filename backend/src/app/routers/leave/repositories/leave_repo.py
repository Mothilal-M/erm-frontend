import calendar
from datetime import UTC, date, datetime

from injectq import singleton

from src.app.db.tables.erm_tables import (
    AttendanceLogTable,
    EmployeeTable,
    LeaveBalanceTable,
    LeaveRequestTable,
    LeaveSettingsTable,
    LeaveTypeTable,
)
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

from .abstract_leave_repo import LeaveRepoAbstract


def _to_leave_request_record(lr: LeaveRequestTable) -> LeaveRequestRecord:
    """Converts a LeaveRequestTable to a LeaveRequestRecord.

    Args:
        lr (LeaveRequestTable): The leave request with employee and leave_type prefetched.

    Returns:
        LeaveRequestRecord: The flattened leave request data.
    """
    emp = lr.employee
    return LeaveRequestRecord(
        id=lr.id,
        employee_id=emp.id,
        employee_name=emp.name,
        employee_avatar=emp.avatar or "",
        employee_department=emp.department.name if emp.department else "",
        leave_type_name=lr.leave_type.name if lr.leave_type else "",
        leave_type_id=lr.leave_type_id,
        sub_type=lr.sub_type,
        date_from=lr.date_from,
        date_to=lr.date_to,
        days=lr.days,
        leave_status=lr.leave_status,
        reason=lr.reason,
        applied_on=lr.applied_on,
    )


def _to_settings_record(settings: LeaveSettingsTable) -> LeaveSettingsRecord:
    """Converts a LeaveSettingsTable to a LeaveSettingsRecord.

    Args:
        settings (LeaveSettingsTable): The leave settings database record.

    Returns:
        LeaveSettingsRecord: The settings data as a Pydantic model.
    """
    return LeaveSettingsRecord(
        annual_leave_quota=settings.annual_leave_quota,
        sick_leave_quota=settings.sick_leave_quota,
        casual_leave_quota=settings.casual_leave_quota,
        carry_forward_limit=settings.carry_forward_limit,
        carry_forward_enabled=settings.carry_forward_enabled,
        half_day_enabled=settings.half_day_enabled,
        wfh_enabled=settings.wfh_enabled,
        auto_approve_after_days=settings.auto_approve_after_days,
        blackout_dates=settings.blackout_dates,
        leave_year_start=settings.leave_year_start,
    )


@singleton
class LeaveRepo(LeaveRepoAbstract):
    """Concrete repository class for leave management database operations."""

    async def get_or_create_leave_type(self, name: str) -> LeaveTypeRecord:
        """Retrieves an existing leave type by name or creates a new one.

        Args:
            name (str): The name of the leave type.

        Returns:
            LeaveTypeRecord: The leave type record.
        """
        lt, _ = await LeaveTypeTable.get_or_create(name=name)
        return LeaveTypeRecord(id=lt.id, name=lt.name)

    async def get_leave_requests(self, **filters) -> list[LeaveRequestRecord]:
        """Retrieves leave requests with optional filtering, ordered by most recent first.

        Args:
            **filters: Keyword arguments used to filter leave requests.

        Returns:
            list[LeaveRequestRecord]: A list of leave request records.
        """
        qs = LeaveRequestTable.all().prefetch_related("employee__department", "leave_type")
        if "leave_status" in filters:
            qs = qs.filter(leave_status=filters["leave_status"])
        if "employee_id" in filters:
            qs = qs.filter(employee_id=filters["employee_id"])
        results = await qs.order_by("-applied_on", "-id")
        return [_to_leave_request_record(lr) for lr in results]

    async def create_leave_request(self, data: dict) -> CreatedLeaveRequestRecord:
        """Creates a new leave request record in the database.

        Args:
            data (dict): A dictionary containing the leave request fields.

        Returns:
            CreatedLeaveRequestRecord: The created request's ID and date_from year.
        """
        lr = await LeaveRequestTable.create(**data)
        return CreatedLeaveRequestRecord(
            id=lr.id,
            date_from_year=lr.date_from.year,
        )

    async def approve_or_reject_request(
        self, request_id: int, status: str, note: str | None
    ) -> ApprovalActionResponse:
        """Approves or rejects a leave request and updates the leave balance.

        Args:
            request_id (int): The ID of the leave request.
            status (str): The new status ("approved" or "rejected").
            note (str | None): Optional review note.

        Returns:
            ApprovalActionResponse: The updated request ID and status.
        """
        lr = await LeaveRequestTable.get(id=request_id).prefetch_related(
            "employee__department", "leave_type"
        )
        old_status = lr.leave_status
        lr.leave_status = status
        lr.review_note = note
        lr.reviewed_at = datetime.now(UTC)
        await lr.save()

        year = lr.date_from.year
        balance, _ = await LeaveBalanceTable.get_or_create(
            employee_id=lr.employee_id,
            leave_type_id=lr.leave_type_id,
            year=year,
        )

        if status == "approved" and old_status == "pending":
            balance.pending = max(0, balance.pending - lr.days)
            balance.used += lr.days
            await balance.save()
        elif status == "rejected" and old_status == "pending":
            balance.pending = max(0, balance.pending - lr.days)
            await balance.save()

        return ApprovalActionResponse(id=lr.id, status=lr.leave_status)

    async def add_balance_used(
        self, employee_id: int, leave_type_id: int, year: int, days: float
    ) -> None:
        """Adds to the 'used' balance for an employee's leave type.

        Args:
            employee_id (int): The employee's ID.
            leave_type_id (int): The leave type's ID.
            year (int): The calendar year.
            days (float): The number of days to add.
        """
        balance, _ = await LeaveBalanceTable.get_or_create(
            employee_id=employee_id,
            leave_type_id=leave_type_id,
            year=year,
        )
        balance.used += days
        await balance.save()

    async def add_balance_pending(
        self, employee_id: int, leave_type_id: int, year: int, days: float
    ) -> None:
        """Adds to the 'pending' balance for an employee's leave type.

        Args:
            employee_id (int): The employee's ID.
            leave_type_id (int): The leave type's ID.
            year (int): The calendar year.
            days (float): The number of days to add.
        """
        balance, _ = await LeaveBalanceTable.get_or_create(
            employee_id=employee_id,
            leave_type_id=leave_type_id,
            year=year,
        )
        balance.pending += days
        await balance.save()

    async def ensure_default_balances(
        self, employee_id: int, year: int, quotas: dict[str, int]
    ) -> None:
        """Creates default leave balances from settings quotas if none exist.

        Args:
            employee_id (int): The employee's ID.
            year (int): The calendar year.
            quotas (dict[str, int]): Mapping of leave type name to allocated quota.
        """
        for lt_name, quota in quotas.items():
            lt, _ = await LeaveTypeTable.get_or_create(name=lt_name)
            balance, _ = await LeaveBalanceTable.get_or_create(
                employee_id=employee_id,
                leave_type_id=lt.id,
                year=year,
            )
            balance.allocated = quota
            await balance.save()

    async def get_settings(self) -> LeaveSettingsRecord:
        """Retrieves the leave management settings, creating defaults if none exist.

        Returns:
            LeaveSettingsRecord: The leave settings.
        """
        settings = await LeaveSettingsTable.first()
        if not settings:
            settings = await LeaveSettingsTable.create()
        return _to_settings_record(settings)

    async def update_settings(self, data: dict) -> LeaveSettingsRecord:
        """Updates the leave management settings with the provided values.

        Args:
            data (dict): A dictionary of setting field names to their new values.

        Returns:
            LeaveSettingsRecord: The updated leave settings.
        """
        settings = await LeaveSettingsTable.first()
        if not settings:
            settings = await LeaveSettingsTable.create()
        for key, value in data.items():
            if value is not None and hasattr(settings, key):
                setattr(settings, key, value)
        await settings.save()
        return _to_settings_record(settings)

    async def get_leave_balances(self, employee_id: int, year: int) -> list[LeaveBalanceRecord]:
        """Retrieves all leave balances for a specific employee and year.

        Args:
            employee_id (int): The employee's ID.
            year (int): The calendar year.

        Returns:
            list[LeaveBalanceRecord]: The leave balance records.
        """
        balances = await LeaveBalanceTable.filter(
            employee_id=employee_id, year=year
        ).prefetch_related("leave_type")
        return [
            LeaveBalanceRecord(
                leave_type_name=b.leave_type.name,
                allocated=b.allocated,
                used=b.used,
                pending=b.pending,
            )
            for b in balances
        ]

    async def get_active_employees(self) -> list[LeaveEmployeeRecord]:
        """Retrieves all employees with active status.

        Returns:
            list[LeaveEmployeeRecord]: A list of active employee records.
        """
        employees = await EmployeeTable.filter(
            status=True, employee_status="active"
        ).prefetch_related("department")
        return [
            LeaveEmployeeRecord(
                id=emp.id,
                name=emp.name,
                department=emp.department.name if emp.department else "",
                avatar=emp.avatar or "",
                role=emp.role,
                join_date=emp.join_date.isoformat() if emp.join_date else None,
                employee_status=emp.employee_status,
            )
            for emp in employees
        ]

    async def get_employees_simple(self) -> list[AdminEmployeeItem]:
        """Retrieves all employees for selection dropdowns.

        Returns:
            list[AdminEmployeeItem]: A list of employees with id, name, department, avatar.
        """
        employees = await EmployeeTable.filter(status=True).prefetch_related("department")
        return [
            AdminEmployeeItem(
                id=emp.id,
                name=emp.name,
                department=emp.department.name if emp.department else "",
                avatar=emp.avatar or "",
            )
            for emp in employees
        ]

    async def get_attendance_for_month(
        self, year: int, month: int
    ) -> list[MonthAttendanceLogRecord]:
        """Retrieves all attendance log entries for a given month.

        Args:
            year (int): The calendar year.
            month (int): The calendar month (1-indexed).

        Returns:
            list[MonthAttendanceLogRecord]: Attendance records with date and employee_id.
        """
        month_start = date(year, month, 1)
        month_end = date(year, month, calendar.monthrange(year, month)[1])
        entries = await AttendanceLogTable.filter(date__gte=month_start, date__lte=month_end).all()
        return [MonthAttendanceLogRecord(date=e.date, employee_id=e.employee_id) for e in entries]

    async def get_leave_requests_for_month(self, year: int, month: int) -> list[LeaveRequestRecord]:
        """Retrieves approved/pending leave requests that overlap with a given month.

        Args:
            year (int): The calendar year.
            month (int): The calendar month (1-indexed).

        Returns:
            list[LeaveRequestRecord]: Leave request records for the month.
        """
        month_start = date(year, month, 1)
        month_end = date(year, month, calendar.monthrange(year, month)[1])
        results = await LeaveRequestTable.filter(
            date_from__lte=month_end,
            date_to__gte=month_start,
            leave_status__in=["approved", "pending"],
        ).prefetch_related("employee__department", "leave_type")
        return [_to_leave_request_record(lr) for lr in results]

    async def get_attendance_for_date(self, target_date: date) -> list[DayAttendanceRecord]:
        """Retrieves all attendance entries for a specific date with employee info.

        Args:
            target_date (date): The date to retrieve attendance for.

        Returns:
            list[DayAttendanceRecord]: Attendance records with employee details.
        """
        entries = await AttendanceLogTable.filter(date=target_date).prefetch_related(
            "employee__department"
        )
        return [
            DayAttendanceRecord(
                employee_id=e.employee.id,
                employee_name=e.employee.name,
                employee_department=e.employee.department.name if e.employee.department else "",
                clock_in=e.clock_in.strftime("%H:%M") if e.clock_in else None,
            )
            for e in entries
        ]

    async def get_leave_requests_for_date(self, target_date: date) -> list[DayLeaveRecord]:
        """Retrieves approved/pending leave requests covering a specific date.

        Args:
            target_date (date): The date to check.

        Returns:
            list[DayLeaveRecord]: Leave records with employee details.
        """
        results = await LeaveRequestTable.filter(
            date_from__lte=target_date,
            date_to__gte=target_date,
            leave_status__in=["approved", "pending"],
        ).prefetch_related("employee__department", "leave_type")
        return [
            DayLeaveRecord(
                employee_id=lr.employee.id,
                employee_name=lr.employee.name,
                employee_department=lr.employee.department.name if lr.employee.department else "",
                leave_type_name=lr.leave_type.name if lr.leave_type else "",
            )
            for lr in results
        ]

    async def get_employee_leave_history(self, employee_id: int) -> list[LeaveHistoryItem]:
        """Retrieves the complete leave request history for a specific employee.

        Args:
            employee_id (int): The employee's ID.

        Returns:
            list[LeaveHistoryItem]: Leave history items for the employee.
        """
        results = (
            await LeaveRequestTable.filter(employee_id=employee_id)
            .prefetch_related("leave_type")
            .order_by("-applied_on")
        )
        return [
            LeaveHistoryItem(
                id=lr.id,
                type=lr.leave_type.name if lr.leave_type else "",
                sub_type=lr.sub_type,
                from_date=lr.date_from.isoformat(),
                to_date=lr.date_to.isoformat(),
                days=lr.days,
                status=lr.leave_status,
            )
            for lr in results
        ]

    async def get_employee_attendance_dates_for_range(
        self, employee_id: int, date_from: date, date_to: date
    ) -> set[date]:
        """Retrieves distinct attendance dates for an employee within a date range.

        Args:
            employee_id (int): The employee's ID.
            date_from (date): Start date (inclusive).
            date_to (date): End date (inclusive).

        Returns:
            set[date]: Set of dates the employee has attendance entries.
        """
        entries = await AttendanceLogTable.filter(
            employee_id=employee_id,
            date__gte=date_from,
            date__lte=date_to,
        ).all()
        return {e.date for e in entries}

    async def get_employee_with_department(self, employee_id: int) -> LeaveEmployeeRecord:
        """Retrieves a single employee with department data.

        Args:
            employee_id (int): The employee's ID.

        Returns:
            LeaveEmployeeRecord: The employee record.
        """
        emp = await EmployeeTable.get(id=employee_id).prefetch_related("department")
        return LeaveEmployeeRecord(
            id=emp.id,
            name=emp.name,
            department=emp.department.name if emp.department else "",
            avatar=emp.avatar or "",
            role=emp.role,
            join_date=emp.join_date.isoformat() if emp.join_date else None,
            employee_status=emp.employee_status,
        )

    async def get_all_leave_types(self) -> list[LeaveTypeRecord]:
        """Retrieves all active leave types.

        Returns:
            list[LeaveTypeRecord]: A list of leave type records.
        """
        types = await LeaveTypeTable.filter(status=True).all()
        return [LeaveTypeRecord(id=lt.id, name=lt.name) for lt in types]
