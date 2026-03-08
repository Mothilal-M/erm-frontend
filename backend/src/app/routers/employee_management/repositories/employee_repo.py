from datetime import date

from injectq import singleton

from src.app.db.tables.erm_tables import DepartmentTable, EmployeeTable

from .abstract_employee_repo import EmployeeRepoAbstract


@singleton
class EmployeeRepo(EmployeeRepoAbstract):
    """Concrete repository implementation for employee database operations.

    Provides CRUD operations for employee records using Tortoise ORM,
    including department resolution and soft-delete functionality.
    """

    async def _resolve_department(self, dept_name: str) -> DepartmentTable:
        """Resolves a department by name, creating it if it does not exist.

        Args:
            dept_name (str): The name of the department to resolve.

        Returns:
            DepartmentTable: The existing or newly created department record.
        """
        dept, _ = await DepartmentTable.get_or_create(name=dept_name)
        return dept

    async def list_employees(self) -> list[EmployeeTable]:
        """Retrieves all active employees with their related department data.

        Returns:
            list[EmployeeTable]: A list of active EmployeeTable instances
                with prefetched department relations.
        """
        return await EmployeeTable.filter(status=True).prefetch_related("department").all()

    async def get_employee(self, employee_id: int) -> EmployeeTable:
        """Retrieves a single active employee by their unique identifier.

        Args:
            employee_id (int): The unique identifier of the employee to retrieve.

        Returns:
            EmployeeTable: The matching EmployeeTable instance with prefetched
                department relation.

        Raises:
            DoesNotExist: If no active employee with the given ID is found.
        """
        return await EmployeeTable.get(id=employee_id, status=True).prefetch_related("department")

    async def create_employee(self, data: dict) -> EmployeeTable:
        """Creates a new employee record in the database.

        Extracts department name and join date from the data dictionary,
        resolves the department, and creates the employee with the
        remaining fields.

        Args:
            data (dict): A dictionary containing employee information. Expected keys:
                - name (str): The employee's full name.
                - email (str): The employee's email address.
                - phone (str, optional): The employee's phone number.
                - department (str, optional): The department name to assign.
                - role (str, optional): The employee's role. Defaults to "employee".
                - join_date (str, optional): ISO-format date string for the join date.

        Returns:
            EmployeeTable: The newly created EmployeeTable instance with
                prefetched department relation.
        """
        dept_name = data.pop("department", None)
        dept = await self._resolve_department(dept_name) if dept_name else None

        join_date_str = data.pop("join_date", None)
        join_date = date.fromisoformat(join_date_str) if join_date_str else None

        employee = await EmployeeTable.create(
            name=data["name"],
            email=data["email"],
            phone=data.get("phone", ""),
            department=dept,
            role=data.get("role", "employee"),
            join_date=join_date,
            employee_status="active",
        )
        await employee.fetch_related("department")
        return employee

    async def update_employee(self, employee_id: int, data: dict) -> EmployeeTable:
        """Updates an existing active employee record with the provided data.

        Handles department reassignment and join date parsing separately,
        then applies any remaining fields dynamically via setattr.

        Args:
            employee_id (int): The unique identifier of the employee to update.
            data (dict): A dictionary of fields to update. Supported keys include:
                - department (str, optional): New department name to assign.
                - join_date (str, optional): New ISO-format join date string.
                - Any other valid EmployeeTable attribute.

        Returns:
            EmployeeTable: The updated EmployeeTable instance with
                prefetched department relation.

        Raises:
            DoesNotExist: If no active employee with the given ID is found.
        """
        employee = await EmployeeTable.get(id=employee_id, status=True)

        if "department" in data and data["department"] is not None:
            dept = await self._resolve_department(data.pop("department"))
            employee.department = dept

        if "join_date" in data and data["join_date"] is not None:
            employee.join_date = date.fromisoformat(data.pop("join_date"))

        for key, value in data.items():
            if value is not None and hasattr(employee, key):
                setattr(employee, key, value)

        await employee.save()
        await employee.fetch_related("department")
        return employee

    async def delete_employee(self, employee_id: int) -> None:
        """Soft-deletes an employee by setting their status to inactive.

        Args:
            employee_id (int): The unique identifier of the employee to delete.

        Raises:
            DoesNotExist: If no employee with the given ID is found.
        """
        employee = await EmployeeTable.get(id=employee_id)
        employee.status = False
        await employee.save()

    async def create_invited_employee(self, data: dict) -> EmployeeTable:
        """Creates a new employee record with an 'invited' status.

        The employee's name is derived from the email address prefix (before the @ symbol).

        Args:
            data (dict): A dictionary containing invitation information. Expected keys:
                - email (str): The invited employee's email address.
                - department (str, optional): The department name to assign.
                - role (str, optional): The employee's role. Defaults to "employee".

        Returns:
            EmployeeTable: The newly created EmployeeTable instance with
                employee_status set to "invited" and prefetched department relation.
        """
        dept_name = data.get("department")
        dept = await self._resolve_department(dept_name) if dept_name else None

        name = data["email"].split("@")[0]
        employee = await EmployeeTable.create(
            name=name,
            email=data["email"],
            role=data.get("role", "employee"),
            department=dept,
            employee_status="invited",
        )
        await employee.fetch_related("department")
        return employee
