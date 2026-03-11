import calendar
from collections import defaultdict
from datetime import date, timedelta

from injectq import inject, singleton

from src.app.core.auth.employee_resolver import resolve_employee
from src.app.routers.leave.repositories import LeaveRepo
from src.app.routers.leave.schemas import (
    AdminEmployeeItem,
    AdminLeaveSummaryResponse,
    ApprovalActionResponse,
    ApprovalItem,
    DailyAttendanceRecord,
    DayDetailResponse,
    DayEmployeeAbsent,
    DayEmployeeOnLeave,
    DayEmployeePresent,
    DaySummary,
    DepartmentStatItem,
    EmployeeLeaveProfileResponse,
    EmployeeProfileInfo,
    LeaveBalanceItem,
    LeaveBreakdownItem,
    LeaveRequestResponse,
    LeaveRequestSchema,
    LeaveSettingsResponse,
    ManualLeaveRecordSchema,
    ManualRecordResponse,
    MonthlyAttendanceResponse,
    MonthStats,
    PendingApprovalItem,
    ThisMonthStats,
    TopLeaveTakerItem,
)
from src.app.utils.schemas import AuthUserSchema


WEEKEND_START = 5  # Saturday (Monday=0)


@singleton
class LeaveService:
    """Service class for leave management business logic and operations."""

    @inject
    def __init__(self, repo: LeaveRepo):
        """Initializes the LeaveService with a LeaveRepo instance.

        Args:
            repo (LeaveRepo): The leave repository for database operations.
        """
        self._repo = repo

    async def get_monthly_attendance(self, year: int, month: int) -> MonthlyAttendanceResponse:
        """Retrieves a day-by-day attendance overview for a given month.

        Args:
            year (int): The calendar year.
            month (int): The month (0-indexed from frontend, converted internally).

        Returns:
            MonthlyAttendanceResponse: Daily attendance records.
        """
        actual_month = month + 1
        employees = await self._repo.get_active_employees()
        total_employees = len(employees)

        attendance_logs = await self._repo.get_attendance_for_month(year, actual_month)
        leave_requests = await self._repo.get_leave_requests_for_month(year, actual_month)

        present_by_date = defaultdict(set)
        for log in attendance_logs:
            present_by_date[log.date].add(log.employee_id)

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
            is_weekend = d.weekday() >= WEEKEND_START
            present = len(present_by_date.get(d, set()))
            on_leave = len(on_leave_by_date.get(d, set()))
            absent = max(0, total_employees - present - on_leave) if not is_weekend else 0

            records.append(
                DailyAttendanceRecord(
                    date=d.isoformat(),
                    is_weekend=is_weekend,
                    present=present,
                    absent=absent,
                    on_leave=on_leave,
                    total=total_employees,
                )
            )

        return MonthlyAttendanceResponse(
            year=year,
            month=month,
            total_employees=total_employees,
            records=records,
        )

    async def get_admin_summary(self) -> AdminLeaveSummaryResponse:
        """Retrieves aggregated leave statistics for the admin dashboard.

        Returns:
            AdminLeaveSummaryResponse: Summary including leave breakdown by type,
                department stats, top leave takers, and pending approvals.
        """
        today = date.today()
        employees = await self._repo.get_active_employees()
        total_employees = len(employees)

        leave_requests = await self._repo.get_leave_requests_for_month(today.year, today.month)

        type_counts: dict[str, float] = defaultdict(int)
        dept_stats: dict[str, dict[str, int]] = defaultdict(
            lambda: {"on_leave": 0, "absent": 0, "present": 0, "wfh": 0}
        )
        employee_leave_days: dict[int, dict] = defaultdict(lambda: {"total": 0, "types": set()})

        for lr in leave_requests:
            type_counts[lr.leave_type_name] += lr.days
            dept_stats[lr.employee_department]["on_leave"] += 1
            if lr.sub_type == "wfh":
                dept_stats[lr.employee_department]["wfh"] += 1

            employee_leave_days[lr.employee_id]["total"] += lr.days
            employee_leave_days[lr.employee_id]["types"].add(lr.leave_type_name)
            employee_leave_days[lr.employee_id]["name"] = lr.employee_name
            employee_leave_days[lr.employee_id]["department"] = lr.employee_department

        colors = {
            "Annual Leave": "blue",
            "Sick Leave": "red",
            "Casual Leave": "yellow",
            "Work From Home": "green",
            "Half Day": "purple",
            "Maternity": "pink",
            "Compensatory": "orange",
            "Unpaid Leave": "gray",
        }
        leave_breakdown = [
            LeaveBreakdownItem(type=t, count=int(c), color=colors.get(t, "blue"))
            for t, c in type_counts.items()
        ]

        department_stats = [
            DepartmentStatItem(department=dept, **stats) for dept, stats in dept_stats.items()
        ]

        top_leave_takers_raw = sorted(
            [
                {
                    "id": str(eid),
                    "name": info["name"],
                    "department": info["department"],
                    "total_days": info["total"],
                    "types": list(info["types"]),
                }
                for eid, info in employee_leave_days.items()
            ],
            key=lambda x: x["total_days"],
            reverse=True,
        )[:5]
        top_leave_takers = [TopLeaveTakerItem(**item) for item in top_leave_takers_raw]

        pending = await self._repo.get_leave_requests(leave_status="pending")
        pending_approvals = [
            PendingApprovalItem(
                id=lr.id,
                name=lr.employee_name,
                avatar=lr.employee_avatar,
                type=lr.leave_type_name,
                sub_type=lr.sub_type,
                from_date=lr.date_from.isoformat(),
                to_date=lr.date_to.isoformat(),
                days=lr.days,
                reason=lr.reason or "",
            )
            for lr in pending[:5]
        ]

        total_leaves = sum(type_counts.values())

        return AdminLeaveSummaryResponse(
            month=today.strftime("%B"),
            year=today.year,
            total_employees=total_employees,
            this_month=ThisMonthStats(
                total_leaves=int(total_leaves),
                total_absent=0,
                total_present=total_employees,
                avg_daily_present=total_employees,
                avg_daily_absent=0,
                avg_daily_on_leave=int(total_leaves / max(today.day, 1)),
                total_wfh=sum(1 for lr in leave_requests if lr.sub_type == "wfh"),
                total_half_day=sum(1 for lr in leave_requests if lr.sub_type == "halfday"),
            ),
            leave_breakdown=leave_breakdown,
            department_stats=department_stats,
            top_leave_takers=top_leave_takers,
            pending_approvals=pending_approvals,
            recent_activity=[],
        )

    async def get_approvals(self) -> list[ApprovalItem]:
        """Retrieves all leave requests with their approval status.

        Returns:
            list[ApprovalItem]: A list of leave approval items.
        """
        requests = await self._repo.get_leave_requests()
        return [
            ApprovalItem(
                id=lr.id,
                name=lr.employee_name,
                avatar=lr.employee_avatar,
                department=lr.employee_department,
                type=lr.leave_type_name,
                sub_type=lr.sub_type,
                from_date=lr.date_from.isoformat(),
                to_date=lr.date_to.isoformat(),
                days=lr.days,
                status=lr.leave_status,
                reason=lr.reason or "",
                applied_on=lr.applied_on.isoformat() if lr.applied_on else "",
            )
            for lr in requests
        ]

    async def approve_or_reject(
        self, request_id: int, status: str, note: str | None
    ) -> ApprovalActionResponse:
        """Approves or rejects a leave request and updates the leave balance.

        Args:
            request_id (int): The unique identifier of the leave request.
            status (str): The new status ("approved" or "rejected").
            note (str | None): Optional review note from the admin.

        Returns:
            ApprovalActionResponse: The updated request ID and status.
        """
        return await self._repo.approve_or_reject_request(request_id, status, note)

    async def manual_record(self, data: ManualLeaveRecordSchema) -> ManualRecordResponse:
        """Creates a manual leave record with auto-approved status.

        Args:
            data (ManualLeaveRecordSchema): The manual leave record data.

        Returns:
            ManualRecordResponse: The created record's ID and status.
        """
        leave_type = await self._repo.get_or_create_leave_type(data.leave_type)
        lr = await self._repo.create_leave_request(
            {
                "employee_id": data.employee_id,
                "leave_type_id": leave_type.id,
                "sub_type": data.sub_type,
                "date_from": date.fromisoformat(data.date_from),
                "date_to": date.fromisoformat(data.date_to),
                "days": data.days,
                "leave_status": "approved",
                "reason": data.reason,
                "applied_on": date.today(),
            }
        )

        await self._repo.add_balance_used(data.employee_id, leave_type.id, lr.date_from_year, data.days)

        return ManualRecordResponse(id=lr.id, status="approved")

    async def get_admin_employees(self) -> list[AdminEmployeeItem]:
        """Retrieves a simplified list of active employees for selection dropdowns.

        Returns:
            list[AdminEmployeeItem]: A list of employees with id, name,
                department, and avatar.
        """
        return await self._repo.get_employees_simple()

    async def get_employee_profile(self, user: AuthUserSchema) -> EmployeeLeaveProfileResponse:
        """Retrieves the authenticated employee's leave profile.

        Args:
            user (AuthUserSchema): The authenticated user's profile.

        Returns:
            EmployeeLeaveProfileResponse: The employee's complete leave profile.
        """
        employee = await resolve_employee(user)
        today = date.today()
        year = today.year

        balances = await self._repo.get_leave_balances(employee.id, year)

        if not balances:
            settings = await self._repo.get_settings()
            quotas = {
                "Annual Leave": settings.annual_leave_quota,
                "Sick Leave": settings.sick_leave_quota,
                "Casual Leave": settings.casual_leave_quota,
            }
            await self._repo.ensure_default_balances(employee.id, year, quotas)
            balances = await self._repo.get_leave_balances(employee.id, year)

        leave_balance = [
            LeaveBalanceItem(
                type=b.leave_type_name,
                allocated=b.allocated,
                used=b.used,
                pending=b.pending,
                remaining=b.allocated - b.used - b.pending,
            )
            for b in balances
        ]

        month_start = date(today.year, today.month, 1)
        month_end = date(today.year, today.month, calendar.monthrange(today.year, today.month)[1])
        attendance_dates = await self._repo.get_employee_attendance_dates_for_range(
            employee.id, month_start, month_end
        )

        present_days = len(attendance_dates)
        num_days = calendar.monthrange(today.year, today.month)[1]
        working_days = sum(
            1
            for d in range(1, num_days + 1)
            if date(today.year, today.month, d).weekday() < WEEKEND_START
            and date(today.year, today.month, d) <= today
        )

        leave_history = await self._repo.get_employee_leave_history(employee.id)

        leave_days = sum(
            lr.days
            for lr in leave_history
            if lr.status == "approved"
            and date.fromisoformat(lr.from_date).month == today.month
            and date.fromisoformat(lr.from_date).year == today.year
        )

        emp_record = await self._repo.get_employee_with_department(employee.id)

        return EmployeeLeaveProfileResponse(
            employee=EmployeeProfileInfo(
                id=str(emp_record.id),
                name=emp_record.name,
                role=emp_record.role,
                department=emp_record.department,
                avatar=emp_record.avatar,
                join_date=emp_record.join_date or "",
                manager="",
            ),
            leave_balance=leave_balance,
            this_month=MonthStats(
                present_days=present_days,
                absent_days=max(0, working_days - present_days - int(leave_days)),
                leave_days=int(leave_days),
                wfh_days=0,
                half_days=0,
                working_days=working_days,
                attendance_pct=round(present_days / max(working_days, 1) * 100),
            ),
            leave_history=leave_history,
            upcoming=[],
        )

    async def submit_leave_request(
        self, user: AuthUserSchema, data: LeaveRequestSchema
    ) -> LeaveRequestResponse:
        """Submits a new leave request and updates the pending balance.

        Args:
            user (AuthUserSchema): The authenticated user's profile.
            data (LeaveRequestSchema): The leave request data.

        Returns:
            LeaveRequestResponse: The created request's ID and status.
        """
        employee = await resolve_employee(user)
        leave_type = await self._repo.get_or_create_leave_type(data.leave_type)
        lr = await self._repo.create_leave_request(
            {
                "employee_id": employee.id,
                "leave_type_id": leave_type.id,
                "sub_type": data.sub_type,
                "date_from": date.fromisoformat(data.date_from),
                "date_to": date.fromisoformat(data.date_to),
                "days": data.days,
                "leave_status": "pending",
                "reason": data.reason,
                "applied_on": date.today(),
            }
        )

        await self._repo.add_balance_pending(employee.id, leave_type.id, lr.date_from_year, data.days)

        return LeaveRequestResponse(id=lr.id, status="pending")

    async def get_settings(self) -> LeaveSettingsResponse:
        """Retrieves the current leave policy settings.

        Returns:
            LeaveSettingsResponse: The leave settings.
        """
        settings = await self._repo.get_settings()
        return LeaveSettingsResponse(
            annual_leave_quota=settings.annual_leave_quota,
            sick_leave_quota=settings.sick_leave_quota,
            casual_leave_quota=settings.casual_leave_quota,
            carry_forward_limit=settings.carry_forward_limit,
            carry_forward_enabled=settings.carry_forward_enabled,
            half_day_enabled=settings.half_day_enabled,
            wfh_enabled=settings.wfh_enabled,
            auto_approve_after_days=settings.auto_approve_after_days,
            blackout_dates=settings.blackout_dates,
            leave_year_start=settings.leave_year_start,
        )

    async def update_settings(self, data: dict) -> LeaveSettingsResponse:
        """Updates the leave policy settings with the provided values.

        Args:
            data (dict): A dictionary of setting field names to their new values.

        Returns:
            LeaveSettingsResponse: The updated leave settings.
        """
        settings = await self._repo.update_settings(data)
        return LeaveSettingsResponse(
            annual_leave_quota=settings.annual_leave_quota,
            sick_leave_quota=settings.sick_leave_quota,
            casual_leave_quota=settings.casual_leave_quota,
            carry_forward_limit=settings.carry_forward_limit,
            carry_forward_enabled=settings.carry_forward_enabled,
            half_day_enabled=settings.half_day_enabled,
            wfh_enabled=settings.wfh_enabled,
            auto_approve_after_days=settings.auto_approve_after_days,
            blackout_dates=settings.blackout_dates,
            leave_year_start=settings.leave_year_start,
        )

    async def get_day_detail(self, target_date_str: str) -> DayDetailResponse:
        """Retrieves per-employee attendance breakdown for a specific date.

        Args:
            target_date_str (str): The target date in ISO format (YYYY-MM-DD).

        Returns:
            DayDetailResponse: Detailed breakdown of present, on-leave,
                and absent employees for the given date.
        """
        target_date = date.fromisoformat(target_date_str)
        employees = await self._repo.get_active_employees()
        attendance = await self._repo.get_attendance_for_date(target_date)
        leave_requests = await self._repo.get_leave_requests_for_date(target_date)

        present_ids = set()
        present_list = []
        for a in attendance:
            present_ids.add(a.employee_id)
            present_list.append(
                DayEmployeePresent(
                    id=a.employee_id,
                    name=a.employee_name,
                    department=a.employee_department,
                    check_in=a.clock_in or "",
                )
            )

        on_leave_ids = set()
        on_leave_list = []
        for lr in leave_requests:
            if lr.employee_id not in present_ids:
                on_leave_ids.add(lr.employee_id)
                on_leave_list.append(
                    DayEmployeeOnLeave(
                        id=lr.employee_id,
                        name=lr.employee_name,
                        department=lr.employee_department,
                        leave_type=lr.leave_type_name,
                    )
                )

        absent_list = [
            DayEmployeeAbsent(
                id=emp.id,
                name=emp.name,
                department=emp.department,
            )
            for emp in employees
            if emp.id not in present_ids and emp.id not in on_leave_ids
        ]

        # Deduplicate present list by employee id
        seen = set()
        unique_present = []
        for p in present_list:
            if p.id not in seen:
                seen.add(p.id)
                unique_present.append(p)

        return DayDetailResponse(
            date=target_date.isoformat(),
            summary=DaySummary(
                present=len(unique_present),
                on_leave=len(on_leave_list),
                absent=len(absent_list),
                total=len(employees),
            ),
            present=unique_present,
            on_leave=on_leave_list,
            absent=absent_list,
        )
