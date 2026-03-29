import { useQuery, useMutation } from "@tanstack/react-query"

import {
  getProjectById,
  getProjects,
  getSprints,
  getTasks,
  getTaskById,
  updateTask,
  addTaskComment,
  getAIInsights,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  getSprintAnalytics,
} from "../api/project.api"

export const projectKeys = {
  all: ["projects"],
  lists: () => [...projectKeys.all, "list"],
  list: (filters) => [...projectKeys.lists(), { filters }],
  details: () => [...projectKeys.all, "detail"],
  detail: (id) => [...projectKeys.details(), id],
  sprints: (projectId) => [...projectKeys.detail(projectId), "sprints"],
  sprintList: (projectId, filters) => [
    ...projectKeys.sprints(projectId),
    { filters },
  ],
  tasks: (projectId, sprintId) => [
    ...projectKeys.detail(projectId),
    "sprints",
    sprintId,
    "tasks",
  ],
  taskList: (projectId, sprintId, filters) => [
    ...projectKeys.tasks(projectId, sprintId),
    { filters },
  ],
  taskDetail: (projectId, sprintId, taskId) => [
    ...projectKeys.tasks(projectId, sprintId),
    taskId,
  ],
  aiInsights: (projectId, sprintId) => [
    ...projectKeys.detail(projectId),
    "sprints",
    sprintId,
    "ai-insights",
  ],
  workflows: (projectId) => [...projectKeys.detail(projectId), "workflows"],
  workflowDetail: (projectId, workflowId) => [
    ...projectKeys.workflows(projectId),
    workflowId,
  ],
  analytics: (projectId, sprintId) => [
    ...projectKeys.detail(projectId),
    "sprints",
    sprintId,
    "analytics",
  ],
}

export const useGetProjects = (parameters = {}) => {
  return useQuery({
    queryKey: projectKeys.list(parameters),
    queryFn: () => getProjects(parameters),
  })
}

export const useGetProjectById = (id) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProjectById(id),
    enabled: !!id,
  })
}

export const useGetSprints = (projectId, parameters = {}) => {
  return useQuery({
    queryKey: projectKeys.sprintList(projectId, parameters),
    queryFn: () => getSprints(projectId, parameters),
    enabled: !!projectId,
  })
}
export const useGetTasks = (projectId, sprintId, parameters = {}) => {
  return useQuery({
    queryKey: projectKeys.taskList(projectId, sprintId, parameters),
    queryFn: () => getTasks(projectId, sprintId, parameters),
    enabled: !!projectId && !!sprintId,
  })
}

export const useGetTaskById = (projectId, sprintId, taskId) => {
  return useQuery({
    queryKey: projectKeys.taskDetail(projectId, sprintId, taskId),
    queryFn: () => getTaskById(projectId, sprintId, taskId),
    enabled: !!projectId && !!sprintId && !!taskId,
  })
}

export const useUpdateTask = () => {
  return useMutation({
    mutationFn: ({ projectId, sprintId, taskId, data }) =>
      updateTask(projectId, sprintId, taskId, data),
  })
}

export const useAddTaskComment = () => {
  return useMutation({
    mutationFn: ({ projectId, sprintId, taskId, data }) =>
      addTaskComment(projectId, sprintId, taskId, data),
  })
}

export const useGetAIInsights = (projectId, sprintId) => {
  return useQuery({
    queryKey: projectKeys.aiInsights(projectId, sprintId),
    queryFn: ({ signal }) => getAIInsights(projectId, sprintId, { signal }),
    enabled: !!projectId && !!sprintId,
  })
}

export const useGetWorkflows = (projectId) => {
  return useQuery({
    queryKey: projectKeys.workflows(projectId),
    queryFn: () => getWorkflows(projectId),
    enabled: !!projectId,
  })
}

export const useGetWorkflowById = (projectId, workflowId) => {
  return useQuery({
    queryKey: projectKeys.workflowDetail(projectId, workflowId),
    queryFn: () => getWorkflowById(projectId, workflowId),
    enabled: !!projectId && !!workflowId,
  })
}

export const useUpdateWorkflow = () => {
  return useMutation({
    mutationFn: ({ projectId, workflowId, data }) =>
      updateWorkflow(projectId, workflowId, data),
  })
}

export const useGetSprintAnalytics = (projectId, sprintId) => {
  return useQuery({
    queryKey: projectKeys.analytics(projectId, sprintId),
    queryFn: ({ signal }) =>
      getSprintAnalytics(projectId, sprintId, { signal }),
    enabled: !!projectId && !!sprintId,
  })
}
