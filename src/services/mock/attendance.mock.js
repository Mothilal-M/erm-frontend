import { http, HttpResponse } from "msw"

// ─── Seed data ────────────────────────────────────────────────────────────────

const EMPLOYEES = [
  { id: 1, name: "Jane Smith", department: "Engineering" },
  { id: 2, name: "Bob Jones", department: "Marketing" },
  { id: 3, name: "Alice Chen", department: "Product" },
  { id: 4, name: "David Kim", department: "Engineering" },
  { id: 5, name: "Sara Patel", department: "Finance" },
]

const today = new Date().toISOString().split("T")[0]

const makeISO = (h, m = 0) => {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

// Simulated mutable session state for clock-in/out
let session = {
  isClocked: false,
  clockedInAt: null,
  willAutoExpire: false,
  expiresInSeconds: null,
  todayTotalMinutes: 0,
}

const WORK_SUMMARIES = [
  "Reviewed pull requests and resolved merge conflicts.",
  "Fixed authentication bug in the login module.",
  "Completed dashboard redesign and code review.",
  "Attended sprint planning and updated backlog tickets.",
  "Integrated new payment gateway endpoints.",
]

const generateLogs = (count = 20) => {
  const statuses = [
    "COMPLETED",
    "COMPLETED",
    "COMPLETED",
    "AUTO_EXPIRED",
    "EDITED",
    "MANUAL",
  ]
  const logs = []
  for (let i = 0; i < count; i++) {
    const emp = EMPLOYEES[i % EMPLOYEES.length]
    const hour = 8 + (i % 3)
    const clockIn = makeISO(hour, (i * 7) % 60)
    const clockOut = makeISO(hour + 4 + (i % 4), (i * 13) % 60)
    const status = statuses[i % statuses.length]
    const isFlagged = i % 9 === 0
    logs.push({
      id: i + 1,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      date: today,
      clockIn,
      clockOut: status === "IN_PROGRESS" ? null : clockOut,
      durationMinutes: status === "IN_PROGRESS" ? null : 240 + ((i * 11) % 180),
      workSummary:
        status === "IN_PROGRESS"
          ? null
          : WORK_SUMMARIES[i % WORK_SUMMARIES.length],
      status,
      isManualEntry: status === "MANUAL",
      manualEntryReason:
        status === "MANUAL"
          ? "Employee forgot to clock in — verified via email"
          : null,
      isFlagged,
      flagReason: isFlagged
        ? "Duration inconsistent with reported tasks"
        : null,
      flaggedBy: isFlagged ? "Admin User" : null,
      flaggedAt: isFlagged ? makeISO(16, 0) : null,
      editedBy: status === "EDITED" ? "Admin User" : null,
      editedAt: status === "EDITED" ? makeISO(17, 30) : null,
      editReason:
        status === "EDITED"
          ? "Employee reported incorrect time captured"
          : null,
    })
  }
  return logs
}

let mockLogs = generateLogs(20)

// ─── Handlers ─────────────────────────────────────────────────────────────────

const getStatusMock = http.get("*/attendance/status/", () => {
  if (session.isClocked) {
    const elapsed = Math.floor(
      (Date.now() - new Date(session.clockedInAt).getTime()) / 1000,
    )
    const maxSeconds = 4 * 60 * 60 // 4 hours
    const expiresInSeconds = Math.max(0, maxSeconds - elapsed)
    return HttpResponse.json({
      isClocked: true,
      clockedInAt: session.clockedInAt,
      elapsedSeconds: elapsed,
      expiresInSeconds,
      willAutoExpire: expiresInSeconds <= 30 * 60,
      todayTotalMinutes: session.todayTotalMinutes + Math.floor(elapsed / 60),
    })
  }
  return HttpResponse.json({
    isClocked: false,
    clockedInAt: null,
    elapsedSeconds: null,
    expiresInSeconds: null,
    willAutoExpire: false,
    todayTotalMinutes: session.todayTotalMinutes,
  })
})

const clockInMock = http.post("*/attendance/clock-in/", async ({ request }) => {
  const body = await request.json().catch(() => ({}))
  session.isClocked = true
  session.clockedInAt = new Date().toISOString()
  return HttpResponse.json({
    id: Math.floor(Math.random() * 9000) + 1000,
    clockedInAt: session.clockedInAt,
    note: body.note ?? null,
  })
})

const clockOutMock = http.post(
  "*/attendance/clock-out/",
  async ({ request }) => {
    const body = await request.json().catch(() => ({}))
    if (!session.isClocked) {
      return HttpResponse.json({ detail: "Not clocked in." }, { status: 400 })
    }
    const clockOut = new Date().toISOString()
    const elapsed = Math.floor(
      (Date.now() - new Date(session.clockedInAt).getTime()) / 60000,
    )
    session.todayTotalMinutes += elapsed
    session.isClocked = false
    session.clockedInAt = null
    return HttpResponse.json({
      id: Math.floor(Math.random() * 9000) + 1000,
      clockOut,
      durationMinutes: elapsed,
      workSummary: body.workSummary,
    })
  },
)

const getTodayMock = http.get("*/attendance/today/", () => {
  return HttpResponse.json({
    date: today,
    totalWorkMinutes: session.todayTotalMinutes,
    firstClockIn: session.isClocked
      ? session.clockedInAt
      : session.todayTotalMinutes > 0
        ? makeISO(9, 2)
        : null,
    lastClockOut: session.isClocked
      ? null
      : session.todayTotalMinutes > 0
        ? makeISO(13, 0)
        : null,
    isCurrentlyIn: session.isClocked,
    hasAutoExpiredEntry: false,
    entries: session.isClocked
      ? [
          {
            id: 99,
            clockIn: session.clockedInAt,
            clockOut: null,
            durationMinutes: null,
            workSummary: null,
            status: "IN_PROGRESS",
            isManualEntry: false,
            isFlagged: false,
          },
        ]
      : [],
  })
})

const getHistoryMock = http.get("*/attendance/history/", () => {
  const entries = Array.from({ length: 15 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i - 1)
    const dateStr = d.toISOString().split("T")[0]
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    if (isWeekend) return { date: dateStr, entries: [], totalWorkMinutes: 0 }
    const status = i === 3 ? "AUTO_EXPIRED" : "COMPLETED"
    return {
      date: dateStr,
      totalWorkMinutes: 420 + ((i * 17) % 120),
      entries: [
        {
          id: 100 + i,
          clockIn: new Date(d.setHours(9, 0)).toISOString(),
          clockOut:
            status === "AUTO_EXPIRED"
              ? new Date(d.setHours(13, 0)).toISOString()
              : new Date(d.setHours(17, 30)).toISOString(),
          durationMinutes: status === "AUTO_EXPIRED" ? 240 : 510,
          workSummary: WORK_SUMMARIES[i % WORK_SUMMARIES.length],
          status,
          isManualEntry: false,
          isFlagged: false,
        },
      ],
    }
  })
  return HttpResponse.json({
    entries,
    totalDaysWorked: 12,
    totalWorkMinutes: 5040,
    avgMinutesPerDay: 420,
  })
})

