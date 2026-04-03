import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import {
  ArrowLeft,
  LayoutDashboard,
  Sparkles,
  BarChart3,
  Clock,
  CheckCircle2,
  CircleDashed,
  Filter,
  X,
  ChevronRight,
  CalendarDays,
  Users,
  Bot,
  AlertTriangle,
  Plus,
  TrendingUp,
  Zap,
  Target,
  Activity,
} from "lucide-react"
import PropTypes from "prop-types"
import { useState } from "react"
import { Link } from "react-router"

import AIInsightsPanel from "@/components/ai-insights-panel"
import AnalyticsDashboard from "@/components/analytics-dashboard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CreateIssueModal } from "../projects/components/create-issue-modal"
import { IssueDetailsSidebar } from "../projects/components/issue-details-sidebar"

import AIAssistantSidebar from "./components/ai-assistant-sidebar"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
    case "low":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
  }
}

/** Column visual config: colors and icons per status */
const COLUMN_CONFIG = {
  Todo: {
    title: "To Do",
    color: "text-slate-600 dark:text-slate-400",
    bgHeader: "bg-slate-50 dark:bg-slate-900/50",
    border: "border-slate-200 dark:border-slate-700",
    dragOver: "bg-slate-50/80 border-slate-300 dark:bg-slate-800/50",
    dotColor: "bg-slate-400",
    taskBorder: "border-l-slate-400",
    emptyBg: "bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/60",
  },
  "In Progress": {
    title: "In Progress",
    color: "text-blue-600 dark:text-blue-400",
    bgHeader: "bg-blue-50 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-700",
    dragOver: "bg-blue-50/80 border-blue-300 dark:bg-blue-900/40",
    dotColor: "bg-blue-500",
    taskBorder: "border-l-blue-500",
    emptyBg: "bg-blue-50/40 dark:bg-blue-900/10 border-blue-200/60",
  },
  "In Review": {
    title: "In Review",
    color: "text-amber-600 dark:text-amber-400",
    bgHeader: "bg-amber-50 dark:bg-amber-900/30",
    border: "border-amber-200 dark:border-amber-700",
    dragOver: "bg-amber-50/80 border-amber-300 dark:bg-amber-900/40",
    dotColor: "bg-amber-500",
    taskBorder: "border-l-amber-500",
    emptyBg: "bg-amber-50/40 dark:bg-amber-900/10 border-amber-200/60",
  },
  Done: {
    title: "Done",
    color: "text-emerald-600 dark:text-emerald-400",
    bgHeader: "bg-emerald-50 dark:bg-emerald-900/30",
    border: "border-emerald-200 dark:border-emerald-700",
    dragOver: "bg-emerald-50/80 border-emerald-300 dark:bg-emerald-900/40",
    dotColor: "bg-emerald-500",
    taskBorder: "border-l-emerald-500",
    emptyBg: "bg-emerald-50/40 dark:bg-emerald-900/10 border-emerald-200/60",
  },
}

/**
 * TaskCard - Individual task card for the kanban board.
 * Supports both tasks and subtasks with visual distinction.
 */
