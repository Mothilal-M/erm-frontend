"""
Seed script to populate initial ERM data and create Firebase auth accounts.
Run from backend-base directory: python -m scripts.seed_data
"""

import asyncio
from datetime import date

from firebase_admin import auth as firebase_auth
from tortoise import Tortoise

from src.app.core.auth.firebase_setup import init_firebase
from src.app.db.setup_database import TORTOISE_ORM
from src.app.db.tables.erm_tables import (
    DepartmentTable,
    EmployeeTable,
    LeaveBalanceTable,
    LeaveSettingsTable,
    LeaveTypeTable,
)

DEFAULT_PASSWORD = "Jack@123"


def create_firebase_user(email: str, display_name: str) -> None:
    """Create a Firebase user with a default password. Skip if already exists."""
    try:
        firebase_auth.get_user_by_email(email)
        print(f"  Firebase user already exists: {email}")
    except firebase_auth.UserNotFoundError:
        firebase_auth.create_user(
            email=email,
            password=DEFAULT_PASSWORD,
            display_name=display_name,
        )
        print(f"  Created Firebase user: {email} (password: {DEFAULT_PASSWORD})")
    except Exception as e:
        print(f"  Failed to create Firebase user for {email}: {e}")


async def seed():
    # Initialize Firebase Admin SDK
    init_firebase()

    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas()

    # Departments
    departments = ["Engineering", "Design", "Marketing", "HR", "Finance", "Operations"]
    dept_objs = {}
    for name in departments:
        dept, _ = await DepartmentTable.get_or_create(name=name)
        dept_objs[name] = dept
    print(f"Seeded {len(departments)} departments")

    # Leave Types
    leave_types = [
        ("Annual Leave", "blue"),
        ("Sick Leave", "red"),
        ("Casual Leave", "yellow"),
        ("Work From Home", "green"),
        ("Half Day", "purple"),
        ("Maternity", "pink"),
        ("Compensatory", "orange"),
        ("Unpaid Leave", "gray"),
    ]
    lt_objs = {}
    for name, color in leave_types:
        lt, _ = await LeaveTypeTable.get_or_create(name=name, defaults={"color": color})
        lt_objs[name] = lt
    print(f"Seeded {len(leave_types)} leave types")

    # Leave Settings (singleton)
    settings_count = await LeaveSettingsTable.all().count()
    if settings_count == 0:
        await LeaveSettingsTable.create(
            annual_leave_quota=20,
            sick_leave_quota=10,
            casual_leave_quota=5,
            carry_forward_limit=5,
            carry_forward_enabled=True,
            half_day_enabled=True,
            wfh_enabled=True,
        )
        print("Seeded leave settings")

    # Sample Employees
    employees_data = [
        {"name": "John Doe", "email": "john@example.com", "phone": "+1234567890",
         "department": "Engineering", "role": "admin", "join_date": date(2023, 1, 15)},
        {"name": "Jane Smith", "email": "jane@example.com", "phone": "+1234567891",
         "department": "Engineering", "role": "manager", "join_date": date(2023, 3, 1)},
        {"name": "Bob Wilson", "email": "bob@example.com", "phone": "+1234567892",
         "department": "Design", "role": "employee", "join_date": date(2023, 6, 10)},
        {"name": "Alice Johnson", "email": "alice@example.com", "phone": "+1234567893",
         "department": "Marketing", "role": "employee", "join_date": date(2023, 9, 20)},
        {"name": "Charlie Brown", "email": "charlie@example.com", "phone": "+1234567894",
         "department": "HR", "role": "manager", "join_date": date(2024, 1, 5)},
        {"name": "Diana Prince", "email": "diana@example.com", "phone": "+1234567895",
         "department": "Finance", "role": "employee", "join_date": date(2024, 4, 15)},
        {"name": "Eve Davis", "email": "eve@example.com", "phone": "+1234567896",
         "department": "Operations", "role": "employee", "join_date": date(2024, 7, 1)},
        {"name": "Frank Miller", "email": "frank@example.com", "phone": "+1234567897",
         "department": "Engineering", "role": "employee", "join_date": date(2024, 10, 10)},
    ]

    year = date.today().year
    for emp_data in employees_data:
        dept = dept_objs[emp_data["department"]]
        emp, created = await EmployeeTable.get_or_create(
            email=emp_data["email"],
            defaults={
                "name": emp_data["name"],
                "phone": emp_data["phone"],
                "department": dept,
                "role": emp_data["role"],
                "join_date": emp_data["join_date"],
                "employee_status": "active",
            },
        )

        # Create Firebase account for every employee
        create_firebase_user(emp_data["email"], emp_data["name"])

        if created:
            # Create leave balances
            for lt_name in ["Annual Leave", "Sick Leave", "Casual Leave"]:
                lt = lt_objs[lt_name]
                quota = {"Annual Leave": 20, "Sick Leave": 10, "Casual Leave": 5}[lt_name]
                await LeaveBalanceTable.get_or_create(
                    employee=emp,
                    leave_type=lt,
                    year=year,
                    defaults={"allocated": quota},
                )

    print(f"Seeded {len(employees_data)} employees with leave balances and Firebase accounts")

    await Tortoise.close_connections()
    print(f"\nSeed complete! All users can log in with password: {DEFAULT_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed())
