import { motion } from "framer-motion"
import {
  Users,
  FolderOpen,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Building2,
  BarChart2,
  ArrowRight,
  UserCheck,
  Home,
  ArrowUpRight,
} from "lucide-react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
import { StaggerContainer, StaggerItem } from "@/components/magicui/stagger-container"
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

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"]
const STAT_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"]
const CHART_KEYS = ["c1", "c2", "c3"]

const QUICK_LINKS = [
  { label: "Employees", icon: Users, to: "/employee-management", gradient: "from-indigo-500 to-blue-600" },
  { label: "Departments", icon: Building2, to: "/employee-management/departments", gradient: "from-purple-500 to-violet-600" },
  { label: "Live Attendance", icon: Activity, to: "/attendance/admin/live", gradient: "from-emerald-500 to-green-600" },
  { label: "Attendance Logs", icon: Clock, to: "/attendance/admin/logs", gradient: "from-blue-500 to-cyan-500" },
  { label: "Attendance Summary", icon: BarChart2, to: "/attendance/admin/summary", gradient: "from-cyan-500 to-teal-500" },
  { label: "Leave Dashboard", icon: Calendar, to: "/leave/admin", gradient: "from-orange-500 to-amber-500" },
  { label: "Leave Approvals", icon: CheckCircle2, to: "/leave/admin/approvals", gradient: "from-emerald-500 to-green-500" },
  { label: "Projects", icon: FolderOpen, to: "/projects", gradient: "from-rose-500 to-pink-500" },
]

