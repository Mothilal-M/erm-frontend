/**
 * Local mock data for projects module.
 * Backend API for projects is not yet implemented.
 * Remove this file once the backend is ready.
 */

const projects = [
  {
    id: 1,
    name: "ERM Frontend Revamp",
    description:
      "Modernizing the ERM frontend with React 19 and Tailwind CSS v4.",
    status: "Active",
    progress: 65,
    members: [
      { id: 1, name: "Alice Smith", avatar: "https://i.pravatar.cc/150?u=1" },
      { id: 2, name: "Bob Jones", avatar: "https://i.pravatar.cc/150?u=2" },
    ],
    startDate: "2026-01-10",
    endDate: "2026-04-30",
  },
  {
    id: 2,
    name: "AI Scrum Master Integration",
    description: "Adding AI-powered standups and auto-estimation.",
    status: "Active",
    progress: 20,
    members: [
      { id: 1, name: "Alice Smith", avatar: "https://i.pravatar.cc/150?u=1" },
      { id: 3, name: "Charlie Brown", avatar: "https://i.pravatar.cc/150?u=3" },
    ],
    startDate: "2026-02-15",
    endDate: "2026-05-15",
  },
  {
    id: 3,
    name: "Legacy API Migration",
    description: "Migrating old REST endpoints to GraphQL.",
    status: "Completed",
    progress: 100,
    members: [
      { id: 2, name: "Bob Jones", avatar: "https://i.pravatar.cc/150?u=2" },
    ],
    startDate: "2025-10-01",
    endDate: "2025-12-20",
  },
]

const sprints = {
  1: [
    {
      id: 101,
      name: "Sprint 1: Foundation",
      status: "Completed",
      startDate: "2026-01-10",
      endDate: "2026-01-24",
      progress: 100,
    },
    {
      id: 102,
      name: "Sprint 2: UI Components",
      status: "Active",
      startDate: "2026-01-25",
      endDate: "2026-02-08",
      progress: 80,
    },
    {
      id: 103,
      name: "Sprint 3: Integration",
      status: "Backlog",
      startDate: "2026-02-09",
      endDate: "2026-02-23",
      progress: 0,
    },
  ],
  2: [
    {
      id: 201,
      name: "Sprint 1: AI Prompts",
      status: "Active",
      startDate: "2026-02-15",
      endDate: "2026-03-01",
      progress: 40,
    },
  ],
}

const tasks = {
  102: [
    {
      id: "TASK-001",
      sprintId: 102,
      title: "Design theme switcher UI",
      description:
        "Create a responsive theme switcher component supporting light/dark modes.",
      status: "Done",
      assignee: {
        id: 1,
        name: "Alice Smith",
        avatar: "https://i.pravatar.cc/150?u=1",
      },
      priority: "High",
      estimatedHours: 4,
      actualHours: 5,
      createdAt: "2026-01-25",
      dueDate: "2026-01-28",
      subtasks: [
        { id: 1, title: "Design mockups", completed: true },
        { id: 2, title: "Build component", completed: true },
      ],
      comments: [
        {
          id: 1,
          author: "Alice Smith",
          text: "Initial design completed",
          createdAt: "2026-01-25",
        },
      ],
    },
    {
      id: "TASK-002",
      sprintId: 102,
      title: "Implement responsive grid layout",
      description:
        "Create responsive grid system that adapts to 375px, 768px, and 1920px breakpoints.",
      status: "In Review",
      assignee: {
        id: 2,
        name: "Bob Jones",
        avatar: "https://i.pravatar.cc/150?u=2",
      },
      priority: "High",
      estimatedHours: 6,
      actualHours: 5,
      createdAt: "2026-01-25",
      dueDate: "2026-02-02",
      subtasks: [
        { id: 1, title: "Mobile layout (375px)", completed: true },
        { id: 2, title: "Tablet layout (768px)", completed: true },
        { id: 3, title: "Desktop layout (1920px)", completed: false },
      ],
      comments: [],
    },
    {
      id: "TASK-003",
      sprintId: 102,
      title: "Create shadcn/ui button variants",
      description:
        "Build all button variants using CVA (Class Variance Authority) pattern.",
      status: "In Progress",
      assignee: {
        id: 1,
        name: "Alice Smith",
        avatar: "https://i.pravatar.cc/150?u=1",
      },
      priority: "Medium",
      estimatedHours: 5,
      actualHours: 3,
      createdAt: "2026-01-26",
      dueDate: "2026-02-04",
      subtasks: [
        { id: 1, title: "Primary button", completed: true },
        { id: 2, title: "Secondary button", completed: true },
        { id: 3, title: "Outline button", completed: false },
        { id: 4, title: "Loading states", completed: false },
      ],
      comments: [],
    },
    {
      id: "TASK-004",
      sprintId: 102,
      title: "Setup form validation with Zod",
      description:
        "Implement form validation schemas using Zod for all user input forms.",
      status: "Todo",
      assignee: {
        id: 2,
        name: "Bob Jones",
        avatar: "https://i.pravatar.cc/150?u=2",
      },
      priority: "Medium",
      estimatedHours: 4,
      actualHours: 0,
      createdAt: "2026-01-27",
      dueDate: "2026-02-05",
      subtasks: [
        { id: 1, title: "Create user schema", completed: false },
        { id: 2, title: "Create project schema", completed: false },
      ],
      comments: [],
    },
    {
      id: "TASK-005",
      sprintId: 102,
      title: "Optimize bundle size",
      description: "Reduce initial bundle size and implement code splitting.",
      status: "Todo",
      assignee: null,
      priority: "Low",
      estimatedHours: 3,
      actualHours: 0,
      createdAt: "2026-01-28",
      dueDate: "2026-02-07",
      subtasks: [],
      comments: [],
    },
  ],
  103: [
    {
      id: "TASK-006",
      sprintId: 103,
      title: "Integrate Redux with components",
      description: "Connect Redux store to all necessary components.",
      status: "Todo",
      assignee: null,
      priority: "High",
      estimatedHours: 8,
      actualHours: 0,
      createdAt: "2026-02-09",
      dueDate: "2026-02-16",
      subtasks: [],
      comments: [],
    },
  ],
  201: [
    {
      id: "TASK-101",
      sprintId: 201,
      title: "Setup AI API integration",
      description: "Configure OpenAI API client and error handling.",
      status: "In Progress",
      assignee: {
        id: 1,
        name: "Alice Smith",
        avatar: "https://i.pravatar.cc/150?u=1",
      },
      priority: "High",
      estimatedHours: 5,
      actualHours: 4,
      createdAt: "2026-02-15",
      dueDate: "2026-02-20",
      subtasks: [
        { id: 1, title: "Configure API credentials", completed: true },
        { id: 2, title: "Setup error handling", completed: false },
      ],
      comments: [],
    },
  ],
}

