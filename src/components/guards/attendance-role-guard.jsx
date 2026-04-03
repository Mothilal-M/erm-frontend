import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import ct from "@constants/"

// ─── Funny Messages ───────────────────────────────────────────────────────────

const FUNNY_MESSAGES = [
  {
    emoji: "⏰",
    title: "Time's not right, employee!",
    body: "This area requires Attendance Admin clearance.",
  },
  {
    emoji: "🕐",
    title: "Attendance Admin Zone",
    body: "You do not have the required role to access this section.",
  },
  {
    emoji: "📊",
    title: "Admin credentials required!",
    body: "This dashboard is reserved for Attendance Admins only.",
  },
  {
    emoji: "🔔",
    title: "Access Denied — Wrong shift.",
    body: "Only attendance admins can view this data.",
  },
  {
    emoji: "⏳",
    title: "Time-out!",
    body: "This page requires admin privileges. Return to your area.",
  },
]

const ROLE_LABELS = {
  admin: "Admin",
  employee: "Employee",
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AttendanceRoleGuard — protects attendance admin routes by `attendance_management_role`.
 * Shows a funny unauthorized page with a countdown before navigating back.
 * @param {object} props - Component props
 * @param {import('react').ReactElement} props.children - Child components to render if access is granted
 * @param {string[]} props.allowedRoles - Array of roles that have access
 */
const AttendanceRoleGuard = ({ children, allowedRoles }) => {
  const navigate = useNavigate()
  const attendanceRole = useSelector(
    (s) => s[ct.store.USER_STORE].attendance_management_role,
  )
  const hasAccess = allowedRoles.includes(attendanceRole)

  const [countdown, setCountdown] = useState(3)
  const [message] = useState(
    () => FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)],
  )

  useEffect(() => {
    if (hasAccess) return () => {}

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((previous) => previous - 1)
    }, 1000)

    // Navigate back after countdown
    const timeout = setTimeout(() => {
      navigate(-1)
    }, 3000)

    return () => {
      clearInterval(timer)
      clearTimeout(timeout)
    }
  }, [hasAccess, navigate])

  if (hasAccess) return children

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="max-w-md text-center">
        {/* Emoji Icon */}
        <div className="mb-4 text-6xl">{message.emoji}</div>

        {/* Title */}
        <h1 className="mb-2 text-3xl font-bold text-white">{message.title}</h1>

        {/* Body */}
        <p className="mb-8 text-slate-300">{message.body}</p>

        {/* Allowed Roles Info */}
        <div className="mb-8 rounded-lg bg-slate-700/50 p-4">
          <p className="text-xs text-slate-400">Required role(s):</p>
          <p className="text-sm font-semibold text-slate-200">
            {allowedRoles.map((r) => ROLE_LABELS[r] || r).join(", ")}
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="rounded-lg bg-blue-950/40 p-3">
          <p className="text-sm text-slate-300">
            Redirecting you back in{" "}
            <span className="font-bold text-blue-400">{countdown}</span>s...
          </p>
        </div>
      </div>
    </div>
  )
}

AttendanceRoleGuard.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default AttendanceRoleGuard