// Admin endpoints
const adminLogsMock = http.get("*/attendance/admin/logs/", ({ request }) => {
  const url = new URL(request.url)
  const statusFilter = url.searchParams.get("status")
  let filtered = mockLogs
  if (statusFilter && statusFilter !== "ALL") {
    filtered = filtered.filter((l) => {
      if (statusFilter === "FLAGGED") return l.isFlagged
      return l.status === statusFilter
    })
  }
  const page = parseInt(url.searchParams.get("page") ?? "1")
  const pageSize = 10
  const start = (page - 1) * pageSize
  return HttpResponse.json({
    count: filtered.length,
    page,
    pageSize,
    results: filtered.slice(start, start + pageSize),
  })
})

const adminEditMock = http.patch(
  "*/attendance/admin/logs/:id/",
  async ({ params, request }) => {
    const body = await request.json().catch(() => ({}))
    const id = parseInt(params.id)
    mockLogs = mockLogs.map((l) =>
      l.id === id
        ? {
            ...l,
            ...(body.clockIn && { clockIn: body.clockIn }),
            ...(body.clockOut && { clockOut: body.clockOut }),
            status: "EDITED",
            editedBy: "Admin User",
            editedAt: new Date().toISOString(),
            editReason: body.editReason,
          }
        : l,
    )
    return HttpResponse.json({ success: true })
  },
)

