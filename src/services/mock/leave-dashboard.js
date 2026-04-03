import { http, HttpResponse } from "msw"

// ─── Admin Summary Mock ──────────────────────────────────────────────────────

const adminSummaryMock = http.get("*/leave/admin/summary/", () => {
  const now = new Date()
  const monthName = now.toLocaleString("default", { month: "long" })

  return HttpResponse.json({
    month: monthName,
    year: now.getFullYear(),
    totalEmployees: 65,

    thisMonth: {
      totalLeaves: 38,
      totalAbsent: 24,
      totalPresent: 1820,
      avgDailyPresent: 52,
      avgDailyAbsent: 2,
      avgDailyOnLeave: 5,
      totalWFH: 47,
      totalHalfDay: 19,
    },

    leaveBreakdown: [
      { type: "Annual Leave", count: 18, color: "blue" },
      { type: "Sick Leave", count: 10, color: "red" },
      { type: "Work From Home", count: 47, color: "cyan" },
      { type: "Half Day", count: 19, color: "yellow" },
      { type: "Maternity/Paternity", count: 4, color: "purple" },
      { type: "Unpaid Leave", count: 6, color: "orange" },
    ],

    departmentStats: [
      {
        department: "Engineering",
        onLeave: 8,
        absent: 3,
        present: 22,
        wfh: 10,
      },
      { department: "Design", onLeave: 3, absent: 1, present: 8, wfh: 4 },
      { department: "Marketing", onLeave: 5, absent: 2, present: 10, wfh: 6 },
      { department: "HR", onLeave: 2, absent: 0, present: 5, wfh: 2 },
      { department: "Finance", onLeave: 4, absent: 1, present: 8, wfh: 5 },
      { department: "Sales", onLeave: 6, absent: 3, present: 9, wfh: 7 },
    ],

    // Top 5 employees by total leave days this month
    topLeaveTakers: [
      {
        id: "EMP-1020",
        name: "Priya Sharma",
        department: "HR",
        totalDays: 12,
        types: ["Annual Leave", "Sick Leave"],
      },
      {
        id: "EMP-1035",
        name: "Alex Johnson",
        department: "Engineering",
        totalDays: 9,
        types: ["Annual Leave"],
      },
      {
        id: "EMP-1012",
        name: "Mike Chen",
        department: "Finance",
        totalDays: 7,
        types: ["Unpaid Leave", "Half Day"],
      },
      {
        id: "EMP-1048",
        name: "Sara Williams",
        department: "Marketing",
        totalDays: 5,
        types: ["Sick Leave"],
      },
      {
        id: "EMP-1031",
        name: "James Wilson",
        department: "Sales",
        totalDays: 4,
        types: ["Annual Leave", "WFH"],
      },
    ],

    pendingApprovals: [
      {
        id: 1,
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/men/10.jpg",
        type: "Annual Leave",
        subType: "full",
        from: "2026-02-15",
        to: "2026-02-19",
        days: 5,
        reason: "Family vacation",
      },
      {
        id: 2,
        name: "Sara Williams",
        avatar: "https://randomuser.me/api/portraits/women/11.jpg",
        type: "Sick Leave",
        subType: "full",
        from: "2026-02-12",
        to: "2026-02-13",
        days: 2,
        reason: "Doctor appointment",
      },
      {
        id: 3,
        name: "Mike Chen",
        avatar: "https://randomuser.me/api/portraits/men/12.jpg",
        type: "Work From Home",
        subType: "wfh",
        from: "2026-02-11",
        to: "2026-02-11",
        days: 1,
        reason: "Internet repair at home",
      },
      {
        id: 4,
        name: "Priya Sharma",
        avatar: "https://randomuser.me/api/portraits/women/13.jpg",
        type: "Maternity",
        subType: "full",
        from: "2026-03-01",
        to: "2026-05-31",
        days: 91,
        reason: "Maternity leave",
      },
      {
        id: 5,
        name: "Tom Brown",
        avatar: "https://randomuser.me/api/portraits/men/14.jpg",
        type: "Half Day",
        subType: "halfday",
        from: "2026-02-12",
        to: "2026-02-12",
        days: 0.5,
        reason: "Personal errand in afternoon",
      },
      {
        id: 6,
        name: "Lisa Park",
        avatar: "https://randomuser.me/api/portraits/women/15.jpg",
        type: "Work From Home",
        subType: "wfh",
        from: "2026-02-13",
        to: "2026-02-14",
        days: 2,
        reason: "Remote project deadline",
      },
      {
        id: 7,
        name: "David Kim",
        avatar: "https://randomuser.me/api/portraits/men/16.jpg",
        type: "Casual Leave",
        subType: "full",
        from: "2026-02-18",
        to: "2026-02-18",
        days: 1,
        reason: "Personal work",
      },
    ],

    recentActivity: [
      {
        id: 1,
        name: "Tom Brown",
        action: "Leave Approved",
        type: "Annual Leave",
        date: "2026-02-09",
      },
      {
        id: 2,
        name: "Lisa Park",
        action: "Leave Rejected",
        type: "Unpaid Leave",
        date: "2026-02-08",
      },
      {
        id: 3,
        name: "David Kim",
        action: "Leave Applied",
        type: "Sick Leave",
        date: "2026-02-08",
      },
      {
        id: 4,
        name: "Emma Davis",
        action: "WFH Approved",
        type: "Work From Home",
        date: "2026-02-07",
      },
      {
        id: 5,
        name: "James Wilson",
        action: "Marked Absent",
        type: "—",
        date: "2026-02-07",
      },
    ],
  })
})

