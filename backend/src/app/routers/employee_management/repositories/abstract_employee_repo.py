from abc import ABC, abstractmethod


class EmployeeRepoAbstract(ABC):
    """Abstract base class defining the interface for employee repository operations.

    All concrete employee repository implementations must inherit from this class
    and provide implementations for each abstract method.
    """

    @abstractmethod
    async def list_employees(self) -> list:
        """Retrieves a list of all active employees.

        Returns:
            list: A list of employee records.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_employee(self, employee_id: int):
        """Retrieves a single employee by their unique identifier.

        Args:
            employee_id (int): The unique identifier of the employee to retrieve.

        Returns:
            The employee record matching the given identifier.

        Raises:
            NotImplementedError: If the method is not implemented by a subclass.
        """
        raise NotImplementedError

    @abstractmethod
    async def create_employee(self, data: dict):
        """Creates a new employee record from the provided data.

        Args:
            data (dict): A dictionary containing the employee's information
                (e.g., name, email, phone, department, role, join_date).

        Returns:
            The newly created employee record.

        Raises:
            NotImplementedError: If the method is not implemented by a subclass.
        """
        raise NotImplementedError

    @abstractmethod
    async def update_employee(self, employee_id: int, data: dict):
        """Updates an existing employee record with the provided data.

        Args:
            employee_id (int): The unique identifier of the employee to update.
            data (dict): A dictionary containing the fields to update and their new values.

        Returns:
            The updated employee record.

        Raises:
            NotImplementedError: If the method is not implemented by a subclass.
        """
        raise NotImplementedError

    @abstractmethod
    async def delete_employee(self, employee_id: int):
        """Deletes (soft-deletes) an employee record by their unique identifier.

        Args:
            employee_id (int): The unique identifier of the employee to delete.

        Raises:
            NotImplementedError: If the method is not implemented by a subclass.
        """
        raise NotImplementedError
