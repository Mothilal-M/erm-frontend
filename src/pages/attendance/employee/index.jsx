import { useState } from "react"

import { toast } from "@/components/ui/use-toast"
import {
  useAttendanceStatus,
  useClockIn,
  useClockOut,
  useTodayAttendance,
} from "@query/attendance.query"

import ClockUI from "./clock.ui"

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_ERROR_MESSAGE = "Something went wrong."

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AttendanceClock — container that wires queries and mutations for the employee
 * clock-in/out page.
 */
const AttendanceClock = () => {
  const [clockOutDialogOpen, setClockOutDialogOpen] = useState(false)

  const {
    data: status,
    isLoading: statusLoading,
    error: statusError,
  } = useAttendanceStatus()
  const { data: todayData, isLoading: todayLoading } = useTodayAttendance()

  const clockInMutation = useClockIn()
  const clockOutMutation = useClockOut()
  const isMutating = clockInMutation.isPending || clockOutMutation.isPending

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

  if (statusError) {
    toast({
      title: "Error",
      description: "Failed to load attendance status.",
      variant: "destructive",
    })
  }

  return (
    <ClockUI
      status={status}
      statusLoading={statusLoading}
      todayData={todayData}
      todayLoading={todayLoading}
      clockOutDialogOpen={clockOutDialogOpen}
      isMutating={isMutating}
      onClockIn={handleClockIn}
      onOpenClockOutDialog={() => setClockOutDialogOpen(true)}
      onCloseClockOutDialog={() => setClockOutDialogOpen(false)}
      onClockOutConfirm={handleClockOutConfirm}
    />
  )
}

export default AttendanceClock
