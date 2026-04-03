import { motion } from "framer-motion"
import {
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FolderOpen,
  FileText,
  Activity,
  Trophy,
  Award,
  Target,
  Zap,
  Star,
  CheckSquare,
  Briefcase,
  BarChart3,
  ArrowUpRight,
} from "lucide-react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"

import ClockStatusWidget from "@/components/attendance/clock-status-widget"
import {
  AnimatedCard,
  BlurText,
  FadeIn,
  NumberTicker,
  ShimmerButton,
  AnimatedProgress,
  PulseBadge,
} from "@/components/magicui"
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/magicui/stagger-container"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

/* eslint-disable complexity, max-lines-per-function, react/no-array-index-key */

const STAT_KEYS = ["s1", "s2", "s3", "s4"]
const CHART_KEYS = ["c1", "c2", "c3"]

const EMP_QUICK_LINKS = [
  {
    label: "My Attendance",
    icon: Clock,
    to: "/attendance",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    label: "Attendance History",
    icon: Activity,
    to: "/attendance/history",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    label: "Leave Dashboard",
    icon: Calendar,
    to: "/leave/employee",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    label: "Request Leave",
    icon: FileText,
    to: "/leave/employee/request",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    label: "Leave Calendar",
    icon: CheckCircle2,
    to: "/leave/calendar",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    label: "Projects",
    icon: FolderOpen,
    to: "/projects",
    gradient: "from-rose-500 to-pink-500",
  },
]

