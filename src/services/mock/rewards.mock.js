import { http, HttpResponse } from "msw"

// ─── Seed data ────────────────────────────────────────────────────────────────

let rewards = [
  {
    id: 1,
    employeeId: 2,
    employeeName: "Bob Smith",
    employeeEmail: "bob@example.com",
    grantedBy: "Alice Johnson",
    type: "star",
    title: "Outstanding Performance",
    description:
      "Exceptional delivery of the Q4 product launch. Bob went above and beyond to ensure everything shipped on time.",
    points: 100,
    grantedAt: "2025-12-10T09:00:00Z",
  },
  {
    id: 2,
    employeeId: 3,
    employeeName: "Carol White",
    employeeEmail: "carol@example.com",
    grantedBy: "Alice Johnson",
    type: "trophy",
    title: "Team Player of the Month",
    description:
      "Carol consistently helps team members and fosters a collaborative environment.",
    points: 75,
    grantedAt: "2026-01-05T10:00:00Z",
  },
  {
    id: 3,
    employeeId: 5,
    employeeName: "Eva Martinez",
    employeeEmail: "eva@example.com",
    grantedBy: "Alice Johnson",
    type: "certificate",
    title: "Innovation Award",
    description:
      "Eva proposed and implemented the automated reporting system that saved 10 hours per week.",
    points: 150,
    grantedAt: "2026-02-14T11:00:00Z",
  },
]

let nextId = rewards.length + 1

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REWARD_STATS = () => ({
  totalRewards: rewards.length,
  totalPoints: rewards.reduce((sum, r) => sum + (r.points ?? 0), 0),
  rewardsByType: rewards.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1
    return acc
  }, {}),
})

// ─── Handlers ─────────────────────────────────────────────────────────────────

const rewardHandlers = [
  // GET /api/rewards/ — all rewards (admin)
  http.get("*/rewards/", ({ request }) => {
    const url = new URL(request.url)
    // prevent collision with /rewards/my/
    if (url.pathname.endsWith("/my/")) return
    return HttpResponse.json({ rewards, stats: REWARD_STATS() })
  }),

  // GET /api/rewards/my/ — current user's rewards
  http.get("*/rewards/my/", () => {
    const myRewards = rewards.filter((r) => r.employeeId === 1) // mock as employee #1
    return HttpResponse.json({ rewards: myRewards, total: myRewards.length })
  }),

  // POST /api/rewards/ — grant a reward
  http.post("*/rewards/", async ({ request }) => {
    const body = await request.json()
    const now = new Date().toISOString()
    const newReward = {
      id: nextId++,
      employeeId: body.employeeId,
      employeeName: body.employeeName ?? "Unknown",
      employeeEmail: body.employeeEmail ?? "",
      grantedBy: "Admin",
      type: body.type ?? "star",
      title: body.title ?? "Reward",
      description: body.description ?? "",
      points: body.points ?? 50,
      grantedAt: now,
    }
    rewards.push(newReward)
    return HttpResponse.json(newReward, { status: 201 })
  }),
]

export default rewardHandlers
