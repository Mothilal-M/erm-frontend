from datetime import UTC, date, datetime

from injectq import inject, singleton

from src.app.db.tables.erm_tables import AttendanceLogTable, EmployeeTable
from src.app.routers.attendance.repositories import AttendanceRepo

MAX_SESSION_SECONDS = 14400  # 4 hours


def _serialize_entry(entry: AttendanceLogTable, include_employee: bool = False) -> dict:
    """Serializes an attendance log entry into a dictionary suitable for API responses.

    Args:
        entry (AttendanceLogTable): The attendance log entry to serialize.
        include_employee (bool): Whether to include employee details (id, name, department)
            in the serialized output. Defaults to False.

    Returns:
        dict: A dictionary containing the serialized attendance log data, with optional
            employee information if include_employee is True.
    """
    result = {
        "id": entry.id,
        "date": entry.date.isoformat(),
        "clockIn": entry.clock_in.isoformat() if entry.clock_in else None,
        "clockOut": entry.clock_out.isoformat() if entry.clock_out else None,
        "durationMinutes": entry.duration_minutes,
        "workSummary": entry.work_summary,
        "status": entry.attendance_status,
        "isManualEntry": entry.is_manual_entry,
        "manualEntryReason": entry.manual_entry_reason,
        "isFlagged": entry.is_flagged,
        "flagReason": entry.flag_reason,
        "flaggedBy": entry.flagged_by,
        "flaggedAt": entry.flagged_at.isoformat() if entry.flagged_at else None,
        "editedBy": entry.edited_by,
        "editedAt": entry.edited_at.isoformat() if entry.edited_at else None,
        "editReason": entry.edit_reason,
    }
    if include_employee:
        emp = entry.employee
        result["employeeId"] = emp.id
        result["employeeName"] = emp.name
        result["department"] = emp.department.name if emp.department else ""
    return result


