from src.app.utils.schemas.camel_schema import CamelModel


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
