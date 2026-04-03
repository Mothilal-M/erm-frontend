import { http, HttpResponse } from "msw"

// ─── Seed data ────────────────────────────────────────────────────────────────

/** In-memory employee store — mutated by create/update/delete handlers */
let employees = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1 555 000 0001",
    department: "Engineering",
    role: "employee",
    joinDate: "2022-03-01",
    status: "active",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "+1 555 000 0002",
    department: "Design",
    role: "employee",
    joinDate: "2021-06-15",
    status: "active",
  },
  {
    id: 3,
    name: "Carol White",
    email: "carol@example.com",
    phone: "+1 555 000 0003",
    department: "HR",
    role: "manager",
    joinDate: "2020-01-10",
    status: "inactive",
  },
  {
    id: 4,
    name: "Dave Brown",
    email: "dave@example.com",
    phone: "",
    department: "Marketing",
    role: "employee",
    joinDate: "2023-09-01",
    status: "invited",
  },
  {
    id: 5,
    name: "Eva Martinez",
    email: "eva@example.com",
    phone: "+1 555 000 0005",
    department: "Finance",
    role: "admin",
    joinDate: "2019-11-20",
    status: "active",
  },
]

let nextId = employees.length + 1

// ─── GET /employee-management/ ────────────────────────────────────────────────

const listEmployees = http.get("*/employee-management/", () => {
  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    inactive: employees.filter((e) => e.status === "inactive").length,
    invited: employees.filter((e) => e.status === "invited").length,
  }
  return HttpResponse.json({ employees, stats })
})

// ─── GET /employee-management/:id/ ───────────────────────────────────────────

const getEmployee = http.get("*/employee-management/:id/", ({ params }) => {
  const employee = employees.find((e) => e.id === Number(params.id))
  if (!employee) {
    return HttpResponse.json({ detail: "Not found." }, { status: 404 })
  }
  return HttpResponse.json(employee)
})

// ─── POST /employee-management/ ───────────────────────────────────────────────

const createEmployee = http.post(
  "*/employee-management/",
  async ({ request }) => {
    const body = await request.json()
    const newEmployee = {
      id: nextId++,
      status: "active",
      ...body,
    }
    employees = [...employees, newEmployee]
    return HttpResponse.json(newEmployee, { status: 201 })
  },
)

// ─── PATCH /employee-management/:id/ ─────────────────────────────────────────

const updateEmployee = http.patch(
  "*/employee-management/:id/",
  async ({ params, request }) => {
    const body = await request.json()
    const idx = employees.findIndex((e) => e.id === Number(params.id))
    if (idx === -1) {
      return HttpResponse.json({ detail: "Not found." }, { status: 404 })
    }
    employees[idx] = { ...employees[idx], ...body }
    return HttpResponse.json(employees[idx])
  },
)

// ─── DELETE /employee-management/:id/ ────────────────────────────────────────

const removeEmployee = http.delete(
  "*/employee-management/:id/",
  ({ params }) => {
    const idx = employees.findIndex((e) => e.id === Number(params.id))
    if (idx === -1) {
      return HttpResponse.json({ detail: "Not found." }, { status: 404 })
    }
    employees = employees.filter((e) => e.id !== Number(params.id))
    return HttpResponse.json({ detail: "Deleted." })
  },
)

// ─── POST /employee-management/invite/ ───────────────────────────────────────

const inviteUser = http.post(
  "*/employee-management/invite/",
  async ({ request }) => {
    const body = await request.json()
    const invited = {
      id: nextId++,
      name: body.email.split("@")[0], // placeholder until they fill in their profile
      email: body.email,
      phone: "",
      department: body.department ?? "",
      role: body.role ?? "employee",
      joinDate: new Date().toISOString().split("T")[0],
      status: "invited",
    }
    employees = [...employees, invited]
    return HttpResponse.json(
      { detail: `Invitation sent to ${body.email}.`, employee: invited },
      { status: 201 },
    )
  },
)

const mockEmployeePerformance = {
  currentSprint: {
    id: 102,
    name: "Sprint 2: UI Components",
    sprintNumber: 2,
    projectName: "ERM Frontend Revamp",
    allocated: 10,
    completed: 7,
    inProgress: 2,
    pending: 1,
    efficiency: 0.86,
    onTimeRate: 0.88,
    estimatedHours: 22,
    actualHours: 19,
  },
  sprintHistory: [
    { sprint: "S1", allocated: 8, completed: 8, efficiency: 1.0 },
    { sprint: "S2", allocated: 10, completed: 7, efficiency: 0.86 },
    { sprint: "S3", allocated: 9, completed: 6, efficiency: 0.75 },
    { sprint: "S4", allocated: 11, completed: 10, efficiency: 0.91 },
    { sprint: "S5", allocated: 8, completed: 8, efficiency: 1.0 },
  ],
  performance: {
    velocityScore: 88,
    qualityScore: 92,
    collaborationScore: 85,
    overallScore: 88,
  },
  recognition: [
    {
      id: 1,
      title: "Star Performer",
      givenBy: "Sarah (Manager)",
      date: "2026-02-10",
      type: "badge",
      emoji: "⭐",
      message: "Outstanding work on the theme switcher component!",
      color: "bg-yellow-50 border-yellow-200",
    },
    {
      id: 2,
      title: "Team Player",
      givenBy: "Bob Jones",
      date: "2026-01-28",
      type: "kudos",
      emoji: "🤝",
      message: "Always willing to help others unblock themselves.",
      color: "bg-blue-50 border-blue-200",
    },
    {
      id: 3,
      title: "Sprint MVP",
      givenBy: "Engineering Team",
      date: "2026-01-24",
      type: "award",
      emoji: "🏆",
      message: "Completed Sprint 1 with 100% on-time delivery.",
      color: "bg-purple-50 border-purple-200",
    },
    {
      id: 4,
      title: "Bug Crusher",
      givenBy: "QA Team",
      date: "2026-01-15",
      type: "badge",
      emoji: "🐛",
      message: "Resolved 12 critical bugs in a single sprint.",
      color: "bg-green-50 border-green-200",
    },
  ],
}

