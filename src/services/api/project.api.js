/**
 * Project API — returns local mock data directly.
 * Backend API for projects is not yet implemented.
 * Replace these with real API calls once the backend is ready.
 */

import { mockData } from "./project.data"
import { postSprintAnalytics, postSprintInsights } from "./ai.api"

export const getProjects = async () => {
  return {
    count: mockData.projects.length,
    next: null,
    previous: null,
    results: mockData.projects,
  }
}

export const getProjectById = async (id) => {
  const project = mockData.projects.find((p) => p.id === Number(id))
  if (!project) throw new Error("Project not found")
  return project
}

export const getSprints = async (projectId) => {
  const sprints = mockData.sprints[projectId] || []
  return {
    count: sprints.length,
    next: null,
    previous: null,
    results: sprints,
  }
}

export const getSprintById = async (projectId, sprintId) => {
  const sprints = mockData.sprints[projectId] || []
  const sprint = sprints.find((s) => s.id === Number(sprintId))
  if (!sprint) throw new Error("Sprint not found")
  return sprint
}

export const getTasks = async (projectId, sprintId) => {
  const tasks = mockData.tasks[sprintId] || []
  return {
    count: tasks.length,
    next: null,
    previous: null,
    results: tasks,
  }
}

export const getTaskById = async (projectId, sprintId, taskId) => {
  const tasks = mockData.tasks[sprintId] || []
  const task = tasks.find((t) => t.id === taskId)
  if (!task) throw new Error("Task not found")
  return task
}

export const updateTask = async (projectId, sprintId, taskId, data) => {
  const tasks = mockData.tasks[sprintId] || []
  const taskIndex = tasks.findIndex((t) => t.id === taskId)
  if (taskIndex === -1) throw new Error("Task not found")
  const updated = { ...tasks[taskIndex], ...data }
  mockData.tasks[sprintId][taskIndex] = updated
  return updated
}

export const addTaskComment = async (projectId, sprintId, taskId, data) => {
  const tasks = mockData.tasks[sprintId] || []
  const task = tasks.find((t) => t.id === taskId)
  if (!task) throw new Error("Task not found")
  const newComment = {
    id: (task.comments?.length || 0) + 1,
    ...data,
    createdAt: new Date().toISOString().split("T")[0],
  }
  if (!task.comments) task.comments = []
  task.comments.push(newComment)
  return newComment
}

export const getAIInsights = async (projectId, sprintId, { signal } = {}) => {
  const tasks = mockData.tasks[sprintId] || []
  const payload = {
    projectId,
    sprintId,
    tasks,
  }
  const response = await postSprintInsights(payload, { signal })
  return response.data
}

export const getWorkflows = async (projectId) => {
  const workflow = mockData.workflows[projectId] || null
  return workflow ? [workflow] : []
}

export const getWorkflowById = async (projectId, workflowId) => {
  const workflow = mockData.workflows[projectId] || null
  if (!workflow) throw new Error("Workflow not found")
  return workflow
}

export const updateWorkflow = async (projectId, workflowId, data) => {
  const workflow = mockData.workflows[projectId]
  if (!workflow) throw new Error("Workflow not found")
  const updated = { ...workflow, ...data }
  mockData.workflows[projectId] = updated
  return updated
}

export const getSprintAnalytics = async (
  projectId,
  sprintId,
  { signal } = {}
) => {
  const tasks = mockData.tasks[sprintId] || []
  const payload = {
    projectId,
    sprintId,
    tasks,
  }
  const response = await postSprintAnalytics(payload, { signal })
  return response.data
}
