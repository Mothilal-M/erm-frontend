import { motion } from "framer-motion"
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
  UserCircle,
} from "lucide-react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import {
  AnimatedCard,
  AnimatedProgress,
  BlurText,
  FadeIn,
  NumberTicker,
  PulseBadge,
  StaggerContainer,
  StaggerItem,
} from "@/components/magicui"
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ct from "@constants/"

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLOR_MAP = {
  active: "emerald",
  inactive: "red",
  onLeave: "amber",
}

const STATUS_STYLE = {
  active: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  inactive: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  onLeave: "bg-amber-500/15 text-amber-700 border-amber-500/30",
}

const TIMELINE_ICON_STYLE = {
  joined: "bg-emerald-500",
  promotion: "bg-blue-500",
  leave: "bg-amber-500",
  award: "bg-purple-500",
  training: "bg-cyan-500",
  default: "bg-slate-400",
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const ProfileSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-8 w-48" />
    </div>
    <Card className="border-0 shadow-sm rounded-xl">
      <CardContent className="p-6">
        <div className="flex gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-24 rounded-xl" />
      ))}
    </div>
  </div>
)

// ─── Info Row Component ───────────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value || "—"}</p>
    </div>
  </div>
)

InfoRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
}

InfoRow.defaultProps = { value: null }

// ─── Stat Card Component ──────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, subtext, accent }) => (
  <AnimatedCard
    delay={0.1}
    className={`border-0 shadow-sm rounded-xl ${accent}`}
  >
    <CardContent className="flex items-center gap-3 p-4">
      <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-white/10 flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">
          {typeof value === "number" ? <NumberTicker value={value} /> : value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {subtext && (
          <p className="text-[10px] text-muted-foreground">{subtext}</p>
        )}
      </div>
    </CardContent>
  </AnimatedCard>
)

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtext: PropTypes.string,
  accent: PropTypes.string,
}

StatCard.defaultProps = { subtext: null, accent: "bg-muted/30" }

// ─── Personal Info Section ────────────────────────────────────────────────────

const PersonalInfoSection = ({ personal }) => (
  <AnimatedCard delay={0.2} className="border-0 shadow-sm rounded-xl">
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2">
        <User className="h-4 w-4" /> Personal Information
      </CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
      <InfoRow icon={Mail} label="Email" value={personal?.email} />
      <InfoRow icon={Phone} label="Phone" value={personal?.phone} />
      <InfoRow icon={MapPin} label="Location" value={personal?.location} />
      <InfoRow icon={Calendar} label="Date of Birth" value={personal?.dob} />
      <InfoRow
        icon={User}
        label="Emergency Contact"
        value={personal?.emergencyContact}
      />
      <InfoRow
        icon={Briefcase}
        label="Employment Type"
        value={personal?.employmentType}
      />
    </CardContent>
  </AnimatedCard>
)

PersonalInfoSection.propTypes = {
  personal: PropTypes.shape({
    email: PropTypes.string,
    phone: PropTypes.string,
    location: PropTypes.string,
    dob: PropTypes.string,
    emergencyContact: PropTypes.string,
    employmentType: PropTypes.string,
  }),
}

PersonalInfoSection.defaultProps = { personal: null }

// ─── Attendance Section ───────────────────────────────────────────────────────

