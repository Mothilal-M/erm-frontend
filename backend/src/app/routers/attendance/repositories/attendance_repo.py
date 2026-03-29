import calendar
from datetime import UTC, date, datetime

from injectq import singleton

from src.app.db.tables.erm_tables import AttendanceLogTable, EmployeeTable
from src.app.routers.attendance.schemas import (
    ActiveSessionRecord,
    AttendanceEntrySchema,
    AttendanceEntryWithEmployeeSchema,
    CreatedEntryRecord,
    LiveClockInRecord,
    SimpleEmployeeRecord,
)

from .abstract_attendance_repo import AttendanceRepoAbstract


def _to_entry_schema(entry: AttendanceLogTable) -> AttendanceEntrySchema:
    """Converts an AttendanceLogTable record to an AttendanceEntrySchema.

    Args:
        entry (AttendanceLogTable): The attendance log database record.

    Returns:
        AttendanceEntrySchema: The serialized attendance entry.
    """
    return AttendanceEntrySchema(
        id=entry.id,
        date=entry.date.isoformat(),
        clock_in=entry.clock_in.isoformat() if entry.clock_in else None,
        clock_out=entry.clock_out.isoformat() if entry.clock_out else None,
        duration_minutes=entry.duration_minutes,
        work_summary=entry.work_summary,
        status=entry.attendance_status,
        is_manual_entry=entry.is_manual_entry,
        manual_entry_reason=entry.manual_entry_reason,
        is_flagged=entry.is_flagged,
        flag_reason=entry.flag_reason,
        flagged_by=entry.flagged_by,
        flagged_at=entry.flagged_at.isoformat() if entry.flagged_at else None,
        edited_by=entry.edited_by,
        edited_at=entry.edited_at.isoformat() if entry.edited_at else None,
        edit_reason=entry.edit_reason,
    )


def _to_entry_with_employee_schema(
    entry: AttendanceLogTable,
) -> AttendanceEntryWithEmployeeSchema:
    """Converts an AttendanceLogTable record to an AttendanceEntryWithEmployeeSchema.

    Args:
        entry (AttendanceLogTable): The attendance log database record with
            employee relation prefetched.

    Returns:
        AttendanceEntryWithEmployeeSchema: The serialized attendance entry
            including employee details.
    """
    emp = entry.employee
    return AttendanceEntryWithEmployeeSchema(
        id=entry.id,
        date=entry.date.isoformat(),
        clock_in=entry.clock_in.isoformat() if entry.clock_in else None,
        clock_out=entry.clock_out.isoformat() if entry.clock_out else None,
        duration_minutes=entry.duration_minutes,
        work_summary=entry.work_summary,
        status=entry.attendance_status,
        is_manual_entry=entry.is_manual_entry,
        manual_entry_reason=entry.manual_entry_reason,
        is_flagged=entry.is_flagged,
        flag_reason=entry.flag_reason,
        flagged_by=entry.flagged_by,
        flagged_at=entry.flagged_at.isoformat() if entry.flagged_at else None,
        edited_by=entry.edited_by,
        edited_at=entry.edited_at.isoformat() if entry.edited_at else None,
        edit_reason=entry.edit_reason,
        employee_id=emp.id,
        employee_name=emp.name,
        department=emp.department.name if emp.department else "",
    )


