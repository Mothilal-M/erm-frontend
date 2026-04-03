import { useCallback, useMemo } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import {
  useAttendanceStatus,
  useClockIn,
  useTodayAttendance,
} from "@query/attendance.query"
import {
  useFetchEmployeePerformance,
  useFetchEmployees,
} from "@query/employee-management.query"
import {
  useFetchAdminLeaveSummary,
  useFetchEmployeeLeaveProfile,
} from "@query/leave.query"
import { useGetProjects } from "@query/project.query"

import AdminDashboardUI from "./admin-dashboard.ui"
import EmployeeDashboardUI from "./employee-dashboard.ui"

/**
 * Extract array from various API response shapes.
 * @param {*} data - Raw API data
 * @param {string} [key] - Object key to extract from
 * @returns {Array}
 */
const extractArray = (data, key) => {
  if (Array.isArray(data)) return data
  if (key && data?.[key] && Array.isArray(data[key])) return data[key]
  return []
}

/**
 * Dashboard — routes to Admin or Employee view based on role.
 */
const Dashboard = () => {
  const navigate = useNavigate()
  const { userName, employee_management_role: empRole } = useSelector(
    (state) => state.user,
  )
  const isAdmin = empRole === "admin"

  const { data: attendanceStatus, isLoading: statusLoading } =
    useAttendanceStatus()
  const { data: todayAttendance, isLoading: todayLoading } =
    useTodayAttendance()
  const { data: projectsRaw, isLoading: projectsLoading } = useGetProjects()

  // Admin-only queries — disabled for employees
  const { data: leaveSummary, isLoading: leaveLoading } =
    useFetchAdminLeaveSummary({ enabled: isAdmin })
  const { data: employeesRaw, isLoading: employeesLoading } = useFetchEmployees(
    { enabled: isAdmin },
  )

  // Employee-only queries — disabled for admins
  const { data: leaveProfile, isLoading: profileLoading } =
    useFetchEmployeeLeaveProfile({ enabled: !isAdmin })
  const { data: employeePerformance, isLoading: performanceLoading } =
    useFetchEmployeePerformance({ enabled: !isAdmin })
  const { mutate: clockIn } = useClockIn()

  const projects = useMemo(
    () => extractArray(projectsRaw, "results"),
    [projectsRaw],
  )
  const employees = useMemo(
    () => extractArray(employeesRaw, "employees"),
    [employeesRaw],
  )

  const handleClockIn = useCallback(() => {
    clockIn()
  }, [clockIn])

  const handleNavigate = useCallback(
    (path) => {
      navigate(path)
    },
    [navigate],
  )

  if (isAdmin) {
    return (
      <AdminDashboardUI
        userName={userName}
        employees={employees}
        projects={projects}
        leaveSummary={leaveSummary}
        attendanceStatus={attendanceStatus}
        todayAttendance={todayAttendance}
        isLoading={
          statusLoading ||
          todayLoading ||
          projectsLoading ||
          leaveLoading ||
          employeesLoading
        }
        onNavigate={handleNavigate}
      />
    )
  }

  return (
    <EmployeeDashboardUI
      userName={userName}
      projects={projects}
      leaveProfile={leaveProfile}
      attendanceStatus={attendanceStatus}
      todayAttendance={todayAttendance}
      performance={employeePerformance}
      onClockIn={handleClockIn}
      onNavigate={handleNavigate}
      isLoading={
        statusLoading ||
        todayLoading ||
        projectsLoading ||
        profileLoading ||
        performanceLoading
      }
    />
  )
}

export default Dashboard
