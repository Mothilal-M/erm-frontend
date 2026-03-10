from abc import ABC, abstractmethod


class LeaveRepoAbstract(ABC):
    """Abstract base class defining the interface for leave repository operations.

    All concrete leave repository implementations must inherit from this class
    and provide implementations for the defined abstract methods.
    """

    @abstractmethod
    async def get_leave_requests(self, **filters):
        """Retrieves leave requests filtered by the provided criteria.

        Args:
            **filters: Keyword arguments used to filter leave requests
                (e.g., leave_status, employee_id).

        Raises:
            NotImplementedError: If the method is not implemented by a subclass.
        """
        raise NotImplementedError

    @abstractmethod
    async def create_leave_request(self, data: dict):
        """Creates a new leave request record.

        Args:
            data (dict): A dictionary containing the leave request fields
                (e.g., employee_id, leave_type_id, date_from, date_to, days, reason).

        Raises:
            NotImplementedError: If the method is not implemented by a subclass.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_settings(self):
        """Retrieves the current leave management settings.

        Raises:
            NotImplementedError: If the method is not implemented by a subclass.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_employee_attendance_for_range(self, employee_id: int, date_from, date_to) -> list:
        """Retrieves attendance entries for an employee within a date range.

        Args:
            employee_id (int): The unique identifier of the employee.
            date_from: Start date (inclusive).
            date_to: End date (inclusive).

        Raises:
            NotImplementedError: If the method is not implemented by a subclass.
        """
        raise NotImplementedError
