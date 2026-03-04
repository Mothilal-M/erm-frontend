import calendar
from collections import defaultdict
from datetime import UTC, date, datetime, timedelta

from injectq import inject, singleton

from src.app.db.tables.erm_tables import EmployeeTable, LeaveRequestTable
from src.app.routers.leave.repositories import LeaveRepo


@singleton
class LeaveService:
    """Service class for leave management business logic and operations.

    Provides methods for attendance tracking, leave request management,
    admin dashboards, employee profiles, and leave settings configuration.
    """

    @inject
    def __init__(self, repo: LeaveRepo):
        """Initializes the LeaveService with a LeaveRepo instance.

        Args:
            repo (LeaveRepo): An instance of LeaveRepo for database operations.
        """
        self._repo = repo

    async def get_monthly_attendance(self, year: int, month: int) -> dict:
        """Retrieves daily attendance records for an entire month.

        Computes per-day counts of present, absent, and on-leave employees
        by cross-referencing attendance logs and leave requests.

        Args:
            year (int): The calendar year.
            month (int): The calendar month (0-indexed, as received from the frontend).

        Returns:
            dict: A dictionary containing:
                - year (int): The calendar year.
                - month (int): The month (0-indexed).
                - totalEmployees (int): Total number of active employees.
                - records (list[dict]): A list of daily records, each containing
                  date, isWeekend, present, absent, onLeave, and total counts.
        """
        # month from frontend is 0-indexed
        actual_month = month + 1
        employees = await self._repo.get_active_employees()
        total_employees = len(employees)

        attendance_logs = await self._repo.get_attendance_for_month(year, actual_month)
        leave_requests = await self._repo.get_leave_requests_for_month(year, actual_month)

        # Build per-date attendance sets
        present_by_date = defaultdict(set)
        for log in attendance_logs:
            present_by_date[log.date].add(log.employee_id)

        # Build per-date leave sets
        on_leave_by_date = defaultdict(set)
        for lr in leave_requests:
            current = lr.date_from
            while current <= lr.date_to:
                if current.month == actual_month and current.year == year:
                    on_leave_by_date[current].add(lr.employee_id)
                current += timedelta(days=1)

        num_days = calendar.monthrange(year, actual_month)[1]
        records = []
        for day in range(1, num_days + 1):
            d = date(year, actual_month, day)
            is_weekend = d.weekday() >= 5
            present = len(present_by_date.get(d, set()))
            on_leave = len(on_leave_by_date.get(d, set()))
            absent = max(0, total_employees - present - on_leave) if not is_weekend else 0

            records.append({
                "date": d.isoformat(),
                "isWeekend": is_weekend,
                "present": present,
                "absent": absent,
                "onLeave": on_leave,
                "total": total_employees,
            })

        return {
            "year": year,
            "month": month,
            "totalEmployees": total_employees,
            "records": records,
        }

    async def get_admin_summary(self) -> dict:
        """Retrieves a comprehensive admin dashboard summary for the current month.

        Aggregates leave data including breakdowns by type, department statistics,
        top leave takers, and pending approval requests.

        Returns:
            dict: A dictionary containing:
                - month (str): The current month name.
                - year (int): The current year.
                - totalEmployees (int): Total number of active employees.
                - thisMonth (dict): Monthly statistics including totalLeaves,
                  totalAbsent, totalPresent, avgDailyPresent, avgDailyAbsent,
                  avgDailyOnLeave, totalWFH, and totalHalfDay.
                - leaveBreakdown (list[dict]): Leave counts grouped by type with colors.
                - departmentStats (list[dict]): Per-department leave statistics.
                - topLeaveTakers (list[dict]): Top 5 employees by leave days taken.
                - pendingApprovals (list[dict]): Up to 5 pending leave requests.
                - recentActivity (list): Recent activity entries (currently empty).
        """
        today = date.today()
        employees = await self._repo.get_active_employees()
        total_employees = len(employees)

        # This month's leave requests
        leave_requests = await self._repo.get_leave_requests_for_month(today.year, today.month)

        # Count by type
        type_counts: dict[str, float] = defaultdict(int)
        dept_stats: dict[str, dict[str, int]] = defaultdict(
            lambda: {"onLeave": 0, "absent": 0, "present": 0, "wfh": 0}
        )
        employee_leave_days: dict[int, dict] = defaultdict(
            lambda: {"total": 0, "types": set()}
        )

        for lr in leave_requests:
            type_name = lr.leave_type.name if lr.leave_type else "Other"
            type_counts[type_name] += lr.days
            emp = lr.employee
            dept = emp.department.name if emp.department else "Unknown"
            dept_stats[dept]["onLeave"] += 1
            if lr.sub_type == "wfh":
                dept_stats[dept]["wfh"] += 1

            employee_leave_days[emp.id]["total"] += lr.days
            employee_leave_days[emp.id]["types"].add(type_name)
            employee_leave_days[emp.id]["name"] = emp.name
            employee_leave_days[emp.id]["department"] = dept

        # Leave breakdown
        colors = {"Annual Leave": "blue", "Sick Leave": "red", "Casual Leave": "yellow",
                  "Work From Home": "green", "Half Day": "purple", "Maternity": "pink",
                  "Compensatory": "orange", "Unpaid Leave": "gray"}
        leave_breakdown = [
            {"type": t, "count": int(c), "color": colors.get(t, "blue")}
            for t, c in type_counts.items()
        ]

        # Department stats
        department_stats = [
            {"department": dept, **stats}
            for dept, stats in dept_stats.items()
        ]

        # Top leave takers
        top_leave_takers = sorted(
            [
                {
                    "id": str(eid),
                    "name": info["name"],
                    "department": info["department"],
                    "totalDays": info["total"],
                    "types": list(info["types"]),
                }
                for eid, info in employee_leave_days.items()
            ],
            key=lambda x: x["totalDays"],
            reverse=True,
        )[:5]

        # Pending approvals
        pending = await self._repo.get_leave_requests(leave_status="pending")
        pending_approvals = [
            {
                "id": lr.id,
                "name": lr.employee.name,
                "avatar": lr.employee.avatar or "",
                "type": lr.leave_type.name if lr.leave_type else "",
                "subType": lr.sub_type,
                "from": lr.date_from.isoformat(),
                "to": lr.date_to.isoformat(),
                "days": lr.days,
                "reason": lr.reason or "",
            }
            for lr in pending[:5]
        ]

        total_leaves = sum(type_counts.values())

        return {
            "month": today.strftime("%B"),
            "year": today.year,
            "totalEmployees": total_employees,
            "thisMonth": {
                "totalLeaves": int(total_leaves),
                "totalAbsent": 0,
                "totalPresent": total_employees,
                "avgDailyPresent": total_employees,
                "avgDailyAbsent": 0,
                "avgDailyOnLeave": int(total_leaves / max(today.day, 1)),
                "totalWFH": sum(1 for lr in leave_requests if lr.sub_type == "wfh"),
                "totalHalfDay": sum(1 for lr in leave_requests if lr.sub_type == "halfday"),
            },
            "leaveBreakdown": leave_breakdown,
            "departmentStats": department_stats,
            "topLeaveTakers": top_leave_takers,
            "pendingApprovals": pending_approvals,
            "recentActivity": [],
        }

    async def get_approvals(self) -> list[dict]:
        """Retrieves all leave requests formatted for the approvals view.

        Returns:
            list[dict]: A list of dictionaries, each representing a leave request
                with fields: id, name, avatar, department, type, subType, from, to,
                days, status, reason, and appliedOn.
        """
        requests = await self._repo.get_leave_requests()
        return [
            {
                "id": lr.id,
                "name": lr.employee.name,
                "avatar": lr.employee.avatar or "",
                "department": lr.employee.department.name if lr.employee.department else "",
                "type": lr.leave_type.name if lr.leave_type else "",
                "subType": lr.sub_type,
                "from": lr.date_from.isoformat(),
                "to": lr.date_to.isoformat(),
                "days": lr.days,
                "status": lr.leave_status,
                "reason": lr.reason or "",
                "appliedOn": lr.applied_on.isoformat() if lr.applied_on else "",
            }
            for lr in requests
        ]

    async def approve_or_reject(self, request_id: int, status: str, note: str | None) -> dict:
        """Approves or rejects a pending leave request and updates the leave balance.

        When a pending request is approved, the pending count is decremented and
        the used count is incremented. When rejected, only the pending count is
        decremented.

        Args:
            request_id (int): The unique identifier of the leave request.
            status (str): The new status to set ("approved" or "rejected").
            note (str | None): An optional reviewer note to attach to the request.

        Returns:
            dict: A dictionary containing the leave request id and its updated status.
        """
        lr = await self._repo.get_leave_request(request_id)
        old_status = lr.leave_status
        lr.leave_status = status
        lr.review_note = note
        lr.reviewed_at = datetime.now(UTC)
        await lr.save()

        # Update leave balance
        year = lr.date_from.year
        balance = await self._repo.get_or_create_balance(
            lr.employee_id, lr.leave_type_id, year
        )

        if status == "approved" and old_status == "pending":
            balance.pending = max(0, balance.pending - lr.days)
            balance.used += lr.days
            await balance.save()
        elif status == "rejected" and old_status == "pending":
            balance.pending = max(0, balance.pending - lr.days)
            await balance.save()

        return {"id": lr.id, "status": lr.leave_status}

    async def manual_record(self, data: dict) -> dict:
        """Creates a manually recorded leave request with an auto-approved status.

        Used by administrators to record leave directly without requiring the
        standard approval workflow. Also updates the employee's leave balance.

        Args:
            data (dict): A dictionary containing:
                - employee_id (int): The employee's identifier.
                - leave_type (str): The name of the leave type.
                - sub_type (str, optional): The sub-type (e.g., "full", "halfday", "wfh").
                - date_from (str): The start date in ISO format.
                - date_to (str): The end date in ISO format.
                - days (float): The number of leave days.
                - reason (str, optional): The reason for leave.

        Returns:
            dict: A dictionary containing the leave request id and status "approved".
        """
        leave_type = await self._repo.get_or_create_leave_type(data["leave_type"])
        lr = await self._repo.create_leave_request({
            "employee_id": data["employee_id"],
            "leave_type_id": leave_type.id,
            "sub_type": data.get("sub_type", "full"),
            "date_from": date.fromisoformat(data["date_from"]),
            "date_to": date.fromisoformat(data["date_to"]),
            "days": data["days"],
            "leave_status": "approved",
            "reason": data.get("reason"),
            "applied_on": date.today(),
        })

        # Update balance
        year = lr.date_from.year
        balance = await self._repo.get_or_create_balance(
            data["employee_id"], leave_type.id, year
        )
        balance.used += data["days"]
        await balance.save()

        return {"id": lr.id, "status": "approved"}

    async def get_admin_employees(self) -> list[dict]:
        """Retrieves a simplified list of employees for admin selection dropdowns.

        Returns:
            list[dict]: A list of dictionaries, each containing id, name,
                department, and avatar for an active employee.
        """
        employees = await self._repo.get_employees_simple()
        return [
            {
                "id": emp.id,
                "name": emp.name,
                "department": emp.department.name if emp.department else "",
                "avatar": emp.avatar or "",
            }
            for emp in employees
        ]

    async def get_employee_profile(self, employee: EmployeeTable) -> dict:
        """Retrieves a comprehensive leave profile for a specific employee.

        Includes leave balances (with automatic default creation if none exist),
        current month attendance statistics, and leave history.

        Args:
            employee (EmployeeTable): The employee record to build the profile for.

        Returns:
            dict: A dictionary containing:
                - employee (dict): Employee details (id, name, role, department,
                  avatar, joinDate, manager).
                - leaveBalance (list[dict]): Leave balances per type with allocated,
                  used, pending, and remaining counts.
                - thisMonth (dict): Current month statistics including presentDays,
                  absentDays, leaveDays, wfhDays, halfDays, workingDays, and
                  attendancePct.
                - leaveHistory (list[dict]): Past leave requests with type, dates,
                  days, and status.
                - upcoming (list): Upcoming leave entries (currently empty).
        """
        today = date.today()
        year = today.year

        # Get balances
        balances = await self._repo.get_leave_balances(employee.id, year)

        # If no balances exist, create defaults from settings
        if not balances:
            settings = await self._repo.get_settings()
            leave_types_map = {
                "Annual Leave": settings.annual_leave_quota,
                "Sick Leave": settings.sick_leave_quota,
                "Casual Leave": settings.casual_leave_quota,
            }
            for lt_name, quota in leave_types_map.items():
                lt = await self._repo.get_or_create_leave_type(lt_name)
                await self._repo.get_or_create_balance(employee.id, lt.id, year)
                bal = await self._repo.get_or_create_balance(employee.id, lt.id, year)
                bal.allocated = quota
                await bal.save()
            balances = await self._repo.get_leave_balances(employee.id, year)

        leave_balance = [
            {
                "type": b.leave_type.name,
                "allocated": b.allocated,
                "used": b.used,
                "pending": b.pending,
                "remaining": b.allocated - b.used - b.pending,
            }
            for b in balances
        ]

        # This month stats
        from src.app.db.tables.erm_tables import AttendanceLogTable
        month_start = date(today.year, today.month, 1)
        month_end = date(today.year, today.month, calendar.monthrange(today.year, today.month)[1])
        month_attendance = await AttendanceLogTable.filter(
            employee_id=employee.id,
            date__gte=month_start,
            date__lte=month_end,
        ).all()

        present_days = len({a.date for a in month_attendance})
        num_days = calendar.monthrange(today.year, today.month)[1]
        working_days = sum(
            1 for d in range(1, num_days + 1)
            if date(today.year, today.month, d).weekday() < 5
            and date(today.year, today.month, d) <= today
        )

        # Leave history
        history = await self._repo.get_employee_leave_history(employee.id)
        leave_history = [
            {
                "id": lr.id,
                "type": lr.leave_type.name if lr.leave_type else "",
                "subType": lr.sub_type,
                "from": lr.date_from.isoformat(),
                "to": lr.date_to.isoformat(),
                "days": lr.days,
                "status": lr.leave_status,
            }
            for lr in history
        ]

        leave_days = sum(lr.days for lr in history if lr.leave_status == "approved"
                        and lr.date_from.month == today.month and lr.date_from.year == today.year)

        await employee.fetch_related("department")

        return {
            "employee": {
                "id": str(employee.id),
                "name": employee.name,
                "role": employee.role,
                "department": employee.department.name if employee.department else "",
                "avatar": employee.avatar or "",
                "joinDate": employee.join_date.isoformat() if employee.join_date else "",
                "manager": "",
            },
            "leaveBalance": leave_balance,
            "thisMonth": {
                "presentDays": present_days,
                "absentDays": max(0, working_days - present_days - int(leave_days)),
                "leaveDays": int(leave_days),
                "wfhDays": 0,
                "halfDays": 0,
                "workingDays": working_days,
                "attendancePct": round(present_days / max(working_days, 1) * 100),
            },
            "leaveHistory": leave_history,
            "upcoming": [],
        }

    async def submit_leave_request(self, employee: EmployeeTable, data: dict) -> dict:
        """Submits a new leave request on behalf of an employee.

        Creates the leave request with a pending status and updates the
        employee's pending leave balance accordingly.

        Args:
            employee (EmployeeTable): The employee submitting the leave request.
            data (dict): A dictionary containing:
                - leave_type (str): The name of the leave type.
                - sub_type (str, optional): The sub-type (e.g., "full", "halfday", "wfh").
                - date_from (str): The start date in ISO format.
                - date_to (str): The end date in ISO format.
                - days (float): The number of leave days.
                - reason (str, optional): The reason for the leave request.

        Returns:
            dict: A dictionary containing the leave request id and status "pending".
        """
        leave_type = await self._repo.get_or_create_leave_type(data["leave_type"])
        lr = await self._repo.create_leave_request({
            "employee_id": employee.id,
            "leave_type_id": leave_type.id,
            "sub_type": data.get("sub_type", "full"),
            "date_from": date.fromisoformat(data["date_from"]),
            "date_to": date.fromisoformat(data["date_to"]),
            "days": data["days"],
            "leave_status": "pending",
            "reason": data.get("reason"),
            "applied_on": date.today(),
        })

        # Update pending balance
        year = lr.date_from.year
        balance = await self._repo.get_or_create_balance(
            employee.id, leave_type.id, year
        )
        balance.pending += data["days"]
        await balance.save()

        return {"id": lr.id, "status": "pending"}

    async def get_settings(self) -> dict:
        """Retrieves the current leave management settings as a dictionary.

        Returns:
            dict: A dictionary containing all leave setting values with
                camelCase keys: annualLeaveQuota, sickLeaveQuota, casualLeaveQuota,
                carryForwardLimit, carryForwardEnabled, halfDayEnabled, wfhEnabled,
                autoApproveAfterDays, blackoutDates, and leaveYearStart.
        """
        settings = await self._repo.get_settings()
        return {
            "annualLeaveQuota": settings.annual_leave_quota,
            "sickLeaveQuota": settings.sick_leave_quota,
            "casualLeaveQuota": settings.casual_leave_quota,
            "carryForwardLimit": settings.carry_forward_limit,
            "carryForwardEnabled": settings.carry_forward_enabled,
            "halfDayEnabled": settings.half_day_enabled,
            "wfhEnabled": settings.wfh_enabled,
            "autoApproveAfterDays": settings.auto_approve_after_days,
            "blackoutDates": settings.blackout_dates,
            "leaveYearStart": settings.leave_year_start,
        }

    async def update_settings(self, data: dict) -> dict:
        """Updates the leave management settings and returns the new values.

        Args:
            data (dict): A dictionary of setting fields to update.

        Returns:
            dict: The updated leave settings as a dictionary, in the same
                format as returned by get_settings().
        """
        await self._repo.update_settings(data)
        return await self.get_settings()

    async def get_day_detail(self, target_date_str: str) -> dict:
        """Retrieves detailed attendance information for a specific date.

        Categorizes all employees into present, on-leave, or absent lists
        based on attendance logs and leave requests for the given date.

        Args:
            target_date_str (str): The target date in ISO format (YYYY-MM-DD).

        Returns:
            dict: A dictionary containing:
                - date (str): The target date in ISO format.
                - summary (dict): Counts of present, onLeave, absent, and total employees.
                - present (list[dict]): Employees who were present, with check-in times.
                - onLeave (list[dict]): Employees on leave, with leave type details.
                - absent (list[dict]): Employees who were neither present nor on leave.
        """
        target_date = date.fromisoformat(target_date_str)
        employees = await self._repo.get_active_employees()
        attendance = await self._repo.get_attendance_for_date(target_date)
        leave_requests = await self._repo.get_leave_requests_for_date(target_date)

        present_ids = set()
        present_list = []
        for a in attendance:
            emp = a.employee
            present_ids.add(emp.id)
            present_list.append({
                "id": emp.id,
                "name": emp.name,
                "department": emp.department.name if emp.department else "",
                "checkIn": a.clock_in.strftime("%H:%M") if a.clock_in else "",
            })

        on_leave_ids = set()
        on_leave_list = []
        for lr in leave_requests:
            emp = lr.employee
            if emp.id not in present_ids:
                on_leave_ids.add(emp.id)
                on_leave_list.append({
                    "id": emp.id,
                    "name": emp.name,
                    "department": emp.department.name if emp.department else "",
                    "leaveType": lr.leave_type.name if lr.leave_type else "",
                })

        absent_list = [
            {
                "id": emp.id,
                "name": emp.name,
                "department": emp.department.name if emp.department else "",
            }
            for emp in employees
            if emp.id not in present_ids and emp.id not in on_leave_ids
        ]

        # Deduplicate present list by employee id
        seen = set()
        unique_present = []
        for p in present_list:
            if p["id"] not in seen:
                seen.add(p["id"])
                unique_present.append(p)

        return {
            "date": target_date.isoformat(),
            "summary": {
                "present": len(unique_present),
                "onLeave": len(on_leave_list),
                "absent": len(absent_list),
                "total": len(employees),
            },
            "present": unique_present,
            "onLeave": on_leave_list,
            "absent": absent_list,
        }
