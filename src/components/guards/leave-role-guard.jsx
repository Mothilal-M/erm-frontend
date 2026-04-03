import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import ct from "@constants/"

// ─── Funny Messages ───────────────────────────────────────────────────────────

const FUNNY_MESSAGES = [
  {
    emoji: "🕵️",
    title: "Nice try, secret agent!",
    body: "This area requires a different clearance level.",
  },
  {
    emoji: "🚨",
    title: "UNAUTHORIZED VIBES DETECTED",
    body: "Our sensors picked up suspicious navigation activity. Stand down.",
  },
  {
    emoji: "🤖",
    title: "ACCESS DENIED — Wrong sector.",
    body: "You do not have the required module role for this zone.",
  },
  {
    emoji: "🎭",
    title: "Plot twist!",
    body: "You stumbled into the wrong act. This scene isn't for you.",
  },
  {
    emoji: "🏰",
    title: "You shall not pass!",
    body: "This page is guarded by the mighty role check.",
  },
]

const ROLE_LABELS = {
  admin: "Admin",
  employee: "Employee",
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * LeaveRoleGuard — protects leave module routes by `leave_management_role`.
 * Shows a funny unauthorized page with a countdown before navigating back.
 * @param {object} props - Component props
 * @param {import('react').ReactElement} props.children - Child components to render if access is granted
 * @param {string[]} props.allowedRoles - Array of roles that have access
 */
const LeaveRoleGuard = ({ children, allowedRoles }) => {
  const navigate = useNavigate()
  const leaveRole = useSelector(
    (s) => s[ct.store.USER_STORE].leave_management_role,
  )
  const hasAccess = allowedRoles.includes(leaveRole)

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
        <p className="text-base font-bold">
          {allowedRoles.map((r) => ROLE_LABELS[r] ?? r).join(" or ")}
        </p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-2">
          Your role
        </p>
        <p className="text-base font-bold text-amber-600 dark:text-amber-400">
          {leaveRole ? (ROLE_LABELS[leaveRole] ?? leaveRole) : "None"}
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

LeaveRoleGuard.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default LeaveRoleGuard
