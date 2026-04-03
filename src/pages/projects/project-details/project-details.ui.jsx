import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Target,
  Activity,
  ChevronRight,
  Sparkles,
  BookOpen,
  ListTodo,
  TrendingUp,
  FileText,
  Lightbulb,
  Settings,
  Layers,
  Trash2,
  Edit,
  MoreVertical,
  Plus,
  Zap,
  CheckCircle2,
  AlertCircle,
  Circle,
  BarChart2,
  FolderOpen,
  Hash,
  Timer,
  ExternalLink,
} from "lucide-react"
import { motion } from "framer-motion"
import PropTypes from "prop-types"
import { useState } from "react"
import { Link } from "react-router"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const VELOCITY_DATA = [
  { name: "Sprint 1", points: 45 },
  { name: "Sprint 2", points: 52 },
  { name: "Sprint 3", points: 48 },
  { name: "Sprint 4", points: 61 },
  { name: "Sprint 5", points: 59 },
  { name: "Sprint 6", points: 68 },
]

const BURNDOWN_DATA = [
  { day: "Day 1", remaining: 100, ideal: 100 },
  { day: "Day 2", remaining: 90, ideal: 90 },
  { day: "Day 3", remaining: 85, ideal: 80 },
  { day: "Day 4", remaining: 70, ideal: 70 },
  { day: "Day 5", remaining: 65, ideal: 60 },
  { day: "Day 6", remaining: 50, ideal: 50 },
  { day: "Day 7", remaining: 45, ideal: 40 },
  { day: "Day 8", remaining: 30, ideal: 30 },
  { day: "Day 9", remaining: 15, ideal: 20 },
  { day: "Day 10", remaining: 5, ideal: 10 },
]

const ISSUE_STATUS_DATA = [
  { name: "To Do", value: 15, color: "#facc15" },
  { name: "In Progress", value: 25, color: "#3b82f6" },
  { name: "Review", value: 10, color: "#a855f7" },
  { name: "Done", value: 50, color: "#22c55e" },
]

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  AnimatedCard,
  BlurText,
  FadeIn,
  PulseBadge,
  AnimatedProgress,
  NumberTicker,
} from "@/components/magicui"
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/magicui/stagger-container"

import { CreateIssueModal } from "../components/create-issue-modal"
import { CreateSprintModal } from "../components/create-sprint-modal"
import { EditProjectSidebar } from "../components/edit-project-sidebar"
import { EpicDetailsSidebar } from "../components/epic-details-sidebar"
import { IssueDetailsSidebar } from "../components/issue-details-sidebar"

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
    case "on hold":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
  }
}

const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "emerald"
    case "completed":
      return "red"
    case "on hold":
      return "amber"
    default:
      return "blue"
  }
}

const getSprintStatusConfig = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return {
        dot: "bg-emerald-500",
        badge:
          "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
        bar: "bg-emerald-500",
      }
    case "completed":
    case "done":
      return {
        dot: "bg-blue-500",
        badge:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
        bar: "bg-blue-500",
      }
    case "planning":
      return {
        dot: "bg-purple-500",
        badge:
          "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
        bar: "bg-purple-500",
      }
    default:
      return {
        dot: "bg-slate-400",
        badge:
          "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300",
        bar: "bg-slate-400",
      }
  }
}

const getPriorityConfig = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return {
        dot: "bg-red-500",
        badge:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400",
      }
    case "medium":
      return {
        dot: "bg-yellow-500",
        badge:
          "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
      }
    case "low":
      return {
        dot: "bg-green-500",
        badge:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
      }
    default:
      return {
        dot: "bg-gray-400",
        badge:
          "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300",
      }
  }
}

const getEpicStatusConfig = (status) => {
  switch (status?.toLowerCase()) {
    case "in progress":
      return {
        color: "text-blue-600",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        bar: "bg-blue-500",
      }
    case "done":
      return {
        color: "text-emerald-600",
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        bar: "bg-emerald-500",
      }
    case "to do":
      return {
        color: "text-slate-600",
        bg: "bg-slate-100 dark:bg-slate-800",
        bar: "bg-slate-400",
      }
    default:
      return {
        color: "text-muted-foreground",
        bg: "bg-muted",
        bar: "bg-muted-foreground",
      }
  }
}

const LoadingState = () => (
  <div className="space-y-6 p-6 max-w-7xl mx-auto">
    <div className="flex items-center gap-4 mb-8">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  </div>
)

