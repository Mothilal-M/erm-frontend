import { motion } from "framer-motion"
import {
  CalendarDays,
  Plus,
  Clock,
  CalendarCheck,
  CalendarX,
  Target,
  ArrowRight,
} from "lucide-react"
import PropTypes from "prop-types"

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
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

/* eslint-disable complexity, max-lines-per-function, react/no-array-index-key */

const STATUS_STYLES = {
  approved: { color: "emerald", label: "Approved" },
  rejected: { color: "red", label: "Rejected" },
  pending: { color: "amber", label: "Pending" },
}

/* ---- Attendance Ring ---- */
const AttendanceRing = ({ pct }) => {
  const r = 38
  const circumference = 2 * Math.PI * r
  const filled = ((pct ?? 0) / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="-rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={r} stroke="currentColor" strokeWidth="7" fill="none" className="text-muted/20" />
        <motion.circle
          cx="48" cy="48" r={r} stroke="currentColor" strokeWidth="7" fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
          className="text-emerald-500"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - filled }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
        />
      </svg>
      <span className="absolute text-lg font-bold tabular-nums">
        <NumberTicker value={pct ?? 0} delay={0.3} suffix="%" />
      </span>
    </div>
  )
}

AttendanceRing.propTypes = { pct: PropTypes.number }
AttendanceRing.defaultProps = { pct: 0 }