const adminFlagMock = http.patch(
  "*/attendance/admin/logs/:id/flag/",
  async ({ params, request }) => {
    const body = await request.json().catch(() => ({}))
    const id = parseInt(params.id)
    mockLogs = mockLogs.map((l) =>
      l.id === id
        ? {
            ...l,
            isFlagged: body.isFlagged,
            flagReason: body.flagReason ?? null,
            flaggedBy: body.isFlagged ? "Admin User" : null,
            flaggedAt: body.isFlagged ? new Date().toISOString() : null,
          }
        : l,
    )
    return HttpResponse.json({ success: true })
  },
)

const adminManualEntryMock = http.post(
  "*/attendance/admin/manual-entry/",
  async ({ request }) => {
    const body = await request.json().catch(() => ({}))
    const emp = EMPLOYEES.find((e) => e.id === body.employeeId) ?? EMPLOYEES[0]
    const newEntry = {
      id: mockLogs.length + 1,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      date: body.clockIn?.split("T")[0] ?? today,
      clockIn: body.clockIn,
      clockOut: body.clockOut,
      durationMinutes:
        body.clockIn && body.clockOut
          ? Math.floor(
              (new Date(body.clockOut) - new Date(body.clockIn)) / 60000,
            )
          : null,
      workSummary: body.workSummary,
      status: "MANUAL",
      isManualEntry: true,
      manualEntryReason: body.manualEntryReason,
      isFlagged: false,
      flagReason: null,
      flaggedBy: null,
      flaggedAt: null,
      editedBy: null,
      editedAt: null,
      editReason: null,
    }
    mockLogs = [newEntry, ...mockLogs]
    return HttpResponse.json(newEntry, { status: 201 })
  },
)

const adminLiveMock = http.get("*/attendance/admin/live/", () => {
  const liveEmployees = EMPLOYEES.slice(0, 3).map((e, i) => ({
    employeeId: e.id,
    employeeName: e.name,
    department: e.department,
    clockedInAt: makeISO(8 + i, 15 + i * 10),
    elapsedSeconds: 3600 + i * 1200,
    expiresInSeconds: 14400 - (3600 + i * 1200),
    willAutoExpire: 14400 - (3600 + i * 1200) <= 1800,
  }))
  const notClockedIn = EMPLOYEES.slice(3).map((e) => ({
    employeeId: e.id,
    employeeName: e.name,
    department: e.department,
  }))
  return HttpResponse.json({
    liveCount: liveEmployees.length,
    liveEmployees,
    notClockedIn,
  })
})

const adminSummaryMock = http.get("/api/attendance/admin/summary/", () => {
  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - index))
    return {
      date: d.toISOString().split("T")[0],
      count: Math.floor(Math.random() * (EMPLOYEES.length + 1)),
    }
  })

  return HttpResponse.json({
    stats: {
      presentToday: 3,
      autoExpiredToday: 1,
      absentToday: 1,
      flaggedEntries: 2,
    },
    dailyAttendance: last7Days,
    employeeMetrics: EMPLOYEES.map((e) => ({
      employeeId: e.id,
      employeeName: e.name,
      daysPresent: Math.floor(Math.random() * 20) + 5,
      avgMinutesPerDay: 450 + Math.floor(Math.random() * 60),
      lateArrivals: Math.floor(Math.random() * 4),
      earlyDepartures: Math.floor(Math.random() * 3),
    })),
  })
})

export default [
  getStatusMock,
  clockInMock,
  clockOutMock,
  getTodayMock,
  getHistoryMock,
  adminLogsMock,
  adminEditMock,
  adminFlagMock,
  adminManualEntryMock,
  adminLiveMock,
  adminSummaryMock,
]