const ErrorState = () => (
  <div className="p-6 max-w-7xl mx-auto">
    <Button variant="ghost" asChild className="mb-4">
      <Link to="/projects">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Link>
    </Button>
    <FadeIn direction="up">
      <Card className="border-destructive bg-destructive/10 rounded-xl">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Error Loading Project
          </CardTitle>
          <CardDescription className="text-destructive/80">
            We couldn&apos;t load the project details. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    </FadeIn>
  </div>
)

const OverviewTab = ({ project, activeSprint }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
    <div className="lg:col-span-2 space-y-5">
      {activeSprint ? (
        <FadeIn direction="up" delay={0.1}>
          <AnimatedCard delay={0.1} className="border-0 shadow-sm rounded-xl border-l-4 border-l-primary overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Active Sprint
                </CardTitle>
                <PulseBadge color="emerald">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                  In Progress
                </PulseBadge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-xl font-bold text-foreground">
                  {activeSprint.name}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(activeSprint.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {" — "}
                {new Date(activeSprint.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </CardHeader>
            <CardContent className="space-y-5 pt-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/40 rounded-xl p-3 text-center border">
                  <div className="text-3xl font-extrabold text-primary">
                    <NumberTicker value={activeSprint.progress} suffix="%" delay={0.2} />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 font-medium uppercase tracking-wide">
                    Completion
                  </div>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 text-center border">
                  <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    <NumberTicker value={12} delay={0.3} />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 font-medium uppercase tracking-wide">
                    Tasks Done
                  </div>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 text-center border">
                  <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                    <NumberTicker value={5} delay={0.4} />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 font-medium uppercase tracking-wide">
                    Days Left
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Sprint Progress</span>
                  <span className="text-foreground font-semibold">
                    {activeSprint.progress}%
                  </span>
                </div>
                <AnimatedProgress
                  value={activeSprint.progress}
                  max={100}
                  height="h-2.5"
                  delay={0.3}
                  className="rounded-xl"
                />
              </div>

              <Button asChild className="w-full gap-2 rounded-xl">
                <Link to={`/projects/${project.id}/sprints/${activeSprint.id}`}>
                  Go to Sprint Board
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </AnimatedCard>
        </FadeIn>
      ) : (
        <FadeIn direction="up" delay={0.1}>
          <Card className="border-dashed border-2 shadow-none rounded-xl">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
              <h3 className="text-xl font-semibold mb-2">No Active Sprint</h3>
              <p className="text-muted-foreground max-w-md mb-6 text-sm">
                Start a new sprint to track your team&apos;s progress here.
              </p>
              <CreateSprintModal />
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* AI Insights */}
      <FadeIn direction="up" delay={0.2}>
        <AnimatedCard delay={0.2} className="border-0 shadow-sm rounded-xl border-amber-200/80 dark:border-amber-800/40 overflow-hidden">
          <div className="h-1 bg-linear-to-r from-amber-400 to-orange-400" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
              AI Overview & Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Based on recent activity, the project is{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">
                on track
              </strong>{" "}
              to meet its target date. Velocity has increased by 15% compared to
              the last sprint.
            </p>
            <div className="space-y-2">
              {[
                {
                  text: `Consider breaking down the "User Authentication Epic" as it currently contains tasks with high estimation variance.`,
                  type: "warning",
                },
                {
                  text: `Team member workload is well-balanced, but QA review times are slightly bottlenecking the "Done" column.`,
                  type: "info",
                },
              ].map((insight, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 rounded-xl p-2.5 text-sm ${
                    insight.type === "warning"
                      ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40"
                      : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/40"
                  }`}
                >
                  <Lightbulb
                    className={`h-4 w-4 mt-0.5 shrink-0 ${insight.type === "warning" ? "text-amber-500" : "text-blue-500"}`}
                  />
                  <span className="text-muted-foreground leading-snug">
                    {insight.text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </AnimatedCard>
      </FadeIn>
    </div>

    {/* Right Sidebar */}
    <div className="space-y-4">
      {/* About */}
      <FadeIn direction="left" delay={0.15}>
        <AnimatedCard delay={0.15} className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              About Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.description || "No description provided for this project."}
            </p>
          </CardContent>
        </AnimatedCard>
      </FadeIn>

      {/* Overall Progress */}
      <FadeIn direction="left" delay={0.25}>
        <AnimatedCard delay={0.25} className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-end justify-between mb-1.5">
                <span className="text-xs text-muted-foreground font-medium">
                  Completion
                </span>
                <span className="text-3xl font-extrabold text-primary leading-none">
                  <NumberTicker value={project.progress} suffix="%" delay={0.3} />
                </span>
              </div>
              <AnimatedProgress
                value={project.progress}
                max={100}
                height="h-2"
                delay={0.35}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2 pt-3 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Start Date
                </span>
                <span className="font-semibold">
                  {new Date(project.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" /> Target Date
                </span>
                <span className="font-semibold">
                  {new Date(project.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      </FadeIn>

      {/* Team */}
      <FadeIn direction="left" delay={0.35}>
        <AnimatedCard delay={0.35} className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </CardTitle>
            <Badge variant="secondary" className="text-xs font-bold">
              {project.members?.length || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            {project.members && project.members.length > 0 ? (
              <div className="space-y-3">
                {project.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-8 w-8 border shadow-sm">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-none truncate">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Team Member
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No team members assigned.
              </p>
            )}
            <Button variant="outline" className="w-full mt-4 h-8 text-xs rounded-xl">
              Manage Team
            </Button>
          </CardContent>
        </AnimatedCard>
      </FadeIn>
    </div>

    {/* Analytics Section */}
    <div className="lg:col-span-3 space-y-4">
      <FadeIn direction="up" delay={0.3}>
        <div className="flex items-center gap-2 pt-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Project Analytics</h3>
        </div>
      </FadeIn>
      <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Velocity Chart */}
        <StaggerItem>
          <AnimatedCard delay={0.35} className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                Velocity Chart
              </CardTitle>
              <CardDescription className="text-xs">
                Story points completed across sprints
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={VELOCITY_DATA}
                  margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="velocityGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(100,116,139,0.18)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    itemStyle={{ color: "#6366f1", fontWeight: 600 }}
                    labelStyle={{
                      color: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    cursor={{ fill: "rgba(99,102,241,0.08)" }}
                  />
                  <Bar
                    dataKey="points"
                    fill="url(#velocityGradient)"
                    radius={[5, 5, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </AnimatedCard>
        </StaggerItem>

        {/* Burndown Chart */}
        <StaggerItem>
          <AnimatedCard delay={0.4} className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-500" />
                Burndown Chart
              </CardTitle>
              <CardDescription className="text-xs">
                Remaining effort in active sprint
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={BURNDOWN_DATA}
                  margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(100,116,139,0.18)"
                  />
                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    itemStyle={{ fontWeight: 600 }}
                    labelStyle={{
                      color: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={28}
                    formatter={(value, entry) => (
                      <span
                        style={{
                          color: entry.color,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {value}
                      </span>
                    )}
                  />
                  <Line
                    type="monotone"
                    name="Actual"
                    dataKey="remaining"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{
                      r: 3,
                      fill: "#ef4444",
                      stroke: "#ef4444",
                      strokeWidth: 0,
                    }}
                    activeDot={{ r: 5, fill: "#ef4444" }}
                  />
                  <Line
                    type="monotone"
                    name="Ideal"
                    dataKey="ideal"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 4, fill: "#6366f1" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </AnimatedCard>
        </StaggerItem>

        {/* Issue Breakdown */}
        <StaggerItem>
          <AnimatedCard delay={0.45} className="border-0 shadow-sm rounded-xl lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Issue Breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                Current status of all project issues
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ISSUE_STATUS_DATA}
                    cx="50%"
                    cy="48%"
                    innerRadius={62}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                      name,
                    }) => {
                      if (percent < 0.1) return null
                      const RADIAN = Math.PI / 180
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 1.45
                      const x = cx + radius * Math.cos(-midAngle * RADIAN)
                      const y = cy + radius * Math.sin(-midAngle * RADIAN)
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#94a3b8"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          fontSize={11}
                          fontWeight={500}
                        >
                          {`${name} ${(percent * 100).toFixed(0)}%`}
                        </text>
                      )
                    }}
                    labelLine={{
                      stroke: "rgba(148,163,184,0.4)",
                      strokeWidth: 1,
                    }}
                  >
                    {ISSUE_STATUS_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    formatter={(value, name) => [`${value}%`, name]}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value, entry) => (
                      <span
                        style={{
                          color: entry.color,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </AnimatedCard>
        </StaggerItem>
      </StaggerContainer>
    </div>
  </div>
)

OverviewTab.propTypes = {
  project: PropTypes.object.isRequired,
  activeSprint: PropTypes.object,
}

OverviewTab.defaultProps = {
  activeSprint: null,
}

const SprintsTab = ({ project, sprints }) => (
  <div className="space-y-4">
    <FadeIn direction="down" delay={0.05}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Sprints</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sprints.length} sprint{sprints.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <CreateSprintModal />
      </div>
    </FadeIn>

    {sprints.length === 0 ? (
      <FadeIn direction="up" delay={0.1}>
        <Card className="border-dashed border-2 shadow-none rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-10 w-10 text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-lg font-semibold mb-1">No sprints yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Get started by creating your first sprint to organize tasks and
              track progress.
            </p>
            <div className="mt-4">
              <CreateSprintModal />
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    ) : (
      <StaggerContainer className="space-y-2.5">
        {sprints.map((sprint) => {
          const config = getSprintStatusConfig(sprint.status)
          return (
            <StaggerItem key={sprint.id}>
              <Link
                to={`/projects/${project.id}/sprints/${sprint.id}`}
                className="block group"
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-4 rounded-xl border-2 bg-card hover:bg-accent/30 transition-all duration-150 hover:shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`h-3 w-3 rounded-full shrink-0 ${config.dot}`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                          {sprint.name}
                        </h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${config.badge}`}
                        >
                          {sprint.status}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(sprint.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {" – "}
                        {new Date(sprint.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 shrink-0 ml-4">
                    <div className="hidden sm:block w-36">
                      <div className="flex justify-between text-[11px] mb-1 font-medium">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground">
                          {sprint.progress}%
                        </span>
                      </div>
                      <AnimatedProgress
                        value={sprint.progress}
                        max={100}
                        height="h-1.5"
                        barClassName={config.bar}
                        className="rounded-xl"
                      />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          )
        })}
      </StaggerContainer>
    )}
  </div>
)

SprintsTab.propTypes = {
  project: PropTypes.object.isRequired,
  sprints: PropTypes.array.isRequired,
}

const PlanningTab = () => {
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [showIssueDetails, setShowIssueDetails] = useState(false)
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false)
  const [parentIssueIdForSubtask, setParentIssueIdForSubtask] = useState(null)

  const ISSUES_DATA = [
    {
      id: "US-101",
      title: "Implement OAuth2 Authentication",
      epic: "Security",
      points: 8,
      priority: "High",
      description: "Implement OAuth2 authentication for secure user login.",
      status: "In Progress",
      startDate: "2025-02-15",
      endDate: "2025-03-05",
      assignee: { name: "John Doe", avatar: "https://i.pravatar.cc/40?img=1" },
    },
    {
      id: "US-102",
      title: "Design new Dashboard Layout",
      epic: "UI/UX",
      points: 5,
      priority: "Medium",
      description: "Create a modern dashboard layout with improved UX.",
      status: "To Do",
      startDate: "2025-02-20",
      endDate: "2025-03-10",
      assignee: {
        name: "Sarah Smith",
        avatar: "https://i.pravatar.cc/40?img=2",
      },
    },
    {
      id: "US-103",
      title: "Setup CI/CD Pipeline for Staging",
      epic: "DevOps",
      points: 13,
      priority: "High",
      description: "Setup automated CI/CD pipeline for staging environment.",
      status: "In Progress",
      startDate: "2025-02-10",
      endDate: "2025-03-15",
      assignee: {
        name: "Mike Johnson",
        avatar: "https://i.pravatar.cc/40?img=3",
      },
    },
    {
      id: "US-104",
      title: "User Profile Settings Page",
      epic: "Features",
      points: 3,
      priority: "Low",
      description: "Create user profile settings page with basic options.",
      status: "To Do",
      startDate: "2025-03-01",
      endDate: "2025-03-20",
      assignee: null,
    },
  ]

  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue)
    setShowIssueDetails(true)
  }

  const handleEditIssue = (issue) => {
    console.log("Edit issue:", issue)
  }

  const handleDeleteIssue = (issueId) => {
    console.log("Delete issue:", issueId)
  }

  const handleCreateSubtask = (parentIssueId) => {
    setParentIssueIdForSubtask(parentIssueId)
    setShowCreateIssueModal(true)
  }

  const getIssueStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "in progress":
        return {
          icon: (
            <Circle className="h-3.5 w-3.5 text-blue-500 fill-blue-500/20" />
          ),
          text: "text-blue-600 dark:text-blue-400",
        }
      case "done":
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
          text: "text-emerald-600 dark:text-emerald-400",
        }
      case "blocked":
        return {
          icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
          text: "text-red-600 dark:text-red-400",
        }
      default:
        return {
          icon: <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
          text: "text-muted-foreground",
        }
    }
  }

  return (
    <>
      <div className="space-y-4">
        <FadeIn direction="down" delay={0.05}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Plans & Backlog
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ISSUES_DATA.length} issues
              </p>
            </div>
            <CreateIssueModal
              triggerText="Add Issue"
              parentIssueId={parentIssueIdForSubtask}
              open={showCreateIssueModal}
              onOpenChange={(newOpen) => {
                setShowCreateIssueModal(newOpen)
                if (!newOpen) setParentIssueIdForSubtask(null)
              }}
            />
          </div>
        </FadeIn>

        {/* Column Header */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b">
          <div className="col-span-5">Issue</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-1 text-right">Pts</div>
        </div>

        <StaggerContainer className="space-y-1.5">
          {ISSUES_DATA.map((story) => {
            const priorityConfig = getPriorityConfig(story.priority)
            const statusConfig = getIssueStatusConfig(story.status)
            return (
              <StaggerItem key={story.id}>
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-xl border bg-card hover:bg-accent/30 transition-all group hover:shadow-sm cursor-pointer"
                  onClick={() => handleIssueSelect(story)}
                >
                  <div className="grid grid-cols-12 gap-3 items-center px-4 py-3">
                    {/* Issue */}
                    <div className="col-span-12 md:col-span-5 flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                        {story.id}
                      </span>
                      <p className="text-sm font-medium truncate">
                        {story.title}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="hidden md:flex col-span-2 items-center gap-1.5">
                      {statusConfig.icon}
                      <span
                        className={`text-xs font-medium ${statusConfig.text}`}
                      >
                        {story.status}
                      </span>
                    </div>

                    {/* Priority */}
                    <div className="hidden md:flex col-span-2 items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${priorityConfig.dot}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {story.priority}
                      </span>
                    </div>

                    {/* Assignee */}
                    <div className="hidden md:flex col-span-2 items-center gap-1.5">
                      {story.assignee ? (
                        <>
                          <img
                            src={story.assignee.avatar}
                            alt={story.assignee.name}
                            className="w-5 h-5 rounded-full border"
                          />
                          <span className="text-xs text-muted-foreground truncate">
                            {story.assignee.name.split(" ")[0]}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">
                          Unassigned
                        </span>
                      )}
                    </div>

                    {/* Points + Actions */}
                    <div className="hidden md:flex col-span-1 items-center justify-end gap-1">
                      <span className="text-xs font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {story.points}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditIssue(story)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteIssue(story.id)
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Mobile extras */}
                  <div className="md:hidden flex items-center gap-2 px-4 pb-3 flex-wrap">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityConfig.badge}`}
                    >
                      {story.priority}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {story.status}
                    </span>
                    {story.endDate && (
                      <span className="text-[10px] text-orange-600 font-medium">
                        Due{" "}
                        {new Date(story.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </motion.div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>

      <IssueDetailsSidebar
        issue={selectedIssue}
        open={showIssueDetails}
        onOpenChange={setShowIssueDetails}
        onEdit={handleEditIssue}
        onDelete={handleDeleteIssue}
        onCreateSubtask={handleCreateSubtask}
      />
    </>
  )
}

const EpicsTab = () => {
  const [selectedEpic, setSelectedEpic] = useState(null)
  const [showEpicDetails, setShowEpicDetails] = useState(false)

  const EPICS_DATA = [
    {
      id: "EPIC-1",
      title: "Security Improvements",
      status: "In Progress",
      progress: 65,
      description:
        "Implementing OAuth2 authentication, encryption, and security best practices.",
    },
    {
      id: "EPIC-2",
      title: "UI/UX Overhaul",
      status: "To Do",
      progress: 0,
      description:
        "Redesign the user interface with improved user experience and modern design patterns.",
    },
    {
      id: "EPIC-3",
      title: "Performance Optimization",
      status: "Done",
      progress: 100,
      description:
        "Optimize database queries, reduce bundle size, and improve overall application performance.",
    },
  ]

  const handleEpicSelect = (epic) => {
    setSelectedEpic(epic)
    setShowEpicDetails(true)
  }

  const handleEditEpic = (epic) => {
    console.log("Edit epic:", epic)
  }

  const handleDeleteEpic = (epicId) => {
    console.log("Delete epic:", epicId)
  }

  return (
    <>
      <div className="space-y-4">
        <FadeIn direction="down" delay={0.05}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Epics</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {EPICS_DATA.length} epics total
              </p>
            </div>
            <CreateIssueModal triggerText="Create Epic" />
          </div>
        </FadeIn>

        <StaggerContainer className="space-y-3">
          {EPICS_DATA.map((epic) => {
            const config = getEpicStatusConfig(epic.status)
            return (
              <StaggerItem key={epic.id}>
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/30 transition-all group cursor-pointer hover:shadow-sm"
                  onClick={() => handleEpicSelect(epic)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}
                    >
                      <Layers className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm truncate">
                          {epic.title}
                        </p>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                          {epic.id}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {epic.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-4 shrink-0 ml-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-36 hidden sm:block">
                      <div className="flex justify-between text-[11px] mb-1 font-medium">
                        <span className={config.color}>{epic.status}</span>
                        <span className="text-foreground">{epic.progress}%</span>
                      </div>
                      <AnimatedProgress
                        value={epic.progress}
                        max={100}
                        height="h-1.5"
                        barClassName={config.bar}
                        className="rounded-xl"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditEpic(epic)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteEpic(epic.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>

      <EpicDetailsSidebar
        epic={selectedEpic}
        open={showEpicDetails}
        onOpenChange={setShowEpicDetails}
        onEdit={handleEditEpic}
        onDelete={handleDeleteEpic}
      />
    </>
  )
}

const NotesTab = ({ projectId }) => {
  const NOTE_CATEGORY_CONFIG = {
    architecture: {
      label: "Architecture",
      dot: "bg-purple-500",
      badge:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    },
    guide: {
      label: "Guide",
      dot: "bg-blue-500",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    },
    documentation: {
      label: "Docs",
      dot: "bg-slate-500",
      badge:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
  }

  const SAMPLE_NOTES = [
    {
      id: 1,
      title: "Database Schema Design",
      category: "architecture",
      createdAt: "2 days ago",
      content:
        "Updated schema for user management with new fields for compliance tracking and audit logs.",
    },
    {
      id: 2,
      title: "API Integration Guide",
      category: "guide",
      createdAt: "5 days ago",
      content:
        "Step-by-step guide for integrating third-party APIs with examples and error handling strategies.",
    },
    {
      id: 3,
      title: "Frontend Architecture Decision",
      category: "documentation",
      createdAt: "1 week ago",
      content:
        "Decided to adopt the Container/Presenter pattern for all feature components to improve testability.",
    },
  ]

  return (
    <div className="space-y-4">
      <FadeIn direction="down" delay={0.05}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Project Notes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {SAMPLE_NOTES.length} notes across{" "}
              {Object.keys(NOTE_CATEGORY_CONFIG).length} categories
            </p>
          </div>
          <Button size="sm" asChild>
            <Link to={`/projects/${projectId}/notes/new`}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Note
            </Link>
          </Button>
        </div>
      </FadeIn>

      {SAMPLE_NOTES.length === 0 ? (
        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
            <FileText className="h-10 w-10 text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-base font-semibold">No notes yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-5">
              Start documenting your project with your first note.
            </p>
            <Button asChild size="sm">
              <Link to={`/projects/${projectId}/notes/new`}>
                Create First Note
              </Link>
            </Button>
          </div>
        </FadeIn>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SAMPLE_NOTES.map((note, index) => {
            const catConfig =
              NOTE_CATEGORY_CONFIG[note.category] ||
              NOTE_CATEGORY_CONFIG.documentation
            return (
              <StaggerItem key={note.id}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatedCard
                    delay={index * 0.08}
                    className="border-0 shadow-sm rounded-xl group relative flex flex-col gap-3 p-4 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div
                          className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${catConfig.dot}`}
                        />
                        <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {note.title}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mt-0.5 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catConfig.badge}`}
                      >
                        {catConfig.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {note.createdAt}
                      </span>
                    </div>
                  </AnimatedCard>
                </motion.div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      )}
    </div>
  )
}

NotesTab.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
}

/**
 * ProjectDetailsUI - Displays detailed information about a project and its sprints.
 */
const ProjectDetailsUI = ({ project, sprints, isLoading, error }) => {
  if (isLoading) return <LoadingState />
  if (error || !project) return <ErrorState />

  const activeSprint =
    sprints?.find((s) => s.status?.toLowerCase() === "active") || sprints?.[0]

  const initials = project.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const totalSprints = sprints?.length ?? 0
  const teamSize = project.members?.length ?? 0
  const completionPct = project.progress ?? 0
  const daysLeft = (() => {
    const end = new Date(project.endDate)
    const diff = Math.ceil((end - Date.now()) / 86400000)
    return diff > 0 ? diff : 0
  })()

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Compact Header */}
      <FadeIn direction="down" duration={0.4}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8 rounded-full shrink-0"
            >
              <Link to="/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            {/* Project Initials Avatar with Gradient */}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <BlurText
                  text={project.name}
                  className="text-xl font-bold tracking-tight text-foreground leading-tight"
                  delay={0.1}
                />
                <PulseBadge color={getStatusBadgeColor(project.status)}>
                  {project.status}
                </PulseBadge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Hash className="h-3 w-3" />
                PRJ-{project.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild className="rounded-xl">
              <Link to={`/projects/${project.id}/settings`}>
                <Settings className="mr-1.5 h-3.5 w-3.5" />
                Settings
              </Link>
            </Button>
            <EditProjectSidebar project={project} />
          </div>
        </div>
      </FadeIn>

      {/* Quick Stats Ribbon */}
      <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StaggerItem>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <AnimatedCard delay={0.1} className="border-0 shadow-sm rounded-xl flex items-center gap-2.5 px-4 py-3">
              <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Sprints</p>
                <p className="text-sm font-bold text-foreground">
                  <NumberTicker value={totalSprints} delay={0.15} />
                </p>
              </div>
            </AnimatedCard>
          </motion.div>
        </StaggerItem>
        <StaggerItem>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <AnimatedCard delay={0.15} className="border-0 shadow-sm rounded-xl flex items-center gap-2.5 px-4 py-3">
              <div className="h-8 w-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Team</p>
                <p className="text-sm font-bold text-foreground">
                  <NumberTicker value={teamSize} delay={0.2} suffix=" members" />
                </p>
              </div>
            </AnimatedCard>
          </motion.div>
        </StaggerItem>
        <StaggerItem>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <AnimatedCard delay={0.2} className="border-0 shadow-sm rounded-xl flex items-center gap-2.5 px-4 py-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Progress
                </p>
                <p className="text-sm font-bold text-foreground">
                  <NumberTicker value={completionPct} delay={0.25} suffix="%" />
                </p>
              </div>
            </AnimatedCard>
          </motion.div>
        </StaggerItem>
        <StaggerItem>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <AnimatedCard delay={0.25} className="border-0 shadow-sm rounded-xl flex items-center gap-2.5 px-4 py-3">
              <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Days Left
                </p>
                <p className="text-sm font-bold text-foreground">
                  <NumberTicker value={daysLeft} delay={0.3} />
                </p>
              </div>
            </AnimatedCard>
          </motion.div>
        </StaggerItem>
      </StaggerContainer>

      <FadeIn direction="up" delay={0.3}>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-transparent border-b border-border/50 w-full justify-start h-auto p-0 rounded-none gap-0 mb-6">
            {[
              { value: "overview", label: "Overview" },
              { value: "sprints", label: "Sprints" },
              { value: "epics", label: "Epics" },
              { value: "planning", label: "Plans & Backlog" },
              { value: "notes", label: "Notes" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2.5 pt-1 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-colors"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab project={project} activeSprint={activeSprint} />
          </TabsContent>

          <TabsContent value="sprints" className="space-y-6">
            <SprintsTab project={project} sprints={sprints} />
          </TabsContent>

          <TabsContent value="epics" className="space-y-6">
            <EpicsTab />
          </TabsContent>

          <TabsContent value="planning" className="space-y-6">
            <PlanningTab />
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <NotesTab projectId={project.id} />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}

ProjectDetailsUI.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    progress: PropTypes.number.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired,
      })
    ),
  }),
  sprints: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      progress: PropTypes.number.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.oneOf([PropTypes.bool, PropTypes.object]),
}

ProjectDetailsUI.defaultProps = {
  project: null,
  error: null,
}

export default ProjectDetailsUI
