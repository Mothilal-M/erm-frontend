import { motion } from "framer-motion"
import { CalendarDays, Clock, BarChart3, TrendingUp } from "lucide-react"
import PropTypes from "prop-types"

import {
  AnimatedCard,
  BlurText,
  FadeIn,
  NumberTicker,
  PulseBadge,
} from "@/components/magicui"
import { StaggerContainer, StaggerItem } from "@/components/magicui/stagger-container"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/* eslint-disable react/no-array-index-key */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "\u2014"

const fmtMins = (mins) => {
  if (!mins) return "0m"
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const STATUS_STYLES = {
  COMPLETED: { color: "blue", label: "Completed" },
  AUTO_EXPIRED: { color: "amber", label: "Auto-Expired" },
  EDITED: { color: "purple", label: "Edited" },
  MANUAL: { color: "indigo", label: "Manual" },
  IN_PROGRESS: { color: "emerald", label: "In Progress" },
}

/* ---- Summary Card ---- */
const SummaryCard = ({ label, value, icon: Icon, gradient, delay }) => (
  <AnimatedCard delay={delay} className="border-0 shadow-sm overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
        </div>
        <div className={`rounded-xl p-2.5 bg-gradient-to-br ${gradient} text-white shadow-md`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </CardContent>
  </AnimatedCard>
)

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  gradient: PropTypes.string.isRequired,
  delay: PropTypes.number.isRequired,
}

/* ---- History Row ---- */
const HistoryRow = ({ entry, date, idx }) => {
  const isAutoExpired = entry.status === "AUTO_EXPIRED"
  const style = STATUS_STYLES[entry.status] ?? STATUS_STYLES.COMPLETED

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + idx * 0.03 }}
      className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${
        isAutoExpired ? "bg-amber-500/5" : ""
      }`}
    >
      <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground text-xs">
        {date}
      </td>
      <td className="px-4 py-3.5 tabular-nums">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {fmtTime(entry.clockIn)}
        </div>
      </td>
      <td className="px-4 py-3.5 tabular-nums">
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${isAutoExpired ? "bg-amber-500" : "bg-red-400"}`} />
          {fmtTime(entry.clockOut)}
        </div>
      </td>
      <td className="px-4 py-3.5 tabular-nums font-medium">{fmtMins(entry.durationMinutes)}</td>
      <td className="px-4 py-3.5 max-w-48">
        <span className="text-muted-foreground truncate block" title={entry.workSummary ?? "\u2014"}>
          {entry.workSummary ?? "\u2014"}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <PulseBadge color={style.color}>{style.label}</PulseBadge>
      </td>
    </motion.tr>
  )
}

HistoryRow.propTypes = {
  entry: PropTypes.object.isRequired,
  date: PropTypes.string.isRequired,
  idx: PropTypes.number.isRequired,
}

const HistoryTableBody = ({ entries }) => {
  let rowIdx = 0
  return (
    <tbody>
      {entries.map((day) => {
        if (!day.entries?.length) return null
        return day.entries.map((entry) => {
          const idx = rowIdx++
          return <HistoryRow key={entry.id} entry={entry} date={day.date} idx={idx} />
        })
      })}
    </tbody>
  )
}

HistoryTableBody.propTypes = { entries: PropTypes.array.isRequired }

const deriveHistory = (data) => ({
  entries: data?.entries ?? [],
  totalDays: data?.totalDaysWorked ?? 0,
  totalMins: data?.totalWorkMinutes ?? 0,
  avgMins: data?.avgMinutesPerDay ?? 0,
})

const HistoryUI = ({ data, isLoading, year, month, onYearChange, onMonthChange }) => {
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-4">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  const { entries, totalDays, totalMins, avgMins } = deriveHistory(data)

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-5">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="rounded-xl p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"
            >
              <CalendarDays className="h-5 w-5" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <BlurText text="My History" />
              </h1>
              <p className="text-sm text-muted-foreground">View your attendance records</p>
            </div>
          </div>

          <FadeIn delay={0.2} direction="left">
            <div className="flex items-center gap-2">
              <select
                className="h-9 rounded-xl border bg-background px-3 py-1 text-sm transition-colors hover:border-primary/50 focus:border-primary"
                value={month}
                onChange={(e) => onMonthChange(Number(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                className="h-9 rounded-xl border bg-background px-3 py-1 text-sm transition-colors hover:border-primary/50 focus:border-primary"
                value={year}
                onChange={(e) => onYearChange(Number(e.target.value))}
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </FadeIn>
        </div>
      </FadeIn>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label="Days Worked"
          value={String(totalDays)}
          icon={CalendarDays}
          gradient="from-emerald-500 to-green-600"
          delay={0.1}
        />
        <SummaryCard
          label="Total Hours"
          value={fmtMins(totalMins)}
          icon={Clock}
          gradient="from-blue-500 to-indigo-600"
          delay={0.18}
        />
        <SummaryCard
          label="Avg / Day"
          value={fmtMins(avgMins)}
          icon={TrendingUp}
          gradient="from-purple-500 to-violet-600"
          delay={0.26}
        />
      </div>

      {/* Entries Table */}
      <AnimatedCard delay={0.3} className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-500" />
            {MONTHS[month - 1]} {year}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm">No entries for this period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {["Date", "Clock In", "Clock Out", "Duration", "Summary", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <HistoryTableBody entries={entries} />
              </table>
            </div>
          )}
        </CardContent>
      </AnimatedCard>
    </div>
  )
}

HistoryUI.propTypes = {
  data: PropTypes.object,
  isLoading: PropTypes.bool.isRequired,
  year: PropTypes.number.isRequired,
  month: PropTypes.number.isRequired,
  onYearChange: PropTypes.func.isRequired,
  onMonthChange: PropTypes.func.isRequired,
}
HistoryUI.defaultProps = { data: null }

export default HistoryUI
