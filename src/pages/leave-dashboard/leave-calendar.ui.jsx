import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  Loader2,
  UserX,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react"
import PropTypes from "prop-types"

import {
  AnimatedCard,
  BlurText,
  FadeIn,
  NumberTicker,
  PulseBadge,
} from "@/components/magicui"
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/magicui/stagger-container"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/* eslint-disable complexity, react/no-array-index-key, max-lines-per-function */

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const getDayColorClass = (record) => {
  if (record.isWeekend) return "bg-muted/30 border-muted"
  const presentPct = record.present / record.total
  if (presentPct >= 0.85)
    return "bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20"
  if (presentPct >= 0.7)
    return "bg-yellow-500/10 border-yellow-500/25 hover:bg-yellow-500/20"
  return "bg-red-500/10 border-red-500/25 hover:bg-red-500/20"
}

const AttendanceBar = ({ present, leaveCount, total }) => {
  if (total === 0) return null
  const presentW = Math.round((present / total) * 100)
  const leaveW = Math.round((leaveCount / total) * 100)
  const absentW = 100 - presentW - leaveW
  return (
    <div className="flex w-full h-1.5 rounded-full overflow-hidden mt-1.5 gap-px">
      <div
        className="bg-emerald-500 rounded-l-full transition-all"
        style={{ width: `${presentW}%` }}
      />
      <div
        className="bg-amber-400 transition-all"
        style={{ width: `${leaveW}%` }}
      />
      <div
        className="bg-red-500 rounded-r-full transition-all"
        style={{ width: `${absentW}%` }}
      />
    </div>
  )
}
AttendanceBar.propTypes = {
  present: PropTypes.number.isRequired,
  leaveCount: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
}

/* ---- Stat Card ---- */
const StatCard = ({ label, value, gradient, icon: Icon }) => (
  <AnimatedCard className="border-0 shadow-sm">
    <CardContent className="flex items-center gap-3 p-4">
      <div
        className={`rounded-xl p-2.5 bg-gradient-to-br ${gradient} text-white shadow-md`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold leading-none mt-0.5 tabular-nums">
          <NumberTicker value={value} />
        </p>
      </div>
    </CardContent>
  </AnimatedCard>
)
StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  gradient: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
}

const initials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

