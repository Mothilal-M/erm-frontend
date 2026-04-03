import { motion } from "framer-motion"
import { Clock, AlertTriangle } from "lucide-react"
import PropTypes from "prop-types"

import { AnimatedCard, PulseBadge } from "@/components/magicui"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const fmtTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "\u2014"

const fmtDuration = (mins) => {
  if (!mins) return "\u2014"
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const STATUS_STYLES = {
  IN_PROGRESS: { color: "emerald", label: "In Progress" },
  COMPLETED: { color: "blue", label: "Completed" },
  AUTO_EXPIRED: { color: "amber", label: "Auto-Expired" },
  EDITED: { color: "purple", label: "Edited" },
  MANUAL: { color: "indigo", label: "Manual" },
}

const SessionRow = ({ entry, index }) => {
  const isAutoExpired = entry.status === "AUTO_EXPIRED"
  const style = STATUS_STYLES[entry.status] ?? STATUS_STYLES.COMPLETED

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.06 }}
      className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${
        isAutoExpired ? "bg-amber-500/5" : ""
      }`}
    >
      <td className="px-4 py-3.5 tabular-nums">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {fmtTime(entry.clockIn)}
        </div>
      </td>
      <td className="px-4 py-3.5 tabular-nums">
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${isAutoExpired ? "bg-amber-500" : "bg-red-400"}`} />
          {isAutoExpired ? (
            <span className="text-amber-600 dark:text-amber-400">{fmtTime(entry.clockOut)}</span>
          ) : (
            fmtTime(entry.clockOut)
          )}
        </div>
      </td>
      <td className="px-4 py-3.5 tabular-nums font-medium">{fmtDuration(entry.durationMinutes)}</td>
      <td className="px-4 py-3.5 max-w-xs">
        {entry.workSummary ? (
          <span className="text-muted-foreground truncate block max-w-50" title={entry.workSummary}>
            {entry.workSummary}
          </span>
        ) : (
          <span className="text-muted-foreground/40 italic text-xs">\u2014</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <PulseBadge color={style.color}>{style.label}</PulseBadge>
        {isAutoExpired && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
            <AlertTriangle className="h-2.5 w-2.5" /> Auto-closed after 4h
          </p>
        )}
      </td>
    </motion.tr>
  )
}

SessionRow.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.number,
    clockIn: PropTypes.string,
    clockOut: PropTypes.string,
    durationMinutes: PropTypes.number,
    workSummary: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
}

const SessionTable = ({ todayData, isLoading }) => {
  if (isLoading) {
    return (
      <AnimatedCard delay={0.2} className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Sessions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </AnimatedCard>
    )
  }

  const entries = todayData?.entries ?? []

  return (
    <AnimatedCard delay={0.2} className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            Today&apos;s Sessions
          </CardTitle>
          {todayData?.hasAutoExpiredEntry && (
            <PulseBadge color="amber">
              <AlertTriangle className="h-3 w-3" /> Auto-expired entry
            </PulseBadge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <Clock className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm">No sessions recorded today.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {["Clock In", "Clock Out", "Duration", "Work Summary", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <SessionRow key={entry.id} entry={entry} index={idx} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </AnimatedCard>
  )
}

SessionTable.propTypes = {
  todayData: PropTypes.shape({ entries: PropTypes.array, hasAutoExpiredEntry: PropTypes.bool }),
  isLoading: PropTypes.bool,
}
SessionTable.defaultProps = { todayData: null, isLoading: false }

export default SessionTable
