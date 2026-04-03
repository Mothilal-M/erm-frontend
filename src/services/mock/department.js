import { http, HttpResponse } from "msw"

// ─── Seed data ────────────────────────────────────────────────────────────────

let departments = [
  {
    id: 1,
    name: "Engineering",
    description: "Product development and technical infrastructure",
    employeeCount: 22,
    head: "Sarah Mitchell",
    color: "blue",
  },
  {
    id: 2,
    name: "Design",
    description: "UI/UX, branding, and creative direction",
    employeeCount: 8,
    head: "Lisa Park",
    color: "purple",
  },
  {
    id: 3,
    name: "HR",
    description: "People operations, hiring, and employee wellbeing",
    employeeCount: 5,
    head: "Priya Sharma",
    color: "green",
  },
  {
    id: 4,
    name: "Finance",
    description: "Budgeting, payroll, and financial planning",
    employeeCount: 7,
    head: "Mike Chen",
    color: "yellow",
  },
  {
    id: 5,
    name: "Marketing",
    description: "Brand growth, campaigns, and market research",
    employeeCount: 10,
    head: "Sara Williams",
    color: "orange",
  },
  {
    id: 6,
    name: "Sales",
    description: "Revenue generation and client relationships",
    employeeCount: 9,
    head: "James Wilson",
    color: "red",
  },
  {
    id: 7,
    name: "Operations",
    description: "Business processes, logistics, and facilities",
    employeeCount: 4,
    head: "Tom Brown",
    color: "slate",
  },
]

let nextId = departments.length + 1

// ─── Helpers ──────────────────────────────────────────────────────────────────

const respondWithDepartmentList = () => {
  return HttpResponse.json({
    departments,
    total: departments.length,
    totalEmployees: departments.reduce((s, d) => s + d.employeeCount, 0),
  })
}

const handleCreateDepartment = async ({ request }) => {
  const body = await request.json()
  const newDept = {
    id: nextId++,
    employeeCount: 0,
    color: "slate",
    ...body,
  }
  departments = [...departments, newDept]
  return HttpResponse.json(newDept, { status: 201 })
}

// ─── GET /employee-management/departments/ ────────────────────────────────────

const listDepartments = http.get("*/employee-management/departments/", () =>
  respondWithDepartmentList(),
)
const listDepartmentsNoSlash = http.get(
  "*/employee-management/departments",
  () => respondWithDepartmentList(),
)

// ─── POST /employee-management/departments/ ───────────────────────────────────

const createDepartment = http.post(
  "*/employee-management/departments/",
  handleCreateDepartment,
)
const createDepartmentNoSlash = http.post(
  "*/employee-management/departments",
  handleCreateDepartment,
)

// ─── PATCH /employee-management/departments/:id/ ──────────────────────────────

const updateDepartment = http.patch(
  "*/employee-management/departments/:id/",
  async ({ params, request }) => {
    const body = await request.json()
    const idx = departments.findIndex((d) => d.id === Number(params.id))
    if (idx === -1)
      return HttpResponse.json({ detail: "Not found." }, { status: 404 })
    departments[idx] = { ...departments[idx], ...body }
    return HttpResponse.json(departments[idx])
  },
)

// ─── DELETE /employee-management/departments/:id/ ─────────────────────────────

const removeDepartment = http.delete(
  "*/employee-management/departments/:id/",
  ({ params }) => {
    const idx = departments.findIndex((d) => d.id === Number(params.id))
    if (idx === -1)
      return HttpResponse.json({ detail: "Not found." }, { status: 404 })
    departments = departments.filter((d) => d.id !== Number(params.id))
    return HttpResponse.json({ detail: "Deleted." })
  },
)

const handlers = [
  listDepartments,
  listDepartmentsNoSlash,
  createDepartment,
  createDepartmentNoSlash,
  updateDepartment,
  removeDepartment,
]

export default handlers
