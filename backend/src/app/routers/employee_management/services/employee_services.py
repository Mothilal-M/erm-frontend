from injectq import inject, singleton

from src.app.db.tables.erm_tables import EmployeeTable
from src.app.routers.employee_management.repositories import EmployeeRepo


def _serialize_employee(emp: EmployeeTable) -> dict:
    """Serializes an EmployeeTable instance into a plain dictionary.

    Converts the ORM employee object into a dictionary suitable for
    API responses, including department name resolution and date formatting.

    Args:
        emp (EmployeeTable): The employee ORM instance to serialize.

    Returns:
        dict: A dictionary containing the employee's serialized data with keys:
            id, name, email, phone, department, role, joinDate, and status.
    """
    return {
        "id": emp.id,
        "name": emp.name,
        "email": emp.email,
        "phone": emp.phone,
        "department": emp.department.name if emp.department else "",
        "role": emp.role,
        "joinDate": emp.join_date.isoformat() if emp.join_date else None,
        "status": emp.employee_status,
    }


@singleton
class EmployeeService:
    """Service class for employee-related business logic and operations.

    Provides methods for listing, retrieving, creating, updating, and deleting
    employees, as well as handling invitations and performance data.
    """

    @inject
    def __init__(self, repo: EmployeeRepo):
        """Initializes the EmployeeService with an EmployeeRepo instance.

        Args:
            repo (EmployeeRepo): An instance of EmployeeRepo for data access.
        """
        self._repo = repo

    async def list_employees_with_stats(self) -> dict:
        """Retrieves all employees along with aggregated status statistics.

        Fetches the full list of employees, serializes them, and computes
        counts for active, inactive, and invited employees.

        Returns:
            dict: A dictionary containing:
                - employees (list[dict]): Serialized employee records.
                - stats (dict): Aggregated counts with keys: total, active,
                  inactive, and invited.
        """
        employees = await self._repo.list_employees()
        serialized = [_serialize_employee(e) for e in employees]

        active = sum(1 for e in employees if e.employee_status == "active")
        inactive = sum(1 for e in employees if e.employee_status == "inactive")
        invited = sum(1 for e in employees if e.employee_status == "invited")

        return {
            "employees": serialized,
            "stats": {
                "total": len(employees),
                "active": active,
                "inactive": inactive,
                "invited": invited,
            },
        }

    async def get_employee(self, employee_id: int) -> dict:
        """Retrieves a single employee by their unique identifier.

        Args:
            employee_id (int): The unique identifier of the employee to retrieve.

        Returns:
            dict: A serialized dictionary containing the employee's data.
        """
        emp = await self._repo.get_employee(employee_id)
        return _serialize_employee(emp)

    async def create_employee(self, data: dict) -> dict:
        """Creates a new employee record from the provided data.

        Args:
            data (dict): A dictionary containing the new employee's information
                (e.g., name, email, phone, department, role, join_date).

        Returns:
            dict: A serialized dictionary containing the newly created employee's data.
        """
        emp = await self._repo.create_employee(data)
        return _serialize_employee(emp)

    async def update_employee(self, employee_id: int, data: dict) -> dict:
        """Updates an existing employee record with the provided data.

        Args:
            employee_id (int): The unique identifier of the employee to update.
            data (dict): A dictionary containing the fields to update and their new values.

        Returns:
            dict: A serialized dictionary containing the updated employee's data.
        """
        emp = await self._repo.update_employee(employee_id, data)
        return _serialize_employee(emp)

    async def delete_employee(self, employee_id: int) -> None:
        """Deletes (soft-deletes) an employee by their unique identifier.

        Args:
            employee_id (int): The unique identifier of the employee to delete.
        """
        await self._repo.delete_employee(employee_id)

    async def invite_user(self, data: dict) -> dict:
        """Creates a new employee record with an 'invited' status.

        Args:
            data (dict): A dictionary containing invitation information.
                Expected keys include email, and optionally department and role.

        Returns:
            dict: A serialized dictionary containing the invited employee's data.
        """
        emp = await self._repo.create_invited_employee(data)
        return _serialize_employee(emp)

    async def get_performance(self) -> dict:
        """Retrieves placeholder performance data for the employee dashboard.

        Returns mock data including current sprint metrics, sprint history,
        performance scores, and recognition entries.

        Returns:
            dict: A dictionary containing:
                - currentSprint (dict): Metrics for the current sprint including
                  allocation, completion, efficiency, and time tracking.
                - sprintHistory (list[dict]): Historical sprint performance data.
                - performance (dict): Aggregated performance scores for velocity,
                  quality, collaboration, and overall.
                - recognition (list[dict]): Recent recognition and badge entries.
        """
        return {
            "currentSprint": {
                "id": 1,
                "name": "Sprint 12",
                "sprintNumber": 12,
                "projectName": "ERM Platform",
                "allocated": 8,
                "completed": 5,
                "inProgress": 2,
                "pending": 1,
                "efficiency": 85,
                "onTimeRate": 90,
                "estimatedHours": 40,
                "actualHours": 38,
            },
            "sprintHistory": [
                {"sprint": "Sprint 9", "allocated": 7, "completed": 6, "efficiency": 86},
                {"sprint": "Sprint 10", "allocated": 8, "completed": 7, "efficiency": 88},
                {"sprint": "Sprint 11", "allocated": 9, "completed": 8, "efficiency": 89},
                {"sprint": "Sprint 12", "allocated": 8, "completed": 5, "efficiency": 85},
            ],
            "performance": {
                "velocityScore": 82,
                "qualityScore": 90,
                "collaborationScore": 88,
                "overallScore": 87,
            },
            "recognition": [
                {
                    "id": 1,
                    "title": "Bug Squasher",
                    "givenBy": "Sarah Chen",
                    "date": "2026-02-20",
                    "type": "badge",
                    "emoji": "🐛",
                    "message": "Fixed 15 critical bugs this sprint!",
                    "color": "red",
                },
                {
                    "id": 2,
                    "title": "Team Player",
                    "givenBy": "Mike Johnson",
                    "date": "2026-02-18",
                    "type": "kudos",
                    "emoji": "🤝",
                    "message": "Great collaboration on the dashboard feature.",
                    "color": "blue",
                },
            ],
        }