const AttendanceSection = ({ attendance }) => {
  const logs = attendance?.recentLogs ?? []

  return (
    <AnimatedCard delay={0.3} className="border-0 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" /> Attendance Summary
        </CardTitle>
        <CardDescription className="text-xs">
          Current month overview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <StaggerContainer className="grid grid-cols-4 gap-3 text-center">
          {[
            {
              label: "Present",
              value: attendance?.presentDays,
              cls: "text-emerald-600",
            },
            {
              label: "Absent",
              value: attendance?.absentDays,
              cls: "text-red-500",
            },
            {
              label: "Late",
              value: attendance?.lateDays,
              cls: "text-amber-600",
            },
            { label: "WFH", value: attendance?.wfhDays, cls: "text-blue-600" },
          ].map(({ label, value, cls }) => (
            <StaggerItem key={label}>
              <div className="p-3 rounded-xl bg-muted/40">
                <p className={`text-xl font-bold ${cls}`}>
                  {typeof value === "number" ? (
                    <NumberTicker value={value} />
                  ) : (
                    (value ?? 0)
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Attendance percentage */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Attendance Rate</span>
            <span className="font-semibold">
              {attendance?.attendanceRate ?? 0}%
            </span>
          </div>
          <AnimatedProgress
            value={attendance?.attendanceRate ?? 0}
            max={100}
            height="h-2"
            delay={0.4}
          />
        </div>

        <Separator />

        {/* Recent logs */}
        <div>
          <p className="text-sm font-medium mb-2">Recent Activity</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent logs.</p>
            ) : (
              logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between text-sm p-2 rounded-xl bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{log.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.clockIn} – {log.clockOut || "—"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs rounded-lg">
                    {log.duration}
                  </Badge>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

AttendanceSection.propTypes = {
  attendance: PropTypes.shape({
    presentDays: PropTypes.number,
    absentDays: PropTypes.number,
    lateDays: PropTypes.number,
    wfhDays: PropTypes.number,
    attendanceRate: PropTypes.number,
    recentLogs: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string,
        clockIn: PropTypes.string,
        clockOut: PropTypes.string,
        duration: PropTypes.string,
      }),
    ),
  }),
}

AttendanceSection.defaultProps = { attendance: null }

// ─── Leave Section ────────────────────────────────────────────────────────────

const LeaveSection = ({ leave }) => {
  const balances = leave?.balances ?? []
  const history = leave?.history ?? []

  return (
    <AnimatedCard delay={0.35} className="border-0 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Leave Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balances */}
        <div className="space-y-3">
          {balances.map((bal, index) => {
            const remainingPct = Math.round(
              (bal.remaining / bal.allocated) * 100,
            )
            return (
              <div key={bal.type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{bal.type}</span>
                  <span className="text-muted-foreground">
                    {bal.remaining}/{bal.allocated} days
                  </span>
                </div>
                <AnimatedProgress
                  value={remainingPct}
                  max={100}
                  height="h-2"
                  delay={0.1 * index}
                />
              </div>
            )
          })}
        </div>

        <Separator />

        {/* Recent history */}
        <div>
          <p className="text-sm font-medium mb-2">Recent Requests</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leave history.</p>
            ) : (
              history.slice(0, 5).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * index }}
                  className="flex items-center justify-between text-sm p-2 rounded-xl bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{item.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.from} → {item.to}
                    </p>
                  </div>
                  <PulseBadge
                    color={
                      item.status === "approved"
                        ? "emerald"
                        : item.status === "pending"
                          ? "amber"
                          : "red"
                    }
                  >
                    {item.status}
                  </PulseBadge>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

LeaveSection.propTypes = {
  leave: PropTypes.shape({
    balances: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        allocated: PropTypes.number,
        used: PropTypes.number,
        remaining: PropTypes.number,
      }),
    ),
    history: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        type: PropTypes.string,
        from: PropTypes.string,
        to: PropTypes.string,
        status: PropTypes.string,
      }),
    ),
  }),
}

LeaveSection.defaultProps = { leave: null }

// ─── Performance Section ──────────────────────────────────────────────────────

