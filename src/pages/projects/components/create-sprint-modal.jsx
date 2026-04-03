import { Plus, Layers, ListTodo } from "lucide-react"
import PropTypes from "prop-types"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

// Sample data - in real app, would come from props or API
const SAMPLE_EPICS = [
  { id: "EPIC-1", title: "Security Improvements", status: "In Progress" },
  { id: "EPIC-2", title: "UI/UX Overhaul", status: "To Do" },
  { id: "EPIC-3", title: "Performance Optimization", status: "Done" },
]

const SAMPLE_BACKLOG_TASKS = [
  {
    id: "US-101",
    title: "Implement OAuth2 Authentication",
    epic: "Security",
    points: 8,
    priority: "High",
  },
  {
    id: "US-102",
    title: "Design new Dashboard Layout",
    epic: "UI/UX",
    points: 5,
    priority: "Medium",
  },
  {
    id: "US-103",
    title: "Setup CI/CD Pipeline for Staging",
    epic: "DevOps",
    points: 13,
    priority: "High",
  },
  {
    id: "US-104",
    title: "User Profile Settings Page",
    epic: "Features",
    points: 3,
    priority: "Low",
  },
]

export const CreateSprintModal = ({ projectId = null }) => {
  const [open, setOpen] = useState(false)
  const [selectedEpics, setSelectedEpics] = useState([])
  const [selectedTasks, setSelectedTasks] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
  })

  const handleFormChange = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }))
  }

  const toggleEpic = (epicId) => {
    setSelectedEpics((previous) =>
      previous.includes(epicId)
        ? previous.filter((id) => id !== epicId)
        : [...previous, epicId],
    )
  }

  const toggleTask = (taskId) => {
    setSelectedTasks((previous) =>
      previous.includes(taskId)
        ? previous.filter((id) => id !== taskId)
        : [...previous, taskId],
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      selectedEpics,
      selectedTasks,
      projectId,
    }
    console.log("Creating sprint:", submitData)
    // Reset form
    setFormData({ name: "", goal: "", startDate: "", endDate: "" })
    setSelectedEpics([])
    setSelectedTasks([])
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Create Sprint
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl flex flex-col p-0"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b sticky top-0">
            <SheetTitle>Create Sprint</SheetTitle>
            <SheetDescription>
              Plan a new sprint for your project. Set a goal, timeline, and add
              epics and tasks.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
            {/* Sprint Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Sprint Details</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Sprint Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Sprint 1"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal">Sprint Goal</Label>
                <Textarea
                  id="goal"
                  placeholder="What do you want to achieve in this sprint?"
                  value={formData.goal}
                  onChange={(e) => handleFormChange("goal", e.target.value)}
                  className="min-h-25"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleFormChange("startDate", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleFormChange("endDate", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Epics Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">
                  Select Epics ({selectedEpics.length})
                </h3>
              </div>
              <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
                {SAMPLE_EPICS.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No epics available
                  </p>
                ) : (
                  SAMPLE_EPICS.map((epic) => (
                    <div
                      key={epic.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`epic-${epic.id}`}
                        checked={selectedEpics.includes(epic.id)}
                        onCheckedChange={() => toggleEpic(epic.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`epic-${epic.id}`}
                          className="font-medium text-sm cursor-pointer"
                        >
                          {epic.title}
                        </Label>
                        <Badge
                          variant="secondary"
                          className="text-xs ml-0 mt-1"
                        >
                          {epic.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Separator />

            {/* Backlog Tasks Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Backlog Tasks</h3>
              </div>
              <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
                {SAMPLE_BACKLOG_TASKS.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No backlog tasks available
                  </p>
                ) : (
                  SAMPLE_BACKLOG_TASKS.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`task-${task.id}`}
                          className="font-medium text-sm cursor-pointer block"
                        >
                          {task.id}: {task.title}
                        </Label>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {task.epic}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {task.points} pts
                          </Badge>
                          <Badge
                            variant={
                              task.priority === "High"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t shrink-0 gap-2 sticky bottom-0 bg-background">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Start Sprint</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

CreateSprintModal.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

CreateSprintModal.defaultProps = {
  projectId: null,
}