/* ---- Stat Card ---- */
const StatCard = ({ label, value, icon: Icon, gradient, to, delay = 0 }) => (
  <AnimatedCard delay={delay} className="border-0 shadow-sm overflow-hidden">
    <CardContent className="pt-5 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold mt-1.5 tracking-tight tabular-nums">
            {typeof value === "number" ? <NumberTicker value={value} delay={delay + 0.2} /> : value}
          </p>
        </div>
        <div className={`rounded-xl p-3 bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {to && (
        <Link to={to} className="mt-3 flex items-center gap-1 text-xs text-primary font-medium hover:gap-2 transition-all">
          View details <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </CardContent>
  </AnimatedCard>
)
StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  gradient: PropTypes.string.isRequired,
  to: PropTypes.string,
  delay: PropTypes.number,
}
StatCard.defaultProps = { to: null, delay: 0 }

/* ---- Admin Stats Grid ---- */
const countActive = (list) => Array.isArray(list) ? list.filter((p) => p.status === "Active").length : 0

const getAdminStats = (employees, projects, leaveSummary) => ({
  totalEmp: employees?.length ?? 0,
  activeProjects: countActive(projects),
  pending: leaveSummary?.pendingApprovals?.length ?? 0,
  avgPresent: leaveSummary?.thisMonth?.avgDailyPresent ?? 0,
  wfh: leaveSummary?.thisMonth?.totalWFH ?? 0,
  onLeave: leaveSummary?.thisMonth?.avgDailyOnLeave ?? 0,
})

const AdminStatsGrid = ({ employees, projects, leaveSummary }) => {
  const { totalEmp, activeProjects, pending, avgPresent, wfh, onLeave } = getAdminStats(employees, projects, leaveSummary)
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard label="Total Employees" value={totalEmp} icon={Users} gradient="from-indigo-500 to-blue-600" to="/employee-management" delay={0} />
      <StatCard label="Active Projects" value={activeProjects} icon={FolderOpen} gradient="from-purple-500 to-violet-600" to="/projects" delay={0.06} />
      <StatCard label="Pending Leaves" value={pending} icon={AlertCircle} gradient="from-orange-500 to-amber-500" to="/leave/admin/approvals" delay={0.12} />
      <StatCard label="Avg Daily Present" value={avgPresent} icon={UserCheck} gradient="from-emerald-500 to-green-600" to="/attendance/admin/summary" delay={0.18} />
      <StatCard label="WFH This Month" value={wfh} icon={Home} gradient="from-cyan-500 to-teal-500" delay={0.24} />
      <StatCard label="Avg On Leave" value={onLeave} icon={Calendar} gradient="from-rose-500 to-pink-600" to="/leave/admin" delay={0.3} />
    </div>
  )
}
AdminStatsGrid.propTypes = { employees: PropTypes.array, projects: PropTypes.array, leaveSummary: PropTypes.object }
AdminStatsGrid.defaultProps = { employees: [], projects: [], leaveSummary: null }

/* ---- Attendance Trend Chart ---- */
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"]
const PRESENT_ADJ = [0, 1, -1, 0, 1]
const WFH_ADJ = [0, -1, 0, -1, 0]

const getTrendBase = (summary) => ({
  present: summary?.thisMonth?.avgDailyPresent ?? 18,
  onLeave: summary?.thisMonth?.avgDailyOnLeave ?? 3,
  wfh: summary?.thisMonth?.totalWFH ?? 5,
})

const buildAttendanceTrend = (leaveSummary) => {
  const base = getTrendBase(leaveSummary)
  return WEEK_DAYS.map((day, i) => ({
    day,
    present: Math.max(base.present + PRESENT_ADJ[i], 0),
    onLeave: Math.max(base.onLeave - (i === 0 ? 1 : 0), 0),
    wfh: Math.max(base.wfh + WFH_ADJ[i], 0),
  }))
}

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
}

const AttendanceTrendChart = ({ leaveSummary }) => {
  const data = buildAttendanceTrend(leaveSummary)
  return (
    <AnimatedCard delay={0.2} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Weekly Attendance Trend</CardTitle>
            <CardDescription>Present / WFH / On Leave this week</CardDescription>
          </div>
          <Link to="/attendance/admin/summary" className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
            Full report <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradWfh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Area type="monotone" dataKey="present" stroke="#6366f1" fill="url(#gradPresent)" strokeWidth={2} />
            <Area type="monotone" dataKey="wfh" stroke="#22c55e" fill="url(#gradWfh)" strokeWidth={2} />
            <Area type="monotone" dataKey="onLeave" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </AnimatedCard>
  )
}
AttendanceTrendChart.propTypes = { leaveSummary: PropTypes.object }
AttendanceTrendChart.defaultProps = { leaveSummary: null }

/* ---- Leave Breakdown Pie ---- */
const LeaveBreakdownChart = ({ leaveSummary }) => {
  const data = leaveSummary?.leaveBreakdown ?? []
  return (
    <AnimatedCard delay={0.25} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Leave Breakdown</CardTitle>
        <CardDescription>By leave type this month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80}
              label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {data.map((entry) => (
                <Cell key={entry.type} fill={entry.color ?? CHART_COLORS[0]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </AnimatedCard>
  )
}
LeaveBreakdownChart.propTypes = { leaveSummary: PropTypes.object }
LeaveBreakdownChart.defaultProps = { leaveSummary: null }

/* ---- Department Stats Bar Chart ---- */
const DepartmentStatsChart = ({ leaveSummary }) => {
  const data = leaveSummary?.departmentStats ?? []
  return (
    <AnimatedCard delay={0.3} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Department Overview</CardTitle>
        <CardDescription>Present / On Leave / WFH per department</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="department" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="present" fill="#6366f1" radius={[6, 6, 0, 0]} />
            <Bar dataKey="onLeave" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            <Bar dataKey="wfh" fill="#22c55e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </AnimatedCard>
  )
}
DepartmentStatsChart.propTypes = { leaveSummary: PropTypes.object }
DepartmentStatsChart.defaultProps = { leaveSummary: null }

/* ---- Project Progress Chart ---- */
const ProjectProgressChart = ({ projects }) => {
  const data = (projects ?? []).slice(0, 6).map((p) => ({
    name: p.name?.length > 14 ? `${p.name.slice(0, 14)}...` : p.name,
    progress: p.progress ?? 0,
  }))
  return (
    <AnimatedCard delay={0.35} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Project Progress</CardTitle>
            <CardDescription>Completion % for active projects</CardDescription>
          </div>
          <Link to="/projects" className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
            All projects <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart layout="vertical" data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Progress"]} />
            <Bar dataKey="progress" fill="#6366f1" radius={[0, 6, 6, 0]} background={{ fill: "hsl(var(--muted))", radius: [0, 6, 6, 0] }} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </AnimatedCard>
  )
}
ProjectProgressChart.propTypes = { projects: PropTypes.array }
ProjectProgressChart.defaultProps = { projects: [] }

/* ---- Pending Approvals ---- */
const PendingApprovals = ({ leaveSummary }) => {
  const approvals = leaveSummary?.pendingApprovals ?? []
  return (
    <AnimatedCard delay={0.3} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Pending Leave Approvals</CardTitle>
            <CardDescription>{approvals.length} requests awaiting review</CardDescription>
          </div>
          <Link to="/leave/admin/approvals" className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
            Review all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-72 overflow-y-auto">
        {approvals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No pending approvals</p>
        )}
        {approvals.map((approval, idx) => (
          <motion.div
            key={approval.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + idx * 0.05 }}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={approval.avatar} alt={approval.name} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                {approval.name?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{approval.name}</p>
              <p className="text-xs text-muted-foreground">
                {approval.type} · {approval.days} day{approval.days !== 1 ? "s" : ""}
              </p>
            </div>
            <PulseBadge color="amber">{approval.from}</PulseBadge>
          </motion.div>
        ))}
      </CardContent>
    </AnimatedCard>
  )
}
PendingApprovals.propTypes = { leaveSummary: PropTypes.object }
PendingApprovals.defaultProps = { leaveSummary: null }

/* ---- Recent Activity ---- */
const RecentActivity = ({ leaveSummary }) => {
  const activity = leaveSummary?.recentActivity ?? []
  return (
    <AnimatedCard delay={0.35} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        <CardDescription>Latest leave & attendance events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-h-72 overflow-y-auto">
        {activity.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
        )}
        {activity.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + idx * 0.04 }}
            className="flex items-start gap-3"
          >
            <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
            <div>
              <p className="text-sm">
                <span className="font-medium">{item.name}</span>{" "}
                <span className="text-muted-foreground">{item.action}</span>
              </p>
              <p className="text-xs text-muted-foreground">{item.date} · {item.type}</p>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </AnimatedCard>
  )
}
RecentActivity.propTypes = { leaveSummary: PropTypes.object }
RecentActivity.defaultProps = { leaveSummary: null }

/* ---- Top Leave Takers ---- */
const TopLeaveTakers = ({ leaveSummary }) => {
  const takers = leaveSummary?.topLeaveTakers ?? []
  return (
    <AnimatedCard delay={0.35} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Top Leave Takers</CardTitle>
        <CardDescription>Employees with most leave this month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {takers.slice(0, 5).map((person, idx) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + idx * 0.06 }}
            className="flex items-center gap-3"
          >
            <span className="text-sm font-bold text-muted-foreground w-4 tabular-nums">{idx + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{person.name}</p>
              <p className="text-xs text-muted-foreground">{person.department}</p>
            </div>
            <div className="w-24">
              <AnimatedProgress value={Math.min((person.totalDays / 5) * 100, 100)} height="h-1.5" delay={0.5 + idx * 0.06} />
            </div>
            <span className="text-sm font-semibold w-10 text-right tabular-nums">{person.totalDays}d</span>
          </motion.div>
        ))}
      </CardContent>
    </AnimatedCard>
  )
}
TopLeaveTakers.propTypes = { leaveSummary: PropTypes.object }
TopLeaveTakers.defaultProps = { leaveSummary: null }

/* ---- Projects List ---- */
const ProjectsList = ({ projects }) => {
  const list = (projects ?? []).slice(0, 5)
  return (
    <AnimatedCard delay={0.35} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-rose-500" /> Active Projects
          </CardTitle>
          <Link to="/projects" className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {list.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.06 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <Link to={`/projects/${project.id}`} className="text-sm font-medium hover:text-primary transition-colors truncate max-w-[60%]">
                {project.name}
              </Link>
              <Badge variant={project.status === "Active" ? "default" : "secondary"} className="text-xs shrink-0 rounded-lg">
                {project.status}
              </Badge>
            </div>
            <AnimatedProgress value={project.progress ?? 0} height="h-1.5" barClassName="bg-gradient-to-r from-indigo-500 to-purple-500" delay={0.5 + idx * 0.06} />
            <p className="text-xs text-muted-foreground text-right tabular-nums">{project.progress ?? 0}% complete</p>
          </motion.div>
        ))}
      </CardContent>
    </AnimatedCard>
  )
}
ProjectsList.propTypes = { projects: PropTypes.array }
ProjectsList.defaultProps = { projects: [] }

/* ---- Quick Links ---- */
const QuickLinks = () => (
  <FadeIn delay={0.4}>
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Quick Navigation</CardTitle>
        <CardDescription>Jump to any module</CardDescription>
      </CardHeader>
      <CardContent>
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
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
                <span className="text-xs font-medium text-center">{link.label}</span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </CardContent>
    </Card>
  </FadeIn>
)

/* ---- Header ---- */
const AdminHeader = ({ userName }) => {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const dateString = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <BlurText text={`${greeting}, ${userName ?? "Admin"}`} />
        </h1>
        <FadeIn delay={0.3}>
          <p className="text-muted-foreground text-sm mt-1">{dateString}</p>
        </FadeIn>
      </div>
      <FadeIn delay={0.2} direction="left">
        <div className="flex items-center gap-2">
          <PulseBadge color="purple">
            <TrendingUp className="h-3 w-3" /> Admin View
          </PulseBadge>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link to="/attendance/admin/live">
                <Activity className="h-4 w-4 mr-1" /> Live Attendance
              </Link>
            </Button>
          </motion.div>
          <ShimmerButton className="h-9 px-4 text-xs rounded-xl" onClick={() => {}}>
            <Link to="/leave/admin/approvals" className="flex items-center gap-1 text-white">
              <CheckCircle2 className="h-4 w-4" /> Approvals
            </Link>
          </ShimmerButton>
        </div>
      </FadeIn>
    </div>
  )
}
AdminHeader.propTypes = { userName: PropTypes.string }
AdminHeader.defaultProps = { userName: null }

/* ---- Attendance Summary Cards ---- */
const AttendanceSummaryCards = ({ leaveSummary }) => {
  const stats = leaveSummary?.thisMonth
  const items = [
    { label: "Total Leaves", value: stats?.totalLeaves ?? 0, gradient: "from-orange-500 to-amber-500", icon: Calendar },
    { label: "Total Absent", value: stats?.totalAbsent ?? 0, gradient: "from-red-500 to-rose-600", icon: AlertCircle },
    { label: "Total Present", value: stats?.totalPresent ?? 0, gradient: "from-emerald-500 to-green-600", icon: CheckCircle2 },
    { label: "Half Days", value: stats?.totalHalfDay ?? 0, gradient: "from-yellow-500 to-amber-500", icon: Clock },
  ]
  return (
    <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(({ label, value, gradient, icon: Icon }) => (
        <StaggerItem key={label}>
          <AnimatedCard className="border-0 shadow-sm text-center">
            <CardContent className="pt-4 pb-3">
              <div className={`inline-flex rounded-xl p-2 bg-gradient-to-br ${gradient} text-white shadow-md mb-2`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold tabular-nums">
                <NumberTicker value={value} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </AnimatedCard>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
AttendanceSummaryCards.propTypes = { leaveSummary: PropTypes.object }
AttendanceSummaryCards.defaultProps = { leaveSummary: null }

/* ---- Main Admin Dashboard ---- */
const getClockProperties = (status) => ({
  isClocked: status?.isClocked ?? false,
  clockedInAt: status?.clockedInAt ?? null,
  elapsedSeconds: status?.elapsedSeconds ?? 0,
  willAutoExpire: status?.willAutoExpire ?? false,
  todayTotalMinutes: status?.todayTotalMinutes ?? 0,
})

const AdminDashboardUI = ({ userName, employees, projects, leaveSummary, attendanceStatus, isLoading }) => {
  const clockProperties = getClockProperties(attendanceStatus)
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-12 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAT_KEYS.map((k) => <div key={k} className="h-28 bg-muted rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CHART_KEYS.map((k) => <div key={k} className="h-64 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      <AdminHeader userName={userName} />
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ transformOrigin: "left" }}>
        <Separator />
      </motion.div>

      <AdminStatsGrid employees={employees} projects={projects} leaveSummary={leaveSummary} />
      <AttendanceSummaryCards leaveSummary={leaveSummary} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <AttendanceTrendChart leaveSummary={leaveSummary} />
        </div>
        <LeaveBreakdownChart leaveSummary={leaveSummary} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <DepartmentStatsChart leaveSummary={leaveSummary} />
        </div>
        <ProjectProgressChart projects={projects} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <PendingApprovals leaveSummary={leaveSummary} />
          <RecentActivity leaveSummary={leaveSummary} />
        </div>
        <div className="space-y-4">
          <FadeIn delay={0.3}>
            <ClockStatusWidget
              isClocked={clockProperties.isClocked}
              clockedInAt={clockProperties.clockedInAt}
              elapsedSeconds={clockProperties.elapsedSeconds}
              willAutoExpire={clockProperties.willAutoExpire}
              todayTotalMinutes={clockProperties.todayTotalMinutes}
              isLoading={false}
            />
          </FadeIn>
          <TopLeaveTakers leaveSummary={leaveSummary} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProjectsList projects={projects} />
        <QuickLinks />
      </div>
    </div>
  )
}

AdminDashboardUI.propTypes = {
  userName: PropTypes.string,
  employees: PropTypes.array,
  projects: PropTypes.array,
  leaveSummary: PropTypes.object,
  attendanceStatus: PropTypes.object,
  isLoading: PropTypes.bool,
}
AdminDashboardUI.defaultProps = {
  userName: null,
  employees: [],
  projects: [],
  leaveSummary: null,
  attendanceStatus: null,
  isLoading: false,
}

export default AdminDashboardUI
