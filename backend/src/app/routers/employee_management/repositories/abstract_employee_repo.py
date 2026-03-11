from abc import ABC, abstractmethod

from src.app.routers.employee_management.schemas import EmployeeResponseSchema


class EmployeeRepoAbstract(ABC):
    """Abstract base class defining the interface for employee repository operations."""

    @abstractmethod
    async def list_employees(self) -> list[EmployeeResponseSchema]:
        """Retrieves a list of all active employees.

        Returns:
            list[EmployeeResponseSchema]: A list of employee records.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_employee(self, employee_id: int) -> EmployeeResponseSchema:
        """Retrieves a single employee by their unique identifier.

        Args:
            employee_id (int): The unique identifier of the employee to retrieve.

        Returns:
            EmployeeResponseSchema: The employee data.
        """
        raise NotImplementedError

    @abstractmethod
    async def create_employee(self, data: dict) -> EmployeeResponseSchema:
        """Creates a new employee record from the provided data.

        Args:
            data (dict): A dictionary containing the employee's information.

        Returns:
            EmployeeResponseSchema: The newly created employee data.
        """
        raise NotImplementedError

    @abstractmethod
    async def update_employee(self, employee_id: int, data: dict) -> EmployeeResponseSchema:
        """Updates an existing employee record with the provided data.

        Args:
            employee_id (int): The unique identifier of the employee to update.
            data (dict): A dictionary containing the fields to update.

        Returns:
            EmployeeResponseSchema: The updated employee data.
        """
        raise NotImplementedError

    @abstractmethod
    async def delete_employee(self, employee_id: int) -> None:
        """Deletes (soft-deletes) an employee record by their unique identifier.

        Args:
            employee_id (int): The unique identifier of the employee to delete.
        """
        raise NotImplementedError

    @abstractmethod
    async def create_invited_employee(self, data: dict) -> EmployeeResponseSchema:
        """Creates a new employee record with 'invited' status.

        Args:
            data (dict): A dictionary containing invitation information.

        Returns:
            EmployeeResponseSchema: The newly created invited employee data.
        """
        raise NotImplementedError
