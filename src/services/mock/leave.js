import { http, HttpResponse } from "msw"

/**
 * Generates realistic attendance data for every day of a given month/year.
 * @param {number} year
 * @param {number} month - 0-indexed (0=Jan)
 * @returns {Array}
 */
const generateMonthAttendance = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalEmployees = 65
  const records = []

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    if (isWeekend) {
      records.push({
        date: date.toISOString().split("T")[0],
        isWeekend: true,
        present: 0,
        absent: 0,
        onLeave: 0,
        total: totalEmployees,
      })
      continue
    }

    // Simulate variance across days
    const onLeave = Math.floor(Math.random() * 12) + 3
    const absent = Math.floor(Math.random() * 6) + 1
    const present = totalEmployees - onLeave - absent

    records.push({
      date: date.toISOString().split("T")[0],
      isWeekend: false,
      present,
      absent,
      onLeave,
      total: totalEmployees,
    })
  }

  return records
}

const leaveAttendanceMock = http.get("*/leave/attendance/", ({ request }) => {
  const url = new URL(request.url)
  const year =
    parseInt(url.searchParams.get("year")) || new Date().getFullYear()
  const month = parseInt(url.searchParams.get("month")) || new Date().getMonth()

  const records = generateMonthAttendance(year, month)

  return HttpResponse.json({
    year,
    month,
    totalEmployees: 65,
    records,
  })
})

// ─── Leave settings mock data ─────────────────────────────────────────────────

let leaveSettings = {
  annualLeaveQuota: 20,
  sickLeaveQuota: 10,
  casualLeaveQuota: 5,
  carryForwardLimit: 5,
  carryForwardEnabled: true,
  halfDayEnabled: true,
  wfhEnabled: true,
  autoApproveAfterDays: null, // null = disabled
  blackoutDates: [],
  leaveYearStart: "01-01", // MM-DD
}

const getLeaveSettingsMock = http.get("*/leave/admin/settings/", () => {
  return HttpResponse.json(leaveSettings)
})

const patchLeaveSettingsMock = http.patch(
  "*/leave/admin/settings/",
  async ({ request }) => {
    const body = await request.json()
    leaveSettings = { ...leaveSettings, ...body }
    return HttpResponse.json(leaveSettings)
  },
)

// ─── Day detail mock ──────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Alice",
  "Bob",
  "Carol",
  "Dave",
  "Eva",
  "Frank",
  "Grace",
  "Hiro",
  "Iris",
  "Jake",
  "Kim",
  "Leo",
  "Maya",
  "Nate",
  "Olivia",
  "Priya",
  "Quinn",
  "Ryan",
  "Sara",
  "Tom",
  "Uma",
  "Victor",
  "Wendy",
  "Xander",
]
const DEPARTMENTS = [
  "Engineering",
  "Design",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
]
const LEAVE_TYPES = [
  "Annual Leave",
  "Sick Leave",
  "Casual Leave",
  "WFH",
  "Half Day",
  "Maternity",
]

/**
 * Generates a deterministic but randomised set of employees for a given date.
 * Seeded by the date string so the same date always returns the same employees.
 */
const generateDayDetail = (date) => {
  // Simple seed from date digits
  const seed = date
    .replace(/-/g, "")
    .split("")
    .reduce((a, c) => a + Number(c), 0)
  const rand = (n) => (seed * 31 + n * 17) % 100

  const totalEmployees = 65
  const onLeaveCount = 4 + (seed % 10)
  const absentCount = 1 + (seed % 5)
  const presentCount = totalEmployees - onLeaveCount - absentCount

  const pick = (arr, i) => arr[(seed + i * 7) % arr.length]

  const present = Array.from(
    { length: Math.min(presentCount, 20) },
    (_, i) => ({
      id: 1000 + i,
      name: `${pick(FIRST_NAMES, i)} ${pick(FIRST_NAMES, i + 1)}`,
      department: pick(DEPARTMENTS, i),
      checkIn: `0${8 + (rand(i) % 2)}:${String(rand(i + 10) % 60).padStart(2, "0")}`,
    }),
  )

  const onLeave = Array.from({ length: onLeaveCount }, (_, i) => ({
    id: 2000 + i,
    name: `${pick(FIRST_NAMES, i + 5)} ${pick(FIRST_NAMES, i + 6)}`,
    department: pick(DEPARTMENTS, i + 2),
    leaveType: pick(LEAVE_TYPES, i),
  }))

  const absent = Array.from({ length: absentCount }, (_, i) => ({
    id: 3000 + i,
    name: `${pick(FIRST_NAMES, i + 10)} ${pick(FIRST_NAMES, i + 11)}`,
    department: pick(DEPARTMENTS, i + 3),
  }))

  return {
    date,
    summary: {
      present: presentCount,
      onLeave: onLeaveCount,
      absent: absentCount,
      total: totalEmployees,
    },
    present,
    onLeave,
    absent,
  }
}

const attendanceDayDetailMock = http.get(
  "*/leave/attendance/day/",
  ({ request }) => {
    const url = new URL(request.url)
    const date =
      url.searchParams.get("date") || new Date().toISOString().split("T")[0]
    return HttpResponse.json(generateDayDetail(date))
  },
)

const handlers = [
  leaveAttendanceMock,
  getLeaveSettingsMock,
  patchLeaveSettingsMock,
  attendanceDayDetailMock,
]

export default handlers
