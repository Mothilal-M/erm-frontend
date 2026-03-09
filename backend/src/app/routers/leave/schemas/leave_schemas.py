from pydantic import Field

from src.app.utils.schemas.camel_schema import CamelModel


class LeaveRequestSchema(CamelModel):
    leave_type: str
    sub_type: str = "full"
    date_from: str  # YYYY-MM-DD
    date_to: str
    days: float
    reason: str | None = None


class LeaveApprovalActionSchema(CamelModel):
    status: str  # "approved" | "rejected"
    note: str | None = None


class ManualLeaveRecordSchema(CamelModel):
    employee_id: int
    leave_type: str
    sub_type: str = "full"
    date_from: str
    date_to: str
    days: float
    reason: str | None = None


class LeaveSettingsUpdateSchema(CamelModel):
    annual_leave_quota: int | None = None
    sick_leave_quota: int | None = None
    casual_leave_quota: int | None = None
    carry_forward_limit: int | None = None
    carry_forward_enabled: bool | None = None
    half_day_enabled: bool | None = None
    wfh_enabled: bool | None = None
    auto_approve_after_days: int | None = None
    blackout_dates: list[str] | None = None
    leave_year_start: str | None = None


# --- Response Schemas ---


class DailyAttendanceRecord(CamelModel):
    date: str
    is_weekend: bool
    present: int
    absent: int
    on_leave: int
    total: int


class MonthlyAttendanceResponse(CamelModel):
    year: int
    month: int
    total_employees: int
    records: list[DailyAttendanceRecord]


class LeaveBreakdownItem(CamelModel):
    type: str
    count: int
    color: str


class DepartmentStatItem(CamelModel):
    department: str
    on_leave: int
    absent: int
    present: int
    wfh: int


class TopLeaveTakerItem(CamelModel):
    id: str
    name: str
    department: str
    total_days: float
    types: list[str]


class PendingApprovalItem(CamelModel):
    id: int
    name: str
    avatar: str
    type: str
    sub_type: str
    from_date: str = Field(alias="from")
    to_date: str = Field(alias="to")
    days: float
    reason: str


class ThisMonthStats(CamelModel):
    total_leaves: int
    total_absent: int
    total_present: int
    avg_daily_present: int
    avg_daily_absent: int
    avg_daily_on_leave: int
    total_wfh: int
    total_half_day: int


class AdminLeaveSummaryResponse(CamelModel):
    month: str
    year: int
    total_employees: int
    this_month: ThisMonthStats
    leave_breakdown: list[LeaveBreakdownItem]
    department_stats: list[DepartmentStatItem]
    top_leave_takers: list[TopLeaveTakerItem]
    pending_approvals: list[PendingApprovalItem]
    recent_activity: list


class ApprovalItem(CamelModel):
    id: int
    name: str
    avatar: str
    department: str
    type: str
    sub_type: str
    from_date: str = Field(alias="from")
    to_date: str = Field(alias="to")
    days: float
    status: str
    reason: str
    applied_on: str


class ApprovalActionResponse(CamelModel):
    id: int
    status: str


class ManualRecordResponse(CamelModel):
    id: int
    status: str


class AdminEmployeeItem(CamelModel):
    id: int
    name: str
    department: str
    avatar: str


class LeaveBalanceItem(CamelModel):
    type: str
    allocated: float
    used: float
    pending: float
    remaining: float


class EmployeeProfileInfo(CamelModel):
    id: str
    name: str
    role: str
    department: str
    avatar: str
    join_date: str
    manager: str


class MonthStats(CamelModel):
    present_days: int
    absent_days: int
    leave_days: int
    wfh_days: int
    half_days: int
    working_days: int
    attendance_pct: int


class LeaveHistoryItem(CamelModel):
    id: int
    type: str
    sub_type: str
    from_date: str = Field(alias="from")
    to_date: str = Field(alias="to")
    days: float
    status: str


class EmployeeLeaveProfileResponse(CamelModel):
    employee: EmployeeProfileInfo
    leave_balance: list[LeaveBalanceItem]
    this_month: MonthStats
    leave_history: list[LeaveHistoryItem]
    upcoming: list


class LeaveRequestResponse(CamelModel):
    id: int
    status: str


class LeaveSettingsResponse(CamelModel):
    annual_leave_quota: int
    sick_leave_quota: int
    casual_leave_quota: int
    carry_forward_limit: int
    carry_forward_enabled: bool
    half_day_enabled: bool
    wfh_enabled: bool
    auto_approve_after_days: int | None = None
    blackout_dates: list[str]
    leave_year_start: str


class DayEmployeePresent(CamelModel):
    id: int
    name: str
    department: str
    check_in: str


class DayEmployeeOnLeave(CamelModel):
    id: int
    name: str
    department: str
    leave_type: str


class DayEmployeeAbsent(CamelModel):
    id: int
    name: str
    department: str


class DaySummary(CamelModel):
    present: int
    on_leave: int
    absent: int
    total: int


class DayDetailResponse(CamelModel):
    date: str
    summary: DaySummary
    present: list[DayEmployeePresent]
    on_leave: list[DayEmployeeOnLeave]
    absent: list[DayEmployeeAbsent]