const PerformanceSection = ({ performance }) => {
  const tasks = performance?.recentTasks ?? []
  const awards = performance?.awards ?? []

  return (
    <AnimatedCard delay={0.2} className="border-0 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="h-4 w-4" /> Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics */}
        <StaggerContainer className="grid grid-cols-3 gap-3 text-center">
          {[
            {
              label: "Tasks Completed",
              value: performance?.tasksCompleted ?? 0,
            },
            { label: "On-Time %", value: `${performance?.onTimeRate ?? 0}%` },
            { label: "Rating", value: performance?.rating ?? "—" },
          ].map(({ label, value }) => (
            <StaggerItem key={label}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-3 rounded-xl bg-muted/40"
              >
                <p className="text-lg font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Recent tasks */}
        {tasks.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Recent Tasks</p>
              <div className="space-y-2">
                {tasks.slice(0, 3).map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * index }}
                    className="flex items-center justify-between text-sm p-2 rounded-xl bg-muted/30"
                  >
                    <span className="truncate">{task.title}</span>
                    <PulseBadge color="blue">{task.status}</PulseBadge>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Recognition</p>
              <div className="flex flex-wrap gap-2">
                {awards.map((award, index) => (
                  <PulseBadge key={index} color="purple">
                    {award}
                  </PulseBadge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </AnimatedCard>
  )
}

PerformanceSection.propTypes = {
  performance: PropTypes.shape({
    tasksCompleted: PropTypes.number,
    onTimeRate: PropTypes.number,
    rating: PropTypes.string,
    recentTasks: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        status: PropTypes.string,
      }),
    ),
    awards: PropTypes.arrayOf(PropTypes.string),
  }),
}

PerformanceSection.defaultProps = { performance: null }

// ─── Assets Section ───────────────────────────────────────────────────────────

const AssetsSection = ({ assets }) => {
  const items = assets ?? []

  return (
    <AnimatedCard delay={0.25} className="border-0 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Briefcase className="h-4 w-4" /> Assigned Assets
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assets assigned.</p>
        ) : (
          <StaggerContainer className="space-y-2">
            {items.map((asset) => (
              <StaggerItem key={asset.id}>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50"
                >
                  <div>
                    <p className="text-sm font-medium">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {asset.type} · {asset.serialNumber}
                    </p>
                  </div>
                  <PulseBadge color="blue">{asset.condition}</PulseBadge>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </CardContent>
    </AnimatedCard>
  )
}

AssetsSection.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      type: PropTypes.string,
      serialNumber: PropTypes.string,
      condition: PropTypes.string,
    }),
  ),
}

AssetsSection.defaultProps = { assets: null }

// ─── Documents Section ────────────────────────────────────────────────────────

const DocumentsSection = ({ documents }) => {
  const docs = documents ?? []

  return (
    <AnimatedCard delay={0.3} className="border-0 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" /> Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents uploaded.
          </p>
        ) : (
          <StaggerContainer className="space-y-2">
            {docs.map((document_) => (
              <StaggerItem key={document_.id}>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{document_.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {document_.category} · {document_.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    View
                  </Button>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </CardContent>
    </AnimatedCard>
  )
}

DocumentsSection.propTypes = {
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      category: PropTypes.string,
      uploadedAt: PropTypes.string,
    }),
  ),
}

DocumentsSection.defaultProps = { documents: null }

// ─── Timeline Section ─────────────────────────────────────────────────────────

const TimelineSection = ({ timeline }) => {
  const events = timeline ?? []

  return (
    <AnimatedCard delay={0.2} className="border-0 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Timeline</CardTitle>
        <CardDescription className="text-xs">
          Key events and milestones
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No timeline events.</p>
        ) : (
          <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-border">
            {events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative"
              >
                <div
                  className={`absolute -left-6 top-1 w-4 h-4 rounded-full ${
                    TIMELINE_ICON_STYLE[event.type] ??
                    TIMELINE_ICON_STYLE.default
                  }`}
                />
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="p-3 rounded-xl bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {event.date}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </AnimatedCard>
  )
}

TimelineSection.propTypes = {
  timeline: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      title: PropTypes.string,
      date: PropTypes.string,
      description: PropTypes.string,
    }),
  ),
}

TimelineSection.defaultProps = { timeline: null }

// ─── Main UI Component ────────────────────────────────────────────────────────

const Employee360UI = ({ data, isLoading, isError }) => {
  if (isLoading) return <ProfileSkeleton />

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Failed to load employee profile.</p>
        <Button variant="outline" asChild>
          <Link to={ct.route.employeeManagement.LIST}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Employees
          </Link>
        </Button>
      </div>
    )
  }

  const {
    employee,
    personal,
    attendance,
    leave,
    performance,
    assets,
    documents,
    timeline,
  } = data

  const initials = employee?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Back link + page title */}
      <FadeIn direction="down">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to={ct.route.employeeManagement.LIST}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
              <UserCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <BlurText
                text="Employee Profile"
                className="text-2xl font-bold tracking-tight"
                delay={0.1}
              />
              <p className="text-sm text-muted-foreground">360° view</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Hero Card */}
      <FadeIn delay={0.15}>
        <AnimatedCard
          delay={0.2}
          className="border-0 shadow-sm rounded-xl bg-linear-to-r from-blue-600/10 via-indigo-500/10 to-purple-600/10"
        >
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.3,
                }}
              >
                <Avatar className="w-20 h-20 border-2 border-white/30 shadow-lg">
                  <AvatarImage src={employee?.avatar} alt={employee?.name} />
                  <AvatarFallback className="text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold">{employee?.name}</h2>
                  <PulseBadge
                    color={STATUS_COLOR_MAP[employee?.status] ?? "emerald"}
                  >
                    {employee?.status ?? "Active"}
                  </PulseBadge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {employee?.role} · {employee?.department}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {employee?.id} · Manager: {employee?.manager} · Joined{" "}
                  {employee?.joinDate}
                </p>
              </div>
              <div className="shrink-0 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-xl"
                >
                  <Link
                    to={ct.route.employeeManagement.EDIT.replace(
                      ":id",
                      employee?.id,
                    )}
                  >
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      </FadeIn>

      {/* Quick Stats */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StaggerItem>
          <StatCard
            icon={Clock}
            label="Attendance Rate"
            value={`${attendance?.attendanceRate ?? 0}%`}
            accent="bg-emerald-500/10"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={Calendar}
            label="Leave Balance"
            value={leave?.totalRemaining ?? 0}
            subtext="days remaining"
            accent="bg-blue-500/10"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={Award}
            label="Tasks Completed"
            value={performance?.tasksCompleted ?? 0}
            accent="bg-purple-500/10"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={Briefcase}
            label="Assets Assigned"
            value={assets?.length ?? 0}
            accent="bg-amber-500/10"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Tabbed Content */}
      <FadeIn delay={0.4}>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex rounded-xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="work">Work</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PersonalInfoSection personal={personal} />
              <AttendanceSection attendance={attendance} />
            </div>
            <LeaveSection leave={leave} />
          </TabsContent>

          {/* Work Tab */}
          <TabsContent value="work" className="space-y-4">
            <PerformanceSection performance={performance} />
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AssetsSection assets={assets} />
              <DocumentsSection documents={documents} />
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <TimelineSection timeline={timeline} />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}

Employee360UI.propTypes = {
  data: PropTypes.shape({
    employee: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      role: PropTypes.string,
      department: PropTypes.string,
      avatar: PropTypes.string,
      joinDate: PropTypes.string,
      manager: PropTypes.string,
      status: PropTypes.string,
    }),
    personal: PropTypes.object,
    attendance: PropTypes.object,
    leave: PropTypes.object,
    performance: PropTypes.object,
    assets: PropTypes.array,
    documents: PropTypes.array,
    timeline: PropTypes.array,
  }),
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
}

Employee360UI.defaultProps = { data: null }

export default Employee360UI
