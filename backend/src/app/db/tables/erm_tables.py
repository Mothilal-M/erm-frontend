from datetime import date

from tortoise import fields

from .inheritance_table import CustomManager, TimestampMixin


class DepartmentTable(TimestampMixin):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100, unique=True)
    description = fields.CharField(max_length=500, default="")
    head = fields.CharField(max_length=255, default="")
    color = fields.CharField(max_length=20, default="slate")

    def __str__(self):
        return self.name

    class Meta:
        table = "t_department"
        manager = CustomManager()


class EmployeeTable(TimestampMixin):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    email = fields.CharField(max_length=255, unique=True, db_index=True)
    phone = fields.CharField(max_length=50, default="")
    department = fields.ForeignKeyField(
        "tables.DepartmentTable", related_name="employees", null=True, on_delete=fields.SET_NULL
    )
    role = fields.CharField(max_length=20, default="employee")
    join_date = fields.DateField(null=True)
    employee_status = fields.CharField(max_length=20, default="active")
    avatar = fields.CharField(max_length=500, default="")

    def __str__(self):
        return self.name

    class Meta:
        table = "t_employee"
        manager = CustomManager()


class AttendanceLogTable(TimestampMixin):
    id = fields.IntField(pk=True)
    employee = fields.ForeignKeyField(
        "tables.EmployeeTable", related_name="attendance_logs", on_delete=fields.CASCADE
    )
    date = fields.DateField(db_index=True)
    clock_in = fields.DatetimeField()
    clock_out = fields.DatetimeField(null=True)
    duration_minutes = fields.IntField(null=True)
    work_summary = fields.TextField(null=True)
    attendance_status = fields.CharField(max_length=20, default="IN_PROGRESS")
    is_manual_entry = fields.BooleanField(default=False)
    manual_entry_reason = fields.TextField(null=True)
    is_flagged = fields.BooleanField(default=False)
    flag_reason = fields.TextField(null=True)
    flagged_by = fields.CharField(max_length=255, null=True)
    flagged_at = fields.DatetimeField(null=True)
    edited_by = fields.CharField(max_length=255, null=True)
    edited_at = fields.DatetimeField(null=True)
    edit_reason = fields.TextField(null=True)
    note = fields.TextField(null=True)

    class Meta:
        table = "t_attendance_log"
        manager = CustomManager()


class LeaveTypeTable(TimestampMixin):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100, unique=True)
    color = fields.CharField(max_length=20, default="blue")

    def __str__(self):
        return self.name

    class Meta:
        table = "t_leave_type"
        manager = CustomManager()


class LeaveBalanceTable(TimestampMixin):
    id = fields.IntField(pk=True)
    employee = fields.ForeignKeyField(
        "tables.EmployeeTable", related_name="leave_balances", on_delete=fields.CASCADE
    )
    leave_type = fields.ForeignKeyField(
        "tables.LeaveTypeTable", related_name="balances", on_delete=fields.CASCADE
    )
    year = fields.IntField()
    allocated = fields.FloatField(default=0)
    used = fields.FloatField(default=0)
    pending = fields.FloatField(default=0)

    @property
    def remaining(self):
        return self.allocated - self.used - self.pending

    class Meta:
        table = "t_leave_balance"
        manager = CustomManager()
        unique_together = [("employee_id", "leave_type_id", "year")]


class LeaveRequestTable(TimestampMixin):
    id = fields.IntField(pk=True)
    employee = fields.ForeignKeyField(
        "tables.EmployeeTable", related_name="leave_requests", on_delete=fields.CASCADE
    )
    leave_type = fields.ForeignKeyField(
        "tables.LeaveTypeTable", related_name="requests", on_delete=fields.CASCADE
    )
    sub_type = fields.CharField(max_length=20, default="full")
    date_from = fields.DateField()
    date_to = fields.DateField()
    days = fields.FloatField()
    leave_status = fields.CharField(max_length=20, default="pending")
    reason = fields.TextField(null=True)
    applied_on = fields.DateField(default=date.today)
    reviewed_by = fields.ForeignKeyField(
        "tables.EmployeeTable",
        related_name="reviewed_requests",
        null=True,
        on_delete=fields.SET_NULL,
    )
    review_note = fields.TextField(null=True)
    reviewed_at = fields.DatetimeField(null=True)

    class Meta:
        table = "t_leave_request"
        manager = CustomManager()


class LeaveSettingsTable(TimestampMixin):
    id = fields.IntField(pk=True)
    annual_leave_quota = fields.IntField(default=20)
    sick_leave_quota = fields.IntField(default=10)
    casual_leave_quota = fields.IntField(default=5)
    carry_forward_limit = fields.IntField(default=5)
    carry_forward_enabled = fields.BooleanField(default=True)
    half_day_enabled = fields.BooleanField(default=True)
    wfh_enabled = fields.BooleanField(default=True)
    auto_approve_after_days = fields.IntField(null=True)
    blackout_dates = fields.JSONField(default=[])
    leave_year_start = fields.CharField(max_length=5, default="01-01")

    class Meta:
        table = "t_leave_settings"
        manager = CustomManager()
