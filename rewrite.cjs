const fs = require("node:fs")
const code = fs.readFileSync(
  "src/pages/dashboard/employee-dashboard.ui.jsx",
  "utf8"
)

const startMarker = "// ─── Date Range Picker ────────────────"
// We need to match the actual marker length
const actualStartMarker = code
  .substring(
    code.indexOf("// ─── Date Range Picker"),
    code.indexOf("const formatDateForInput")
  )
  .trim()
const actualEndMarker = code
  .substring(
    code.indexOf("// ─── Leave Balance Chart"),
    code.indexOf("const LeaveBalanceChart")
  )
  .trim()

if (!actualStartMarker || !actualEndMarker) {
  console.error("Markers not found.")
  process.exit(1)
}

const startIndex = code.indexOf(actualStartMarker)
const endIndex = code.indexOf(actualEndMarker)

const newSection = `// ─── Date Range Picker ────────────────────────────────────────────────────────
const formatDateForInput = (date) => {
  if (!date) return ""
  return date.toISOString().split("T")[0]
}

const DateRangePicker = ({ dateRange, onDateRangeChange }) => {
  const handleFromChange = (e) => {
    const newFrom = e.target.value ? new Date(e.target.value) : null
    onDateRangeChange({ ...dateRange, from: newFrom })
  }

  const handleToChange = (e) => {
    const newTo = e.target.value ? new Date(e.target.value) : null
    onDateRangeChange({ ...dateRange, to: newTo })
  }

  return (
    <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-1.5 shadow-sm">
      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      <Input
        type="date"
        value={formatDateForInput(dateRange?.from)}
        onChange={handleFromChange}
        className="h-7 w-auto border-0 bg-transparent text-foreground text-sm focus-visible:ring-0 p-0"
      />
      <span className="text-muted-foreground">—</span>
      <Input
        type="date"
        value={formatDateForInput(dateRange?.to)}
        onChange={handleToChange}
        className="h-7 w-auto border-0 bg-transparent text-foreground text-sm focus-visible:ring-0 p-0"
      />
    </div>
  )
}

DateRangePicker.propTypes = {
  dateRange: PropTypes.shape({
    from: PropTypes.instanceOf(Date),
    to: PropTypes.instanceOf(Date),
  }),
  onDateRangeChange: PropTypes.func.isRequired,
}

DateRangePicker.defaultProps = { dateRange: null }

// ─── Dashboard Header ────────────────────────────────────────────────────────
const DashboardHeader = ({ userName, leaveProfile, dateRange, onDateRangeChange }) => {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const emp = leaveProfile?.employee

  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      <div className="flex items-center gap-4">
        {emp && (
          <Avatar className="h-14 w-14 border shadow-sm">
            <AvatarImage src={emp.avatar} alt={emp.name} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {emp.name?.[0] ?? userName?.[0] ?? "U"}
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {emp?.name?.split(" ")[0] ?? userName ?? "User"} 👋
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
            {emp ? (
              <>
                <span className="font-medium text-foreground">{emp.role}</span>
                <span className="text-muted-foreground/30">•</span>
                <span>{emp.department}</span>
              </>
            ) : "Here's your performance overview"}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <DateRangePicker dateRange={dateRange} onDateRangeChange={onDateRangeChange} />
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/attendance">
              <Clock className="h-4 w-4 mr-2" /> Clock In / Out
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/leave/employee/request">
              <CalendarIcon className="h-4 w-4 mr-2" /> Request Leave
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

DashboardHeader.propTypes = {
  userName: PropTypes.string,
  leaveProfile: PropTypes.object,
  dateRange: PropTypes.object,
  onDateRangeChange: PropTypes.func.isRequired,
}

DashboardHeader.defaultProps = { userName: null, leaveProfile: null, dateRange: null }

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, to }) => (
  <Card className="shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      {to && (
        <Link to={to} className="text-xs text-primary hover:underline flex items-center gap-1 mt-3 transition-colors">
          View details <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </CardContent>
  </Card>
)

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sub: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  to: PropTypes.string,
}

StatCard.defaultProps = { sub: null, to: null }

// ─── Stats Grid ──────────────────────────────────────────────────────────────
const StatsGrid = ({ leaveProfile, todayAttendance }) => {
  const month = leaveProfile?.thisMonth
  const totalRemaining = (leaveProfile?.leaveBalance ?? []).reduce(
    (sum, b) => sum + (b.remaining ?? 0),
    0
  )
  const todayHours = formatWorkHours(todayAttendance?.totalWorkMinutes ?? 0)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Today's Hours"
        value={todayHours}
        sub="Logged today"
        icon={Clock}
        to="/attendance"
      />
      <StatCard
        label="Present This Month"
        value={month?.presentDays ?? 0}
        sub="Days"
        icon={CheckCircle2}
        to="/attendance/history"
      />
      <StatCard
        label="Leave Remaining"
        value={totalRemaining}
        sub="Days available"
        icon={CalendarIcon}
        to="/leave/employee"
      />
      <StatCard
        label="WFH Days"
        value={month?.wfhDays ?? 0}
        sub="This month"
        icon={Home}
      />
    </div>
  )
}

StatsGrid.propTypes = {
  leaveProfile: PropTypes.object,
  todayAttendance: PropTypes.object,
}

StatsGrid.defaultProps = { leaveProfile: null, todayAttendance: null }

`

let newCode =
  code.slice(0, Math.max(0, startIndex)) +
  newSection +
  code.slice(Math.max(0, endIndex))

// Regex to replace the render block correctly
newCode = newCode.replace(
  /{[\s\S]*Hero Header with Date Filter[\s\S]*DashboardHeader[\s\S]*Profile Card[\s\S]*ProfileCard[\s\S]*Stats Grid[\s\S]*StatsGrid[^/>]*\/>/,
  `{/* Hero Header */}
      <DashboardHeader 
        userName={userName} 
        leaveProfile={leaveProfile} 
        dateRange={dateRange} 
        onDateRangeChange={onDateRangeChange} 
      />

      {/* Stats Grid */}
      <StatsGrid leaveProfile={leaveProfile} todayAttendance={todayAttendance} />`
)

fs.writeFileSync("src/pages/dashboard/employee-dashboard.ui.jsx", newCode)
console.log("Rewrite complete.")
