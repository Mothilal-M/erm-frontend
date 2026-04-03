import { motion } from "framer-motion"
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Flag,
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
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Format minutes to "Xh Ym" string.
 * @param {number|null} minutes - Total minutes to format.
 * @returns {string} Formatted duration string.
 */
const formatDuration = (minutes) => {
  if (minutes == null) return "\u2014"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const colorMap = {
  green: "text-green-600 dark:text-green-400",
  amber: "text-amber-600 dark:text-amber-400",
  red: "text-red-600 dark:text-red-400",
  blue: "text-blue-600 dark:text-blue-400",
  default: "text-foreground",
}

const iconMap = {
  green: CheckCircle2,
  amber: AlertTriangle,
  red: Users,
  blue: Flag,
  default: BarChart3,
}

const gradientMap = {
  green: "from-green-500 to-emerald-600",
  amber: "from-amber-500 to-orange-600",
  red: "from-red-500 to-rose-600",
  blue: "from-blue-500 to-indigo-600",
  default: "from-gray-500 to-gray-600",
}

/**
 * Stat card widget.
 * @param {object} props - Component props.
 * @param {string} props.title - Card title.
 * @param {string|number} props.value - Displayed value.
 * @param {string} props.variant - Color variant key.
 */
const StatCard = ({ title, value, variant }) => {
  const Icon = iconMap[variant ?? "default"]
  const gradient = gradientMap[variant ?? "default"]
  const numericValue = typeof value === "number" ? value : null

  return (
    <AnimatedCard className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-sm`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {numericValue !== null ? (
          <NumberTicker
            value={numericValue}
            className={`text-3xl font-bold ${colorMap[variant ?? "default"]}`}
            duration={1}
          />
        ) : (
          <span
            className={`text-3xl font-bold ${colorMap[variant ?? "default"]}`}
          >
            {value}
          </span>
        )}
      </CardContent>
    </AnimatedCard>
  )
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  variant: PropTypes.oneOf(["green", "amber", "red", "blue", "default"]),
}

StatCard.defaultProps = {
  variant: "default",
}

/**
 * Daily bar chart — animated bar chart for the week view.
 * @param {object} props - Component props.
 * @param {Array<{date: string, count: number}>} props.days - Daily attendance data.
 */
const DailyBarChart = ({ days }) => {
  if (!days || days.length === 0) return null
  const max = Math.max(...days.map((d) => d.count), 1)
  return (
    <div className="flex items-end gap-2 h-32">
      {days.map((day, index) => (
        <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
          <motion.span
            className="text-xs font-medium text-muted-foreground"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
          >
            {day.count}
          </motion.span>
          <motion.div
            className="w-full rounded-t bg-gradient-to-t from-blue-500 to-indigo-500"
            initial={{ height: 0 }}
            animate={{ height: `${(day.count / max) * 96}px` }}
            transition={{
              duration: 0.6,
              delay: 0.2 + index * 0.08,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          />
          <motion.span
            className="text-xs text-muted-foreground truncate w-full text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.08 }}
          >
            {new Date(day.date).toLocaleDateString(undefined, {
              weekday: "short",
            })}
          </motion.span>
        </div>
      ))}
    </div>
  )
}

DailyBarChart.propTypes = {
  days: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    }),
  ),
}

DailyBarChart.defaultProps = {
  days: [],
}

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      delay: i * 0.06,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
}

/**
 * Metric row in the employee metrics table.
 * @param {object} props - Component props.
 * @param {object} props.employee - Employee metric data.
 * @param {number} props.index - Row index for stagger animation.
 */
const MetricRow = ({ employee, index = 0 }) => (
  <motion.tr
    className="border-b last:border-0"
    variants={rowVariants}
    initial="hidden"
    animate="visible"
    custom={index}
  >
    <td className="px-3 py-2 text-sm font-medium">{employee.employeeName}</td>
    <td className="px-3 py-2 text-sm text-center">
      {employee.daysPresent ?? "\u2014"}
    </td>
    <td className="px-3 py-2 text-sm text-center">
      {formatDuration(employee.avgMinutesPerDay)}
    </td>
    <td className="px-3 py-2 text-sm text-center">
      {employee.lateArrivals > 0 ? (
        <PulseBadge color="amber">{employee.lateArrivals}</PulseBadge>
      ) : (
        <span className="text-muted-foreground">0</span>
      )}
    </td>
    <td className="px-3 py-2 text-sm text-center">
      {employee.earlyDepartures > 0 ? (
        <PulseBadge color="red">{employee.earlyDepartures}</PulseBadge>
      ) : (
        <span className="text-muted-foreground">0</span>
      )}
    </td>
  </motion.tr>
)

MetricRow.propTypes = {
  employee: PropTypes.shape({
    employeeId: PropTypes.number,
    employeeName: PropTypes.string.isRequired,
    daysPresent: PropTypes.number,
    avgMinutesPerDay: PropTypes.number,
    lateArrivals: PropTypes.number,
    earlyDepartures: PropTypes.number,
  }).isRequired,
  index: PropTypes.number,
}

const SKELETON_COUNT = 4

/**
 * Skeleton state for the summary page.
 */
const SummarySkeleton = () => (
  <div className="p-6 space-y-6">
    <Skeleton className="h-8 w-48 rounded-2xl" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Skeleton key={index} className="h-24 rounded-2xl" />
      ))}
    </div>
    <Skeleton className="h-48 rounded-2xl" />
    <Skeleton className="h-64 rounded-2xl" />
  </div>
)

/**
 * Top stat cards row.
 * @param {object} props - Component props.
 * @param {object} props.stats - Summary stats object.
 */
const StatCards = ({ stats }) => (
  <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StaggerItem>
      <StatCard
        title="Present Today"
        value={stats.presentToday ?? 0}
        variant="green"
      />
    </StaggerItem>
    <StaggerItem>
      <StatCard
        title="Auto-Expired"
        value={stats.autoExpiredToday ?? 0}
        variant="amber"
      />
    </StaggerItem>
    <StaggerItem>
      <StatCard
        title="Absent Today"
        value={stats.absentToday ?? 0}
        variant="red"
      />
    </StaggerItem>
    <StaggerItem>
      <StatCard
        title="Flagged Entries"
        value={stats.flaggedEntries ?? 0}
        variant="blue"
      />
    </StaggerItem>
  </StaggerContainer>
)

StatCards.propTypes = {
  stats: PropTypes.shape({
    presentToday: PropTypes.number,
    autoExpiredToday: PropTypes.number,
    absentToday: PropTypes.number,
    flaggedEntries: PropTypes.number,
  }).isRequired,
}

/**
 * Employee metrics table.
 * @param {object} props - Component props.
 * @param {Array} props.employeeMetrics - List of employee metric objects.
 */
const EmployeeMetricsTable = ({ employeeMetrics }) => (
  <AnimatedCard className="border-0 shadow-sm" delay={0.3}>
    <CardHeader>
      <CardTitle className="text-base">Employee Metrics (This Month)</CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                Employee
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-center">
                Days Present
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-center">
                Avg Hours/Day
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-center">
                Late Arrivals
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-center">
                Early Departures
              </th>
            </tr>
          </thead>
          <tbody>
            {employeeMetrics.map((emp, index) => (
              <MetricRow
                key={emp.employeeId ?? emp.employeeName}
                employee={emp}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </AnimatedCard>
)

EmployeeMetricsTable.propTypes = {
  employeeMetrics: PropTypes.arrayOf(
    PropTypes.shape({
      employeeId: PropTypes.number,
      employeeName: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

const summaryShape = PropTypes.shape({
  stats: PropTypes.shape({
    presentToday: PropTypes.number,
    autoExpiredToday: PropTypes.number,
    absentToday: PropTypes.number,
    flaggedEntries: PropTypes.number,
  }),
  dailyAttendance: PropTypes.arrayOf(
    PropTypes.shape({ date: PropTypes.string, count: PropTypes.number }),
  ),
  employeeMetrics: PropTypes.arrayOf(
    PropTypes.shape({
      employeeId: PropTypes.number,
      employeeName: PropTypes.string,
      daysPresent: PropTypes.number,
      avgMinutesPerDay: PropTypes.number,
      lateArrivals: PropTypes.number,
      earlyDepartures: PropTypes.number,
    }),
  ),
})

/**
 * Summary content body (rendered when data is available).
 * @param {object} props - Component props.
 * @param {object} props.stats - Stat counts object.
 * @param {Array} props.dailyData - Daily attendance data for bar chart.
 * @param {Array} props.employeeMetrics - Per-employee metrics list.
 */
const SummaryContent = ({ stats, dailyData, employeeMetrics }) => (
  <div className="p-6 space-y-6">
    <FadeIn delay={0} duration={0.5} direction="up">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
          <BarChart3 className="h-5 w-5" />
        </div>
        <BlurText
          text="Attendance Summary"
          className="text-2xl font-semibold"
          delay={0.1}
        />
      </div>
    </FadeIn>

    <StatCards stats={stats} />

    {dailyData.length > 0 && (
      <AnimatedCard className="border-0 shadow-sm" delay={0.2}>
        <CardHeader>
          <CardTitle className="text-base">
            Daily Attendance (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DailyBarChart days={dailyData} />
        </CardContent>
      </AnimatedCard>
    )}

    {employeeMetrics.length > 0 && (
      <EmployeeMetricsTable employeeMetrics={employeeMetrics} />
    )}

    {!dailyData.length && !employeeMetrics.length && (
      <FadeIn delay={0.3}>
        <p className="text-muted-foreground text-sm">
          No summary data available.
        </p>
      </FadeIn>
    )}
  </div>
)

SummaryContent.propTypes = {
  stats: PropTypes.object.isRequired,
  dailyData: PropTypes.array.isRequired,
  employeeMetrics: PropTypes.array.isRequired,
}

/**
 * Admin Attendance Summary page UI.
 * Displays stat cards, daily bar chart, and employee metrics table.
 * @param {object} props - Component props.
 * @param {object|null} props.summary - API response from GET attendance/admin/summary/.
 * @param {boolean} props.isLoading - Loading state flag.
 */
const AdminSummaryUI = ({ summary, isLoading }) => {
  if (isLoading) return <SummarySkeleton />

  return (
    <SummaryContent
      stats={summary?.stats ?? {}}
      dailyData={summary?.dailyAttendance ?? []}
      employeeMetrics={summary?.employeeMetrics ?? []}
    />
  )
}

AdminSummaryUI.propTypes = {
  summary: summaryShape,
  isLoading: PropTypes.bool.isRequired,
}

AdminSummaryUI.defaultProps = {
  summary: null,
}

export default AdminSummaryUI
