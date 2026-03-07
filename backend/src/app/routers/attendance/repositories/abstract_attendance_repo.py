from abc import ABC, abstractmethod
from datetime import date


class AttendanceRepoAbstract(ABC):
    """Abstract base class defining the interface for attendance repository operations."""

    @abstractmethod
    async def get_active_session(self, employee_id: int, today: date):
        """Retrieves the currently active (in-progress) attendance session for an employee on a given date.

        Args:
            employee_id (int): The unique identifier of the employee.
            today (date): The date to check for an active session.

        Returns:
            AttendanceLogTable | None: The active attendance log entry, or None if no active session exists.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_today_entries(self, employee_id: int, today: date) -> list:
        """Retrieves all attendance log entries for an employee on a given date.

        Args:
            employee_id (int): The unique identifier of the employee.
            today (date): The date to retrieve entries for.

        Returns:
            list[AttendanceLogTable]: A list of attendance log entries ordered by clock-in time.
        """
        raise NotImplementedError

    @abstractmethod
    async def create_entry(self, data: dict):
        """Creates a new attendance log entry in the database.

        Args:
            data (dict): A dictionary containing the fields for the new attendance log entry.

        Returns:
            AttendanceLogTable: The newly created attendance log entry.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_entry(self, entry_id: int):
        """Retrieves a single attendance log entry by its unique identifier.

        Args:
            entry_id (int): The unique identifier of the attendance log entry.

        Returns:
            AttendanceLogTable: The attendance log entry with the related employee prefetched.

        Raises:
            DoesNotExist: If no attendance log entry with the given ID is found.
        """
        raise NotImplementedError
