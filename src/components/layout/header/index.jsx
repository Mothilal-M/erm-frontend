import { CalendarDays, Clock } from "lucide-react"
import { useSelector } from "react-redux"
import { Link } from "react-router"

import ModeToggle from "@/components/layout/header/theme-switch"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import ct from "@constants/"

import LanguageNav from "./language-nav"
import NotificationNav from "./notification-nav"
import UserNav from "./user-nav"

const Navbar = () => {
  const appState = useSelector((state) => state[ct.store.APP_STORE])
  const empRole = useSelector(
    (state) => state[ct.store.USER_STORE].employee_management_role,
  )
  const attendanceRole = useSelector(
    (state) => state[ct.store.USER_STORE].attendance_management_role,
  )

  const { currentModule, standupStatus } = appState || {
    currentModule: "ERM",
    standupStatus: "Not Submitted",
  }

  const isAdmin = empRole === "admin"
  const isAttendanceAdmin = attendanceRole === "admin"

  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow-sm backdrop-blur-sm supports-backdrop-filter:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex h-14 items-center">
        {/* Left Side - Current Module */}
        <SidebarTrigger />
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">{currentModule}</span>
        </div>

        <div className="flex-1" />

        {/* Right Side - Controls */}
        <div className="flex gap-x-5 items-center space-x-2">
          {/* Standup Status — employee only */}
          {!isAdmin && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:flex gap-2"
            >
              <Link to="/daily-update/standup/new">
                <CalendarDays className="h-4 w-4" />
                Standup: {standupStatus}
              </Link>
            </Button>
          )}

          {/* Clock IN — employee only */}
          {!isAttendanceAdmin && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:flex gap-2"
            >
              <Link to="/attendance">
                <Clock className="h-4 w-4" />
                Clock IN
              </Link>
            </Button>
          )}
          <NotificationNav />
          <LanguageNav />
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}

export default Navbar
