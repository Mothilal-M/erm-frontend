import { Loader2, X, Check, MessageSquare } from "lucide-react"
import PropTypes from "prop-types"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAddTaskComment } from "@/services/query/project.query"

/**
 * TaskModal - Modal for viewing and editing task details
 */
const TaskModal = ({
  isOpen,
  task,
  projectId,
  sprintId,
  onClose,
  onSave,
  isLoading = false,
  projectMembers = [],
}) => {
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "Todo",
    priority: task?.priority || "Medium",
    assignee: task?.assignee?.id || null,
    estimatedHours: task?.estimatedHours || 0,
    actualHours: task?.actualHours || 0,
  })

  const [newComment, setNewComment] = useState("")
  const addCommentMutation = useAddTaskComment()

  const handleInputChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleSubmit = () => {
    onSave?.(formData)
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !task) return

    addCommentMutation.mutate(
      {
        projectId,
        sprintId,
        taskId: task.id,
        data: {
          author: "Current User", // TODO: Get from auth context
          text: newComment,
        },
      },
      {
        onSuccess: () => {
          setNewComment("")
        },
      },
    )
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Low":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="line-clamp-1">{task?.id}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Task description"
              rows={3}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todo">Todo</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee and Hours */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={String(formData.assignee || "none")}
                onValueChange={(value) =>
                  handleInputChange(
                    "assignee",
                    value === "none" ? null : Number(value),
                  )
                }
              >
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {projectMembers.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="estimated">Est. Hours</Label>
                <Input
                  id="estimated"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) =>
                    handleInputChange("estimatedHours", Number(e.target.value))
                  }
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual">Actual Hours</Label>
                <Input
                  id="actual"
                  type="number"
                  value={formData.actualHours}
                  onChange={(e) =>
                    handleInputChange("actualHours", Number(e.target.value))
                  }
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Subtasks */}
          {task?.subtasks && task.subtasks.length > 0 && (
            <div className="space-y-3">
              <Label>
                Subtasks ({task.subtasks.filter((s) => s.completed).length}/
                {task.subtasks.length})
              </Label>
              <Card>
                <CardContent className="space-y-2 pt-4">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-start gap-2">
                      <div className="mt-1 h-4 w-4 rounded border border-gray-300 bg-white flex items-center justify-center">
                        {subtask.completed && (
                          <Check className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      <Label
                        className={`text-sm cursor-pointer pt-0.5 ${
                          subtask.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {subtask.title}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Comments */}
          {task && (
            <div className="space-y-3">
              <Label>Comments ({task.comments?.length || 0})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {task.comments?.map((comment) => (
                  <Card key={comment.id} className="bg-muted/50">
                    <CardContent className="pt-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-semibold">
                            {comment.author}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {comment.text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {comment.createdAt}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  className="self-end"
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

TaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  task: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    priority: PropTypes.string,
    status: PropTypes.string,
    assignee: PropTypes.object,
    estimatedHours: PropTypes.number,
    actualHours: PropTypes.number,
    subtasks: PropTypes.array,
    comments: PropTypes.array,
  }),
  projectId: PropTypes.number,
  sprintId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  isLoading: PropTypes.bool,
  projectMembers: PropTypes.array,
}

export default TaskModal
