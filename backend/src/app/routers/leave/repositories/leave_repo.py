import calendar
from datetime import date

from injectq import singleton

from src.app.db.tables.erm_tables import (
    AttendanceLogTable,
    EmployeeTable,
    LeaveBalanceTable,
    LeaveRequestTable,
    LeaveSettingsTable,
    LeaveTypeTable,
)

from .abstract_leave_repo import LeaveRepoAbstract


@singleton
class LeaveRepo(LeaveRepoAbstract):
    """Concrete repository class for leave management database operations.

    Implements all abstract methods from LeaveRepoAbstract to provide
    data access for leave requests, balances, settings, employees, and attendance.
    """

    async def get_or_create_leave_type(self, name: str) -> LeaveTypeTable:
        """Retrieves an existing leave type by name or creates a new one if it does not exist.

        Args:
            name (str): The name of the leave type (e.g., "Annual Leave", "Sick Leave").

        Returns:
            LeaveTypeTable: The retrieved or newly created leave type record.
        """
        lt, _ = await LeaveTypeTable.get_or_create(name=name)
        return lt

    async def get_leave_requests(self, **filters) -> list[LeaveRequestTable]:
        """Retrieves leave requests with optional filtering, ordered by most recent first.

        Args:
            **filters: Keyword arguments used to filter leave requests.
                Supported keys include:
                - leave_status (str): Filter by leave status (e.g., "pending", "approved").
                - employee_id (int): Filter by the employee's identifier.

        Returns:
            list[LeaveRequestTable]: A list of leave request records with
                prefetched employee, department, and leave type relations.
        """
        qs = LeaveRequestTable.all().prefetch_related("employee__department", "leave_type")
        if "leave_status" in filters:
            qs = qs.filter(leave_status=filters["leave_status"])
        if "employee_id" in filters:
            qs = qs.filter(employee_id=filters["employee_id"])
        return await qs.order_by("-applied_on", "-id")

    async def get_leave_request(self, request_id: int) -> LeaveRequestTable:
        """Retrieves a single leave request by its unique identifier.

        Args:
            request_id (int): The unique identifier of the leave request.

        Returns:
            LeaveRequestTable: The leave request record with prefetched
                employee, department, and leave type relations.

        Raises:
            DoesNotExist: If no leave request with the given ID exists.
        """
        return await LeaveRequestTable.get(id=request_id).prefetch_related(
            "employee__department", "leave_type"
        )

    async def create_leave_request(self, data: dict) -> LeaveRequestTable:
        """Creates a new leave request record in the database.

        Args:
            data (dict): A dictionary containing the leave request fields including
                employee_id, leave_type_id, sub_type, date_from, date_to, days,
                leave_status, reason, and applied_on.

        Returns:
            LeaveRequestTable: The newly created leave request record.
        """
        return await LeaveRequestTable.create(**data)

    async def get_settings(self) -> LeaveSettingsTable:
        """Retrieves the leave management settings, creating default settings if none exist.

        Returns:
            LeaveSettingsTable: The leave settings record containing quotas,
                carry-forward rules, and other configuration values.
        """
        settings = await LeaveSettingsTable.first()
        if not settings:
            settings = await LeaveSettingsTable.create()
        return settings

    async def update_settings(self, data: dict) -> LeaveSettingsTable:
        """Updates the leave management settings with the provided values.

        Args:
            data (dict): A dictionary of setting field names to their new values.
                Keys that do not correspond to valid setting attributes or have
                None values are skipped.

        Returns:
            LeaveSettingsTable: The updated leave settings record.
        """
        settings = await self.get_settings()
        for key, value in data.items():
            if value is not None and hasattr(settings, key):
                setattr(settings, key, value)
        await settings.save()
        return settings

    async def get_leave_balances(self, employee_id: int, year: int) -> list[LeaveBalanceTable]:
        """Retrieves all leave balances for a specific employee and year.

        Args:
            employee_id (int): The unique identifier of the employee.
            year (int): The calendar year for which to retrieve balances.

        Returns:
            list[LeaveBalanceTable]: A list of leave balance records with
                prefetched leave type relations.
        """
        return await LeaveBalanceTable.filter(employee_id=employee_id, year=year).prefetch_related(
            "leave_type"
        )

    async def get_or_create_balance(
        self, employee_id: int, leave_type_id: int, year: int
    ) -> LeaveBalanceTable:
        """Retrieves an existing leave balance or creates a new one if it does not exist.

        Args:
            employee_id (int): The unique identifier of the employee.
            leave_type_id (int): The unique identifier of the leave type.
            year (int): The calendar year for the balance.

        Returns:
            LeaveBalanceTable: The retrieved or newly created leave balance record.
        """
        balance, _ = await LeaveBalanceTable.get_or_create(
            employee_id=employee_id,
            leave_type_id=leave_type_id,
            year=year,
        )
        return balance

    async def get_active_employees(self) -> list[EmployeeTable]:
        """Retrieves all employees with active status.

        Returns:
            list[EmployeeTable]: A list of active employee records with
                prefetched department relations. Only employees with status=True
                and employee_status="active" are included.
        """
        return await EmployeeTable.filter(status=True, employee_status="active").prefetch_related(
            "department"
        )

    async def get_employees_simple(self) -> list[EmployeeTable]:
        """Retrieves all employees with an enabled status flag.

        Returns:
            list[EmployeeTable]: A list of employee records with prefetched
                department relations, filtered by status=True.
        """
        return await EmployeeTable.filter(status=True).prefetch_related("department")

    async def get_attendance_for_month(self, year: int, month: int) -> list[AttendanceLogTable]:
        """Retrieves all attendance log entries for a given month.

        Args:
            year (int): The calendar year.
            month (int): The calendar month (1-indexed).

        Returns:
            list[AttendanceLogTable]: A list of attendance log records for the
                specified month with prefetched employee relations.
        """
        month_start = date(year, month, 1)
        month_end = date(year, month, calendar.monthrange(year, month)[1])
        return await AttendanceLogTable.filter(
            date__gte=month_start, date__lte=month_end
        ).prefetch_related("employee")

    async def get_leave_requests_for_month(self, year: int, month: int) -> list[LeaveRequestTable]:
        """Retrieves all approved or pending leave requests that overlap with a given month.

        Args:
            year (int): The calendar year.
            month (int): The calendar month (1-indexed).

        Returns:
            list[LeaveRequestTable]: A list of leave request records that fall
                within the specified month, with prefetched employee, department,
                and leave type relations.
        """
        month_start = date(year, month, 1)
        month_end = date(year, month, calendar.monthrange(year, month)[1])
        return await LeaveRequestTable.filter(
            date_from__lte=month_end,
            date_to__gte=month_start,
            leave_status__in=["approved", "pending"],
        ).prefetch_related("employee__department", "leave_type")

    async def get_attendance_for_date(self, target_date: date) -> list[AttendanceLogTable]:
        """Retrieves all attendance log entries for a specific date.

        Args:
            target_date (date): The date for which to retrieve attendance records.

        Returns:
            list[AttendanceLogTable]: A list of attendance log records for the
                specified date with prefetched employee and department relations.
        """
        return await AttendanceLogTable.filter(date=target_date).prefetch_related(
            "employee__department"
        )

    async def get_leave_requests_for_date(self, target_date: date) -> list[LeaveRequestTable]:
        """Retrieves all approved or pending leave requests that cover a specific date.

        Args:
            target_date (date): The date for which to retrieve overlapping leave requests.

        Returns:
            list[LeaveRequestTable]: A list of leave request records whose date range
                includes the target date, with prefetched employee, department, and
                leave type relations.
        """
        return await LeaveRequestTable.filter(
            date_from__lte=target_date,
            date_to__gte=target_date,
            leave_status__in=["approved", "pending"],
        ).prefetch_related("employee__department", "leave_type")

    async def get_employee_leave_history(self, employee_id: int) -> list[LeaveRequestTable]:
        """Retrieves the complete leave request history for a specific employee.

        Args:
            employee_id (int): The unique identifier of the employee.

        Returns:
            list[LeaveRequestTable]: A list of all leave request records for the
                employee, ordered by most recently applied first, with prefetched
                leave type relations.
        """
        return (
            await LeaveRequestTable.filter(employee_id=employee_id)
            .prefetch_related("leave_type")
            .order_by("-applied_on")
        )

    async def get_all_leave_types(self) -> list[LeaveTypeTable]:
        """Retrieves all active leave types.

        Returns:
            list[LeaveTypeTable]: A list of leave type records where status is True.
        """
        return await LeaveTypeTable.filter(status=True).all()