const getEmployeePerformance = http.get("*/employee/performance/", () =>
  HttpResponse.json(mockEmployeePerformance),
)

// ─── GET /employee-management/profile/:id ─────────────────────────────────────

/**
 * 360° profile mock — combines employee info with attendance, leave, performance, assets, docs, timeline
 */
const getEmployee360Profile = http.get(
  "*/employee-management/profile/:id",
  ({ params }) => {
    const employee = employees.find((e) => e.id === Number(params.id))
    if (!employee) {
      return HttpResponse.json({ detail: "Not found." }, { status: 404 })
    }

    const profile360 = {
      employee: {
        ...employee,
        avatar: null,
        manager: "Sarah Chen",
      },
      personal: {
        email: employee.email,
        phone: employee.phone,
        location: "San Francisco, CA",
        dob: "1992-07-15",
        emergencyContact: "John Doe (+1 555 111 2222)",
        employmentType: "Full-time",
      },
      attendance: {
        presentDays: 18,
        absentDays: 1,
        lateDays: 2,
        wfhDays: 3,
        attendanceRate: 94,
        recentLogs: [
          {
            date: "2026-02-20",
            clockIn: "09:02 AM",
            clockOut: "06:15 PM",
            duration: "9h 13m",
          },
          {
            date: "2026-02-19",
            clockIn: "09:00 AM",
            clockOut: "06:00 PM",
            duration: "9h 00m",
          },
          {
            date: "2026-02-18",
            clockIn: "09:30 AM",
            clockOut: "06:45 PM",
            duration: "9h 15m",
          },
          {
            date: "2026-02-17",
            clockIn: "08:55 AM",
            clockOut: "05:50 PM",
            duration: "8h 55m",
          },
          {
            date: "2026-02-14",
            clockIn: "09:05 AM",
            clockOut: "06:10 PM",
            duration: "9h 05m",
          },
        ],
      },
      leave: {
        totalRemaining: 14,
        balances: [
          { type: "Annual Leave", allocated: 20, used: 6, remaining: 14 },
          { type: "Sick Leave", allocated: 10, used: 2, remaining: 8 },
          { type: "Personal Leave", allocated: 3, used: 1, remaining: 2 },
        ],
        history: [
          {
            id: 1,
            type: "Annual Leave",
            from: "2026-02-10",
            to: "2026-02-12",
            status: "approved",
          },
          {
            id: 2,
            type: "Sick Leave",
            from: "2026-01-25",
            to: "2026-01-25",
            status: "approved",
          },
          {
            id: 3,
            type: "Annual Leave",
            from: "2025-12-23",
            to: "2025-12-27",
            status: "approved",
          },
        ],
      },
      performance: {
        tasksCompleted: 47,
        onTimeRate: 88,
        rating: "4.5/5",
        recentTasks: [
          { id: 101, title: "Implement Employee 360 page", status: "done" },
          { id: 102, title: "Fix sidebar navigation bug", status: "done" },
          { id: 103, title: "Add dark mode support", status: "in-progress" },
        ],
        awards: ["Star Performer", "Sprint MVP", "Bug Crusher"],
      },
      assets: [
        {
          id: 1,
          name: 'MacBook Pro 16"',
          type: "Laptop",
          serialNumber: "SN-MBP16-2024-0042",
          condition: "Good",
        },
        {
          id: 2,
          name: "Dell U2723QE",
          type: "Monitor",
          serialNumber: "SN-DEL-MON-0078",
          condition: "Good",
        },
        {
          id: 3,
          name: "Logitech MX Keys",
          type: "Keyboard",
          serialNumber: "SN-LGT-KB-0156",
          condition: "Good",
        },
      ],
      documents: [
        {
          id: 1,
          name: "Employment Contract.pdf",
          category: "Contract",
          uploadedAt: "2022-03-01",
        },
        {
          id: 2,
          name: "ID Proof.pdf",
          category: "Identity",
          uploadedAt: "2022-03-01",
        },
        {
          id: 3,
          name: "Tax Form W4.pdf",
          category: "Tax",
          uploadedAt: "2023-01-15",
        },
      ],
      timeline: [
        {
          type: "promotion",
          title: "Promoted to Senior Engineer",
          date: "2025-04-01",
          description: "Recognized for outstanding contributions",
        },
        {
          type: "award",
          title: "Received Star Performer Badge",
          date: "2026-02-10",
          description: "Outstanding work on theme switcher",
        },
        {
          type: "training",
          title: "Completed React Advanced Course",
          date: "2024-09-15",
          description: "Internal upskilling program",
        },
        {
          type: "joined",
          title: "Joined the Team",
          date: employee.joinDate,
          description: `Joined as ${employee.role}`,
        },
      ],
    }

    return HttpResponse.json(profile360)
  },
)

const handlers = [
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  removeEmployee,
  inviteUser,
  getEmployeePerformance,
  getEmployee360Profile,
]

export default handlers