const aiInsights = {
  102: {
    sprintId: 102,
    autoEstimates: [
      {
        taskId: "TASK-004",
        suggestedHours: 6,
        confidence: 0.92,
        reason: "Similar to TASK-001",
      },
      {
        taskId: "TASK-005",
        suggestedHours: 4,
        confidence: 0.87,
        reason: "Matches bundle optimization pattern",
      },
    ],
    standupSummary:
      "Sprint 2 is progressing well at 80% completion. Setup form validation has started, responsive grid is in review. Continue momentum on remaining UI components.",
    riskAssessment: [
      {
        issue: "Desktop layout not started",
        severity: "medium",
        recommendation: "Allocate 2 hours to complete grid layout",
      },
      {
        issue: "Bundle optimization low priority",
        severity: "low",
        recommendation: "Plan for Sprint 3 if not critical",
      },
    ],
    recommendations: [
      "Prioritize desktop grid layout to unblock In Review tasks",
      "Consider pairing Bob Jones with form validation task",
      "Schedule review for responsive grid by tomorrow",
    ],
    velocityTrend: [45, 52, 60, 48],
    predictedCompletion: "2026-02-09",
  },
}

const workflows = {
  1: {
    projectId: 1,
    name: "Standard Agile",
    columns: [
      { id: "Todo", title: "Todo", color: "bg-gray-100" },
      { id: "In Progress", title: "In Progress", color: "bg-blue-100" },
      { id: "In Review", title: "In Review", color: "bg-yellow-100" },
      { id: "Done", title: "Done", color: "bg-green-100" },
    ],
    isActive: true,
  },
  2: {
    projectId: 2,
    name: "AI-Optimized Flow",
    columns: [
      { id: "Backlog", title: "Backlog", color: "bg-gray-100" },
      { id: "Analysis", title: "Analysis", color: "bg-purple-100" },
      { id: "Development", title: "Development", color: "bg-blue-100" },
      { id: "Testing", title: "Testing", color: "bg-orange-100" },
      { id: "Deployed", title: "Deployed", color: "bg-green-100" },
    ],
    isActive: true,
  },
}

const analytics = {
  102: {
    sprintId: 102,
    plannedVelocity: 40,
    actualVelocity: 32,
    burndownData: [
      { day: "1/25", remaining: 40 },
      { day: "1/26", remaining: 35 },
      { day: "1/27", remaining: 33 },
      { day: "1/28", remaining: 28 },
      { day: "1/29", remaining: 25 },
      { day: "1/30", remaining: 20 },
      { day: "1/31", remaining: 15 },
      { day: "2/1", remaining: 12 },
      { day: "2/2", remaining: 8 },
      { day: "2/3", remaining: 5 },
      { day: "2/4", remaining: 3 },
      { day: "2/5", remaining: 1 },
    ],
    teamCapacity: {
      "Alice Smith": { allocated: 28, completed: 24, efficiency: 0.86 },
      "Bob Jones": { allocated: 35, completed: 28, efficiency: 0.8 },
    },
    taskDistribution: {
      byStatus: { Todo: 2, "In Progress": 1, "In Review": 1, Done: 1 },
      byPriority: { High: 2, Medium: 2, Low: 1 },
      byAssignee: { "Alice Smith": 2, "Bob Jones": 2, Unassigned: 1 },
    },
    defectRate: 0.05,
    onTimeHistory: [0.9, 0.85, 0.92, 0.88],
  },
}

export const mockData = {
  projects,
  sprints,
  tasks,
  aiInsights,
  workflows,
  analytics,
}
