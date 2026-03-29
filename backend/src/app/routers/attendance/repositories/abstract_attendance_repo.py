from abc import ABC, abstractmethod
from datetime import date, datetime

from src.app.routers.attendance.schemas import (
    ActiveSessionRecord,
    AttendanceEntrySchema,
    AttendanceEntryWithEmployeeSchema,
    CreatedEntryRecord,
    LiveClockInRecord,
    SimpleEmployeeRecord,
)


class AttendanceRepoAbstract(ABC):
    """Abstract base class defining the interface for attendance repository operations."""

    @abstractmethod
    async def get_active_session(self, employee_id: int, today: date) -> ActiveSessionRecord | None:
        """Retrieves the currently active attendance session for an employee.

        Args:
            employee_id (int): The unique identifier of the employee.
            today (date): The date to check for an active session.

        Returns:
            ActiveSessionRecord | None: The active session record, or None.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_today_entries(self, employee_id: int, today: date) -> list[AttendanceEntrySchema]:
        """Retrieves all attendance entries for an employee on a given date.

        Args:
            employee_id (int): The unique identifier of the employee.
            today (date): The date to retrieve entries for.

        Returns:
            list[AttendanceEntrySchema]: Entries ordered by clock-in time.
        """
        raise NotImplementedError

    @abstractmethod
    async def create_entry(self, data: dict) -> CreatedEntryRecord:
        """Creates a new attendance log entry in the database.

        Args:
            data (dict): A dictionary containing the fields for the new entry.

        Returns:
            CreatedEntryRecord: The newly created entry's key fields.
        """
        raise NotImplementedError

    @abstractmethod
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
        raise NotImplementedError

    @abstractmethod
    async def admin_edit_entry(
        self, entry_id: int, data: dict
    ) -> AttendanceEntryWithEmployeeSchema:
        """Updates an attendance entry and marks it as edited.

        Args:
            entry_id (int): The ID of the entry to edit.
            data (dict): Fields to update.

        Returns:
            AttendanceEntryWithEmployeeSchema: The updated entry with employee details.
        """
        raise NotImplementedError

    @abstractmethod
    async def admin_flag_entry(
        self, entry_id: int, data: dict
    ) -> AttendanceEntryWithEmployeeSchema:
        """Toggles the flagged status of an attendance entry.

        Args:
            entry_id (int): The ID of the entry to flag or unflag.
            data (dict): Must contain 'is_flagged' and optionally 'flag_reason'.

        Returns:
            AttendanceEntryWithEmployeeSchema: The updated entry with employee details.
        """
        raise NotImplementedError

    @abstractmethod
    async def create_manual_entry(self, data: dict) -> AttendanceEntryWithEmployeeSchema:
        """Creates a manual attendance entry and returns it with employee details.

        Args:
            data (dict): The fields for the manual entry.

        Returns:
            AttendanceEntryWithEmployeeSchema: The created entry with employee details.
        """
        raise NotImplementedError

    @abstractmethod
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
            year (int | None): Year filter.
            month (int | None): Month filter.
            page (int): Page number. Defaults to 1.
            page_size (int): Entries per page. Defaults to 20.

        Returns:
            tuple[list[AttendanceEntrySchema], int]: Entries and total count.
        """
        raise NotImplementedError

    @abstractmethod
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

        Returns:
            tuple[list[AttendanceEntryWithEmployeeSchema], int]: Entries and total count.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_live_clocked_in(self, today: date) -> list[LiveClockInRecord]:
        """Retrieves all currently clocked-in entries for a given date.

        Args:
            today (date): The date to retrieve live clocked-in entries for.

        Returns:
            list[LiveClockInRecord]: Live clocked-in records with employee info.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_all_employees_active(self) -> list[SimpleEmployeeRecord]:
        """Retrieves all active employees as simplified records.

        Returns:
            list[SimpleEmployeeRecord]: Active employees with id, name, department.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_present_employee_ids_for_date(self, target_date: date) -> set[int]:
        """Retrieves employee IDs with attendance entries for a given date.

        Args:
            target_date (date): The date to check.

        Returns:
            set[int]: Set of employee IDs.
        """
        raise NotImplementedError

    @abstractmethod
    async def count_flagged_for_date(self, target_date: date) -> int:
        """Counts flagged attendance entries for a given date.

        Args:
            target_date (date): The date to count flagged entries for.

        Returns:
            int: The number of flagged entries.
        """
        raise NotImplementedError

    @abstractmethod
    async def count_auto_expired_for_date(self, target_date: date) -> int:
        """Counts auto-expired attendance entries for a given date.

        Args:
            target_date (date): The date to count auto-expired entries for.

        Returns:
            int: The number of auto-expired entries.
        """
        raise NotImplementedError
