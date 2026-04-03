import { motion } from "framer-motion"
import PropTypes from "prop-types"

import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import {
  AnimatedCard,
  AnimatedProgress,
  BlurText,
  FadeIn,
  NumberTicker,
  PulseBadge,
} from "@/components/magicui"
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/magicui/stagger-container"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PENDING_STYLE =
  "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"

const BLUE_BG = "bg-blue-500"
const RED_BG = "bg-red-500"
const EMERALD_BG = "bg-emerald-500"
const LEAVE_DEFAULT_COLOR = "bg-gray-400"

const STATUS_STYLE = {
  approved:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  pending: PENDING_STYLE,
}

const LEAVE_COLOR = {
  blue: BLUE_BG,
  red: RED_BG,
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  cyan: "bg-cyan-500",
  yellow: "bg-yellow-400",
}

const LEAVE_BAR_COLOR = {
  blue: "bg-blue-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  cyan: "bg-cyan-500",
  yellow: "bg-yellow-400",
  default: "bg-gray-400",
}

const SUBTYPE_BADGE = {
  wfh: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
  halfday:
    "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  full: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
}

const SUBTYPE_LABEL = { wfh: "WFH", halfday: "½ Day", full: "Full" }

// ─── Gradient icon map for MetricCards ───────────────────────────────────────

const METRIC_ICON_MAP = {
  "🏖️": { icon: "🏖️", gradient: "from-blue-500 to-indigo-600" },
  "❌": { icon: "❌", gradient: "from-red-500 to-rose-600" },
  "✅": { icon: "✅", gradient: "from-emerald-500 to-teal-600" },
  "⏳": { icon: "⏳", gradient: "from-amber-500 to-orange-600" },
  "🏠": { icon: "🏠", gradient: "from-cyan-500 to-blue-600" },
  "🌗": { icon: "🌗", gradient: "from-yellow-500 to-amber-600" },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const MetricCard = ({ icon, label, value, sub, accent, delay = 0 }) => (
  <AnimatedCard
    delay={delay}
    className={`overflow-hidden ${accent}`}
    glowColor={accent.includes("blue") ? "#3b82f6" : accent.includes("red") ? "#ef4444" : accent.includes("emerald") ? "#10b981" : accent.includes("amber") ? "#f59e0b" : accent.includes("cyan") ? "#06b6d4" : accent.includes("yellow") ? "#eab308" : undefined}
  >
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-extrabold mt-1 leading-none tabular-nums">
            {typeof value === "number" ? (
              <NumberTicker value={value} delay={delay + 0.2} />
            ) : (
              value
            )}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div
          className={`rounded-xl p-2.5 bg-gradient-to-br ${METRIC_ICON_MAP[icon]?.gradient ?? "from-gray-500 to-gray-600"} text-white shadow-md`}
        >
          <span className="text-xl leading-none">{icon}</span>
        </div>
      </div>
    </CardContent>
  </AnimatedCard>
)

MetricCard.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  sub: PropTypes.string,
  accent: PropTypes.string.isRequired,
  delay: PropTypes.number,
}

MetricCard.defaultProps = {
  sub: undefined,
  delay: 0,
}

