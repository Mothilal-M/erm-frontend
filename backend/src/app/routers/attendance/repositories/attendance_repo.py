import calendar
from datetime import date, datetime

from injectq import singleton
from tortoise.expressions import Q

from src.app.db.tables.erm_tables import AttendanceLogTable, EmployeeTable

from .abstract_attendance_repo import AttendanceRepoAbstract


@singleton
class AttendanceRepo(AttendanceRepoAbstract):
    """Repository class for attendance-related database operations."""

    async def get_active_session(self, employee_id: int, today: date) -> AttendanceLogTable | None:
        """Retrieves the currently active (in-progress) attendance session for an employee on a given date.

        Args:
            employee_id (int): The unique identifier of the employee.
            today (date): The date to check for an active session.

        Returns:
            AttendanceLogTable | None: The active attendance log entry, or None if no active session exists.
        """
        return await AttendanceLogTable.filter(
            employee_id=employee_id,
            date=today,
            attendance_status="IN_PROGRESS",
        ).first()

    async def get_today_entries(self, employee_id: int, today: date) -> list[AttendanceLogTable]:
        """Retrieves all attendance log entries for an employee on a given date, ordered by clock-in time.

        Args:
            employee_id (int): The unique identifier of the employee.
            today (date): The date to retrieve entries for.

        Returns:
            list[AttendanceLogTable]: A list of attendance log entries ordered by clock-in time ascending.
        """
        return await AttendanceLogTable.filter(
            employee_id=employee_id,
            date=today,
        ).order_by("clock_in")

    async def create_entry(self, data: dict) -> AttendanceLogTable:
        """Creates a new attendance log entry in the database.

        Args:
            data (dict): A dictionary containing the fields for the new attendance log entry,
                such as employee_id, date, clock_in, attendance_status, and optional note.

        Returns:
            AttendanceLogTable: The newly created attendance log entry.
        """
        return await AttendanceLogTable.create(**data)

    async def get_entry(self, entry_id: int) -> AttendanceLogTable:
        """Retrieves a single attendance log entry by its unique identifier with the related employee prefetched.

        Args:
            entry_id (int): The unique identifier of the attendance log entry.

        Returns:
            AttendanceLogTable: The attendance log entry with the related employee prefetched.

        Raises:
            DoesNotExist: If no attendance log entry with the given ID is found.
        """
        return await AttendanceLogTable.get(id=entry_id).prefetch_related("employee")

    async def get_history(
        self, employee_id: int, year: int | None, month: int | None, page: int = 1, page_size: int = 20
    ) -> tuple[list[AttendanceLogTable], int]:
        """Retrieves paginated attendance history for an employee, optionally filtered by year and month.

        Args:
            employee_id (int): The unique identifier of the employee.
            year (int | None): The year to filter by. If None, no year filter is applied.
            month (int | None): The month to filter by (used in conjunction with year). If None, no month filter is applied.
            page (int): The page number for pagination. Defaults to 1.
            page_size (int): The number of entries per page. Defaults to 20.

        Returns:
            tuple[list[AttendanceLogTable], int]: A tuple containing the list of attendance log entries
                for the requested page and the total count of matching entries.
        """
        qs = AttendanceLogTable.filter(employee_id=employee_id)
        if year and month:
            month_start = date(year, month, 1)
            month_end = date(year, month, calendar.monthrange(year, month)[1])
            qs = qs.filter(date__gte=month_start, date__lte=month_end)
        elif year:
            qs = qs.filter(date__gte=date(year, 1, 1), date__lte=date(year, 12, 31))

        total = await qs.count()
        entries = await qs.order_by("-date", "-clock_in").offset((page - 1) * page_size).limit(page_size)
        return entries, total

    async def get_admin_logs(
        self,
        page: int = 1,
        page_size: int = 20,
        status: str | None = None,
        date_filter: str | None = None,
        date_from: str | None = None,
        date_to: str | None = None,
        employee_id: int | None = None,
        department_id: int | None = None,
    ) -> tuple[list[AttendanceLogTable], int]:
        """Retrieves paginated attendance logs for administrative purposes with various optional filters.

        Args:
            page (int): The page number for pagination. Defaults to 1.
            page_size (int): The number of entries per page. Defaults to 20.
            status (str | None): Filter by attendance status (e.g., "COMPLETED", "FLAGGED"). Defaults to None.
            date_filter (str | None): Filter by an exact date. Defaults to None.
            date_from (str | None): Filter entries from this date onward (inclusive). Defaults to None.
            date_to (str | None): Filter entries up to this date (inclusive). Defaults to None.
            employee_id (int | None): Filter by a specific employee ID. Defaults to None.
            department_id (int | None): Filter by a specific department ID. Defaults to None.

        Returns:
            tuple[list[AttendanceLogTable], int]: A tuple containing the list of attendance log entries
                (with employee and department prefetched) for the requested page and the total count of matching entries.
        """
        qs = AttendanceLogTable.all().prefetch_related("employee__department")

        if status:
            if status == "FLAGGED":
                qs = qs.filter(is_flagged=True)
            else:
                qs = qs.filter(attendance_status=status)
        if date_filter:
            qs = qs.filter(date=date_filter)
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        if employee_id:
            qs = qs.filter(employee_id=employee_id)
        if department_id:
            qs = qs.filter(employee__department_id=department_id)

        total = await qs.count()
        entries = await qs.order_by("-date", "-clock_in").offset((page - 1) * page_size).limit(page_size)
        return entries, total

    async def get_live_clocked_in(self, today: date) -> list[AttendanceLogTable]:
        """Retrieves all currently clocked-in (in-progress) attendance entries for a given date.

        Args:
            today (date): The date to retrieve live clocked-in entries for.

        Returns:
            list[AttendanceLogTable]: A list of in-progress attendance log entries with employee
                and department data prefetched.
        """
        return (
            await AttendanceLogTable.filter(date=today, attendance_status="IN_PROGRESS")
            .prefetch_related("employee__department")
            .all()
        )

    async def get_all_employees_active(self) -> list[EmployeeTable]:
        """Retrieves all active employees with their department data prefetched.

        Returns:
            list[EmployeeTable]: A list of active employee records with department relations prefetched.
        """
        return await EmployeeTable.filter(status=True, employee_status="active").prefetch_related("department")
