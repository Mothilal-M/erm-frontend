from datetime import UTC, date, datetime

from injectq import inject, singleton

from src.app.core.auth.employee_resolver import resolve_employee
from src.app.db.tables.erm_tables import AttendanceLogTable
from src.app.routers.attendance.repositories import AttendanceRepo
from src.app.routers.attendance.schemas import (
    AdminAttendanceSummaryResponse,
    AdminLiveResponse,
    AdminLogsResponse,
    AttendanceEntrySchema,
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


def _to_entry_schema(entry: AttendanceLogTable) -> AttendanceEntrySchema:
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
class AttendanceService:
    """Service class for attendance-related business logic and operations."""

    @inject
    def __init__(self, repo: AttendanceRepo):
        self._repo = repo

    async def get_status(self, user: AuthUserSchema) -> AttendanceStatusResponse:
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
        employee = await resolve_employee(user)
        today = date.today()
        active = await self._repo.get_active_session(employee.id, today)
        if active:
            raise ValueError("Already clocked in")

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
        employee = await resolve_employee(user)
        today = date.today()
        active = await self._repo.get_active_session(employee.id, today)
        if not active:
            raise ValueError("Not clocked in")

        now = datetime.now(UTC)
        clock_in_aware = (
            active.clock_in if active.clock_in.tzinfo else active.clock_in.replace(tzinfo=UTC)
        )
        duration = int((now - clock_in_aware).total_seconds() / 60)

        active.clock_out = now
        active.duration_minutes = duration
        active.work_summary = data.work_summary
        active.attendance_status = "COMPLETED"
        await active.save()

        return ClockOutResponse(
            id=active.id,
            clock_out=active.clock_out.isoformat(),
            duration_minutes=duration,
            work_summary=active.work_summary,
        )

    async def get_today(self, user: AuthUserSchema) -> TodayAttendanceResponse:
        employee = await resolve_employee(user)
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

        return TodayAttendanceResponse(
            date=today.isoformat(),
            total_work_minutes=total_minutes,
            first_clock_in=first_clock_in,
            last_clock_out=last_clock_out,
            is_currently_in=is_currently_in,
            has_auto_expired_entry=has_auto_expired,
            entries=[_to_entry_schema(e) for e in entries],
        )

    async def get_history(
        self, user: AuthUserSchema, year: int | None, month: int | None, page: int = 1
    ) -> AttendanceHistoryResponse:
        employee = await resolve_employee(user)
        entries, total = await self._repo.get_history(employee.id, year, month, page)
        return AttendanceHistoryResponse(
            count=total,
            page=page,
            page_size=20,
            results=[_to_entry_schema(e) for e in entries],
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
            results=[_to_entry_with_employee_schema(e) for e in entries],
        )

    async def admin_edit_entry(
        self, entry_id: int, data: dict
    ) -> AttendanceEntryWithEmployeeSchema:
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
        return _to_entry_with_employee_schema(entry)

    async def admin_flag_entry(
        self, entry_id: int, data: dict
    ) -> AttendanceEntryWithEmployeeSchema:
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
        return _to_entry_with_employee_schema(entry)

    async def admin_manual_entry(self, data: dict) -> AttendanceEntryWithEmployeeSchema:
        clock_in = datetime.fromisoformat(data["clock_in"])
        clock_out = datetime.fromisoformat(data["clock_out"])
        ci = clock_in if clock_in.tzinfo else clock_in.replace(tzinfo=UTC)
        co = clock_out if clock_out.tzinfo else clock_out.replace(tzinfo=UTC)
        duration = int((co - ci).total_seconds() / 60)

        entry = await self._repo.create_entry(
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
        await entry.fetch_related("employee__department")
        return _to_entry_with_employee_schema(entry)

    async def get_admin_live(self) -> AdminLiveResponse:
        today = date.today()
        live_entries = await self._repo.get_live_clocked_in(today)
        all_employees = await self._repo.get_all_employees_active()

        now = datetime.now(UTC)
        live_ids = set()
        live_employees = []

        for entry in live_entries:
            emp = entry.employee
            live_ids.add(emp.id)
            clock_in_aware = (
                entry.clock_in if entry.clock_in.tzinfo else entry.clock_in.replace(tzinfo=UTC)
            )
            elapsed = int((now - clock_in_aware).total_seconds())
            expires_in = max(0, MAX_SESSION_SECONDS - elapsed)
            live_employees.append(
                LiveEmployeeSchema(
                    employee_id=emp.id,
                    employee_name=emp.name,
                    department=emp.department.name if emp.department else "",
                    clocked_in_at=entry.clock_in.isoformat(),
                    elapsed_seconds=elapsed,
                    expires_in_seconds=expires_in,
                    will_auto_expire=True,
                )
            )

        not_clocked_in = [
            NotClockedInEmployeeSchema(
                employee_id=emp.id,
                employee_name=emp.name,
                department=emp.department.name if emp.department else "",
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
        today = date.today()
        all_employees = await self._repo.get_all_employees_active()
        total = len(all_employees)

        today_entries = await AttendanceLogTable.filter(date=today).prefetch_related("employee")
        present_ids = {e.employee_id for e in today_entries}
        present_today = len(present_ids)

        live_entries = await self._repo.get_live_clocked_in(today)
        flagged = await AttendanceLogTable.filter(is_flagged=True, date=today).count()
        auto_expired = await AttendanceLogTable.filter(
            attendance_status="AUTO_EXPIRED", date=today
        ).count()

        return AdminAttendanceSummaryResponse(
            present_today=present_today,
            absent_today=total - present_today,
            live_now=len(live_entries),
            auto_expired_today=auto_expired,
            flagged_entries=flagged,
            total_employees=total,
        )
