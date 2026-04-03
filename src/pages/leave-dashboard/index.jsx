import { useEffect, useState } from "react"

import { toast } from "@/components/ui/use-toast"
import {
  useFetchAttendanceDayDetail,
  useFetchMonthlyAttendance,
} from "@query/leave.query"

import LeaveCalendarUI from "./leave-calendar.ui"

/**
 * LeaveCalendar container — manages month navigation, fetches attendance data,
 * and controls the day-detail sheet (opened on calendar day click).
 */
const LeaveCalendar = () => {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)

  const { data, isLoading, isError, error } = useFetchMonthlyAttendance(
    year,
    month,
  )

  const { data: dayDetail, isLoading: isDayLoading } =
    useFetchAttendanceDayDetail(selectedDate)

  const handlePreviousMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    const now = new Date()
    const isCurrentOrFuture =
      year > now.getFullYear() ||
      (year === now.getFullYear() && month >= now.getMonth())
    if (isCurrentOrFuture) return

    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const canGoNext = (() => {
    const now = new Date()
    return !(
      year > now.getFullYear() ||
      (year === now.getFullYear() && month >= now.getMonth())
    )
  })()

  const handleDayClick = (record) => {
    if (record.isWeekend || record.total === 0) return
    setSelectedDate(record.date)
  }

  const handleSheetClose = () => setSelectedDate(null)

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load attendance data.",
        variant: "destructive",
      })
    }
  }, [error])

  return (
    <LeaveCalendarUI
      year={year}
      month={month}
      data={data}
      isLoading={isLoading}
      isError={isError}
      onPrevMonth={handlePreviousMonth}
      onNextMonth={handleNextMonth}
      canGoNext={canGoNext}
      selectedDate={selectedDate}
      dayDetail={dayDetail}
      isDayLoading={isDayLoading}
      onDayClick={handleDayClick}
      onSheetClose={handleSheetClose}
    />
  )
}

export default LeaveCalendar
