import { motion, AnimatePresence } from "framer-motion"
import { Timer, LogIn, LogOut, Zap } from "lucide-react"
import PropTypes from "prop-types"

import { PulseBadge, ShimmerButton } from "@/components/magicui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const pad = (n) => String(n).padStart(2, "0")

const formatElapsed = (seconds) => {
  if (!seconds || seconds <= 0) return "0m"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${pad(m)}m`
  return `${m}m`
}

const formatMinutes = (minutes) => {
  if (!minutes || minutes <= 0) return "0m"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}h ${pad(m)}m`
  return `${m}m`
}

/* ---- Animated Clock Ring ---- */
const ClockRing = ({ progress, isActive }) => {
  const r = 70
  const circumference = 2 * Math.PI * r
  const filled = Math.min(progress, 1) * circumference

  return (
    <div className="relative flex items-center justify-center w-44 h-44">
      <svg className="-rotate-90" width="176" height="176">
        <circle
          cx="88"
          cy="88"
          r={r}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted/20"
        />
        <motion.circle
          cx="88"
          cy="88"
          r={r}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
          className={isActive ? "text-emerald-500" : "text-muted-foreground/30"}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - filled }}
          transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
        />
      </svg>
      {/* Inner glow when active */}
      {isActive && (
        <motion.div
          className="absolute inset-6 rounded-full bg-emerald-500/5"
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <div className="absolute flex flex-col items-center">
        <Timer
          className={`h-5 w-5 mb-1 ${isActive ? "text-emerald-500" : "text-muted-foreground"}`}
        />
        <span className="text-3xl font-bold tabular-nums tracking-tight">
          {isActive ? formatElapsed(progress * 8 * 3600) : "—"}
        </span>
      </div>
    </div>
  )
}

ClockRing.propTypes = {
  progress: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
}

/* ---- Clocked In Body ---- */
const ClockedInBody = ({
  elapsed,
  clockedInAt,
  willAutoExpire,
  isMutating,
  onClockOut,
}) => {
  const progress = Math.min(elapsed / (8 * 3600), 1) // 8h workday
  const r = 70
  const circumference = 2 * Math.PI * r
  const filled = progress * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5"
    >
      {/* Animated ring */}
      <div className="relative flex items-center justify-center w-44 h-44">
        <svg className="-rotate-90" width="176" height="176">
          <circle
            cx="88"
            cy="88"
            r={r}
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-muted/20"
          />
          <motion.circle
            cx="88"
            cy="88"
            r={r}
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeLinecap="round"
            className="text-emerald-500"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - filled }}
            transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
          />
        </svg>
        <motion.div
          className="absolute inset-6 rounded-full bg-emerald-500/5"
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute flex flex-col items-center">
          <Timer className="h-5 w-5 mb-1 text-emerald-500" />
          <span className="text-3xl font-bold tabular-nums tracking-tight">
            {formatElapsed(elapsed)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <PulseBadge color="emerald">
          {clockedInAt ? `Since ${clockedInAt}` : "Clocked In"}
        </PulseBadge>
        {willAutoExpire && (
          <PulseBadge color="amber">
            <Zap className="h-3 w-3" /> Expiring soon
          </PulseBadge>
        )}
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full"
      >
        <Button
          variant="destructive"
          size="lg"
          className="w-full text-base rounded-xl shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-shadow"
          onClick={onClockOut}
          disabled={isMutating}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isMutating ? "Clocking out..." : "Clock Out"}
        </Button>
      </motion.div>
    </motion.div>
  )
}

ClockedInBody.propTypes = {
  elapsed: PropTypes.number.isRequired,
  clockedInAt: PropTypes.string,
  willAutoExpire: PropTypes.bool,
  isMutating: PropTypes.bool.isRequired,
  onClockOut: PropTypes.func.isRequired,
}
ClockedInBody.defaultProps = { clockedInAt: null, willAutoExpire: false }

/* ---- Clocked Out Body ---- */
const ClockedOutBody = ({ todayMinutes, isMutating, onClockIn }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center gap-5"
  >
    {/* Idle ring */}
    <div className="relative flex items-center justify-center w-44 h-44">
      <svg className="-rotate-90" width="176" height="176">
        <circle
          cx="88"
          cy="88"
          r="70"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted/20"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <Timer className="h-5 w-5 mb-1 text-muted-foreground/50" />
        <span className="text-3xl font-bold tabular-nums tracking-tight text-muted-foreground">
          {formatMinutes(todayMinutes)}
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          {todayMinutes > 0 ? "worked today" : "no sessions"}
        </span>
      </div>
    </div>

    <PulseBadge color="blue">Not Clocked In</PulseBadge>

    <ShimmerButton
      className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500"
      onClick={onClockIn}
      disabled={isMutating}
    >
      <LogIn className="h-4 w-4" />
      {isMutating ? "Clocking in..." : "Clock In"}
    </ShimmerButton>
  </motion.div>
)

ClockedOutBody.propTypes = {
  todayMinutes: PropTypes.number.isRequired,
  isMutating: PropTypes.bool.isRequired,
  onClockIn: PropTypes.func.isRequired,
}

const deriveState = (status) => {
  if (!status) {
    return {
      isClocked: false,
      elapsed: 0,
      todayMinutes: 0,
      clockedInAt: null,
      willAutoExpire: false,
    }
  }
  const clockedInAt = status.clockedInAt
    ? new Date(status.clockedInAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null
  return {
    isClocked: status.isClocked ?? false,
    elapsed: status.elapsedSeconds ?? 0,
    todayMinutes: status.todayTotalMinutes ?? 0,
    clockedInAt,
    willAutoExpire: status.willAutoExpire ?? false,
  }
}

const ClockCard = ({
  status,
  isLoading,
  onClockIn,
  onClockOut,
  isMutating,
}) => {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 flex flex-col items-center gap-4">
          <Skeleton className="h-44 w-44 rounded-full" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  const { isClocked, elapsed, todayMinutes, clockedInAt, willAutoExpire } =
    deriveState(status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <Card
        className={`border-0 shadow-sm overflow-hidden ${
          isClocked ? "bg-gradient-to-b from-emerald-500/5 to-transparent" : ""
        }`}
      >
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {isClocked ? (
              <ClockedInBody
                key="clocked-in"
                elapsed={elapsed}
                clockedInAt={clockedInAt}
                willAutoExpire={willAutoExpire}
                isMutating={isMutating}
                onClockOut={onClockOut}
              />
            ) : (
              <ClockedOutBody
                key="clocked-out"
                todayMinutes={todayMinutes}
                isMutating={isMutating}
                onClockIn={onClockIn}
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

ClockCard.propTypes = {
  status: PropTypes.shape({
    isClocked: PropTypes.bool,
    clockedInAt: PropTypes.string,
    elapsedSeconds: PropTypes.number,
    expiresInSeconds: PropTypes.number,
    willAutoExpire: PropTypes.bool,
    todayTotalMinutes: PropTypes.number,
  }),
  isLoading: PropTypes.bool.isRequired,
  onClockIn: PropTypes.func.isRequired,
  onClockOut: PropTypes.func.isRequired,
  isMutating: PropTypes.bool,
}
ClockCard.defaultProps = { status: null, isMutating: false }

export default ClockCard
