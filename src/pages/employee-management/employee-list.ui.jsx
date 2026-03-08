import {
  Edit,
  Mail,
  MailPlus,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import ct from "@constants/"

// ─── Status badge helper ──────────────────────────────────────────────────────

const statusVariant = {
  active: "default",
  inactive: "secondary",
  invited: "outline",
}

const StatusBadge = ({ status }) => (
  <Badge variant={statusVariant[status] ?? "secondary"} className="capitalize">
    {status}
  </Badge>
)

StatusBadge.propTypes = { status: PropTypes.string.isRequired }

// ─── Loading skeleton ─────────────────────────────────────────────────────────

const EmployeeRowSkeleton = () => (
  <div className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
    <Skeleton className="h-9 w-9 rounded-full" />
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-28" />
    </div>
    <Skeleton className="h-5 w-16 rounded-full" />
    <Skeleton className="h-8 w-8 rounded" />
  </div>
)

// ─── Stats card ───────────────────────────────────────────────────────────────

const StatsCard = ({ icon: Icon, label, value, isLoading }) => (
  <Card>
    <CardContent className="flex items-center gap-4 pt-6">
      <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        {isLoading ? (
          <Skeleton className="h-7 w-12 mb-1" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
)

StatsCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isLoading: PropTypes.bool.isRequired,
}

// ─── Employee row ─────────────────────────────────────────────────────────────

const EmployeeRow = ({ employee, onDelete, onSendInvite }) => {
  const initials = employee.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b last:border-0 hover:bg-muted/30 transition-colors">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{employee.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {employee.email}
        </p>
      </div>

      <div className="hidden sm:block text-xs text-muted-foreground w-28 truncate">
        {employee.department ?? "—"}
      </div>

      <StatusBadge status={employee.status} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              to={ct.route.employeeManagement.EDIT.replace(":id", employee.id)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSendInvite(employee.email)}>
            <Mail className="mr-2 h-4 w-4" />
            Send Invite Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(employee.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

EmployeeRow.propTypes = {
  employee: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    department: PropTypes.string,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onSendInvite: PropTypes.func.isRequired,
}

// ─── Employee list content ────────────────────────────────────────────────────

/**
 * EmployeeListContent — renders the employee list with proper state handling.
 * @param {object} props - Component props.
 * @param {boolean} props.isLoading - Whether the employee data is currently loading.
 * @param {boolean} props.isError - Whether there was an error loading the employee data.
 * @param {Array} props.employees - The array of employee objects to display.
 * @param {(id: string) => void} props.onDelete - Callback function to call when an employee is deleted, receives the employee ID as an argument.
 */
const EmployeeListContent = ({ isLoading, isError, employees, onDelete, onSendInvite }) => {
  if (isError) {
    return (
      <p className="px-4 py-6 text-sm text-center text-destructive">
        Failed to load employees. Please try again.
      </p>
    )
  }

  if (isLoading) {
    return Array.from({ length: 5 }).map((_, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <EmployeeRowSkeleton key={index} />
    ))
  }

  if (employees?.length === 0) {
    return (
      <p className="px-4 py-10 text-sm text-center text-muted-foreground">
        No employees found.
      </p>
    )
  }

  return employees?.map((emp) => (
    <EmployeeRow key={emp.id} employee={emp} onDelete={onDelete} onSendInvite={onSendInvite} />
  ))
}

EmployeeListContent.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  employees: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSendInvite: PropTypes.func.isRequired,
}

// ─── Main UI ──────────────────────────────────────────────────────────────────

const EmployeeListUI = ({
  employees,
  stats,
  isLoading,
  isError,
  search,
  onSearchChange,
  onSendInvite,
  onDelete,
}) => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Employee Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your organisation&apos;s employees
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm">
            <Link to={ct.route.employeeManagement.INVITE}>
              <MailPlus className="mr-1.5 h-4 w-4" />
              Invite User
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to={ct.route.employeeManagement.CREATE}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Employee
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        <StatsCard
          icon={Users}
          label="Total Employees"
          value={stats?.total}
          isLoading={isLoading}
        />
        <StatsCard
          icon={UserCheck}
          label="Active"
          value={stats?.active}
          isLoading={isLoading}
        />
        <StatsCard
          icon={UserRound}
          label="Pending Invite"
          value={stats?.invited}
          isLoading={isLoading}
        />
      </div>

      {/* List card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">All Employees</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {isLoading ? "Loading…" : `${employees?.length ?? 0} records`}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <EmployeeListContent
            isLoading={isLoading}
            isError={isError}
            employees={employees}
            onDelete={onDelete}
            onSendInvite={onSendInvite}
          />
        </CardContent>
      </Card>
    </div>
  )
}

EmployeeListUI.propTypes = {
  employees: PropTypes.array.isRequired,
  stats: PropTypes.shape({
    total: PropTypes.number,
    active: PropTypes.number,
    invited: PropTypes.number,
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onSendInvite: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default EmployeeListUI