/* ---- Day Detail Sheet ---- */
const EmployeeRow = ({ emp, colorScheme }) => {
  const colorMap = {
    emerald: {
      bg: "bg-emerald-500/5 border-emerald-500/15 hover:bg-emerald-500/10",
      avatar:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    },
    amber: {
      bg: "bg-amber-500/5 border-amber-500/15 hover:bg-amber-500/10",
      avatar:
        "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    },
    red: {
      bg: "bg-red-500/5 border-red-500/15 hover:bg-red-500/10",
      avatar: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    },
  }
  const colors = colorMap[colorScheme] ?? colorMap.emerald

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-3 rounded-xl border ${colors.bg} transition-colors`}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={`text-xs font-semibold ${colors.avatar}`}>
          {initials(emp.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{emp.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {emp.department}
        </p>
      </div>
      {emp.checkIn && (
        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
          <Clock className="h-3 w-3" />
          {emp.checkIn}
        </div>
      )}
      {emp.leaveType && (
        <Badge
          variant="outline"
          className="text-[10px] shrink-0 border-amber-400/40 text-amber-600 dark:text-amber-400"
        >
          {emp.leaveType}
        </Badge>
      )}
      {!emp.checkIn && !emp.leaveType && (
        <UserX className="h-4 w-4 text-red-400 shrink-0" />
      )}
    </motion.div>
  )
}
EmployeeRow.propTypes = {
  emp: PropTypes.object.isRequired,
  colorScheme: PropTypes.string.isRequired,
}

const DayDetailSheet = ({ open, onClose, date, dayDetail, isLoading }) => {
  const formatted = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : ""

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b shrink-0">
          <SheetTitle className="text-base font-bold">{formatted}</SheetTitle>
          {isLoading ? (
            <div className="flex gap-2 mt-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          ) : dayDetail ? (
            <div className="flex gap-2 flex-wrap mt-1">
              <PulseBadge color="emerald">
                {dayDetail.summary.present} Present
              </PulseBadge>
              <PulseBadge color="amber">
                {dayDetail.summary.onLeave} On Leave
              </PulseBadge>
              <PulseBadge color="red">
                {dayDetail.summary.absent} Absent
              </PulseBadge>
            </div>
          ) : null}
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="present" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-5 mt-4 grid grid-cols-3 shrink-0 rounded-xl">
              <TabsTrigger
                value="present"
                className="gap-1.5 text-xs rounded-lg"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Present ({dayDetail?.present?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="leave" className="gap-1.5 text-xs rounded-lg">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Leave ({dayDetail?.onLeave?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger
                value="absent"
                className="gap-1.5 text-xs rounded-lg"
              >
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Absent ({dayDetail?.absent?.length ?? 0})
              </TabsTrigger>
            </TabsList>

            {[
              {
                key: "present",
                data: dayDetail?.present,
                color: "emerald",
                emptyLabel: "No employees present",
              },
              {
                key: "leave",
                data: dayDetail?.onLeave,
                color: "amber",
                emptyLabel: "Nobody on leave",
              },
              {
                key: "absent",
                data: dayDetail?.absent,
                color: "red",
                emptyLabel: "No absences recorded",
              },
            ].map(({ key, data, color, emptyLabel }) => (
              <TabsContent
                key={key}
                value={key}
                className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden"
              >
                <ScrollArea className="h-full px-5 py-4">
                  <div className="space-y-2">
                    {data?.map((emp) => (
                      <EmployeeRow key={emp.id} emp={emp} colorScheme={color} />
                    ))}
                    {!data?.length && (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                        <Users className="h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm">{emptyLabel}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  )
}

DayDetailSheet.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  dayDetail: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

/* ---- Main Calendar UI ---- */
const LeaveCalendarUI = ({
  year,
  month,
  data,
  isLoading,
  isError,
  onPrevMonth,
  onNextMonth,
  canGoNext,
  selectedDate,
  dayDetail,
  isDayLoading,
  onDayClick,
  onSheetClose,
}) => {
  const today = new Date()
  const [todayString] = today.toISOString().split("T")

  const computeMonthTotals = (records) =>
    (records ?? []).reduce(
      (acc, r) => {
        if (!r.isWeekend) {
          acc.present += r.present
          acc.absent += r.absent
          acc.onLeave += r.onLeave
          acc.workdays += 1
        }
        return acc
      },
      { present: 0, absent: 0, onLeave: 0, workdays: 0 },
    )

  const monthTotals = computeMonthTotals(data?.records)

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const recordMap = Object.fromEntries(
    (data?.records ?? []).map((r) => [r.date, r]),
  )
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const gridCells = []
  for (let i = 0; i < firstDayOfWeek; i++) gridCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    gridCells.push(
      recordMap[dateStr] ?? {
        date: dateStr,
        isWeekend: false,
        present: 0,
        absent: 0,
        onLeave: 0,
        total: 0,
      },
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <p>Failed to load attendance data. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1200px] mx-auto">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <BlurText text="Leave & Attendance Calendar" />
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Click any weekday to see who&apos;s present, on leave, or absent.
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total Employees",
              value: data?.totalEmployees ?? 0,
              gradient: "from-blue-500 to-indigo-600",
              icon: Users,
            },
            {
              label: "Avg. Present / Day",
              value: monthTotals.workdays
                ? Math.round(monthTotals.present / monthTotals.workdays)
                : 0,
              gradient: "from-emerald-500 to-green-600",
              icon: Users,
            },
            {
              label: "Avg. On Leave / Day",
              value: monthTotals.workdays
                ? Math.round(monthTotals.onLeave / monthTotals.workdays)
                : 0,
              gradient: "from-amber-500 to-orange-500",
              icon: Users,
            },
            {
              label: "Avg. Absent / Day",
              value: monthTotals.workdays
                ? Math.round(monthTotals.absent / monthTotals.workdays)
                : 0,
              gradient: "from-red-500 to-rose-600",
              icon: Users,
            },
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <StatCard {...stat} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Calendar */}
      <AnimatedCard delay={0.2} className="border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] bg-white overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6 border-b border-gray-50/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const now = new Date()
                  if (now.getMonth() !== month || now.getFullYear() !== year) {
                    // We don't have a direct "go to today" prop, but we could trigger month changes if we implemented it.
                    // For now, it just acts as a UI element or triggers next/prev until we reach today.
                  }
                }}
                className="px-4 py-2 text-sm font-medium bg-gray-50/80 hover:bg-gray-100 text-gray-700 rounded-full transition-colors"
              >
                Today
              </button>
              
              <div className="flex items-center bg-gray-50/80 rounded-full p-1 border border-gray-100/50">
                <button
                  onClick={onPrevMonth}
                  className="p-1.5 rounded-full hover:bg-white hover:shadow-sm text-gray-500 transition-all"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <button
                  onClick={onNextMonth}
                  disabled={!canGoNext}
                  className="p-1.5 rounded-full hover:bg-white hover:shadow-sm text-gray-500 transition-all disabled:opacity-30"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 ml-2 flex items-center gap-2 cursor-pointer">
                {MONTH_NAMES[month]} {year}
                <span className="text-xs text-gray-400">▼</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full border border-gray-100 hover:bg-gray-50 text-gray-500 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              </button>
              <button className="px-4 py-2 text-sm font-medium border border-gray-100 hover:bg-gray-50 text-gray-700 rounded-full transition-colors flex items-center gap-2">
                Month <span className="text-[10px] text-gray-400">▼</span>
              </button>
              <button className="px-5 py-2.5 text-sm font-semibold bg-[#FFC516] hover:bg-[#F2B900] text-black rounded-full transition-colors shadow-sm flex items-center gap-1.5">
                <span>+</span> Add Event
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 bg-[#FAFAFA]/50">
          <div className="grid grid-cols-7 mb-3">
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-left pl-3 text-xs font-semibold text-gray-500 pb-2"
              >
                {label}
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-28 md:h-36 rounded-2xl bg-white border border-gray-100 shadow-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-3">
              {gridCells.map((record, index) => {
                if (!record)
                  return <div key={`empty-${index}`} className="h-28 md:h-36" />

                const dayNumber = parseInt(record.date.split("-")[2])
                const isToday = record.date === todayString
                const isSelected = record.date === selectedDate
                const isClickable = !record.isWeekend && record.total > 0
                
                // Hatched pattern for weekends
                const weekendStyle = record.isWeekend ? {
                  backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, #f3f4f6 4px, #f3f4f6 5px)',
                  backgroundColor: '#fcfcfc'
                } : { backgroundColor: '#ffffff' }

                return (
                  <motion.div
                    key={record.date}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.005 * index, duration: 0.2 }}
                    whileHover={isClickable ? { y: -2, zIndex: 10 } : {}}
                    whileTap={isClickable ? { scale: 0.98 } : {}}
                    onClick={() => isClickable && onDayClick(record)}
                    style={weekendStyle}
                    className={`
                      relative rounded-2xl p-2.5 md:p-3 h-28 md:h-36 flex flex-col transition-all overflow-hidden
                      border border-gray-100 shadow-sm
                      ${isToday ? "ring-1 ring-emerald-500/30" : ""}
                      ${isSelected ? "ring-2 ring-primary shadow-md" : ""}
                      ${isClickable ? "cursor-pointer hover:shadow-md hover:border-gray-200" : "cursor-default opacity-80"}
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`text-sm font-medium ${
                          isToday
                            ? "text-white bg-indigo-500 w-6 h-6 flex items-center justify-center rounded-full shadow-sm"
                            : record.isWeekend
                              ? "text-gray-400"
                              : "text-gray-700"
                        }`}
                      >
                        {dayNumber}
                      </span>
                    </div>

                    {!record.isWeekend && record.total > 0 && (
                      <div className="mt-1 space-y-1.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        {record.present > 0 && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100/50 w-fit max-w-full">
                            <span className="text-[10px]">🟢</span>
                            <span className="text-[10px] font-medium text-emerald-700 truncate">
                              {record.present} Present
                            </span>
                          </div>
                        )}
                        {record.onLeave > 0 && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-100/50 w-fit max-w-full">
                            <span className="text-[10px]">🏖️</span>
                            <span className="text-[10px] font-medium text-amber-700 truncate">
                              {record.onLeave} On Leave
                            </span>
                          </div>
                        )}
                        {record.absent > 0 && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 border border-red-100/50 w-fit max-w-full">
                            <span className="text-[10px]">🚨</span>
                            <span className="text-[10px] font-medium text-red-700 truncate">
                              {record.absent} Absent
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </AnimatedCard>

      {/* Attendance Guide */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        {[
          {
            emoji: "🟢",
            title: "High Attendance",
            desc: "85%+ of employees present",
            gradient: "from-emerald-500/10 to-emerald-500/5",
            border: "border-emerald-500/20",
            textColor: "text-emerald-700 dark:text-emerald-400",
          },
          {
            emoji: "🟡",
            title: "Moderate Attendance",
            desc: "70-84% of employees present",
            gradient: "from-yellow-500/10 to-yellow-500/5",
            border: "border-yellow-500/20",
            textColor: "text-yellow-700 dark:text-yellow-400",
          },
          {
            emoji: "🔴",
            title: "Low Attendance",
            desc: "Below 70% of employees present",
            gradient: "from-red-500/10 to-red-500/5",
            border: "border-red-500/20",
            textColor: "text-red-700 dark:text-red-400",
          },
        ].map(({ emoji, title, desc, gradient, border, textColor }) => (
          <StaggerItem key={title}>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className={`flex items-start gap-2 p-3.5 rounded-xl bg-gradient-to-br ${gradient} border ${border}`}
            >
              <span className="text-lg mt-0.5">{emoji}</span>
              <div>
                <p className={`font-semibold ${textColor}`}>{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Day Detail Sheet */}
      <DayDetailSheet
        open={Boolean(selectedDate)}
        onClose={onSheetClose}
        date={selectedDate}
        dayDetail={dayDetail}
        isLoading={isDayLoading}
      />
    </div>
  )
}

LeaveCalendarUI.propTypes = {
  year: PropTypes.number.isRequired,
  month: PropTypes.number.isRequired,
  data: PropTypes.shape({
    totalEmployees: PropTypes.number,
    records: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string,
        isWeekend: PropTypes.bool,
        present: PropTypes.number,
        onLeave: PropTypes.number,
        total: PropTypes.number,
      }),
    ),
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  onPrevMonth: PropTypes.func.isRequired,
  onNextMonth: PropTypes.func.isRequired,
  canGoNext: PropTypes.bool.isRequired,
  selectedDate: PropTypes.string.isRequired,
  dayDetail: PropTypes.object.isRequired,
  isDayLoading: PropTypes.bool.isRequired,
  onDayClick: PropTypes.func.isRequired,
  onSheetClose: PropTypes.func.isRequired,
}

export default LeaveCalendarUI
