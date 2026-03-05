import { http, HttpResponse } from "msw"

// ─── Seed data ────────────────────────────────────────────────────────────────

let policies = [
  {
    id: 1,
    title: "Remote Work Policy",
    content:
      "Employees may work remotely up to 3 days per week with manager approval. All remote work must comply with data security standards.",
    category: "hr",
    shareScope: "team",
    specificAccess: "",
    effectiveDate: "2024-01-01",
    createdAt: "2023-12-15T10:00:00Z",
    updatedAt: "2024-01-01T08:00:00Z",
  },
  {
    id: 2,
    title: "Code of Conduct",
    content:
      "All employees are expected to maintain a professional and respectful workplace. Harassment and discrimination of any kind are not tolerated.",
    category: "general",
    shareScope: "public",
    specificAccess: "",
    effectiveDate: "2023-03-01",
    createdAt: "2023-02-10T09:00:00Z",
    updatedAt: "2023-03-01T08:00:00Z",
  },
  {
    id: 3,
    title: "Annual Leave Policy",
    content:
      "Full-time employees are entitled to 20 days of annual leave per year. Leave must be requested at least 5 working days in advance.",
    category: "leave",
    shareScope: "team",
    specificAccess: "",
    effectiveDate: "2024-01-01",
    createdAt: "2023-11-20T11:00:00Z",
    updatedAt: "2024-01-01T08:00:00Z",
  },
  {
    id: 4,
    title: "Information Security Policy",
    content:
      "All company data must be handled securely. Employees must use strong passwords, enable 2FA, and not share credentials. Security incidents must be reported immediately.",
    category: "security",
    shareScope: "specific",
    specificAccess: "security-team@company.com",
    effectiveDate: "2023-06-01",
    createdAt: "2023-05-01T10:00:00Z",
    updatedAt: "2023-06-01T08:00:00Z",
  },
]

let nextId = policies.length + 1

// ─── Handlers ─────────────────────────────────────────────────────────────────

const policyHandlers = [
  // GET /api/policies/
  http.get("*/policies/", () => {
    return HttpResponse.json({ policies, total: policies.length })
  }),

  // GET /api/policies/:id/
  http.get("*/policies/:id/", ({ params }) => {
    const policy = policies.find((p) => p.id === Number(params.id))
    if (!policy) {
      return HttpResponse.json({ error: "Policy not found." }, { status: 404 })
    }
    return HttpResponse.json(policy)
  }),

  // POST /api/policies/
  http.post("*/policies/", async ({ request }) => {
    const body = await request.json()
    const now = new Date().toISOString()
    const newPolicy = {
      id: nextId++,
      title: body.title ?? "",
      content: body.content ?? "",
      category: body.category ?? "general",
      shareScope: body.shareScope ?? "team",
      specificAccess:
        body.shareScope === "specific" ? (body.specificAccess ?? "") : "",
      effectiveDate: body.effectiveDate ?? now.split("T")[0],
      createdAt: now,
      updatedAt: now,
    }
    policies.push(newPolicy)
    return HttpResponse.json(newPolicy, { status: 201 })
  }),

  // PATCH /api/policies/:id/
  http.patch("*/policies/:id/", async ({ params, request }) => {
    const idx = policies.findIndex((p) => p.id === Number(params.id))
    if (idx === -1) {
      return HttpResponse.json({ error: "Policy not found." }, { status: 404 })
    }
    const body = await request.json()
    policies[idx] = {
      ...policies[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(policies[idx])
  }),

  // DELETE /api/policies/:id/
  http.delete("*/policies/:id/", ({ params }) => {
    const idx = policies.findIndex((p) => p.id === Number(params.id))
    if (idx === -1) {
      return HttpResponse.json({ error: "Policy not found." }, { status: 404 })
    }
    policies.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]

export default policyHandlers
