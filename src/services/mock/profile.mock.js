import { http, HttpResponse } from "msw"

// ─── Seed data ────────────────────────────────────────────────────────────────

let profile = {
  id: 1,
  name: "Alice Johnson",
  email: "alice@example.com",
  phone: "+1 555 000 0001",
  bio: "Senior software engineer with a passion for building great products.",
  jobTitle: "Senior Software Engineer",
  department: "Engineering",
  role: "employee",
  joinDate: "2022-03-01",
  avatarUrl: null,
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
    {
      id: 4,
      name: "Logitech MX Master 3",
      type: "Mouse",
      serialNumber: "SN-LGT-MS-0089",
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
    {
      id: 4,
      name: "NDA Agreement.pdf",
      category: "Legal",
      uploadedAt: "2022-03-01",
    },
  ],
  timeline: [
    {
      type: "promotion",
      title: "Promoted to Senior Engineer",
      date: "2025-04-01",
      description: "Recognized for outstanding contributions to the product",
    },
    {
      type: "award",
      title: "Received Star Performer Badge",
      date: "2026-02-10",
      description: "Outstanding work on the theme switcher component",
    },
    {
      type: "training",
      title: "Completed React Advanced Course",
      date: "2024-09-15",
      description: "Internal upskilling program",
    },
    {
      type: "award",
      title: "Sprint MVP Award",
      date: "2024-06-20",
      description: "100% on-time delivery with zero bugs",
    },
    {
      type: "training",
      title: "AWS Solutions Architect Certification",
      date: "2023-11-10",
      description: "Cloud certification completed",
    },
    {
      type: "joined",
      title: "Joined the Team",
      date: "2022-03-01",
      description: "Started as Software Engineer in Engineering team",
    },
  ],
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

const profileHandlers = [
  // GET /api/profile/me/
  http.get("*/profile/me/", () => {
    return HttpResponse.json(profile)
  }),

  // PATCH /api/profile/me/
  http.patch("*/profile/me/", async ({ request }) => {
    const body = await request.json()
    profile = { ...profile, ...body }
    return HttpResponse.json(profile)
  }),

  // POST /api/profile/change-password/
  http.post("*/profile/change-password/", async ({ request }) => {
    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) {
      return HttpResponse.json(
        { error: "Both fields are required." },
        { status: 400 },
      )
    }
    return HttpResponse.json({ message: "Password changed successfully." })
  }),
]

export default profileHandlers
