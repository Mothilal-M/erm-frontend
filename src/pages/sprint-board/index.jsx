import { useState } from "react"
import { useParams } from "react-router"

import {
  useGetProjectById,
  useGetTasks,
  useUpdateTask,
  useGetAIInsights,
  useGetSprintAnalytics,
} from "@/services/query/project.query"

import SprintBoardUI from "./sprint-board.ui"

const SprintBoard = () => {
  const { projectId, sprintId } = useParams()
  const [selectedTask, setSelectedTask] = useState(null)

  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
  } = useGetProjectById(projectId)
  const {
    data: tasks,
    isLoading: isTasksLoading,
    error: tasksError,
  } = useGetTasks(projectId, sprintId)
  const {
    data: insights,
    isLoading: isInsightsLoading,
    error: insightsError,
  } = useGetAIInsights(projectId, sprintId)
  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
  } = useGetSprintAnalytics(projectId, sprintId)

  const updateTaskMutation = useUpdateTask()

  const handleSaveTask = (formData) => {
    if (!selectedTask) return

    updateTaskMutation.mutate(
      {
        projectId,
        sprintId,
        taskId: selectedTask.id,
        data: formData,
      },
      {
        onSuccess: () => {
          setSelectedTask(null)
        },
      },
    )
  }

  return (
    <SprintBoardUI
      project={project}
      tasks={tasks?.results || []}
      sprintId={sprintId}
      insights={insights}
      analytics={analytics}
      isLoading={isProjectLoading || isTasksLoading}
      isInsightsLoading={isInsightsLoading}
      isAnalyticsLoading={isAnalyticsLoading}
      error={projectError || tasksError}
      selectedTask={selectedTask}
      onSelectTask={setSelectedTask}
      onSaveTask={handleSaveTask}
      isSavingTask={updateTaskMutation.isPending}
    />
  )
}

export default SprintBoard