// ─── Full Approvals List Mock ─────────────────────────────────────────────────

const approvalsListMock = http.get("*/leave/admin/approvals/", () => {
  return HttpResponse.json([
    {
      id: 1,
      name: "Alex Johnson",
      avatar: "https://randomuser.me/api/portraits/men/10.jpg",
      department: "Engineering",
      type: "Annual Leave",
      subType: "full",
      from: "2026-02-15",
      to: "2026-02-19",
      days: 5,
      status: "pending",
      reason: "Family vacation",
      appliedOn: "2026-02-01",
    },
    {
      id: 2,
      name: "Sara Williams",
      avatar: "https://randomuser.me/api/portraits/women/11.jpg",
      department: "Marketing",
      type: "Sick Leave",
      subType: "full",
      from: "2026-02-12",
      to: "2026-02-13",
      days: 2,
      status: "pending",
      reason: "Doctor appointment",
      appliedOn: "2026-02-05",
    },
    {
      id: 3,
      name: "Mike Chen",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      department: "Finance",
      type: "Work From Home",
      subType: "wfh",
      from: "2026-02-11",
      to: "2026-02-11",
      days: 1,
      status: "pending",
      reason: "Internet repair at home",
      appliedOn: "2026-02-09",
    },
    {
      id: 4,
      name: "Priya Sharma",
      avatar: "https://randomuser.me/api/portraits/women/13.jpg",
      department: "HR",
      type: "Maternity",
      subType: "full",
      from: "2026-03-01",
      to: "2026-05-31",
      days: 91,
      status: "pending",
      reason: "Maternity leave",
      appliedOn: "2026-01-20",
    },
    {
      id: 5,
      name: "Tom Brown",
      avatar: "https://randomuser.me/api/portraits/men/14.jpg",
      department: "Sales",
      type: "Half Day",
      subType: "halfday",
      from: "2026-02-12",
      to: "2026-02-12",
      days: 0.5,
      status: "pending",
      reason: "Personal errand",
      appliedOn: "2026-02-10",
    },
    {
      id: 6,
      name: "Lisa Park",
      avatar: "https://randomuser.me/api/portraits/women/15.jpg",
      department: "Design",
      type: "Work From Home",
      subType: "wfh",
      from: "2026-02-13",
      to: "2026-02-14",
      days: 2,
      status: "pending",
      reason: "Remote project deadline",
      appliedOn: "2026-02-08",
    },
    {
      id: 7,
      name: "David Kim",
      avatar: "https://randomuser.me/api/portraits/men/16.jpg",
      department: "Engineering",
      type: "Casual Leave",
      subType: "full",
      from: "2026-02-18",
      to: "2026-02-18",
      days: 1,
      status: "pending",
      reason: "Personal work",
      appliedOn: "2026-02-07",
    },
    {
      id: 8,
      name: "Emma Davis",
      avatar: "https://randomuser.me/api/portraits/women/17.jpg",
      department: "Marketing",
      type: "Annual Leave",
      subType: "full",
      from: "2026-01-13",
      to: "2026-01-17",
      days: 5,
      status: "approved",
      reason: "Holiday trip",
      appliedOn: "2026-01-05",
    },
    {
      id: 9,
      name: "Ryan Scott",
      avatar: "https://randomuser.me/api/portraits/men/18.jpg",
      department: "Sales",
      type: "Work From Home",
      subType: "wfh",
      from: "2026-01-22",
      to: "2026-01-22",
      days: 1,
      status: "approved",
      reason: "Client call from home",
      appliedOn: "2026-01-20",
    },
    {
      id: 10,
      name: "Aisha Patel",
      avatar: "https://randomuser.me/api/portraits/women/19.jpg",
      department: "Finance",
      type: "Sick Leave",
      subType: "full",
      from: "2026-01-08",
      to: "2026-01-09",
      days: 2,
      status: "rejected",
      reason: "Not feeling well",
      appliedOn: "2026-01-08",
    },
    {
      id: 11,
      name: "Carlos Ruiz",
      avatar: "https://randomuser.me/api/portraits/men/20.jpg",
      department: "Engineering",
      type: "Half Day",
      subType: "halfday",
      from: "2026-02-05",
      to: "2026-02-05",
      days: 0.5,
      status: "approved",
      reason: "Morning dentist appointment",
      appliedOn: "2026-02-04",
    },
  ])
})

