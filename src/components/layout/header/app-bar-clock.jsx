import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import ClockOutDialog from "@/pages/attendance/employee/components/clock-out-dialog"
import {
  useAttendanceStatus,
  useClockIn,
  useClockOut,
} from "@query/attendance.query"

const DEFAULT_ERROR_MESSAGE = "Something went wrong."

const formatElapsed = (seconds) => {
  if (!seconds || seconds <= 0) return "0m"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

/**
 * AppBarClock — compact clock-in/out button for the app bar.
 * Handles clock-in directly and shows the clock-out dialog for work summary.
 */
const AppBarClock = () => {
  const [clockOutDialogOpen, setClockOutDialogOpen] = useState(false)
  const [liveElapsed, setLiveElapsed] = useState(0)

  const { data: status, isLoading } = useAttendanceStatus()
  const clockInMutation = useClockIn()
  const clockOutMutation = useClockOut()

  const isMutating = clockInMutation.isPending || clockOutMutation.isPending
  const isClocked = status?.isClocked ?? false
  const clockedInAt = status?.clockedInAt ?? null

  useEffect(() => {
    if (!isClocked || !clockedInAt) {
      setLiveElapsed(0)
      return
    }

    const update = () => {
      const diff = Math.floor(
        (Date.now() - new Date(clockedInAt).getTime()) / 1000,
      )
      setLiveElapsed(diff)
    }

    update()
    const interval = setInterval(update, 1000)
    // eslint-disable-next-line consistent-return
    return () => clearInterval(interval)
  }, [isClocked, clockedInAt])

  const handleClockIn = () => {
    clockInMutation.mutate(
      { deviceInfo: navigator.userAgent },
      {
        onSuccess: () => {
          toast({
            title: "Clocked in",
            description: "Your session has started. Good luck!",
          })
        },
        onError: (error) => {
          toast({
            title: "Clock-in failed",
            description: error?.response?.data?.detail ?? DEFAULT_ERROR_MESSAGE,
            variant: "destructive",
          })
        },
      },
    )
  }

  const handleClockOutConfirm = ({ workSummary }) => {
    clockOutMutation.mutate(
      { workSummary },
      {
        onSuccess: () => {
          setClockOutDialogOpen(false)
          toast({
            title: "Clocked out",
            description: "Great work today! Your summary was saved.",
          })
        },
        onError: (error) => {
          toast({
            title: "Clock-out failed",
            description: error?.response?.data?.detail ?? DEFAULT_ERROR_MESSAGE,
            variant: "destructive",
          })
        },
      },
    )
  }

  if (isLoading) return null

  return (
    <>
      {isClocked ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium tabular-nums text-muted-foreground">
            {formatElapsed(liveElapsed)}
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setClockOutDialogOpen(true)}
            disabled={isMutating}
          >
            🔴 Clock Out
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="default"
          onClick={handleClockIn}
          disabled={isMutating}
        >
          🟢 Clock In
        </Button>
      )}
      <ClockOutDialog
        open={clockOutDialogOpen}
        onClose={() => setClockOutDialogOpen(false)}
        onConfirm={handleClockOutConfirm}
        isLoading={clockOutMutation.isPending}
      />
    </>
  )
}

export default AppBarClock
