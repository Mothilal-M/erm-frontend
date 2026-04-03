import { motion } from "framer-motion"
import {
  Building2,
  CalendarDays,
  ChevronRight,
  Clock,
  ClipboardList,
  FolderOpen,
  Home,
  LayoutDashboard,
  Layers,
  MailPlus,
  Plus,
  Settings,
  UserCircle2,
  Users,
  Sparkles,
} from "lucide-react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"
import { Link, useLocation } from "react-router-dom"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import ct from "@constants/"

// ─── Nav data ────────────────────────────────────────────────────────────────

const mainItems = [{ title: "Home", url: "/", icon: Home }]

const leaveSharedItems = [
  { title: "Calendar View", url: "/leave/calendar", icon: CalendarDays },
]

const adminLeaveItems = [
  { title: "Admin Dashboard", url: "/leave/admin", icon: LayoutDashboard },
  { title: "Approvals", url: "/leave/admin/approvals", icon: ClipboardList },
  { title: "Settings", url: "/leave/admin/settings", icon: Settings },
]

const employeeLeaveItems = [
  { title: "My Dashboard", url: "/leave/employee", icon: UserCircle2 },
]

const employeeManagementItems = [
  { title: "All Employees", url: "/employee-management", icon: Users },
  {
    title: "Departments",
    url: "/employee-management/departments",
    icon: Building2,
  },
  { title: "New Employee", url: "/employee-management/create", icon: Plus },
  { title: "Invite User", url: "/employee-management/invite", icon: MailPlus },
]

const employeeAttendanceItems = [
  { title: "My History", url: "/attendance/history", icon: ClipboardList },
]

const adminAttendanceItems = [
  {
    title: "Activity Logs",
    url: "/attendance/admin/logs",
    icon: ClipboardList,
  },
  { title: "Live Status", url: "/attendance/admin/live", icon: Clock },
  { title: "Summary", url: "/attendance/admin/summary", icon: LayoutDashboard },
]

const projectManagementItems = [
  { title: "Project", url: "/projects", icon: FolderOpen },
]

// ─── Animated menu item ─────────────────────────────────────────────────────

const AnimatedMenuItem = ({ item, isActive }) => (
  <SidebarMenuItem>
    <SidebarMenuButton
      asChild
      className={`
        group relative rounded-xl transition-all duration-200
        ${
          isActive
            ? "bg-primary/10 text-primary font-medium shadow-sm"
            : "hover:bg-muted/60"
        }
      `}
    >
      <Link to={item.url} className="flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <item.icon
            className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
          />
        </motion.div>
        <span>{item.title}</span>
        {isActive && (
          <motion.div
            layoutId="sidebar-active-pill"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
)

AnimatedMenuItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
}

// ─── Simple nav group (Application) ──────────────────────────────────────────

const NavGroup = ({ label, items }) => {
  const location = useLocation()
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold px-3">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <AnimatedMenuItem
              key={item.title}
              item={item}
              isActive={location.pathname === item.url}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

NavGroup.propTypes = {
  label: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
    }),
  ).isRequired,
}

// ─── Animated sub-item ──────────────────────────────────────────────────────

const AnimatedSubItem = ({ item, isActive }) => (
  <SidebarMenuSubItem>
    <SidebarMenuSubButton
      asChild
      className={`
        rounded-lg transition-all duration-200
        ${
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        }
      `}
    >
      <Link to={item.url} className="flex items-center gap-2">
        <item.icon
          className={`h-3.5 w-3.5 ${isActive ? "text-primary" : ""}`}
        />
        <span>{item.title}</span>
      </Link>
    </SidebarMenuSubButton>
  </SidebarMenuSubItem>
)

AnimatedSubItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
}

// ─── Reusable collapsible module group ───────────────────────────────────────

