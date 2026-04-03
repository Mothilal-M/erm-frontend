import { motion } from "framer-motion"
import { Activity } from "lucide-react"
import PropTypes from "prop-types"
import { useMemo, useRef } from "react"

import AnimatedCard from "@/components/magicui/animated-card"
import BlurText from "@/components/magicui/blur-text"
import FadeIn from "@/components/magicui/fade-in"
import NumberTicker from "@/components/magicui/number-ticker"
import PulseBadge from "@/components/magicui/pulse-badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Duration in minutes → "Xh Ym" string.
 * @param {number|null} minutes - Duration in minutes to format.
 * @returns {string} Formatted duration string.
 */
const formatDuration = (minutes) => {
  if (minutes == null) return "—"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const statusBadge = (status) => {
  const map = {
    IN_PROGRESS: "default",
    COMPLETED: "secondary",
    AUTO_EXPIRED: "outline",
    EDITED: "secondary",
    MANUAL: "secondary",
    FLAGGED: "destructive",
    NOT_CLOCKED: "red",
  }

  if (status === "NOT_CLOCKED") {
    return <PulseBadge color="red">NOT_CLOCKED</PulseBadge>
  }

  return (
    <PulseBadge color={map[status] === "destructive" ? "red" : "blue"}>
      {status}
    </PulseBadge>
  )
}

/**
 * LiveRow — one row of the live status table.
 * @param {object} props - Component props.
 * @param {object} props.entry - Attendance entry data.
 * @param {number} props.index - Row index for stagger animation.
 */
const LiveRow = ({ entry, index = 0 }) => {
  const clockedInAt = useMemo(
    () => new Date(entry.clockedInAt),
    [entry.clockedInAt]
  )

  // Calculate elapsed time on each render - this is intentional as we want
  // the time to update on each render cycle without external dependencies

  const elapsedMinutes = Math.floor(
    // eslint-disable-next-line react-hooks/purity
    (Date.now() - clockedInAt.getTime()) / 60000
  )

  const rowClassName = entry.willAutoExpire
    ? "bg-amber-50 dark:bg-amber-950/30"
    : ""

  return (
    <motion.tr
      className={rowClassName}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      <td className="px-3 py-2 text-sm font-medium">{entry.employeeName}</td>
      <td className="px-3 py-2 text-sm text-muted-foreground">
        {entry.department ?? "—"}
      </td>
      <td className="px-3 py-2 text-sm">{clockedInAt.toLocaleTimeString()}</td>
      <td className="px-3 py-2 text-sm">{formatDuration(elapsedMinutes)}</td>
      <td className="px-3 py-2 text-sm">
        {entry.willAutoExpire ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <PulseBadge color="amber">Expiring soon</PulseBadge>
              </TooltipTrigger>
              <TooltipContent>
                Auto-expiry in ~{Math.ceil((entry.expiresInSeconds ?? 0) / 60)}{" "}
                min
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
    </motion.tr>
  )
}

LiveRow.propTypes = {
  entry: PropTypes.shape({
    employeeId: PropTypes.number,
    employeeName: PropTypes.string,
    department: PropTypes.string,
    clockedInAt: PropTypes.string,
    willAutoExpire: PropTypes.bool,
    expiresInSeconds: PropTypes.number,
  }).isRequired,
  index: PropTypes.number,
}

/**
 * AdminLiveUI — presenter for the admin live attendance status page.
 * @param {object} props - Component props.
 * @param {object} [props.liveData] - Live attendance data object.
 * @param {boolean} [props.isLoading] - Loading state indicator.
 */
const AdminLiveUI = ({ liveData, isLoading }) => {
  const active = liveData?.active ?? []
  const notClocked = liveData?.notClocked ?? []
  // eslint-disable-next-line react-hooks/purity
  const skeletonIdReference = useRef(`skeleton-${Date.now()}`)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Page header */}
      <FadeIn delay={0} duration={0.5} direction="up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <BlurText
                text="Live Attendance"
                className="text-xl font-semibold"
                delay={0.1}
              />
              <p className="text-sm text-muted-foreground">
                Real-time view of who is currently clocked in. Refreshes every
                30 s.
              </p>
            </div>
          </div>
          {!isLoading && (
            <PulseBadge color="emerald">
              <NumberTicker
                value={active.length}
                className="font-semibold"
                duration={0.8}
                delay={0.3}
              />{" "}
              clocked in
            </PulseBadge>
          )}
        </div>
      </FadeIn>

      <Separator />

      {/* Clocked-in table */}
      <AnimatedCard
        delay={0.15}
        className="rounded-xl border-0 shadow-sm"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Currently Clocked In</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Employee</th>
                  <th className="px-3 py-2 font-medium">Department</th>
                  <th className="px-3 py-2 font-medium">Clocked In At</th>
                  <th className="px-3 py-2 font-medium">Duration</th>
                  <th className="px-3 py-2 font-medium">Expiry Warning</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => {
                    const rowId = `${skeletonIdReference.current}-${index}`
                    return (
                      <tr key={rowId}>
                        {Array.from({ length: 5 }).map((__, cellIndex) => {
                          return (
                            <td
                              // eslint-disable-next-line react/no-array-index-key
                              key={`${rowId}-${cellIndex}`}
                              className="px-3 py-2"
                            >
                              <Skeleton className="h-4 w-24" />
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })
                ) : active.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-sm text-muted-foreground"
                    >
                      No employees are currently clocked in.
                    </td>
                  </tr>
                ) : (
                  active.map((entry, index) => (
                    <LiveRow
                      key={entry.employeeId}
                      entry={entry}
                      index={index}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Not clocked in */}
      {!isLoading && notClocked.length > 0 && (
        <AnimatedCard
          delay={0.3}
          className="rounded-xl border-0 shadow-sm"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">
              Not Clocked In Today
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Employee</th>
                    <th className="px-3 py-2 font-medium">Department</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {notClocked.map((emp, index) => (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: index * 0.05,
                        ease: [0.25, 0.4, 0.25, 1],
                      }}
                    >
                      <td className="px-3 py-2 text-sm">{emp.name}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">
                        {emp.department ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        {statusBadge("NOT_CLOCKED")}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </AnimatedCard>
      )}
    </div>
  )
}

AdminLiveUI.propTypes = {
  liveData: PropTypes.shape({
    active: PropTypes.array,
    notClocked: PropTypes.array,
  }),
  isLoading: PropTypes.bool,
}

AdminLiveUI.defaultProps = {
  liveData: null,
  isLoading: false,
}

export default AdminLiveUI