@singleton
class AttendanceRepo(AttendanceRepoAbstract):
    """Repository class for attendance-related database operations."""

    async def get_active_session(self, employee_id: int, today: date) -> ActiveSessionRecord | None:
        """Retrieves the currently active attendance session for an employee.

        Args:
            employee_id (int): The unique identifier of the employee.
            today (date): The date to check for an active session.

        Returns:
            ActiveSessionRecord | None: The active session record, or None
                if no active session exists.
        """
        entry = await AttendanceLogTable.filter(
            employee_id=employee_id,
            date=today,
            attendance_status="IN_PROGRESS",
        ).first()
        if not entry:
            return None
        return ActiveSessionRecord(id=entry.id, clock_in=entry.clock_in)

    async def get_today_entries(self, employee_id: int, today: date) -> list[AttendanceEntrySchema]:
        """Retrieves all attendance entries for an employee on a given date.

        Args:
            employee_id (int): The unique identifier of the employee.
            today (date): The date to retrieve entries for.

        Returns:
            list[AttendanceEntrySchema]: A list of attendance entries ordered by clock-in time.
        """
        entries = await AttendanceLogTable.filter(
            employee_id=employee_id,
            date=today,
        ).order_by("clock_in")
        return [_to_entry_schema(e) for e in entries]

    async def create_entry(self, data: dict) -> CreatedEntryRecord:
        """Creates a new attendance log entry in the database.

        Args:
            data (dict): A dictionary containing the fields for the new attendance log entry.

        Returns:
            CreatedEntryRecord: The newly created entry's key fields.
        """
        entry = await AttendanceLogTable.create(**data)
        return CreatedEntryRecord(
            id=entry.id,
            clock_in=entry.clock_in,
            note=entry.note,
        )

    async def complete_session(
        self, session_id: int, clock_out: datetime, duration_minutes: int, work_summary: str | None
    ) -> None:
        """Completes an active attendance session by recording clock-out details.

        Args:
            session_id (int): The ID of the active session to complete.
            clock_out (datetime): The clock-out timestamp.
            duration_minutes (int): The session duration in minutes.
            work_summary (str | None): Optional work summary.
        """
        entry = await AttendanceLogTable.get(id=session_id)
        entry.clock_out = clock_out
        entry.duration_minutes = duration_minutes
        entry.work_summary = work_summary
        entry.attendance_status = "COMPLETED"
        await entry.save()

    async def admin_edit_entry(
        self, entry_id: int, data: dict
    ) -> AttendanceEntryWithEmployeeSchema:
        """Updates an attendance entry's clock times, work summary, and marks it as edited.

        Args:
            entry_id (int): The ID of the attendance entry to edit.
            data (dict): Fields to update (clock_in, clock_out, work_summary, edit_reason).

        Returns:
            AttendanceEntryWithEmployeeSchema: The updated entry with employee details.
        """
        entry = await AttendanceLogTable.get(id=entry_id)

        if data.get("clock_in"):
            entry.clock_in = datetime.fromisoformat(data["clock_in"])
        if data.get("clock_out"):
            entry.clock_out = datetime.fromisoformat(data["clock_out"])
        if data.get("work_summary") is not None:
            entry.work_summary = data["work_summary"]

        if entry.clock_in and entry.clock_out:
            ci = entry.clock_in if entry.clock_in.tzinfo else entry.clock_in.replace(tzinfo=UTC)
            co = entry.clock_out if entry.clock_out.tzinfo else entry.clock_out.replace(tzinfo=UTC)
            entry.duration_minutes = int((co - ci).total_seconds() / 60)

        entry.attendance_status = "EDITED"
        entry.edited_by = "Admin"
        entry.edited_at = datetime.now(UTC)
        entry.edit_reason = data.get("edit_reason", "")
        await entry.save()

        await entry.fetch_related("employee__department")
        return _to_entry_with_employee_schema(entry)

    async def admin_flag_entry(
        self, entry_id: int, data: dict
    ) -> AttendanceEntryWithEmployeeSchema:
        """Toggles the flagged status of an attendance entry.

        Args:
            entry_id (int): The ID of the attendance entry to flag or unflag.
            data (dict): Must contain 'is_flagged' (bool) and optionally 'flag_reason' (str).

        Returns:
            AttendanceEntryWithEmployeeSchema: The updated entry with employee details.
        """
        entry = await AttendanceLogTable.get(id=entry_id)
        entry.is_flagged = data["is_flagged"]
        entry.flag_reason = data.get("flag_reason")
        if data["is_flagged"]:
            entry.flagged_by = "Admin"
            entry.flagged_at = datetime.now(UTC)
        else:
            entry.flagged_by = None
            entry.flagged_at = None
            entry.flag_reason = None
        await entry.save()

        await entry.fetch_related("employee__department")
        return _to_entry_with_employee_schema(entry)

    async def create_manual_entry(self, data: dict) -> AttendanceEntryWithEmployeeSchema:
        """Creates a manual attendance entry and returns it with employee details.

        Args:
            data (dict): The fields for the manual entry.

        Returns:
            AttendanceEntryWithEmployeeSchema: The newly created entry with employee details.
        """
        entry = await AttendanceLogTable.create(**data)
        await entry.fetch_related("employee__department")
        return _to_entry_with_employee_schema(entry)

    async def get_history(
        self,
        employee_id: int,
        year: int | None,
        month: int | None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[AttendanceEntrySchema], int]:
        """Retrieves paginated attendance history for an employee.

        Args:
            employee_id (int): The unique identifier of the employee.
            year (int | None): Year filter. None means no filter.
            month (int | None): Month filter (with year). None means no filter.
            page (int): Page number for pagination. Defaults to 1.
            page_size (int): Entries per page. Defaults to 20.

        Returns:
            tuple[list[AttendanceEntrySchema], int]: A tuple of (entries, total count).
        """
        qs = AttendanceLogTable.filter(employee_id=employee_id)
        if year and month:
            month_start = date(year, month, 1)
            month_end = date(year, month, calendar.monthrange(year, month)[1])
            qs = qs.filter(date__gte=month_start, date__lte=month_end)
        elif year:
            qs = qs.filter(date__gte=date(year, 1, 1), date__lte=date(year, 12, 31))

        total = await qs.count()
        offset = (page - 1) * page_size
        entries = await qs.order_by("-date", "-clock_in").offset(offset).limit(page_size)
        return [_to_entry_schema(e) for e in entries], total

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
    ) -> tuple[list[AttendanceEntryWithEmployeeSchema], int]:
        """Retrieves paginated admin attendance logs with filters.

        Args:
            page (int): Page number. Defaults to 1.
            page_size (int): Entries per page. Defaults to 20.
            status (str | None): Filter by attendance status.
            date_filter (str | None): Filter by exact date.
            date_from (str | None): Start date filter (inclusive).
            date_to (str | None): End date filter (inclusive).
            employee_id (int | None): Filter by employee ID.
            department_id (int | None): Filter by department ID.

        Returns:
            tuple[list[AttendanceEntryWithEmployeeSchema], int]: A tuple of (entries, total count).
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
        offset = (page - 1) * page_size
        entries = await qs.order_by("-date", "-clock_in").offset(offset).limit(page_size)
        return [_to_entry_with_employee_schema(e) for e in entries], total

    async def get_live_clocked_in(self, today: date) -> list[LiveClockInRecord]:
        """Retrieves all currently clocked-in entries for a given date.

        Args:
            today (date): The date to retrieve live clocked-in entries for.

        Returns:
            list[LiveClockInRecord]: Live clocked-in records with employee info.
        """
        entries = (
            await AttendanceLogTable.filter(date=today, attendance_status="IN_PROGRESS")
            .prefetch_related("employee__department")
            .all()
        )
        return [
            LiveClockInRecord(
                employee_id=e.employee.id,
                employee_name=e.employee.name,
                department=e.employee.department.name if e.employee.department else "",
                clock_in=e.clock_in,
            )
            for e in entries
        ]

    async def get_all_employees_active(self) -> list[SimpleEmployeeRecord]:
        """Retrieves all active employees as simplified records.

        Returns:
            list[SimpleEmployeeRecord]: A list of active employees with id, name, department.
        """
        employees = await EmployeeTable.filter(
            status=True, employee_status="active"
        ).prefetch_related("department")
        return [
            SimpleEmployeeRecord(
                id=emp.id,
                name=emp.name,
                department=emp.department.name if emp.department else "",
            )
            for emp in employees
        ]

    async def get_present_employee_ids_for_date(self, target_date: date) -> set[int]:
        """Retrieves the set of employee IDs with attendance entries for a given date.

        Args:
            target_date (date): The date to check.

        Returns:
            set[int]: Set of employee IDs that have attendance entries.
        """
        entries = await AttendanceLogTable.filter(date=target_date).all()
        return {e.employee_id for e in entries}

    async def count_flagged_for_date(self, target_date: date) -> int:
        """Counts flagged attendance entries for a given date.

        Args:
            target_date (date): The date to count flagged entries for.

        Returns:
            int: The number of flagged entries.
        """
        return await AttendanceLogTable.filter(is_flagged=True, date=target_date).count()

    async def count_auto_expired_for_date(self, target_date: date) -> int:
        """Counts auto-expired attendance entries for a given date.

        Args:
            target_date (date): The date to count auto-expired entries for.

        Returns:
            int: The number of auto-expired entries.
        """
        return await AttendanceLogTable.filter(
            attendance_status="AUTO_EXPIRED", date=target_date
        ).count()