const TaskCard = ({ task, onClick, parentTitle }) => {
  const isSubtask = task.type === "subtask" || !!task.parentId
  const colConfig = COLUMN_CONFIG[task.status] || COLUMN_CONFIG.Todo

  // Mock AI insights for demonstration
  const hasRisk = task.priority === "High" && !task.assignee
  const aiEstimate = task.estimatedHours ? null : (task.id.length % 5) + 1

  return (
    <Card
      className={`cursor-pointer transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] bg-card relative overflow-hidden border-l-4 ${colConfig.taskBorder} ${
        isSubtask ? "ml-3 opacity-90" : ""
      } ${hasRisk ? "ring-1 ring-red-300 dark:ring-red-700" : ""}`}
      onClick={onClick}
    >
      {hasRisk && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-24 border-r-24 border-t-red-500 border-r-transparent">
          <AlertTriangle className="absolute -top-5.5 right-0.5 h-3 w-3 text-white" />
        </div>
      )}
      <CardContent className="p-3.5 space-y-2.5">
        {isSubtask && parentTitle && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{parentTitle}</span>
          </div>
        )}

        <h4 className="font-medium text-sm leading-snug line-clamp-2 text-foreground">
          {task.title}
        </h4>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            className={`${getPriorityColor(task.priority)} text-[10px] font-semibold px-1.5 py-0`}
            variant="outline"
          >
            {task.priority || "No Priority"}
          </Badge>
          {isSubtask ? (
            <Badge
              className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 text-[10px] px-1.5 py-0"
              variant="outline"
            >
              Subtask
            </Badge>
          ) : task.type ? (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {task.type}
            </Badge>
          ) : null}
          {task.points && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 font-semibold"
            >
              {task.points} pts
            </Badge>
          )}
          {task.endDate && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400"
            >
              Due{" "}
              {new Date(task.endDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Badge>
          )}
          {aiEstimate && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 flex items-center gap-0.5"
              title="AI Suggested Estimate"
            >
              <Sparkles className="h-2.5 w-2.5" />~{aiEstimate}h
            </Badge>
          )}
        </div>

        {task.epic && (
          <p className="text-[11px] text-muted-foreground truncate">
            <span className="font-medium">Epic:</span> {task.epic}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            {task.assignee ? (
              <Avatar className="h-6 w-6 border shadow-sm">
                <AvatarImage
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                  {task.assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-6 w-6 rounded-full bg-muted border border-dashed border-muted-foreground/40 flex items-center justify-center text-muted-foreground/60 text-[10px]">
                ?
              </div>
            )}
            {task.assignee && (
              <span className="text-[11px] text-muted-foreground font-medium truncate max-w-20">
                {task.assignee.name?.split(" ")[0]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            {task.subtasks && task.subtasks.length > 0 && (
              <span className="flex items-center gap-0.5">
                <CheckCircle2 className="h-3 w-3" />
                {task.subtasks.filter((s) => s.completed).length}/
                {task.subtasks.length}
              </span>
            )}
            {task.estimatedHours && (
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {task.estimatedHours}h
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    priority: PropTypes.string,
    type: PropTypes.string,
    parentId: PropTypes.string,
    assignee: PropTypes.object,
    estimatedHours: PropTypes.number,
    subtasks: PropTypes.array,
    points: PropTypes.number,
    endDate: PropTypes.string,
    epic: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  parentTitle: PropTypes.string,
}

TaskCard.defaultProps = {
  onClick: undefined,
  parentTitle: undefined,
}

/**
 * KanbanColumn - Reusable kanban column with drop support.
 */
const KanbanColumn = ({
  title,
  tasks,
  allTasks,
  columnId,
  onTaskClick,
  onAddTask,
}) => {
  const config = COLUMN_CONFIG[columnId] || {}
  const totalPoints = tasks.reduce((sum, t) => sum + (t.points || 0), 0)
  const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)

  return (
    <Droppable droppableId={columnId}>
      {(provided, snapshot) => (
        <div
          className={`flex min-h-125 flex-col rounded-xl border-2 bg-background transition-all duration-200 ${
            snapshot.isDraggingOver
              ? `${config.dragOver} shadow-inner`
              : `${config.border} hover:shadow-sm`
          }`}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {/* Column Header */}
          <div
            className={`rounded-t-xl px-3 py-2.5 ${config.bgHeader} border-b ${config.border}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full shrink-0 ${config.dotColor}`}
                />
                <h3 className={`font-bold text-sm ${config.color}`}>{title}</h3>
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 px-1.5 text-xs font-bold bg-background border"
                >
                  {tasks.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md hover:bg-background/80"
                onClick={onAddTask}
                title={`Add task to ${title}`}
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
            {(totalPoints > 0 || totalHours > 0) && (
              <div className="flex items-center gap-2 mt-1.5">
                {totalPoints > 0 && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Target className="h-2.5 w-2.5" />
                    {totalPoints} pts
                  </span>
                )}
                {totalHours > 0 && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {totalHours}h
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="flex-1 space-y-2 p-2.5 overflow-y-auto py-2 custom-scrollbar">
            {tasks.length === 0 ? (
              <div
                className={`flex h-36 flex-col items-center justify-center rounded-lg border-2 border-dashed ${config.emptyBg} transition-colors`}
              >
                <CircleDashed className="h-6 w-6 text-muted-foreground/30 mb-2" />
                <p className="text-center text-xs text-muted-foreground/60 font-medium">
                  No tasks here
                </p>
                <button
                  onClick={onAddTask}
                  className="mt-1.5 text-[10px] text-muted-foreground/50 hover:text-primary transition-colors flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" />
                  Add a task
                </button>
              </div>
            ) : (
              tasks.map((task, index) => {
                const parent = task.parentId
                  ? allTasks.find((t) => t.id === task.parentId)
                  : null
                return (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transition-all ${
                          snapshot.isDragging
                            ? "opacity-75 scale-105 shadow-2xl z-50 rotate-1"
                            : ""
                        }`}
                        style={{ ...provided.draggableProps.style }}
                      >
                        <TaskCard
                          task={task}
                          parentTitle={parent?.title}
                          onClick={() => onTaskClick?.(task)}
                        />
                      </div>
                    )}
                  </Draggable>
                )
              })
            )}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  )
}

KanbanColumn.propTypes = {
  title: PropTypes.string.isRequired,
  tasks: PropTypes.array.isRequired,
  allTasks: PropTypes.array.isRequired,
  columnId: PropTypes.string.isRequired,
  onTaskClick: PropTypes.func,
  onAddTask: PropTypes.func,
}

KanbanColumn.defaultProps = {
  onTaskClick: undefined,
  onAddTask: undefined,
}

// ---------------------------------------------------------------------------
// BoardFilters
// ---------------------------------------------------------------------------

/**
 * BoardFilters - Filter bar for type, priority, and assignee.
 */
const BoardFilters = ({ filters, onChange, projectMembers, tasks = [] }) => {
  const hasActiveFilters =
    filters.type !== "all" ||
    filters.priority !== "all" ||
    filters.assignee !== "all"

  const handleClear = () =>
    onChange?.({ type: "all", priority: "all", assignee: "all" })

  const seen = new Set()
  const assignees = []
  for (const task of tasks) {
    if (task.assignee && !seen.has(task.assignee.id)) {
      seen.add(task.assignee.id)
      assignees.push(task.assignee)
    }
  }
  const members =
    projectMembers?.length > 0
      ? projectMembers.map((m) => ({ id: m.id, name: m.name }))
      : assignees

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-1">
        <Filter className="h-3.5 w-3.5" />
        <span className="font-medium text-xs">Filters:</span>
      </div>

      <Select
        value={filters.type}
        onValueChange={(v) => onChange({ ...filters, type: v })}
      >
        <SelectTrigger className="h-7 text-xs px-2 w-auto min-w-22.5 bg-background">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="task">Tasks Only</SelectItem>
          <SelectItem value="subtask">Subtasks Only</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(v) => onChange({ ...filters, priority: v })}
      >
        <SelectTrigger className="h-7 text-xs px-2 w-auto min-w-26.25 bg-background">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.assignee}
        onValueChange={(v) => onChange({ ...filters, assignee: v })}
      >
        <SelectTrigger className="h-7 text-xs px-2 w-auto min-w-28.75 bg-background">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Members</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.id} value={String(m.id)}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  )
}

BoardFilters.propTypes = {
  filters: PropTypes.shape({
    type: PropTypes.string,
    priority: PropTypes.string,
    assignee: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  projectMembers: PropTypes.array,
  tasks: PropTypes.array,
}

BoardFilters.defaultProps = {
  projectMembers: undefined,
  tasks: [],
}

// ---------------------------------------------------------------------------
// StandupTab
// ---------------------------------------------------------------------------

const MOCK_STANDUP_DATES = [
  {
    id: "2026-02-23",
    date: "2026-02-23",
    label: "Today",
    updates: [
      {
        id: 1,
        name: "Alice Smith",
        avatar: "https://i.pravatar.cc/150?u=1",
        today: "Completed UI component library setup and theme design review.",
        blockers: "None",
        time: "2 hours ago",
      },
      {
        id: 2,
        name: "Bob Jones",
        avatar: "https://i.pravatar.cc/150?u=2",
        today: "Implemented API authentication and token refresh flow.",
        blockers: "Waiting for design specs for the mobile screen",
        time: "1 hour ago",
      },
    ],
  },
  {
    id: "2026-02-22",
    date: "2026-02-22",
    label: "Yesterday",
    updates: [
      {
        id: 3,
        name: "Alice Smith",
        avatar: "https://i.pravatar.cc/150?u=1",
        today: "Started working on the UI component library.",
        blockers: "None",
        time: "1 day ago",
      },
      {
        id: 4,
        name: "Charlie Brown",
        avatar: "https://i.pravatar.cc/150?u=3",
        today: "Fixed the bug in the user profile page.",
        blockers: "None",
        time: "1 day ago",
      },
    ],
  },
  {
    id: "2026-02-21",
    date: "2026-02-21",
    label: "Feb 21, 2026",
    updates: [
      {
        id: 5,
        name: "Bob Jones",
        avatar: "https://i.pravatar.cc/150?u=2",
        today: "Investigated the performance issue in the dashboard.",
        blockers: "Need access to production logs",
        time: "2 days ago",
      },
    ],
  },
]

/**
 * StandupTab - Embedded standup and team updates view for the sprint.
 */
const StandupTab = ({ sprintId }) => {
  const [selectedDateId, setSelectedDateId] = useState(MOCK_STANDUP_DATES[0].id)

  const selectedDateData = MOCK_STANDUP_DATES.find(
    (d) => d.id === selectedDateId,
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Standup Updates</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
            <Users className="h-4 w-4" />
            Team daily progress
            {sprintId && (
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Sprint {sprintId}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Side: Dates List */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1">
              {MOCK_STANDUP_DATES.map((dateItem) => (
                <button
                  key={dateItem.id}
                  onClick={() => setSelectedDateId(dateItem.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedDateId === dateItem.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{dateItem.label}</span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 ${
                      selectedDateId === dateItem.id
                        ? "bg-primary/20 text-primary"
                        : "bg-muted-foreground/10 text-muted-foreground"
                    }`}
                  >
                    {dateItem.updates.length}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Updates List */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Updates for {selectedDateData?.label}
              <Badge variant="secondary" className="ml-auto text-xs">
                {selectedDateData?.updates.length || 0} updates
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDateData?.updates.length > 0 ? (
              selectedDateData.updates.map((update, _index) => (
                <div key={update.id}>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarImage src={update.avatar} alt={update.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {update.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {update.name}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {update.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {update.today}
                      </p>
                      {update.blockers && update.blockers !== "None" && (
                        <div className="mt-1.5 flex items-start gap-1.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-orange-300 text-orange-700 bg-orange-50 shrink-0"
                          >
                            Blocker
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {update.blockers}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {_index < selectedDateData.updates.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No updates for this date.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

StandupTab.propTypes = {
  sprintId: PropTypes.string,
}

StandupTab.defaultProps = {
  sprintId: undefined,
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLUMNS = [
  { id: "Todo", title: "To Do" },
  { id: "In Progress", title: "In Progress" },
  { id: "In Review", title: "In Review" },
  { id: "Done", title: "Done" },
]

const DEFAULT_FILTERS = { type: "all", priority: "all", assignee: "all" }

// ---------------------------------------------------------------------------
// SprintProgressBar
// ---------------------------------------------------------------------------

/**
 * SprintProgressBar - Compact horizontal progress overview above the board.
 */
const SprintProgressBar = ({ tasksByStatus, totalTasks }) => {
  if (totalTasks === 0) return null

  const doneTasks = tasksByStatus.Done?.length || 0
  const inProgressTasks = tasksByStatus["In Progress"]?.length || 0
  const inReviewTasks = tasksByStatus["In Review"]?.length || 0
  const todoTasks = tasksByStatus.Todo?.length || 0

  const donePercent = Math.round((doneTasks / totalTasks) * 100)
  const inProgressPercent = Math.round((inProgressTasks / totalTasks) * 100)
  const inReviewPercent = Math.round((inReviewTasks / totalTasks) * 100)
  const todoPercent = Math.round((todoTasks / totalTasks) * 100)

  return (
    <div className="px-6 py-3 border-b bg-card/30">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          Sprint Progress
        </span>
        <span className="text-xs font-bold text-foreground">
          {donePercent}% Complete
        </span>
        <div className="flex items-center gap-3 ml-auto text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-slate-400 inline-block" />
            {todoTasks} To Do
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-blue-500 inline-block" />
            {inProgressTasks} In Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-amber-500 inline-block" />
            {inReviewTasks} In Review
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-emerald-500 inline-block" />
            {doneTasks} Done
          </span>
        </div>
      </div>
      <div className="flex h-2 w-full rounded-full overflow-hidden gap-0.5">
        {todoPercent > 0 && (
          <div
            className="bg-slate-300 dark:bg-slate-600 rounded-full transition-all duration-500"
            style={{ width: `${todoPercent}%` }}
          />
        )}
        {inProgressPercent > 0 && (
          <div
            className="bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${inProgressPercent}%` }}
          />
        )}
        {inReviewPercent > 0 && (
          <div
            className="bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${inReviewPercent}%` }}
          />
        )}
        {donePercent > 0 && (
          <div
            className="bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${donePercent}%` }}
          />
        )}
      </div>
    </div>
  )
}

SprintProgressBar.propTypes = {
  tasksByStatus: PropTypes.object.isRequired,
  totalTasks: PropTypes.number.isRequired,
}

/**
 * SprintBoardUI - Main kanban board for sprint management.
 * Tabs: Board (with task/subtask filters), Daily Updates, AI Insights, Analytics.
 * Workflow tab removed. Issue creation moved to a sidebar sheet.
 */
const SprintBoardUI = ({
  project,
  tasks,
  sprintId,
  insights,
  analytics,
  isLoading,
  isInsightsLoading,
  isAnalyticsLoading,
  error,
  selectedTask,
  onSelectTask,
  onSaveTask,
}) => {
  const [activeTab, setActiveTab] = useState("kanban")
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to={`/projects/${project?.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Link>
        </Button>
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-destructive/80">
            Failed to load sprint board. Please try again later.
          </CardContent>
        </Card>
      </div>
    )
  }

  // Apply filters to tasks
  const filteredTasks = tasks.filter((task) => {
    const isSubtask = task.type === "subtask" || !!task.parentId

    if (filters.type === "task" && isSubtask) return false
    if (filters.type === "subtask" && !isSubtask) return false

    if (
      filters.priority !== "all" &&
      task.priority?.toLowerCase() !== filters.priority
    ) {
      return false
    }

    if (filters.assignee === "unassigned" && task.assignee) {
      return false
    }
    if (
      filters.assignee !== "all" &&
      filters.assignee !== "unassigned" &&
      String(task.assignee?.id) !== filters.assignee
    ) {
      return false
    }

    return true
  })

  // Group filtered tasks by status
  const tasksByStatus = COLUMNS.reduce((accumulator, col) => {
    accumulator[col.id] = filteredTasks.filter((t) => t.status === col.id)
    return accumulator
  }, {})

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result
    if (!destination) {
      return
    }
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const draggedTask = tasks.find((t) => t.id === draggableId)
    if (!draggedTask) {
      return
    }

    if (source.droppableId !== destination.droppableId) {
      onSaveTask?.({ ...draggedTask, status: destination.droppableId })
    }
  }

  const handleCreateSubtask = () => {
    // TODO: Open create subtask modal
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Header Area */}
      <div className="flex-none border-b bg-card/60 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="h-8 w-8 rounded-full shrink-0"
            >
              <Link to={`/projects/${project.id}`}>
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Sprint {sprintId}
                </h1>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold">
                  ● Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <LayoutDashboard className="h-3.5 w-3.5" />
                {project.name}
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground">
                  {tasks.length} tasks total
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`gap-1.5 h-8 text-xs transition-all ${
                isAIAssistantOpen
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
              }`}
              onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
            >
              <Bot className="h-3.5 w-3.5" />
              AI Assistant
            </Button>
            <div className="flex -space-x-2">
              {project.members?.slice(0, 4).map((member, index) => (
                <Avatar
                  key={member.id || index}
                  className="h-7 w-7 border-2 border-background"
                >
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="bg-muted text-[10px] font-semibold">
                    {member.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.members?.length > 4 && (
                <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground z-10">
                  +{project.members.length - 4}
                </div>
              )}
            </div>
            <CreateIssueModal
              triggerText="Create Issue"
              variant="default"
              size="sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-border/50 w-full justify-start h-auto p-0 rounded-none space-x-5">
            <TabsTrigger
              value="kanban"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-2 text-xs font-semibold text-muted-foreground data-[state=active]:text-foreground transition-all gap-1.5"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Board
            </TabsTrigger>
            <TabsTrigger
              value="standup"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-2 text-xs font-semibold text-muted-foreground data-[state=active]:text-foreground transition-all gap-1.5"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Standup
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent px-1 py-2 text-xs font-semibold text-muted-foreground data-[state=active]:text-foreground transition-all gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-2 text-xs font-semibold text-muted-foreground data-[state=active]:text-foreground transition-all gap-1.5"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden bg-muted/10 relative">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* AI Sprint Health Banner */}
          <div className="flex items-center justify-between gap-3 bg-linear-to-r from-primary/15 via-primary/8 to-amber-500/5 border-b px-6 py-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0 bg-primary/10 text-primary rounded-full px-2.5 py-0.5">
                <Zap className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">On Track</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground shrink-0">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                AI Sprint Health
              </div>
              <span className="text-xs text-muted-foreground truncate">
                Velocity is 4% above average · 2 tasks at risk
              </span>
            </div>
            <Button
              variant="link"
              size="sm"
              className="h-auto py-0 text-xs shrink-0 text-primary"
              onClick={() => setActiveTab("insights")}
            >
              View Analysis →
            </Button>
          </div>

          {/* Sprint Progress Bar */}
          {activeTab === "kanban" && (
            <SprintProgressBar
              tasksByStatus={tasksByStatus}
              totalTasks={filteredTasks.length}
            />
          )}

          {/* Kanban Tab */}
          {activeTab === "kanban" && (
            <div className="h-full p-5 overflow-x-auto flex flex-col">
              <div className="mb-3">
                <BoardFilters
                  filters={filters}
                  onChange={setFilters}
                  tasks={tasks}
                  projectMembers={project?.members || []}
                />
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 flex-1 min-w-max pb-4">
                  {COLUMNS.map((col) => (
                    <div key={col.id} className="w-72.5 shrink-0 flex flex-col">
                      <KanbanColumn
                        title={col.title}
                        tasks={tasksByStatus[col.id] || []}
                        columnId={col.id}
                        onTaskClick={(task) => onSelectTask?.(task)}
                        onAddTask={() => {
                          // CreateIssueModal will be opened via header button
                        }}
                        allTasks={tasks}
                      />
                    </div>
                  ))}
                </div>
              </DragDropContext>
            </div>
          )}

          {/* Standup Tab */}
          {activeTab === "standup" && (
            <div className="h-full p-6 overflow-y-auto">
              <StandupTab projectMembers={project?.members || []} />
            </div>
          )}

          {/* AI Insights Tab */}
          {activeTab === "insights" && (
            <div className="h-full p-6 overflow-y-auto">
              <div className="max-w-5xl mx-auto">
                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                  <CardHeader className="border-b bg-muted/20">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      AI-Powered Sprint Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <AIInsightsPanel
                      insights={insights}
                      isLoading={isInsightsLoading}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="h-full p-6 overflow-y-auto">
              <div className="max-w-5xl mx-auto">
                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                  <CardHeader className="border-b bg-muted/20">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Sprint Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <AnalyticsDashboard
                      analytics={analytics}
                      isLoading={isAnalyticsLoading}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Sidebar */}
        {isAIAssistantOpen && (
          <div className="w-80 shrink-0 border-l bg-card flex flex-col h-full shadow-xl z-10">
            <AIAssistantSidebar
              isOpen={isAIAssistantOpen}
              onClose={() => setIsAIAssistantOpen(false)}
              sprintId={sprintId}
            />
          </div>
        )}
      </div>

      {/* Issue Details Sidebar */}
      <IssueDetailsSidebar
        issue={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) onSelectTask?.(null)
        }}
        onEdit={() => {
          // TODO: Open edit issue modal/sidebar
        }}
        onDelete={() => {
          // TODO: Delete issue
        }}
        onCreateSubtask={handleCreateSubtask}
      />
    </div>
  )
}

SprintBoardUI.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    members: PropTypes.array,
  }),
  tasks: PropTypes.array.isRequired,
  sprintId: PropTypes.string,
  insights: PropTypes.object,
  analytics: PropTypes.object,
  isLoading: PropTypes.bool.isRequired,
  isInsightsLoading: PropTypes.bool,
  isAnalyticsLoading: PropTypes.bool,
  error: PropTypes.object,
  selectedTask: PropTypes.object,
  onSelectTask: PropTypes.func,
  onSaveTask: PropTypes.func,
}

SprintBoardUI.defaultProps = {
  project: undefined,
  sprintId: undefined,
  insights: undefined,
  analytics: undefined,
  isInsightsLoading: false,
  isAnalyticsLoading: false,
  error: undefined,
  selectedTask: undefined,
  onSelectTask: undefined,
  onSaveTask: undefined,
}

export { BoardFilters }
export default SprintBoardUI