// ─── Approve / Reject Actions (PATCH) ────────────────────────────────────────

const approveActionMock = http.patch(
  "*/leave/admin/approvals/:id/",
  async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: Number(params.id),
      status: body.status,
      message: `Leave request ${body.status} successfully.`,
    })
  },
)

// ─── Manual Record (POST) ─────────────────────────────────────────────────────

const manualRecordMock = http.post("*/leave/admin/manual-record/", async () => {
  return HttpResponse.json({
    success: true,
    message: "Record saved successfully.",
  })
})

// ─── Employee List for Manual Record ─────────────────────────────────────────

const employeeListMock = http.get("*/leave/admin/employees/", () => {
  return HttpResponse.json([
    {
      id: "EMP-1001",
      name: "John Doe",
      department: "Engineering",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      id: "EMP-1002",
      name: "Jane Smith",
      department: "Design",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      id: "EMP-1003",
      name: "Bob Builder",
      department: "Marketing",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
      id: "EMP-1004",
      name: "Alice Wonder",
      department: "HR",
      avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    },
    {
      id: "EMP-1005",
      name: "Charlie Choco",
      department: "Finance",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    },
    {
      id: "EMP-1010",
      name: "Alex Johnson",
      department: "Engineering",
      avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    },
    {
      id: "EMP-1012",
      name: "Mike Chen",
      department: "Finance",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    },
    {
      id: "EMP-1020",
      name: "Priya Sharma",
      department: "HR",
      avatar: "https://randomuser.me/api/portraits/women/13.jpg",
    },
    {
      id: "EMP-1035",
      name: "Sara Williams",
      department: "Marketing",
      avatar: "https://randomuser.me/api/portraits/women/11.jpg",
    },
  ])
})

// ─── Employee Leave Request (POST) ────────────────────────────────────────────

const leaveRequestMock = http.post("*/leave/employee/request/", async () => {
  return HttpResponse.json({
    success: true,
    message: "Your leave request has been submitted successfully.",
  })
})

// ─── Employee Profile Mock ────────────────────────────────────────────────────

const employeeProfileMock = http.get("*/leave/employee/profile/", () => {
  return HttpResponse.json({
    employee: {
      id: "EMP-1042",
      name: "John Doe",
      role: "Senior Developer",
      department: "Engineering",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      joinDate: "2022-03-15",
      manager: "Sarah Mitchell",
    },

    leaveBalance: [
      {
        type: "Annual Leave",
        allocated: 20,
        used: 7,
        pending: 2,
        remaining: 11,
      },
      { type: "Sick Leave", allocated: 10, used: 3, pending: 0, remaining: 7 },
      { type: "Casual Leave", allocated: 5, used: 2, pending: 0, remaining: 3 },
      {
        type: "Work From Home",
        allocated: 24,
        used: 8,
        pending: 2,
        remaining: 14,
      },
      { type: "Compensatory", allocated: 3, used: 0, pending: 0, remaining: 3 },
    ],

    thisMonth: {
      presentDays: 7,
      absentDays: 1,
      leaveDays: 2,
      wfhDays: 3,
      halfDays: 1,
      workingDays: 10,
      attendancePct: 70,
    },

    leaveHistory: [
      {
        id: 1,
        type: "Annual Leave",
        subType: "full",
        from: "2026-01-13",
        to: "2026-01-17",
        days: 5,
        status: "approved",
      },
      {
        id: 2,
        type: "Sick Leave",
        subType: "full",
        from: "2025-12-04",
        to: "2025-12-05",
        days: 2,
        status: "approved",
      },
      {
        id: 3,
        type: "Work From Home",
        subType: "wfh",
        from: "2025-11-20",
        to: "2025-11-20",
        days: 1,
        status: "approved",
      },
      {
        id: 4,
        type: "Half Day",
        subType: "halfday",
        from: "2025-11-10",
        to: "2025-11-10",
        days: 0.5,
        status: "approved",
      },
      {
        id: 5,
        type: "Annual Leave",
        subType: "full",
        from: "2025-10-20",
        to: "2025-10-21",
        days: 2,
        status: "rejected",
      },
      {
        id: 6,
        type: "Annual Leave",
        subType: "full",
        from: "2026-02-15",
        to: "2026-02-19",
        days: 5,
        status: "pending",
      },
      {
        id: 7,
        type: "Work From Home",
        subType: "wfh",
        from: "2026-02-13",
        to: "2026-02-14",
        days: 2,
        status: "pending",
      },
    ],

    upcoming: [
      { label: "Annual Leave", date: "Feb 15 – Feb 19", daysUntil: 5 },
      { label: "Public Holiday", date: "Feb 21 (Fri)", daysUntil: 11 },
    ],
  })
})

const handlers = [
  adminSummaryMock,
  approvalsListMock,
  approveActionMock,
  manualRecordMock,
  employeeListMock,
  leaveRequestMock,
  employeeProfileMock,
]

export default handlers
