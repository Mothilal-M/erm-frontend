import {
  ArrowLeft,
  Send,
  Plus,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { setStandupStatus } from "@/services/store/slices/app.slice"

// Mock data for projects and user stories
const MOCK_PROJECTS = [
  { id: "p1", name: "ERM Frontend Redesign" },
  { id: "p2", name: "Backend API v2" },
  { id: "p3", name: "Mobile App MVP" },
]

const MOCK_USER_STORIES = {
  p1: [
    { id: "us1", title: "ERM-101: Implement new dashboard layout" },
    { id: "us2", title: "ERM-105: Add dark mode support" },
    { id: "us3", title: "ERM-112: Refactor authentication flow" },
  ],
  p2: [
    { id: "us4", title: "API-201: Create user management endpoints" },
    { id: "us5", title: "API-205: Implement rate limiting" },
  ],
  p3: [
    { id: "us6", title: "MOB-301: Setup React Native project" },
    { id: "us7", title: "MOB-305: Implement push notifications" },
  ],
}

/**
 * Submission Status Component - Shows the status of the standup submission
 */
const SubmissionStatus = ({ status, feedback, aiApproved }) => {
  const getStatusColor = () => {
    if (status === "pending") return "bg-yellow-50 border-yellow-200"
    if (status === "reviewing") return "bg-blue-50 border-blue-200"
    if (status === "approved") return "bg-green-50 border-green-200"
    if (status === "rejected") return "bg-red-50 border-red-200"
    return "bg-gray-50 border-gray-200"
  }

  const getStatusIcon = () => {
    if (status === "pending") {
      return <Clock className="h-4 w-4 text-yellow-600" />
    }
    if (status === "reviewing") {
      return <Sparkles className="h-4 w-4 text-blue-600" />
    }
    if (status === "approved") {
      return <Check className="h-4 w-4 text-green-600" />
    }
    if (status === "rejected") {
      return <AlertCircle className="h-4 w-4 text-red-600" />
    }
    return null
  }

  const getStatusText = () => {
    if (status === "pending") return "Pending Submission"
    if (status === "reviewing") return "AI Reviewing"
    if (status === "approved") return "Approved"
    if (status === "rejected") return "Needs Revision"
    return "Unknown"
  }

  return (
    <Card className={`border ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {getStatusIcon()}
          Submission Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge
              variant={
                status === "approved"
                  ? "default"
                  : status === "rejected"
                    ? "destructive"
                    : "secondary"
              }
            >
              {getStatusText()}
            </Badge>
          </div>
          {status === "reviewing" && (
            <p className="text-xs text-muted-foreground">
              AI is analyzing your standup for completeness and quality...
            </p>
          )}
        </div>

        {feedback && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">AI Feedback</Label>
            <div className="bg-background/50 rounded-md p-3 text-sm text-muted-foreground border">
              {feedback}
            </div>
          </div>
        )}

        {status === "approved" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
              <Check className="h-4 w-4" />
              Great job! Your standup has been approved by AI.
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full gap-2"
            >
              <Link to="/ai/recommendations">
                <Sparkles className="h-4 w-4" />
                View AI Recommendations
              </Link>
            </Button>
          </div>
        )}

        {status === "rejected" && (
          <Button variant="outline" size="sm" className="w-full">
            Edit & Resubmit
          </Button>
        )}

        {status !== "pending" && (
          <Button variant="outline" size="sm" asChild className="w-full gap-2">
            <Link to="/ai/insights">
              <Sparkles className="h-4 w-4" />
              View AI Insights
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * CreateStandupPage - Form for developers to submit their daily standup
 */
const CreateStandupPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState("pending")
  const [aiFeedback, setAiFeedback] = useState(null)

  // A user can work on multiple projects/stories in a day
  const [updates, setUpdates] = useState([
    {
      id: Date.now().toString(),
      projectId: "",
      userStoryIds: [],
      yesterday: "",
      today: "",
      blockers: "",
    },
  ])

  const handleAddUpdate = () => {
    setUpdates([
      ...updates,
      {
        id: Date.now().toString(),
        projectId: "",
        userStoryIds: [],
        yesterday: "",
        today: "",
        blockers: "",
      },
    ])
  }

  const handleRemoveUpdate = (idToRemove) => {
    if (updates.length > 1) {
      setUpdates(updates.filter((update) => update.id !== idToRemove))
    }
  }

  const handleUpdateChange = (id, field, value) => {
    setUpdates(
      updates.map((update) => {
        if (update.id === id) {
          const newUpdate = { ...update, [field]: value }
          // Reset user stories if project changes
          if (field === "projectId") {
            newUpdate.userStoryIds = []
          }
          return newUpdate
        }
        return update
      }),
    )
  }

  const handleUserStoryToggle = (updateId, storyId) => {
    setUpdates(
      updates.map((update) => {
        if (update.id === updateId) {
          const newUserStoryIds = update.userStoryIds.includes(storyId)
            ? update.userStoryIds.filter((id) => id !== storyId)
            : [...update.userStoryIds, storyId]
          return { ...update, userStoryIds: newUserStoryIds }
        }
        return update
      }),
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form (basic validation)
    const isValid = updates.every((u) => u.projectId && u.today)
    if (!isValid) {
      alert(
        "Please fill in at least the Project and Today's plan for all entries.",
      )
      setIsSubmitting(false)
      return
    }

    // Simulate API call and AI review
    setTimeout(() => {
      setSubmissionStatus("reviewing")
      dispatch(setStandupStatus("In Review"))
      setIsSubmitting(false)

      // Simulate AI review after 2 seconds
      setTimeout(() => {
        // Randomly decide approval status
        const approved = Math.random() > 0.3
        if (approved) {
          setSubmissionStatus("approved")
          dispatch(setStandupStatus("Done"))
          setAiFeedback(
            "Your standup is well-structured with clear goals and blockers identified. Keep up the good work!",
          )
        } else {
          setSubmissionStatus("rejected")
          dispatch(setStandupStatus("Not Submitted"))
          setAiFeedback(
            "Please provide more details about blockers you're facing. Also, consider breaking down your tasks into smaller milestones.",
          )
        }
      }, 2000)
    }, 1000)
  }

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Post Daily Standup
            </h1>
            <p className="text-sm text-muted-foreground">{dateLabel}</p>
          </div>
          {submissionStatus !== "pending" && (
            <Badge
              className={
                submissionStatus === "approved"
                  ? "bg-green-600"
                  : submissionStatus === "reviewing"
                    ? "bg-blue-600"
                    : "bg-red-600"
              }
            >
              {submissionStatus.charAt(0).toUpperCase() +
                submissionStatus.slice(1)}
            </Badge>
          )}
        </div>

        <Separator />

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {updates.map((update, index) => (
                <Card key={update.id} className="relative overflow-hidden">
                  {updates.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveUpdate(update.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">
                      Update #{index + 1}
                    </CardTitle>
                    <CardDescription>
                      Select the project and stories you are working on
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Project Selection */}
                    <div className="space-y-2">
                      <Label htmlFor={`project-${update.id}`}>
                        Project <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={update.projectId}
                        onValueChange={(value) =>
                          handleUpdateChange(update.id, "projectId", value)
                        }
                      >
                        <SelectTrigger id={`project-${update.id}`}>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_PROJECTS.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Multiple User Story Selection */}
                    {update.projectId && (
                      <div className="space-y-3">
                        <Label>User Stories / Tasks (Select Multiple)</Label>
                        <div className="border rounded-md p-4 space-y-2">
                          {MOCK_USER_STORIES[update.projectId]?.map((story) => (
                            <div
                              key={story.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`story-${update.id}-${story.id}`}
                                checked={update.userStoryIds.includes(story.id)}
                                onCheckedChange={() =>
                                  handleUserStoryToggle(update.id, story.id)
                                }
                              />
                              <Label
                                htmlFor={`story-${update.id}-${story.id}`}
                                className="cursor-pointer text-sm font-normal"
                              >
                                {story.title}
                              </Label>
                            </div>
                          ))}
                          <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                              id={`story-${update.id}-other`}
                              checked={update.userStoryIds.includes("other")}
                              onCheckedChange={() =>
                                handleUserStoryToggle(update.id, "other")
                              }
                            />
                            <Label
                              htmlFor={`story-${update.id}-other`}
                              className="cursor-pointer text-sm font-normal"
                            >
                              Other / General Task
                            </Label>
                          </div>
                        </div>
                        {update.userStoryIds.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {update.userStoryIds.map((storyId) => (
                              <Badge
                                key={storyId}
                                variant="outline"
                                className="text-xs"
                              >
                                {storyId === "other"
                                  ? "Other"
                                  : MOCK_USER_STORIES[update.projectId]?.find(
                                      (s) => s.id === storyId,
                                    )?.title || storyId}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-4">
                      {/* Yesterday */}
                      <div className="space-y-2">
                        <Label htmlFor={`yesterday-${update.id}`}>
                          What did you accomplish yesterday?
                        </Label>
                        <Textarea
                          id={`yesterday-${update.id}`}
                          placeholder="Briefly describe what you completed..."
                          value={update.yesterday}
                          onChange={(e) =>
                            handleUpdateChange(
                              update.id,
                              "yesterday",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="resize-none"
                        />
                      </div>

                      {/* Today */}
                      <div className="space-y-2">
                        <Label htmlFor={`today-${update.id}`}>
                          What will you do today?{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id={`today-${update.id}`}
                          placeholder="What are your goals for today?"
                          value={update.today}
                          onChange={(e) =>
                            handleUpdateChange(
                              update.id,
                              "today",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="resize-none"
                        />
                      </div>

                      {/* Blockers */}
                      <div className="space-y-2">
                        <Label htmlFor={`blockers-${update.id}`}>
                          Are there any blockers in your way?
                        </Label>
                        <Textarea
                          id={`blockers-${update.id}`}
                          placeholder="List any impediments or dependencies (leave blank if none)..."
                          value={update.blockers}
                          onChange={(e) =>
                            handleUpdateChange(
                              update.id,
                              "blockers",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddUpdate}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Project Update
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || submissionStatus !== "pending"}
                  className="gap-2 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Submitting...
                    </span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Standup
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column - Submission Status */}
          <div className="lg:col-span-1">
            <SubmissionStatus
              status={submissionStatus}
              feedback={aiFeedback}
              aiApproved={submissionStatus === "approved"}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateStandupPage
