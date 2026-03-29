from datetime import UTC, date, datetime

from injectq import inject, singleton

from src.app.core.auth.employee_resolver import resolve_employee
from src.app.core.exceptions import InvalidOperationError
from src.app.routers.attendance.repositories import AttendanceRepo
from src.app.routers.attendance.schemas import (
    AdminAttendanceSummaryResponse,
    AdminLiveResponse,
    AdminLogsResponse,
    AttendanceEntryWithEmployeeSchema,
    AttendanceHistoryResponse,
    AttendanceStatusResponse,
    ClockInResponse,
    ClockInSchema,
    ClockOutResponse,
    ClockOutSchema,
    LiveEmployeeSchema,
    NotClockedInEmployeeSchema,
    TodayAttendanceResponse,
)
from src.app.utils.schemas import AuthUserSchema


MAX_SESSION_SECONDS = 14400  # 4 hours


@singleton
class AttendanceService:
    """Service class for attendance-related business logic and operations."""

    @inject
    def __init__(self, repo: AttendanceRepo):
        """Initializes the AttendanceService with an AttendanceRepo instance.

        Args:
            repo (AttendanceRepo): The attendance repository for database operations.
        """
        self._repo = repo

    async def get_status(self, user: AuthUserSchema) -> AttendanceStatusResponse:
        """Retrieves the current clock-in status for the authenticated employee.

        Args:
            user (AuthUserSchema): The authenticated user's profile.

        Returns:
            AttendanceStatusResponse: The current attendance status including
                clock-in state, elapsed time, and auto-expiry details.
        """
        employee = await resolve_employee(user)
        today = date.today()
        active = await self._repo.get_active_session(employee.id, today)
        today_entries = await self._repo.get_today_entries(employee.id, today)

        total_minutes = sum(e.duration_minutes or 0 for e in today_entries)

        if active:
            now = datetime.now(UTC)
            clock_in_aware = (
                active.clock_in if active.clock_in.tzinfo else active.clock_in.replace(tzinfo=UTC)
            )
            elapsed = int((now - clock_in_aware).total_seconds())
            expires_in = max(0, MAX_SESSION_SECONDS - elapsed)
            return AttendanceStatusResponse(
                is_clocked=True,
                clocked_in_at=active.clock_in.isoformat(),
                elapsed_seconds=elapsed,
                expires_in_seconds=expires_in,
                will_auto_expire=True,
                today_total_minutes=total_minutes,
            )

        return AttendanceStatusResponse(
            is_clocked=False,
            clocked_in_at=None,
            elapsed_seconds=None,
            expires_in_seconds=None,
            will_auto_expire=False,
            today_total_minutes=total_minutes,
        )

    async def clock_in(self, user: AuthUserSchema, data: ClockInSchema) -> ClockInResponse:
        """Starts a new attendance session for the authenticated employee.

        Args:
            user (AuthUserSchema): The authenticated user's profile.
            data (ClockInSchema): The clock-in request data containing an optional note.

        Returns:
            ClockInResponse: The newly created clock-in entry details.

        Raises:
            InvalidOperationError: If the employee is already clocked in.
        """
        employee = await resolve_employee(user)
        today = date.today()
        active = await self._repo.get_active_session(employee.id, today)
        if active:
            raise InvalidOperationError("You are already clocked in. Please clock out first.")

        now = datetime.now(UTC)
        entry = await self._repo.create_entry(
            {
                "employee_id": employee.id,
                "date": today,
                "clock_in": now,
                "attendance_status": "IN_PROGRESS",
                "note": data.note,
            }
        )
        return ClockInResponse(
            id=entry.id,
            clocked_in_at=entry.clock_in.isoformat(),
            note=entry.note,
        )

    async def clock_out(self, user: AuthUserSchema, data: ClockOutSchema) -> ClockOutResponse:
        """Ends the current attendance session and records the work summary.

        Args:
            user (AuthUserSchema): The authenticated user's profile.
            data (ClockOutSchema): The clock-out request data containing a work summary.

        Returns:
            ClockOutResponse: The completed clock-out entry details with duration.

        Raises:
            InvalidOperationError: If the employee is not currently clocked in.
        """
        employee = await resolve_employee(user)
        today = date.today()
        active = await self._repo.get_active_session(employee.id, today)
        if not active:
            raise InvalidOperationError("You are not clocked in. Please clock in first.")

        now = datetime.now(UTC)
        clock_in_aware = (
            active.clock_in if active.clock_in.tzinfo else active.clock_in.replace(tzinfo=UTC)
        )
        duration = int((now - clock_in_aware).total_seconds() / 60)

        await self._repo.complete_session(active.id, now, duration, data.work_summary)

        return ClockOutResponse(
            id=active.id,
            clock_out=now.isoformat(),
            duration_minutes=duration,
            work_summary=data.work_summary,
        )

    async def get_today(self, user: AuthUserSchema) -> TodayAttendanceResponse:
        """Retrieves all attendance entries for the authenticated employee for today.

        Args:
            user (AuthUserSchema): The authenticated user's profile.

        Returns:
            TodayAttendanceResponse: Today's attendance summary with all entries.
        """
        employee = await resolve_employee(user)
        today = date.today()
        entries = await self._repo.get_today_entries(employee.id, today)

        total_minutes = sum(e.duration_minutes or 0 for e in entries)
        first_clock_in = entries[0].clock_in if entries else None
        last_clock_out = None
        is_currently_in = False
        has_auto_expired = False

        for e in entries:
            if e.clock_out:
                last_clock_out = e.clock_out
            if e.status == "IN_PROGRESS":
                is_currently_in = True
            if e.status == "AUTO_EXPIRED":
                has_auto_expired = True

        return TodayAttendanceResponse(
            date=today.isoformat(),
            total_work_minutes=total_minutes,
            first_clock_in=first_clock_in,
            last_clock_out=last_clock_out,
            is_currently_in=is_currently_in,
            has_auto_expired_entry=has_auto_expired,
            entries=entries,
        )

    async def get_history(
        self, user: AuthUserSchema, year: int | None, month: int | None, page: int = 1
    ) -> AttendanceHistoryResponse:
        """Retrieves paginated attendance history for the authenticated employee.

        Args:
            user (AuthUserSchema): The authenticated user's profile.
            year (int | None): Optional year filter.
            month (int | None): Optional month filter (used with year).
            page (int): Page number for pagination. Defaults to 1.

        Returns:
            AttendanceHistoryResponse: Paginated attendance history with entries.
        """
        employee = await resolve_employee(user)
        entries, total = await self._repo.get_history(employee.id, year, month, page)
        return AttendanceHistoryResponse(
            count=total,
            page=page,
            page_size=20,
            results=entries,
        )

    async def get_admin_logs(
        self,
        page: int = 1,
        status: str | None = None,
        date_filter: str | None = None,
        date_from: str | None = None,
        date_to: str | None = None,
        employee_id: int | None = None,
        department_id: int | None = None,
    ) -> AdminLogsResponse:
        """Retrieves paginated attendance logs for all employees (admin view).

        Args:
            page (int): Page number for pagination. Defaults to 1.
            status (str | None): Filter by attendance status.
            date_filter (str | None): Filter by exact date.
            date_from (str | None): Start date filter (inclusive).
            date_to (str | None): End date filter (inclusive).
            employee_id (int | None): Filter by employee ID.
            department_id (int | None): Filter by department ID.

        Returns:
            AdminLogsResponse: Paginated attendance logs with employee details.
        """
        entries, total = await self._repo.get_admin_logs(
            page=page,
            status=status,
            date_filter=date_filter,
            date_from=date_from,
            date_to=date_to,
            employee_id=employee_id,
            department_id=department_id,
        )
        return AdminLogsResponse(
            count=total,
            page=page,
            page_size=20,
            results=entries,
        )

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
        return await self._repo.admin_edit_entry(entry_id, data)

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
        return await self._repo.admin_flag_entry(entry_id, data)

    async def admin_manual_entry(self, data: dict) -> AttendanceEntryWithEmployeeSchema:
        """Creates a manual attendance entry for an employee (admin action).

        Args:
            data (dict): Must contain employee_id, clock_in, clock_out, and optionally
                work_summary and manual_entry_reason.

        Returns:
            AttendanceEntryWithEmployeeSchema: The newly created entry with employee details.
        """
        clock_in = datetime.fromisoformat(data["clock_in"])
        clock_out = datetime.fromisoformat(data["clock_out"])
        ci = clock_in if clock_in.tzinfo else clock_in.replace(tzinfo=UTC)
        co = clock_out if clock_out.tzinfo else clock_out.replace(tzinfo=UTC)
        duration = int((co - ci).total_seconds() / 60)

        return await self._repo.create_manual_entry(
            {
                "employee_id": data["employee_id"],
                "date": clock_in.date(),
                "clock_in": clock_in,
                "clock_out": clock_out,
                "duration_minutes": duration,
                "work_summary": data.get("work_summary"),
                "attendance_status": "MANUAL",
                "is_manual_entry": True,
                "manual_entry_reason": data.get("manual_entry_reason"),
            }
        )

    async def get_admin_live(self) -> AdminLiveResponse:
        """Retrieves a real-time list of clocked-in and not-clocked-in employees.

        Returns:
            AdminLiveResponse: Live clocked-in employees with elapsed time
                and a list of employees not currently clocked in.
        """
        today = date.today()
        live_records = await self._repo.get_live_clocked_in(today)
        all_employees = await self._repo.get_all_employees_active()

        now = datetime.now(UTC)
        live_ids = set()
        live_employees = []

        for record in live_records:
            live_ids.add(record.employee_id)
            clock_in_aware = (
                record.clock_in if record.clock_in.tzinfo else record.clock_in.replace(tzinfo=UTC)
            )
            elapsed = int((now - clock_in_aware).total_seconds())
            expires_in = max(0, MAX_SESSION_SECONDS - elapsed)
            live_employees.append(
                LiveEmployeeSchema(
                    employee_id=record.employee_id,
                    employee_name=record.employee_name,
                    department=record.department,
                    clocked_in_at=record.clock_in.isoformat(),
                    elapsed_seconds=elapsed,
                    expires_in_seconds=expires_in,
                    will_auto_expire=True,
                )
            )

        not_clocked_in = [
            NotClockedInEmployeeSchema(
                employee_id=emp.id,
                employee_name=emp.name,
                department=emp.department,
            )
            for emp in all_employees
            if emp.id not in live_ids
        ]

        return AdminLiveResponse(
            live_count=len(live_employees),
            live_employees=live_employees,
            not_clocked_in=not_clocked_in,
        )

    async def get_admin_summary(self) -> AdminAttendanceSummaryResponse:
        """Retrieves aggregated attendance statistics for the admin dashboard.

        Returns:
            AdminAttendanceSummaryResponse: Summary stats including present count,
                absent count, live sessions, auto-expired, and flagged entries.
        """
        today = date.today()
        all_employees = await self._repo.get_all_employees_active()
        total = len(all_employees)

        present_ids = await self._repo.get_present_employee_ids_for_date(today)
        present_today = len(present_ids)

        live_entries = await self._repo.get_live_clocked_in(today)
        flagged = await self._repo.count_flagged_for_date(today)
        auto_expired = await self._repo.count_auto_expired_for_date(today)

        return AdminAttendanceSummaryResponse(
            present_today=present_today,
            absent_today=total - present_today,
            live_now=len(live_entries),
            auto_expired_today=auto_expired,
            flagged_entries=flagged,
            total_employees=total,
        )