const DeptBar = ({ present, leaveCount, absent, wfh }) => {
  const total = present + leaveCount + absent + (wfh ?? 0)
  if (total === 0) return null
  return (
    <div className="flex w-full h-2 rounded-full overflow-hidden gap-px">
      <motion.div
        className={`${EMERALD_BG} transition-all`}
        initial={{ width: 0 }}
        animate={{ width: `${(present / total) * 100}%` }}
        transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
      />
      <motion.div
        className="bg-cyan-400 transition-all"
        initial={{ width: 0 }}
        animate={{ width: `${((wfh ?? 0) / total) * 100}%` }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
      />
      <motion.div
        className="bg-amber-400 transition-all"
        initial={{ width: 0 }}
        animate={{ width: `${(leaveCount / total) * 100}%` }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
      />
      <motion.div
        className={`${RED_BG} transition-all`}
        initial={{ width: 0 }}
        animate={{ width: `${(absent / total) * 100}%` }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      />
    </div>
  )
}

DeptBar.propTypes = {
  present: PropTypes.number.isRequired,
  leaveCount: PropTypes.number.isRequired,
  absent: PropTypes.number.isRequired,
  wfh: PropTypes.number,
}

DeptBar.defaultProps = {
  wfh: 0,
}

// ─── Section Sub-components ───────────────────────────────────────────────────

const LeaveBreakdownAndDeptSection = ({
  isLoading,
  leaveBreakdown,
  totalRequests,
  departmentStats,
}) => (
  <FadeIn delay={0.3} direction="up">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Leave Type Breakdown */}
      <AnimatedCard delay={0.35}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Leave Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Skeleton key={index} className="h-8 rounded-lg" />
              ))
            : leaveBreakdown?.map((item, idx) => {
                const pct = Math.round((item.count / totalRequests) * 100)
                return (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.4 + idx * 0.07 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${LEAVE_COLOR[item.color] ?? LEAVE_DEFAULT_COLOR}`}
                        />
                        <span className="text-sm font-medium">{item.type}</span>
                      </div>
                      <span className="text-sm font-bold tabular-nums">
                        {item.count}
                      </span>
                    </div>
                    <AnimatedProgress
                      value={pct}
                      max={100}
                      height="h-1.5"
                      barClassName={LEAVE_BAR_COLOR[item.color] ?? LEAVE_BAR_COLOR.default}
                      delay={0.45 + idx * 0.07}
                    />
                  </motion.div>
                )
              })}
        </CardContent>
      </AnimatedCard>

      {/* Department Stats */}
      <AnimatedCard delay={0.4} className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Department Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Skeleton key={index} className="h-10 mb-2 rounded-lg" />
            ))
          ) : (
            <StaggerContainer className="space-y-3">
              {departmentStats?.map((dept) => (
                <StaggerItem key={dept.department}>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="font-medium w-28 truncate">
                      {dept.department}
                    </span>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="text-emerald-600 font-semibold tabular-nums">
                        ✓ {dept.present}
                      </span>
                      <span className="text-cyan-600 font-semibold tabular-nums">
                        🏠 {dept.wfh ?? 0}
                      </span>
                      <span className="text-amber-600 font-semibold tabular-nums">
                        ⏳ {dept.onLeave}
                      </span>
                      <span className="text-red-500 font-semibold tabular-nums">
                        ✗ {dept.absent}
                      </span>
                    </div>
                  </div>
                  <DeptBar
                    present={dept.present}
                    leaveCount={dept.onLeave}
                    absent={dept.absent}
                    wfh={dept.wfh}
                  />
                </StaggerItem>
              ))}
              <div className="flex flex-wrap gap-3 pt-2 border-t mt-2">
                {[
                  [EMERALD_BG, "Present"],
                  ["bg-cyan-400", "WFH"],
                  ["bg-amber-400", "On Leave"],
                  [RED_BG, "Absent"],
                ].map(([cls, lbl]) => (
                  <div key={lbl} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
                    <span className="text-xs text-muted-foreground">{lbl}</span>
                  </div>
                ))}
              </div>
            </StaggerContainer>
          )}
        </CardContent>
      </AnimatedCard>
    </div>
  </FadeIn>
)

LeaveBreakdownAndDeptSection.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  leaveBreakdown: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      count: PropTypes.number,
      color: PropTypes.string,
    })
  ),
  totalRequests: PropTypes.number.isRequired,
  departmentStats: PropTypes.arrayOf(
    PropTypes.shape({
      department: PropTypes.string,
      onLeave: PropTypes.number,
      absent: PropTypes.number,
      present: PropTypes.number,
      wfh: PropTypes.number,
    })
  ),
}

LeaveBreakdownAndDeptSection.defaultProps = {
  leaveBreakdown: undefined,
  departmentStats: undefined,
}

const TopLeaveTakersCard = ({ isLoading, topLeaveTakers }) => (
  <FadeIn delay={0.4} direction="up">
    <AnimatedCard delay={0.45}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="rounded-xl p-2 bg-gradient-to-br from-yellow-500 to-amber-600 text-white shadow-md">
            <span className="text-sm leading-none">🏆</span>
          </div>
          Top Leave Takers This Month
          <span className="text-xs text-muted-foreground font-normal">
            by total days away
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={index} className="h-12 mb-2 rounded-lg" />
          ))
        ) : (
          <StaggerContainer className="space-y-2">
            {topLeaveTakers?.map((emp, index) => {
              const maxDays = topLeaveTakers?.[0]?.totalDays || 1
              const barW = Math.round((emp.totalDays / maxDays) * 100)
              return (
                <StaggerItem key={emp.id}>
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        index === 0
                          ? "bg-yellow-400 text-yellow-900"
                          : index === 1
                            ? "bg-slate-300 text-slate-700"
                            : index === 2
                              ? "bg-amber-600 text-white"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    {/* Name & dept */}
                    <div className="w-40 shrink-0">
                      <p className="text-sm font-semibold leading-none">
                        {emp.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {emp.department}
                      </p>
                    </div>
                    {/* Bar */}
                    <AnimatedProgress
                      value={barW}
                      max={100}
                      height="h-2.5"
                      barClassName="bg-blue-500"
                      className="flex-1"
                      delay={0.1 + index * 0.08}
                    />
                    {/* Days + types */}
                    <div className="shrink-0 text-right">
                      <span className="text-sm font-bold tabular-nums">
                        {emp.totalDays}d
                      </span>
                      <div className="flex gap-1 mt-0.5 justify-end flex-wrap">
                        {emp.types.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] bg-muted px-1.5 py-0.5 rounded-xl text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}
      </CardContent>
    </AnimatedCard>
  </FadeIn>
)

TopLeaveTakersCard.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  topLeaveTakers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      department: PropTypes.string,
      totalDays: PropTypes.number,
      types: PropTypes.arrayOf(PropTypes.string),
    })
  ),
}

TopLeaveTakersCard.defaultProps = {
  topLeaveTakers: undefined,
}

const ApprovalsAndActivitySection = ({
  isLoading,
  pendingApprovals,
  recentActivity,
}) => (
  <FadeIn delay={0.5} direction="up">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pending Approvals preview */}
      <AnimatedCard delay={0.55}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            Pending Approvals
            {!isLoading && (
              <PulseBadge color="amber">
                {pendingApprovals?.length}
              </PulseBadge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Skeleton key={index} className="h-14 rounded-lg" />
              ))
            : pendingApprovals?.slice(0, 5).map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + idx * 0.07 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50 gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-none truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.type} · {item.from} → {item.to}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 rounded-xl ${SUBTYPE_BADGE[item.subType] ?? ""}`}
                    >
                      {SUBTYPE_LABEL[item.subType] ?? item.subType}
                    </Badge>
                    <Badge variant="outline" className="text-xs rounded-xl tabular-nums">
                      {item.days}d
                    </Badge>
                  </div>
                </motion.div>
              ))}
        </CardContent>
      </AnimatedCard>

      {/* Recent Activity */}
      <AnimatedCard delay={0.6}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Skeleton key={index} className="h-10 mb-2 rounded-lg" />
            ))
          ) : (
            <StaggerContainer className="space-y-1">
              {recentActivity?.map((item, index) => (
                <StaggerItem key={item.id}>
                  <div className="flex items-center justify-between py-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          item.action.includes("Approved")
                            ? EMERALD_BG
                            : item.action.includes("Rejected")
                              ? RED_BG
                              : item.action.includes("Absent")
                                ? "bg-red-400"
                                : BLUE_BG
                        }`}
                      />
                      <span className="font-medium truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <PulseBadge
                        color={
                          item.action.includes("Approved")
                            ? "emerald"
                            : item.action.includes("Rejected")
                              ? "red"
                              : "amber"
                        }
                        className="text-[10px] px-2 py-0.5"
                      >
                        {item.action}
                      </PulseBadge>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {item.date}
                      </span>
                    </div>
                  </div>
                  {index < (recentActivity?.length ?? 0) - 1 && <Separator />}
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </CardContent>
      </AnimatedCard>
    </div>
  </FadeIn>
)

ApprovalsAndActivitySection.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  pendingApprovals: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      type: PropTypes.string,
      subType: PropTypes.string,
      from: PropTypes.string,
      to: PropTypes.string,
      days: PropTypes.number,
    })
  ),
  recentActivity: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      action: PropTypes.string,
      type: PropTypes.string,
      date: PropTypes.string,
    })
  ),
}

ApprovalsAndActivitySection.defaultProps = {
  pendingApprovals: undefined,
  recentActivity: undefined,
}

// ─── Main UI ──────────────────────────────────────────────────────────────────

/* eslint-disable complexity */
/**
 *
 */
const AdminDashboardUI = ({ data, isLoading, isError }) => {
  if (isError) {
    return (
      <FadeIn delay={0.1}>
        <div className="flex items-center justify-center h-64 text-destructive">
          Failed to load admin dashboard. Please try again.
        </div>
      </FadeIn>
    )
  }

  // Total requests for leave breakdown % denominator
  const totalRequests =
    data?.leaveBreakdown?.reduce((a, b) => a + b.count, 0) || 1

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <FadeIn delay={0} direction="up">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <BlurText
              text="Admin Leave Dashboard"
              className="text-2xl font-bold tracking-tight"
            />
            <p className="text-muted-foreground text-sm mt-0.5">
              {isLoading
                ? "Loading…"
                : `${data?.month} ${data?.year} — ${data?.totalEmployees} employees`}
            </p>
          </div>
          <PulseBadge color="red">Live</PulseBadge>
        </div>
      </FadeIn>

      {/* KPI Row 1 — core metrics */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon="🏖️"
            label="Leaves This Month"
            value={data?.thisMonth?.totalLeaves}
            sub="full-day leaves"
            accent="bg-blue-500/10"
            delay={0.05}
          />
          <MetricCard
            icon="❌"
            label="Absences"
            value={data?.thisMonth?.totalAbsent}
            sub="unauthorized & unplanned"
            accent="bg-red-500/10"
            delay={0.1}
          />
          <MetricCard
            icon="✅"
            label="Avg. Daily Present"
            value={data?.thisMonth?.avgDailyPresent}
            sub={`of ${data?.totalEmployees}`}
            accent="bg-emerald-500/10"
            delay={0.15}
          />
          <MetricCard
            icon="⏳"
            label="Pending Approvals"
            value={data?.pendingApprovals?.length}
            sub="awaiting your action"
            accent="bg-amber-500/10"
            delay={0.2}
          />
        </div>
      )}

      {/* KPI Row 2 — WFH & Half Day */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon="🏠"
            label="Work From Home (Month)"
            value={data?.thisMonth?.totalWFH}
            sub="approved WFH days"
            accent="bg-cyan-500/10"
            delay={0.25}
          />
          <MetricCard
            icon="🌗"
            label="Half Days (Month)"
            value={data?.thisMonth?.totalHalfDay}
            sub="morning & afternoon"
            accent="bg-yellow-500/10"
            delay={0.3}
          />
        </div>
      )}

      <LeaveBreakdownAndDeptSection
        isLoading={isLoading}
        leaveBreakdown={data?.leaveBreakdown}
        totalRequests={totalRequests}
        departmentStats={data?.departmentStats}
      />
      <TopLeaveTakersCard
        isLoading={isLoading}
        topLeaveTakers={data?.topLeaveTakers}
      />
      <ApprovalsAndActivitySection
        isLoading={isLoading}
        pendingApprovals={data?.pendingApprovals}
        recentActivity={data?.recentActivity}
      />
    </div>
  )
}

AdminDashboardUI.propTypes = {
  data: PropTypes.shape({
    month: PropTypes.string,
    year: PropTypes.number,
    totalEmployees: PropTypes.number,
    thisMonth: PropTypes.shape({
      totalLeaves: PropTypes.number,
      totalAbsent: PropTypes.number,
      avgDailyPresent: PropTypes.number,
      totalWFH: PropTypes.number,
      totalHalfDay: PropTypes.number,
    }),
    leaveBreakdown: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        count: PropTypes.number,
        color: PropTypes.string,
      })
    ),
    departmentStats: PropTypes.arrayOf(
      PropTypes.shape({
        department: PropTypes.string,
        onLeave: PropTypes.number,
        absent: PropTypes.number,
        present: PropTypes.number,
        wfh: PropTypes.number,
      })
    ),
    topLeaveTakers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        department: PropTypes.string,
        totalDays: PropTypes.number,
        types: PropTypes.arrayOf(PropTypes.string),
      })
    ),
    pendingApprovals: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        type: PropTypes.string,
        subType: PropTypes.string,
        from: PropTypes.string,
        to: PropTypes.string,
        days: PropTypes.number,
      })
    ),
    recentActivity: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        action: PropTypes.string,
        type: PropTypes.string,
        date: PropTypes.string,
      })
    ),
  }),
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
}

AdminDashboardUI.defaultProps = {
  data: undefined,
}

export default AdminDashboardUI