@singleton
class AttendanceService:
    """Service class for attendance-related business logic and operations."""

    @inject
    def __init__(self, repo: AttendanceRepo):
        """Initializes the AttendanceService with the required repository dependency.

        Args:
            repo (AttendanceRepo): The attendance repository instance for database operations.
        """
        self._repo = repo

    async def get_status(self, employee: EmployeeTable) -> dict:
        """Retrieves the current clock-in status for an employee, including session timing details.

        Args:
            employee (EmployeeTable): The employee whose attendance status is being queried.

        Returns:
            dict: A dictionary containing clock-in status with keys: isClocked, clockedInAt,
                elapsedSeconds, expiresInSeconds, willAutoExpire, and todayTotalMinutes.
        """
        today = date.today()
        active = await self._repo.get_active_session(employee.id, today)
        today_entries = await self._repo.get_today_entries(employee.id, today)

        total_minutes = sum(e.duration_minutes or 0 for e in today_entries)

        if active:
            now = datetime.now(UTC)
            clock_in_aware = active.clock_in if active.clock_in.tzinfo else active.clock_in.replace(tzinfo=UTC)
            elapsed = int((now - clock_in_aware).total_seconds())
            expires_in = max(0, MAX_SESSION_SECONDS - elapsed)
            return {
                "isClocked": True,
                "clockedInAt": active.clock_in.isoformat(),
                "elapsedSeconds": elapsed,
                "expiresInSeconds": expires_in,
                "willAutoExpire": True,
                "todayTotalMinutes": total_minutes,
            }

        return {
            "isClocked": False,
            "clockedInAt": None,
            "elapsedSeconds": None,
            "expiresInSeconds": None,
            "willAutoExpire": False,
            "todayTotalMinutes": total_minutes,
        }

    async def clock_in(self, employee: EmployeeTable, data: dict) -> dict:
        """Records a clock-in event for the given employee.

        Args:
            employee (EmployeeTable): The employee who is clocking in.
            data (dict): A dictionary containing optional clock-in data such as "note".

        Returns:
            dict: A dictionary containing the new entry's id, clockedInAt timestamp, and note.

        Raises:
            ValueError: If the employee is already clocked in for today.
        """
        today = date.today()
        active = await self._repo.get_active_session(employee.id, today)
        if active:
            raise ValueError("Already clocked in")

        now = datetime.now(UTC)
        entry = await self._repo.create_entry({
            "employee_id": employee.id,
            "date": today,
            "clock_in": now,
            "attendance_status": "IN_PROGRESS",
            "note": data.get("note"),
        })
        return {
            "id": entry.id,
            "clockedInAt": entry.clock_in.isoformat(),
            "note": entry.note,
        }

    async def clock_out(self, employee: EmployeeTable, data: dict) -> dict:
        """Records a clock-out event for the given employee, calculating the session duration.

        Args:
            employee (EmployeeTable): The employee who is clocking out.
            data (dict): A dictionary containing optional clock-out data such as "work_summary".

        Returns:
            dict: A dictionary containing the entry's id, clockOut timestamp, durationMinutes,
                and workSummary.

        Raises:
            ValueError: If the employee is not currently clocked in.
        """
        today = date.today()
        active = await self._repo.get_active_session(employee.id, today)
        if not active:
            raise ValueError("Not clocked in")

        now = datetime.now(UTC)
        clock_in_aware = active.clock_in if active.clock_in.tzinfo else active.clock_in.replace(tzinfo=UTC)
        duration = int((now - clock_in_aware).total_seconds() / 60)

        active.clock_out = now
        active.duration_minutes = duration
        active.work_summary = data.get("work_summary")
        active.attendance_status = "COMPLETED"
        await active.save()

        return {
            "id": active.id,
            "clockOut": active.clock_out.isoformat(),
            "durationMinutes": duration,
            "workSummary": active.work_summary,
        }

    async def get_today(self, employee: EmployeeTable) -> dict:
        """Retrieves a comprehensive summary of the employee's attendance for today.

        Args:
            employee (EmployeeTable): The employee whose today's attendance is being queried.

        Returns:
            dict: A dictionary containing date, totalWorkMinutes, firstClockIn, lastClockOut,
                isCurrentlyIn, hasAutoExpiredEntry, and a list of serialized entries.
        """
        today = date.today()
        entries = await self._repo.get_today_entries(employee.id, today)

        total_minutes = sum(e.duration_minutes or 0 for e in entries)
        first_clock_in = entries[0].clock_in.isoformat() if entries else None
        last_clock_out = None
        is_currently_in = False
        has_auto_expired = False

        for e in entries:
            if e.clock_out:
                last_clock_out = e.clock_out.isoformat()
            if e.attendance_status == "IN_PROGRESS":
                is_currently_in = True
            if e.attendance_status == "AUTO_EXPIRED":
                has_auto_expired = True

        return {
            "date": today.isoformat(),
            "totalWorkMinutes": total_minutes,
            "firstClockIn": first_clock_in,
            "lastClockOut": last_clock_out,
            "isCurrentlyIn": is_currently_in,
            "hasAutoExpiredEntry": has_auto_expired,
            "entries": [_serialize_entry(e) for e in entries],
        }

    async def get_history(self, employee: EmployeeTable, year: int | None, month: int | None, page: int = 1) -> dict:
        """Retrieves paginated attendance history for an employee with optional date filters.

        Args:
            employee (EmployeeTable): The employee whose attendance history is being queried.
            year (int | None): The year to filter by. If None, no year filter is applied.
            month (int | None): The month to filter by (used with year). If None, no month filter is applied.
            page (int): The page number for pagination. Defaults to 1.

        Returns:
            dict: A dictionary containing count, page, pageSize, and a list of serialized results.
        """
        entries, total = await self._repo.get_history(employee.id, year, month, page)
        return {
            "count": total,
            "page": page,
            "pageSize": 20,
            "results": [_serialize_entry(e) for e in entries],
        }

    async def get_admin_logs(
        self,
        page: int = 1,
        status: str | None = None,
        date_filter: str | None = None,
        date_from: str | None = None,
        date_to: str | None = None,
        employee_id: int | None = None,
        department_id: int | None = None,
    ) -> dict:
        """Retrieves paginated attendance logs for administrative review with various filters.

        Args:
            page (int): The page number for pagination. Defaults to 1.
            status (str | None): Filter by attendance status (e.g., "COMPLETED", "FLAGGED"). Defaults to None.
            date_filter (str | None): Filter by an exact date. Defaults to None.
            date_from (str | None): Filter entries from this date onward (inclusive). Defaults to None.
            date_to (str | None): Filter entries up to this date (inclusive). Defaults to None.
            employee_id (int | None): Filter by a specific employee ID. Defaults to None.
            department_id (int | None): Filter by a specific department ID. Defaults to None.

        Returns:
            dict: A dictionary containing count, page, pageSize, and a list of serialized results
                with employee details included.
        """
        entries, total = await self._repo.get_admin_logs(
            page=page, status=status, date_filter=date_filter,
            date_from=date_from, date_to=date_to,
            employee_id=employee_id, department_id=department_id,
        )
        return {
            "count": total,
            "page": page,
            "pageSize": 20,
            "results": [_serialize_entry(e, include_employee=True) for e in entries],
        }

    async def admin_edit_entry(self, entry_id: int, data: dict) -> dict:
        """Allows an administrator to edit an existing attendance log entry.

        Args:
            entry_id (int): The unique identifier of the attendance log entry to edit.
            data (dict): A dictionary containing the fields to update. Supported keys include
                "clock_in", "clock_out", "work_summary", and "edit_reason".

        Returns:
            dict: A serialized dictionary of the updated attendance log entry with employee details.
        """
        entry = await self._repo.get_entry(entry_id)

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
        return _serialize_entry(entry, include_employee=True)

    async def admin_flag_entry(self, entry_id: int, data: dict) -> dict:
        """Allows an administrator to flag or unflag an attendance log entry.

        Args:
            entry_id (int): The unique identifier of the attendance log entry to flag or unflag.
            data (dict): A dictionary containing "is_flagged" (bool) and optionally "flag_reason" (str).

        Returns:
            dict: A serialized dictionary of the updated attendance log entry with employee details.
        """
        entry = await self._repo.get_entry(entry_id)
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
        return _serialize_entry(entry, include_employee=True)

    async def admin_manual_entry(self, data: dict) -> dict:
        """Allows an administrator to create a manual attendance entry for an employee.

        Args:
            data (dict): A dictionary containing the required fields: "employee_id", "clock_in",
                "clock_out", and optional fields "work_summary" and "manual_entry_reason".

        Returns:
            dict: A serialized dictionary of the newly created attendance log entry with employee details.
        """
        clock_in = datetime.fromisoformat(data["clock_in"])
        clock_out = datetime.fromisoformat(data["clock_out"])
        ci = clock_in if clock_in.tzinfo else clock_in.replace(tzinfo=UTC)
        co = clock_out if clock_out.tzinfo else clock_out.replace(tzinfo=UTC)
        duration = int((co - ci).total_seconds() / 60)

        entry = await self._repo.create_entry({
            "employee_id": data["employee_id"],
            "date": clock_in.date(),
            "clock_in": clock_in,
            "clock_out": clock_out,
            "duration_minutes": duration,
            "work_summary": data.get("work_summary"),
            "attendance_status": "MANUAL",
            "is_manual_entry": True,
            "manual_entry_reason": data.get("manual_entry_reason"),
        })
        await entry.fetch_related("employee__department")
        return _serialize_entry(entry, include_employee=True)

    async def get_admin_live(self) -> dict:
        """Retrieves a live overview of all currently clocked-in employees and those not yet clocked in.

        Returns:
            dict: A dictionary containing liveCount, liveEmployees (list of currently clocked-in
                employees with timing details), and notClockedIn (list of active employees
                who have not clocked in today).
        """
        today = date.today()
        live_entries = await self._repo.get_live_clocked_in(today)
        all_employees = await self._repo.get_all_employees_active()

        now = datetime.now(UTC)
        live_ids = set()
        live_employees = []

        for entry in live_entries:
            emp = entry.employee
            live_ids.add(emp.id)
            clock_in_aware = entry.clock_in if entry.clock_in.tzinfo else entry.clock_in.replace(tzinfo=UTC)
            elapsed = int((now - clock_in_aware).total_seconds())
            expires_in = max(0, MAX_SESSION_SECONDS - elapsed)
            live_employees.append({
                "employeeId": emp.id,
                "employeeName": emp.name,
                "department": emp.department.name if emp.department else "",
                "clockedInAt": entry.clock_in.isoformat(),
                "elapsedSeconds": elapsed,
                "expiresInSeconds": expires_in,
                "willAutoExpire": True,
            })

        not_clocked_in = [
            {
                "employeeId": emp.id,
                "employeeName": emp.name,
                "department": emp.department.name if emp.department else "",
            }
            for emp in all_employees
            if emp.id not in live_ids
        ]

        return {
            "liveCount": len(live_employees),
            "liveEmployees": live_employees,
            "notClockedIn": not_clocked_in,
        }

    async def get_admin_summary(self) -> dict:
        """Retrieves a high-level attendance summary for administrative dashboards.

        Returns:
            dict: A dictionary containing presentToday, absentToday, liveNow, autoExpiredToday,
                flaggedEntries, and totalEmployees counts for the current day.
        """
        today = date.today()
        all_employees = await self._repo.get_all_employees_active()
        total = len(all_employees)

        today_entries = await AttendanceLogTable.filter(date=today).prefetch_related("employee")
        present_ids = {e.employee_id for e in today_entries}
        present_today = len(present_ids)

        live_entries = await self._repo.get_live_clocked_in(today)
        flagged = await AttendanceLogTable.filter(is_flagged=True, date=today).count()
        auto_expired = await AttendanceLogTable.filter(attendance_status="AUTO_EXPIRED", date=today).count()

        return {
            "presentToday": present_today,
            "absentToday": total - present_today,
            "liveNow": len(live_entries),
            "autoExpiredToday": auto_expired,
            "flaggedEntries": flagged,
            "totalEmployees": total,
        }
