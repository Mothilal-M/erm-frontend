from datetime import datetime as dt

from pydantic import BaseModel

from src.app.utils.schemas.camel_schema import CamelModel


# --- Repo-level intermediate models ---


class ActiveSessionRecord(BaseModel):
    """Repo-level model for an active attendance session."""

    id: int
    clock_in: dt


class CreatedEntryRecord(BaseModel):
    """Repo-level model for a newly created attendance entry."""

    id: int
    clock_in: dt
    note: str | None = None


class LiveClockInRecord(BaseModel):
    """Repo-level model for a live clocked-in entry with employee info."""

    employee_id: int
    employee_name: str
    department: str
    clock_in: dt


class SimpleEmployeeRecord(BaseModel):
    """Repo-level model for a simplified employee record."""

    id: int
    name: str
    department: str


# --- Request Schemas ---


class ClockInSchema(CamelModel):
    note: str | None = None
    device_info: str | None = None


class ClockOutSchema(CamelModel):
    work_summary: str | None = None


class AdminEditEntrySchema(CamelModel):
    clock_in: str | None = None
    clock_out: str | None = None
    edit_reason: str | None = None
    work_summary: str | None = None


class AdminFlagEntrySchema(CamelModel):
    is_flagged: bool
    flag_reason: str | None = None


class AdminManualEntrySchema(CamelModel):
    employee_id: int
    clock_in: str
    clock_out: str
    work_summary: str | None = None
    manual_entry_reason: str | None = None


# --- Response Schemas ---


class AttendanceStatusResponse(CamelModel):
    is_clocked: bool
    clocked_in_at: str | None = None
    elapsed_seconds: int | None = None
    expires_in_seconds: int | None = None
    will_auto_expire: bool
    today_total_minutes: int


class ClockInResponse(CamelModel):
    id: int
    clocked_in_at: str
    note: str | None = None


class ClockOutResponse(CamelModel):
    id: int
    clock_out: str
    duration_minutes: int
    work_summary: str | None = None


class AttendanceEntrySchema(CamelModel):
    id: int
    date: str
    clock_in: str | None = None
    clock_out: str | None = None
    duration_minutes: int | None = None
    work_summary: str | None = None
    status: str
    is_manual_entry: bool
    manual_entry_reason: str | None = None
    is_flagged: bool
    flag_reason: str | None = None
    flagged_by: str | None = None
    flagged_at: str | None = None
    edited_by: str | None = None
    edited_at: str | None = None
    edit_reason: str | None = None


class AttendanceEntryWithEmployeeSchema(AttendanceEntrySchema):
    employee_id: int
    employee_name: str
    department: str


class TodayAttendanceResponse(CamelModel):
    date: str
    total_work_minutes: int
    first_clock_in: str | None = None
    last_clock_out: str | None = None
    is_currently_in: bool
    has_auto_expired_entry: bool
    entries: list[AttendanceEntrySchema]


class AttendanceHistoryResponse(CamelModel):
    count: int
    page: int
    page_size: int
    results: list[AttendanceEntrySchema]


class AdminLogsResponse(CamelModel):
    count: int
    page: int
    page_size: int
    results: list[AttendanceEntryWithEmployeeSchema]


class LiveEmployeeSchema(CamelModel):
    employee_id: int
    employee_name: str
    department: str
    clocked_in_at: str
    elapsed_seconds: int
    expires_in_seconds: int
    will_auto_expire: bool


class NotClockedInEmployeeSchema(CamelModel):
    employee_id: int
    employee_name: str
    department: str


class AdminLiveResponse(CamelModel):
    live_count: int
    live_employees: list[LiveEmployeeSchema]
    not_clocked_in: list[NotClockedInEmployeeSchema]


class AdminAttendanceSummaryResponse(CamelModel):
    present_today: int
    absent_today: int
    live_now: int
    auto_expired_today: int
    flagged_entries: int
    total_employees: int
