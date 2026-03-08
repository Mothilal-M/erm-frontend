import calendar
from collections import defaultdict
from datetime import UTC, date, datetime, timedelta

from injectq import inject, singleton

from src.app.core.auth.employee_resolver import resolve_employee
from src.app.db.tables.erm_tables import AttendanceLogTable
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
    LeaveHistoryItem,
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
        self._repo = repo

    async def get_monthly_attendance(self, year: int, month: int) -> MonthlyAttendanceResponse:
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
        today = date.today()
        employees = await self._repo.get_active_employees()
        total_employees = len(employees)

        # This month's leave requests
        leave_requests = await self._repo.get_leave_requests_for_month(today.year, today.month)

        # Count by type
        type_counts: dict[str, float] = defaultdict(int)
        dept_stats: dict[str, dict[str, int]] = defaultdict(
            lambda: {"on_leave": 0, "absent": 0, "present": 0, "wfh": 0}
        )
        employee_leave_days: dict[int, dict] = defaultdict(lambda: {"total": 0, "types": set()})

        for lr in leave_requests:
            type_name = lr.leave_type.name if lr.leave_type else "Other"
            type_counts[type_name] += lr.days
            emp = lr.employee
            dept = emp.department.name if emp.department else "Unknown"
            dept_stats[dept]["on_leave"] += 1
            if lr.sub_type == "wfh":
                dept_stats[dept]["wfh"] += 1

            employee_leave_days[emp.id]["total"] += lr.days
            employee_leave_days[emp.id]["types"].add(type_name)
            employee_leave_days[emp.id]["name"] = emp.name
            employee_leave_days[emp.id]["department"] = dept

        # Leave breakdown
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

        # Department stats
        department_stats = [
            DepartmentStatItem(department=dept, **stats) for dept, stats in dept_stats.items()
        ]

        # Top leave takers
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

        # Pending approvals
        pending = await self._repo.get_leave_requests(leave_status="pending")
        pending_approvals = [
            PendingApprovalItem(
                id=lr.id,
                name=lr.employee.name,
                avatar=lr.employee.avatar or "",
                type=lr.leave_type.name if lr.leave_type else "",
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
        requests = await self._repo.get_leave_requests()
        return [
            ApprovalItem(
                id=lr.id,
                name=lr.employee.name,
                avatar=lr.employee.avatar or "",
                department=lr.employee.department.name if lr.employee.department else "",
                type=lr.leave_type.name if lr.leave_type else "",
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
        lr = await self._repo.get_leave_request(request_id)
        old_status = lr.leave_status
        lr.leave_status = status
        lr.review_note = note
        lr.reviewed_at = datetime.now(UTC)
        await lr.save()

        # Update leave balance
        year = lr.date_from.year
        balance = await self._repo.get_or_create_balance(lr.employee_id, lr.leave_type_id, year)

        if status == "approved" and old_status == "pending":
            balance.pending = max(0, balance.pending - lr.days)
            balance.used += lr.days
            await balance.save()
        elif status == "rejected" and old_status == "pending":
            balance.pending = max(0, balance.pending - lr.days)
            await balance.save()

        return ApprovalActionResponse(id=lr.id, status=lr.leave_status)

    async def manual_record(self, data: ManualLeaveRecordSchema) -> ManualRecordResponse:
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

        # Update balance
        year = lr.date_from.year
        balance = await self._repo.get_or_create_balance(data.employee_id, leave_type.id, year)
        balance.used += data.days
        await balance.save()

        return ManualRecordResponse(id=lr.id, status="approved")

    async def get_admin_employees(self) -> list[AdminEmployeeItem]:
        employees = await self._repo.get_employees_simple()
        return [
            AdminEmployeeItem(
                id=emp.id,
                name=emp.name,
                department=emp.department.name if emp.department else "",
                avatar=emp.avatar or "",
            )
            for emp in employees
        ]

    async def get_employee_profile(self, user: AuthUserSchema) -> EmployeeLeaveProfileResponse:
        employee = await resolve_employee(user)
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
            LeaveBalanceItem(
                type=b.leave_type.name,
                allocated=b.allocated,
                used=b.used,
                pending=b.pending,
                remaining=b.allocated - b.used - b.pending,
            )
            for b in balances
        ]

        # This month stats
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
            1
            for d in range(1, num_days + 1)
            if date(today.year, today.month, d).weekday() < WEEKEND_START
            and date(today.year, today.month, d) <= today
        )

        # Leave history
        history = await self._repo.get_employee_leave_history(employee.id)
        leave_history = [
            LeaveHistoryItem(
                id=lr.id,
                type=lr.leave_type.name if lr.leave_type else "",
                sub_type=lr.sub_type,
                from_date=lr.date_from.isoformat(),
                to_date=lr.date_to.isoformat(),
                days=lr.days,
                status=lr.leave_status,
            )
            for lr in history
        ]

        leave_days = sum(
            lr.days
            for lr in history
            if lr.leave_status == "approved"
            and lr.date_from.month == today.month
            and lr.date_from.year == today.year
        )

        await employee.fetch_related("department")

        return EmployeeLeaveProfileResponse(
            employee=EmployeeProfileInfo(
                id=str(employee.id),
                name=employee.name,
                role=employee.role,
                department=employee.department.name if employee.department else "",
                avatar=employee.avatar or "",
                join_date=employee.join_date.isoformat() if employee.join_date else "",
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

        # Update pending balance
        year = lr.date_from.year
        balance = await self._repo.get_or_create_balance(employee.id, leave_type.id, year)
        balance.pending += data.days
        await balance.save()

        return LeaveRequestResponse(id=lr.id, status="pending")

    async def get_settings(self) -> LeaveSettingsResponse:
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
        await self._repo.update_settings(data)
        return await self.get_settings()

    async def get_day_detail(self, target_date_str: str) -> DayDetailResponse:
        target_date = date.fromisoformat(target_date_str)
        employees = await self._repo.get_active_employees()
        attendance = await self._repo.get_attendance_for_date(target_date)
        leave_requests = await self._repo.get_leave_requests_for_date(target_date)

        present_ids = set()
        present_list = []
        for a in attendance:
            emp = a.employee
            present_ids.add(emp.id)
            present_list.append(
                DayEmployeePresent(
                    id=emp.id,
                    name=emp.name,
                    department=emp.department.name if emp.department else "",
                    check_in=a.clock_in.strftime("%H:%M") if a.clock_in else "",
                )
            )

        on_leave_ids = set()
        on_leave_list = []
        for lr in leave_requests:
            emp = lr.employee
            if emp.id not in present_ids:
                on_leave_ids.add(emp.id)
                on_leave_list.append(
                    DayEmployeeOnLeave(
                        id=emp.id,
                        name=emp.name,
                        department=emp.department.name if emp.department else "",
                        leave_type=lr.leave_type.name if lr.leave_type else "",
                    )
                )

        absent_list = [
            DayEmployeeAbsent(
                id=emp.id,
                name=emp.name,
                department=emp.department.name if emp.department else "",
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
