from src.app.db.tables.erm_tables import (
    AttendanceLogTable,
    DepartmentTable,
    EmployeeTable,
    LeaveBalanceTable,
    LeaveRequestTable,
    LeaveSettingsTable,
    LeaveTypeTable,
)
from src.app.db.tables.user_tables import UserTable

from .setup_database import TORTOISE_ORM, setup_db
from .tables.user_device_tables import UserDeviceTable
from .views.setup_views import setup_view


__all__ = [
    "setup_db",
    "UserTable",
    "UserDeviceTable",
    "setup_view",
    "TORTOISE_ORM",
    "DepartmentTable",
    "EmployeeTable",
    "AttendanceLogTable",
    "LeaveTypeTable",
    "LeaveBalanceTable",
    "LeaveRequestTable",
    "LeaveSettingsTable",
]