/* ---- Leave Balance Row ---- */
const LeaveBalanceRow = ({ type, allocated, used, pending, remaining, delay = 0 }) => {
  const usedPct = allocated > 0 ? Math.round((used / allocated) * 100) : 0
  const pendingPct = allocated > 0 ? Math.round((pending / allocated) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{type}</span>
        <span className="text-muted-foreground text-xs">
          <span className="text-foreground font-semibold tabular-nums">{remaining}</span> / {allocated} days left
        </span>
      </div>
      <div className="w-full h-2.5 bg-muted/40 rounded-full overflow-hidden flex gap-px">
        <motion.div
          className="bg-red-400 rounded-l-full"
          initial={{ width: 0 }}
          animate={{ width: `${usedPct}%` }}
          transition={{ duration: 0.8, delay: delay + 0.1, ease: [0.25, 0.4, 0.25, 1] }}
          title={`Used: ${used}`}
        />
        <motion.div
          className="bg-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${pendingPct}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: [0.25, 0.4, 0.25, 1] }}
          title={`Pending: ${pending}`}
        />
        <motion.div
          className="bg-emerald-500 rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${100 - usedPct - pendingPct}%` }}
          transition={{ duration: 0.8, delay: delay + 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          title={`Remaining: ${remaining}`}
        />
      </div>
      <div className="flex gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-red-400" /> Used: {used}
        </span>
        {pending > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400" /> Pending: {pending}
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> Available: {remaining}
        </span>
      </div>
    </motion.div>
  )
}

LeaveBalanceRow.propTypes = {
  type: PropTypes.string.isRequired,
  allocated: PropTypes.number.isRequired,
  used: PropTypes.number.isRequired,
  pending: PropTypes.number.isRequired,
  remaining: PropTypes.number.isRequired,
  delay: PropTypes.number,
}
LeaveBalanceRow.defaultProps = { delay: 0 }

/* ---- Main UI ---- */
const EmployeeDashboardUI = ({ data, isLoading, isError, onRequestLeave }) => {
  const emp = data?.employee
  const balance = data?.leaveBalance ?? []
  const thisMonth = data?.thisMonth
  const history = data?.leaveHistory ?? []
  const upcoming = data?.upcoming ?? []

  const totalUsed = balance.reduce((acc, b) => acc + b.used, 0)
  const totalAllocated = balance.reduce((acc, b) => acc + b.allocated, 0)
  const totalPending = balance.reduce((acc, b) => acc + b.pending, 0)
  const totalRemaining = balance.reduce((acc, b) => acc + b.remaining, 0)

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        Failed to load your leave profile. Please try again.
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Profile Header */}
      <AnimatedCard delay={0} className="border-0 shadow-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/8 via-indigo-500/8 to-purple-600/8" />
        <CardContent className="p-5 relative">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Avatar className="w-16 h-16 ring-2 ring-primary/20 ring-offset-2 ring-offset-background shadow-lg">
                  <AvatarImage src={emp?.avatar} alt={emp?.name} />
                  <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    {emp?.name?.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold tracking-tight">
                  <BlurText text={emp?.name ?? ""} />
                </h1>
                <FadeIn delay={0.2}>
                  <p className="text-sm text-muted-foreground">{emp?.role} · {emp?.department}</p>
                </FadeIn>
                <FadeIn delay={0.25}>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ID: {emp?.id} · Manager: {emp?.manager} · Joined {emp?.joinDate}
                  </p>
                </FadeIn>
              </div>
              <div className="shrink-0 flex flex-col items-center gap-2">
                <AttendanceRing pct={thisMonth?.attendancePct} />
                <p className="text-xs text-center text-muted-foreground">This month</p>
                <ShimmerButton
                  className="h-9 px-4 text-xs rounded-xl"
                  onClick={onRequestLeave}
                >
                  <Plus className="h-3.5 w-3.5" /> Request Leave
                </ShimmerButton>
              </div>
            </div>
          )}
        </CardContent>
      </AnimatedCard>

      {/* Quick Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: CalendarDays, label: "Total Allocated", value: totalAllocated, gradient: "from-blue-500 to-indigo-600" },
            { icon: CalendarX, label: "Days Used", value: totalUsed, gradient: "from-red-500 to-rose-600" },
            { icon: Clock, label: "Pending Approval", value: totalPending, gradient: "from-amber-500 to-orange-500" },
            { icon: Target, label: "Days Remaining", value: totalRemaining, gradient: "from-emerald-500 to-green-600" },
          ].map(({ icon: Icon, label, value, gradient }) => (
            <StaggerItem key={label}>
              <AnimatedCard className="border-0 shadow-sm">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`rounded-xl p-2.5 bg-gradient-to-br ${gradient} text-white shadow-md`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
                    <p className="text-2xl font-bold leading-none mt-0.5 tabular-nums">
                      <NumberTicker value={value} />
                    </p>
                  </div>
                </CardContent>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leave Balance */}
        <AnimatedCard delay={0.15} className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Leave Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading
              ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)
              : balance.map((b, idx) => (
                  <LeaveBalanceRow
                    key={b.type}
                    type={b.type}
                    allocated={b.allocated}
                    used={b.used}
                    pending={b.pending}
                    remaining={b.remaining}
                    delay={0.2 + idx * 0.08}
                  />
                ))}
          </CardContent>
        </AnimatedCard>

        {/* This Month + Upcoming */}
        <div className="space-y-4">
          <AnimatedCard delay={0.2} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-indigo-500" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
                </div>
              ) : (
                <StaggerContainer className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Present", value: thisMonth?.presentDays, color: "text-emerald-600", bg: "bg-emerald-500/10" },
                    { label: "On Leave", value: thisMonth?.leaveDays, color: "text-amber-600", bg: "bg-amber-500/10" },
                    { label: "Absent", value: thisMonth?.absentDays, color: "text-red-500", bg: "bg-red-500/10" },
                  ].map(({ label, value, color, bg }) => (
                    <StaggerItem key={label}>
                      <div className={`p-3 rounded-xl ${bg}`}>
                        <p className={`text-2xl font-bold ${color} tabular-nums`}>
                          <NumberTicker value={value ?? 0} />
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.25} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                [1, 2].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)
              ) : upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming leaves or holidays.
                </p>
              ) : (
                upcoming.map((u, idx) => (
                  <motion.div
                    key={u.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.06 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold">{u.label}</p>
                      <p className="text-xs text-muted-foreground">{u.date}</p>
                    </div>
                    <PulseBadge color="blue">in {u.daysUntil}d</PulseBadge>
                  </motion.div>
                ))
              )}
            </CardContent>
          </AnimatedCard>
        </div>
      </div>

      {/* Leave History */}
      <AnimatedCard delay={0.3} className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((item, idx) => {
                const style = STATUS_STYLES[item.status] ?? STATUS_STYLES.pending
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + idx * 0.04 }}
                  >
                    <div className="flex items-center justify-between py-3 text-sm hover:bg-muted/20 px-2 rounded-lg transition-colors">
                      <div className="min-w-0">
                        <p className="font-medium">{item.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.from} <ArrowRight className="inline h-3 w-3" /> {item.to} · {item.days} day{item.days > 1 ? "s" : ""}
                        </p>
                      </div>
                      <PulseBadge color={style.color}>{style.label}</PulseBadge>
                    </div>
                    {idx < history.length - 1 && <Separator className="opacity-50" />}
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </AnimatedCard>
    </div>
  )
}

EmployeeDashboardUI.propTypes = {
  data: PropTypes.shape({
    employee: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      role: PropTypes.string,
      department: PropTypes.string,
      avatar: PropTypes.string,
      joinDate: PropTypes.string,
      manager: PropTypes.string,
    }),
    leaveBalance: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        allocated: PropTypes.number,
        used: PropTypes.number,
        pending: PropTypes.number,
        remaining: PropTypes.number,
      })
    ),
    thisMonth: PropTypes.shape({
      presentDays: PropTypes.number,
      absentDays: PropTypes.number,
      leaveDays: PropTypes.number,
      workingDays: PropTypes.number,
      attendancePct: PropTypes.number,
    }),
    leaveHistory: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        type: PropTypes.string,
        from: PropTypes.string,
        to: PropTypes.string,
        days: PropTypes.number,
        status: PropTypes.string,
      })
    ),
    upcoming: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        date: PropTypes.string,
        daysUntil: PropTypes.number,
      })
    ),
  }),
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  onRequestLeave: PropTypes.func.isRequired,
}
EmployeeDashboardUI.defaultProps = { data: null }

export default EmployeeDashboardUI