const CollapsibleNavGroup = ({ title, icon: Icon, items, gradient }) => {
  const location = useLocation()
  const isAnyActive = items.some((item) => location.pathname === item.url)

  return (
    <SidebarMenu>
      <Collapsible
        asChild
        defaultOpen={isAnyActive}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={title}
              className={`
                rounded-xl transition-all duration-200
                ${isAnyActive ? "bg-muted/80 font-medium" : "hover:bg-muted/50"}
              `}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`rounded-lg p-1 ${gradient ? `bg-gradient-to-br ${gradient} text-white` : ""}`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${gradient ? "" : "text-muted-foreground"}`}
                />
              </motion.div>
              <span>{title}</span>
              {isAnyActive && (
                <span className="ml-auto mr-1 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/50 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub className="ml-3 border-l border-border/40 pl-2">
              {items.map((item) => (
                <AnimatedSubItem
                  key={item.title}
                  item={item}
                  isActive={location.pathname === item.url}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  )
}

CollapsibleNavGroup.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
    }),
  ).isRequired,
  gradient: PropTypes.string,
}

CollapsibleNavGroup.defaultProps = {
  gradient: null,
}

// ─── Modules section ──────────────────────────────────────────────────────────

const ModulesNavGroup = ({
  isLeaveAdmin,
  isLeaveEmployee,
  isEmpAdmin,
  isAttendanceAdmin,
  isAttendanceEmployee,
}) => {
  const roleItems = isLeaveAdmin
    ? adminLeaveItems
    : isLeaveEmployee
      ? employeeLeaveItems
      : []

  const leaveItems = [...leaveSharedItems, ...roleItems]
  const showLeave = isLeaveAdmin || isLeaveEmployee
  const showEmpMgmt = isEmpAdmin
  const showAttendance = isAttendanceAdmin || isAttendanceEmployee

  const attendanceItems = isAttendanceAdmin
    ? adminAttendanceItems
    : employeeAttendanceItems

  if (!showLeave && !showEmpMgmt && !showAttendance) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold px-3">
        Modules
      </SidebarGroupLabel>
      <SidebarGroupContent className="space-y-1">
        {showLeave && (
          <CollapsibleNavGroup
            title="Leave Management"
            icon={Layers}
            items={leaveItems}
            gradient="from-indigo-500 to-blue-600"
          />
        )}
        {showAttendance && (
          <CollapsibleNavGroup
            title="Attendance"
            icon={Clock}
            items={attendanceItems}
            gradient="from-emerald-500 to-teal-600"
          />
        )}
        {showEmpMgmt && (
          <CollapsibleNavGroup
            title="Employee Management"
            icon={Users}
            items={employeeManagementItems}
            gradient="from-purple-500 to-violet-600"
          />
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

ModulesNavGroup.propTypes = {
  isLeaveAdmin: PropTypes.bool.isRequired,
  isLeaveEmployee: PropTypes.bool.isRequired,
  isEmpAdmin: PropTypes.bool.isRequired,
  isAttendanceAdmin: PropTypes.bool.isRequired,
  isAttendanceEmployee: PropTypes.bool.isRequired,
}

// ─── AppSidebar ───────────────────────────────────────────────────────────

const AppSidebar = () => {
  const location = useLocation()
  const leaveRole = useSelector(
    (s) => s[ct.store.USER_STORE].leave_management_role,
  )
  const empMgmtRole = useSelector(
    (s) => s[ct.store.USER_STORE].employee_management_role,
  )
  const attendanceRole = useSelector(
    (s) => s[ct.store.USER_STORE].attendance_management_role,
  )

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="py-2 gap-1">
        {/* Brand */}
        <div className="px-4 py-3 mb-1">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="rounded-xl p-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-bold tracking-tight">ERM Platform</p>
              <p className="text-[10px] text-muted-foreground">
                Management Suite
              </p>
            </div>
          </div>
        </div>

        <NavGroup label="Application" items={mainItems} />
        <ModulesNavGroup
          isLeaveAdmin={leaveRole === "admin"}
          isLeaveEmployee={leaveRole === "employee"}
          isEmpAdmin={empMgmtRole === "admin"}
          isAttendanceAdmin={attendanceRole === "admin"}
          isAttendanceEmployee={attendanceRole === "employee"}
        />
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold px-3">
            Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectManagementItems.map((item) => (
                <AnimatedMenuItem
                  key={item.title}
                  item={item}
                  isActive={location.pathname === item.url}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