/* ---- Stat Card ---- */
const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  gradient,
  to,
  delay = 0,
}) => (
  <AnimatedCard delay={delay} className="overflow-hidden border-0 shadow-sm">
    <CardContent className="pt-5 pb-4 relative">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-3xl font-bold mt-1.5 tracking-tight">
            {typeof value === "number" ? (
              <NumberTicker value={value} delay={delay + 0.2} />
            ) : (
              value
            )}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div
          className={`rounded-xl p-3 bg-gradient-to-br ${gradient} text-white shadow-lg`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {to && (
        <Link
          to={to}
          className="mt-3 flex items-center gap-1 text-xs text-primary font-medium hover:gap-2 transition-all"
        >
          View details <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </CardContent>
  </AnimatedCard>
)

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sub: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  gradient: PropTypes.string.isRequired,
  to: PropTypes.string,
  delay: PropTypes.number,
}
StatCard.defaultProps = { sub: null, to: null, delay: 0 }

/* ---- Employee Stats Grid ---- */
const formatWorkHours = (minutes) => {
  if (!minutes) return "0h 0m"
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

const getEmployeeStats = (leaveProfile, todayAttendance) => ({
  month: leaveProfile?.thisMonth,
  totalRemaining: (leaveProfile?.leaveBalance ?? []).reduce(
    (sum, b) => sum + (b.remaining ?? 0),
    0,
  ),
  todayHours: formatWorkHours(todayAttendance?.totalWorkMinutes ?? 0),
})

const EmployeeStatsGrid = ({ leaveProfile, todayAttendance }) => {
  const { month, totalRemaining, todayHours } = getEmployeeStats(
    leaveProfile,
    todayAttendance,
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Today's Hours"
        value={todayHours}
        icon={Clock}
        gradient="from-indigo-500 to-blue-600"
        to="/attendance"
        delay={0}
      />
      <StatCard
        label="Present This Month"
        value={month?.presentDays ?? 0}
        sub="days"
        icon={CheckCircle2}
        gradient="from-emerald-500 to-green-600"
        to="/attendance/history"
        delay={0.08}
      />
      <StatCard
        label="Leave Remaining"
        value={totalRemaining}
        sub="days available"
        icon={Calendar}
        gradient="from-orange-500 to-amber-500"
        to="/leave/employee"
        delay={0.16}
      />
      <StatCard
        label="WFH Days"
        value={month?.wfhDays ?? 0}
        sub="this month"
        icon={Briefcase}
        gradient="from-cyan-500 to-teal-500"
        delay={0.24}
      />
    </div>
  )
}

EmployeeStatsGrid.propTypes = {
  leaveProfile: PropTypes.object,
  todayAttendance: PropTypes.object,
}
EmployeeStatsGrid.defaultProps = { leaveProfile: null, todayAttendance: null }

/* ---- Leave Balance Bar Chart ---- */
const LeaveBalanceChart = ({ leaveProfile }) => {
  const data = (leaveProfile?.leaveBalance ?? []).map((b) => ({
    type: b.type,
    allocated: b.allocated,
    used: b.used,
    remaining: b.remaining,
  }))

  return (
    <AnimatedCard delay={0.2} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              Leave Balance
            </CardTitle>
            <CardDescription>Allocated vs used vs remaining</CardDescription>
          </div>
          <Link
            to="/leave/employee"
            className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            Details <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.5}
            />
            <XAxis dataKey="type" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Legend />
            <Bar dataKey="allocated" fill="#c7d2fe" radius={[6, 6, 0, 0]} />
            <Bar dataKey="used" fill="#f87171" radius={[6, 6, 0, 0]} />
            <Bar dataKey="remaining" fill="#34d399" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </AnimatedCard>
  )
}

LeaveBalanceChart.propTypes = { leaveProfile: PropTypes.object }
LeaveBalanceChart.defaultProps = { leaveProfile: null }

/* ---- Monthly Attendance Radar ---- */
const MonthlyAttendanceRadar = ({ leaveProfile }) => {
  const month = leaveProfile?.thisMonth
  const data = [
    { subject: "Present", value: month?.presentDays ?? 0 },
    { subject: "Absent", value: month?.absentDays ?? 0 },
    { subject: "Leave", value: month?.leaveDays ?? 0 },
    { subject: "WFH", value: month?.wfhDays ?? 0 },
  ]

  return (
    <AnimatedCard delay={0.3} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          This Month Summary
        </CardTitle>
        <CardDescription>
          Attendance breakdown for current month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={30} tick={{ fontSize: 10 }} />
            <Radar
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid hsl(var(--border))",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </AnimatedCard>
  )
}

MonthlyAttendanceRadar.propTypes = { leaveProfile: PropTypes.object }
MonthlyAttendanceRadar.defaultProps = { leaveProfile: null }

/* ---- Leave Balance Detail Table ---- */
const LeaveBalanceTable = ({ leaveProfile }) => {
  const balance = leaveProfile?.leaveBalance ?? []
  return (
    <AnimatedCard delay={0.35} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Leave Entitlement Details
        </CardTitle>
        <CardDescription>Annual leave balance breakdown</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                Type
              </th>
              <th className="text-right py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                Allocated
              </th>
              <th className="text-right py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                Used
              </th>
              <th className="text-right py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                Pending
              </th>
              <th className="text-right py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                Remaining
              </th>
              <th className="text-right py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                Usage
              </th>
            </tr>
          </thead>
          <tbody>
            {balance.map((row, idx) => {
              const usagePct =
                row.allocated > 0
                  ? Math.round((row.used / row.allocated) * 100)
                  : 0
              return (
                <motion.tr
                  key={row.type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.06 }}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 font-medium">{row.type}</td>
                  <td className="py-3 text-right tabular-nums">
                    {row.allocated}
                  </td>
                  <td className="py-3 text-right text-red-500 tabular-nums font-medium">
                    {row.used}
                  </td>
                  <td className="py-3 text-right text-amber-600 tabular-nums">
                    {row.pending}
                  </td>
                  <td className="py-3 text-right text-emerald-600 font-semibold tabular-nums">
                    {row.remaining}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <AnimatedProgress
                        value={usagePct}
                        height="h-1.5"
                        className="w-16"
                        barClassName={
                          usagePct > 80
                            ? "bg-red-500"
                            : usagePct > 50
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        }
                        delay={0.5 + idx * 0.06}
                      />
                      <span className="text-xs w-8 tabular-nums">
                        {usagePct}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </AnimatedCard>
  )
}

LeaveBalanceTable.propTypes = { leaveProfile: PropTypes.object }
LeaveBalanceTable.defaultProps = { leaveProfile: null }

/* ---- Active Projects ---- */
const ActiveProjects = ({ projects }) => {
  const list = (projects ?? []).filter((p) => p.status === "Active").slice(0, 4)
  return (
    <AnimatedCard delay={0.3} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-rose-500" />
            My Projects
          </CardTitle>
          <Link
            to="/projects"
            className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No active projects
          </p>
        )}
        {list.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.08 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <Link
                to={`/projects/${project.id}`}
                className="text-sm font-medium hover:text-primary transition-colors truncate max-w-[60%]"
              >
                {project.name}
              </Link>
              <span className="text-xs text-muted-foreground tabular-nums">
                {project.progress ?? 0}%
              </span>
            </div>
            <AnimatedProgress
              value={project.progress ?? 0}
              height="h-1.5"
              barClassName="bg-gradient-to-r from-indigo-500 to-purple-500"
              delay={0.5 + idx * 0.08}
            />
          </motion.div>
        ))}
      </CardContent>
    </AnimatedCard>
  )
}

ActiveProjects.propTypes = { projects: PropTypes.array }
ActiveProjects.defaultProps = { projects: [] }

/* ---- Employee Profile Card ---- */
const EmployeeProfileCard = ({ leaveProfile }) => {
  const emp = leaveProfile?.employee
  if (!emp) return null

  return (
    <AnimatedCard delay={0.1} className="border-0 shadow-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
      <CardContent className="pt-5 pb-4 flex items-center gap-4 relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Avatar className="h-14 w-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={emp.avatar} alt={emp.name} />
            <AvatarFallback className="text-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
              {emp.name?.[0] ?? "E"}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base truncate">{emp.name}</p>
          <p className="text-sm text-muted-foreground">{emp.role}</p>
          <p className="text-xs text-muted-foreground">{emp.department}</p>
        </div>
        <div className="text-right shrink-0">
          <PulseBadge color="indigo">Employee</PulseBadge>
          <p className="text-xs text-muted-foreground mt-1.5">
            Manager: {emp.manager}
          </p>
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

EmployeeProfileCard.propTypes = { leaveProfile: PropTypes.object }
EmployeeProfileCard.defaultProps = { leaveProfile: null }

/* ---- Quick Links ---- */
const QuickLinks = () => (
  <FadeIn delay={0.4}>
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Quick Navigation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EMP_QUICK_LINKS.map((link) => (
            <StaggerItem key={link.to}>
              <Link
                to={link.to}
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-xl p-2.5 bg-gradient-to-br ${link.gradient} text-white shadow-md`}
                >
                  <link.icon className="h-4 w-4" />
                </motion.div>
                <span className="text-xs font-medium text-center">
                  {link.label}
                </span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </CardContent>
    </Card>
  </FadeIn>
)

/* ---- Header ---- */
const EmployeeHeader = ({ userName }) => {
  const now = new Date()
  const hour = now.getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const dateString = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <BlurText text={`${greeting}, ${userName ?? "User"}`} />
        </h1>
        <FadeIn delay={0.3}>
          <p className="text-muted-foreground text-sm mt-1">{dateString}</p>
        </FadeIn>
      </div>
      <FadeIn delay={0.2} direction="left">
        <div className="flex items-center gap-2">
          <PulseBadge color="blue">
            <TrendingUp className="h-3 w-3" /> Employee View
          </PulseBadge>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link to="/attendance">
                <Clock className="h-4 w-4 mr-1" /> Clock In/Out
              </Link>
            </Button>
          </motion.div>
          <ShimmerButton
            className="h-9 px-4 text-xs rounded-xl"
            to="/leave/employee/request"
          >
            <Calendar className="h-4 w-4" /> Request Leave
          </ShimmerButton>
        </div>
      </FadeIn>
    </div>
  )
}

EmployeeHeader.propTypes = { userName: PropTypes.string }
EmployeeHeader.defaultProps = { userName: null }

/* ---- Sprint Task Stats Block ---- */
const SPRINT_TASK_KEYS = [
  {
    key: "completed",
    label: "Completed",
    gradient: "from-emerald-500 to-green-600",
    text: "text-emerald-700",
  },
  {
    key: "inProgress",
    label: "In Progress",
    gradient: "from-blue-500 to-indigo-600",
    text: "text-blue-700",
  },
  {
    key: "pending",
    label: "Pending",
    gradient: "from-orange-500 to-amber-500",
    text: "text-orange-700",
  },
  {
    key: "allocated",
    label: "Allocated",
    gradient: "from-indigo-500 to-purple-600",
    text: "text-indigo-700",
  },
]

const SprintTaskStats = ({ currentSprint }) => (
  <StaggerContainer className="grid grid-cols-4 gap-3">
    {SPRINT_TASK_KEYS.map(({ key, label, gradient, text }) => (
      <StaggerItem key={key}>
        <div className="rounded-xl p-3 text-center bg-muted/30 border border-border/50">
          <p className={`text-2xl font-bold ${text}`}>
            <NumberTicker value={currentSprint?.[key] ?? 0} />
          </p>
          <p className="text-xs mt-0.5 text-muted-foreground">{label}</p>
        </div>
      </StaggerItem>
    ))}
  </StaggerContainer>
)

SprintTaskStats.propTypes = { currentSprint: PropTypes.object }
SprintTaskStats.defaultProps = { currentSprint: null }

/* ---- Sprint History Chart ---- */
const SprintHistoryChart = ({ sprintHistory }) => {
  const data = sprintHistory ?? []
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          opacity={0.5}
        />
        <XAxis dataKey="sprint" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Legend />
        <Bar
          dataKey="allocated"
          fill="#c7d2fe"
          radius={[6, 6, 0, 0]}
          name="Allocated"
        />
        <Bar
          dataKey="completed"
          fill="#6366f1"
          radius={[6, 6, 0, 0]}
          name="Completed"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

SprintHistoryChart.propTypes = { sprintHistory: PropTypes.array }
SprintHistoryChart.defaultProps = { sprintHistory: [] }

/* ---- Performance Score Gauges ---- */
const SCORE_METRICS = [
  {
    key: "velocityScore",
    label: "Velocity",
    icon: Zap,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    key: "qualityScore",
    label: "Quality",
    icon: Star,
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    key: "collaborationScore",
    label: "Team Play",
    icon: CheckSquare,
    gradient: "from-emerald-500 to-green-500",
  },
  {
    key: "overallScore",
    label: "Overall",
    icon: Trophy,
    gradient: "from-purple-500 to-indigo-500",
  },
]

const PerformanceScoreBar = ({
  label,
  value,
  icon: Icon,
  gradient,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="space-y-1.5"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div
          className={`rounded-md p-1 bg-gradient-to-br ${gradient} text-white`}
        >
          <Icon className="h-3 w-3" />
        </div>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-xs font-bold tabular-nums">
        <NumberTicker value={value ?? 0} delay={delay} />
        /100
      </span>
    </div>
    <AnimatedProgress
      value={value ?? 0}
      height="h-2"
      barClassName={`bg-gradient-to-r ${gradient}`}
      delay={delay + 0.1}
    />
  </motion.div>
)

PerformanceScoreBar.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  icon: PropTypes.elementType.isRequired,
  gradient: PropTypes.string.isRequired,
  delay: PropTypes.number,
}
PerformanceScoreBar.defaultProps = { value: 0, delay: 0 }

const extractSprintData = (performance) => ({
  sprint: performance?.currentSprint,
  history: performance?.sprintHistory,
  scores: performance?.performance,
})

const toPercent = (value) => Math.round((value ?? 0) * 100)

const getSprintDescription = (sprint) => {
  const project = sprint?.projectName ?? "\u2014"
  const name = sprint?.name ?? "No active sprint"
  return `${project} \u00b7 ${name}`
}

/* ---- Sprint Performance Card ---- */
const SprintPerformance = ({ performance }) => {
  const { sprint, history, scores } = extractSprintData(performance)
  const efficiencyPct = toPercent(sprint?.efficiency)
  const onTimePct = toPercent(sprint?.onTimeRate)

  return (
    <AnimatedCard delay={0.35} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div className="rounded-lg p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Target className="h-3.5 w-3.5" />
          </div>
          Sprint Task Performance
        </CardTitle>
        <CardDescription>{getSprintDescription(sprint)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SprintTaskStats currentSprint={sprint} />

        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-border/50 p-3 text-center bg-muted/20"
          >
            <p className="text-xl font-bold text-emerald-600">
              <NumberTicker value={efficiencyPct} suffix="%" delay={0.5} />
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Efficiency</p>
            <AnimatedProgress
              value={efficiencyPct}
              height="h-1.5"
              barClassName="bg-gradient-to-r from-emerald-500 to-green-500"
              className="mt-2"
              delay={0.6}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            className="rounded-xl border border-border/50 p-3 text-center bg-muted/20"
          >
            <p className="text-xl font-bold text-blue-600">
              <NumberTicker value={onTimePct} suffix="%" delay={0.55} />
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">On-Time Rate</p>
            <AnimatedProgress
              value={onTimePct}
              height="h-1.5"
              barClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
              className="mt-2"
              delay={0.65}
            />
          </motion.div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Sprint History
          </p>
          <SprintHistoryChart sprintHistory={history} />
        </div>

        {scores && (
          <div className="space-y-3 pt-1">
            <p className="text-xs font-medium text-muted-foreground">
              Performance Scores
            </p>
            {SCORE_METRICS.map((m, idx) => (
              <PerformanceScoreBar
                key={m.key}
                label={m.label}
                value={scores[m.key]}
                icon={m.icon}
                gradient={m.gradient}
                delay={0.6 + idx * 0.08}
              />
            ))}
          </div>
        )}
      </CardContent>
    </AnimatedCard>
  )
}

SprintPerformance.propTypes = { performance: PropTypes.object }
SprintPerformance.defaultProps = { performance: null }

/* ---- Recognition Card ---- */
const RecognitionCard = ({ item, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.01 }}
    className="rounded-xl border border-border/50 p-3 flex items-start gap-3 hover:bg-muted/30 transition-colors"
  >
    <span className="text-3xl leading-none mt-0.5" aria-hidden="true">
      {item.emoji}
    </span>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold truncate">{item.title}</p>
        <Badge variant="outline" className="text-xs shrink-0 rounded-lg">
          {item.type}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">
        From <span className="font-medium">{item.givenBy}</span> · {item.date}
      </p>
      <p className="text-xs mt-1 italic text-muted-foreground">
        &ldquo;{item.message}&rdquo;
      </p>
    </div>
  </motion.div>
)

RecognitionCard.propTypes = {
  item: PropTypes.object.isRequired,
  delay: PropTypes.number,
}
RecognitionCard.defaultProps = { delay: 0 }

/* ---- Recognition Wall ---- */
const RecognitionWall = ({ recognition }) => {
  const list = recognition ?? []
  return (
    <AnimatedCard delay={0.4} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div className="rounded-lg p-1.5 bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
            <Award className="h-3.5 w-3.5" />
          </div>
          Recognition & Kudos
        </CardTitle>
        <CardDescription>
          {list.length} recognition{list.length !== 1 ? "s" : ""} received
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No recognitions yet — keep up the great work!
          </p>
        )}
        {list.map((item, idx) => (
          <RecognitionCard key={item.id} item={item} delay={0.5 + idx * 0.06} />
        ))}
      </CardContent>
    </AnimatedCard>
  )
}

RecognitionWall.propTypes = { recognition: PropTypes.array }
RecognitionWall.defaultProps = { recognition: [] }

const getClockProperties = (status) => {
  const s = status ?? {}
  return {
    isClocked: s.isClocked ?? false,
    clockedInAt: s.clockedInAt ?? null,
    elapsedSeconds: s.elapsedSeconds ?? 0,
    willAutoExpire: s.willAutoExpire ?? false,
    todayTotalMinutes: s.todayTotalMinutes ?? 0,
  }
}

/* ---- Loading Skeleton ---- */
const DashboardSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="h-12 bg-muted rounded-xl animate-pulse" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {STAT_KEYS.map((key) => (
        <div key={key} className="h-28 bg-muted rounded-2xl animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {CHART_KEYS.map((key) => (
        <div key={key} className="h-64 bg-muted rounded-2xl animate-pulse" />
      ))}
    </div>
  </div>
)

/* ---- Main Component ---- */
const EmployeeDashboardUI = ({
  userName,
  projects,
  leaveProfile,
  attendanceStatus,
  todayAttendance,
  performance,
  isLoading,
}) => {
  const clockProperties = getClockProperties(attendanceStatus)

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      <EmployeeHeader userName={userName} />

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ transformOrigin: "left" }}
      >
        <Separator />
      </motion.div>

      <EmployeeProfileCard leaveProfile={leaveProfile} />

      <EmployeeStatsGrid
        leaveProfile={leaveProfile}
        todayAttendance={todayAttendance}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <LeaveBalanceChart leaveProfile={leaveProfile} />
        </div>
        <MonthlyAttendanceRadar leaveProfile={leaveProfile} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FadeIn delay={0.25} className="space-y-4">
          <ClockStatusWidget
            isClocked={clockProperties.isClocked}
            clockedInAt={clockProperties.clockedInAt}
            elapsedSeconds={clockProperties.elapsedSeconds}
            willAutoExpire={clockProperties.willAutoExpire}
            todayTotalMinutes={clockProperties.todayTotalMinutes}
            isLoading={false}
          />
          <ActiveProjects projects={projects} />
        </FadeIn>
        <div className="md:col-span-2">
          <LeaveBalanceTable leaveProfile={leaveProfile} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SprintPerformance performance={performance} />
        <RecognitionWall recognition={performance?.recognition} />
      </div>

      <QuickLinks />
    </div>
  )
}

EmployeeDashboardUI.propTypes = {
  userName: PropTypes.string,
  projects: PropTypes.array,
  leaveProfile: PropTypes.object,
  attendanceStatus: PropTypes.object,
  todayAttendance: PropTypes.object,
  performance: PropTypes.object,
  isLoading: PropTypes.bool,
}
EmployeeDashboardUI.defaultProps = {
  userName: null,
  projects: [],
  leaveProfile: null,
  attendanceStatus: null,
  todayAttendance: null,
  performance: null,
  isLoading: false,
}

export default EmployeeDashboardUI
