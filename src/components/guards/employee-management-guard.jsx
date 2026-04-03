import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import ct from "@constants/"

// ─── Funny Messages ───────────────────────────────────────────────────────────

const FUNNY_MESSAGES = [
  {
    emoji: "🔐",
    title: "Admin credentials required!",
    body: "This area is reserved for Employee Management admins only.",
  },
  {
    emoji: "🚧",
    title: "Construction zone ahead.",
    body: "Only admins are allowed past this point. Hard hats optional.",
  },
  {
    emoji: "🛡️",
    title: "Access blocked at the gate.",
    body: "The employee management module requires admin privileges.",
  },
  {
    emoji: "🎯",
    title: "Wrong target, agent.",
    body: "This mission is for admins only. Return to base.",
  },
  {
    emoji: "🏛️",
    title: "Restricted territory!",
    body: "Only administrators may enter the Employee Management zone.",
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * EmployeeManagementGuard — protects employee management routes.
 * Only users with employee_management_role === "admin" may access guarded pages.
 * Shows a funny unauthorized screen with countdown before navigating back.
 * @param {object} props - Component props
 * @param {import('react').ReactElement} props.children - Child components to render if access is granted
 */
const EmployeeManagementGuard = ({ children }) => {
  const navigate = useNavigate()
  const empMgmtRole = useSelector(
    (s) => s[ct.store.USER_STORE].employee_management_role,
  )
  const hasAccess = empMgmtRole === "admin"

  const [countdown, setCountdown] = useState(3)
  const [message] = useState(
    () => FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)],
  )

  useEffect(() => {
    if (hasAccess) return () => {}

    const interval = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(interval)
          navigate(-1)
          return 0
        }
        return n - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [hasAccess, navigate])

  if (hasAccess) return children

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center space-y-5 select-none">
      <div className="text-7xl animate-bounce">{message.emoji}</div>

      <div className="space-y-2 max-w-sm">
        <h2 className="text-2xl font-extrabold tracking-tight text-destructive">
          {message.title}
        </h2>
        <p className="text-muted-foreground text-sm">{message.body}</p>
      </div>

      <div className="rounded-xl border border-border bg-muted/40 px-6 py-4 space-y-1 max-w-xs w-full">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          Required role
        </p>
        <p className="text-base font-bold">Admin</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-2">
          Your role
        </p>
        <p className="text-base font-bold text-amber-600 dark:text-amber-400">
          {empMgmtRole || "None"}
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        Sending you back in{" "}
        <span className="font-bold text-foreground tabular-nums">
          {countdown}
        </span>
        {countdown === 1 ? " second" : " seconds"}…
      </p>
    </div>
  )
}

EmployeeManagementGuard.propTypes = {
  children: PropTypes.node.isRequired,
}

export default EmployeeManagementGuard
