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
