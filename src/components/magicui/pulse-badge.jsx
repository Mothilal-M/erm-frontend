import { motion } from "framer-motion"
import PropTypes from "prop-types"

import { cn } from "@/lib/utils"

/**
 * PulseBadge — a badge with a soft pulsing glow, great for status indicators.
 */
const PulseBadge = ({ children, color = "emerald", className = "" }) => {
  const colorMap = {
    emerald:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    amber:
      "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    red: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25",
    blue: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
    purple:
      "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/25",
    indigo:
      "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/25",
  }

  const dotColorMap = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    indigo: "bg-indigo-500",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        colorMap[color] ?? colorMap.blue,
        className,
      )}
    >
      <motion.span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          dotColorMap[color] ?? dotColorMap.blue,
        )}
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {children}
    </span>
  )
}

PulseBadge.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf([
    "emerald",
    "amber",
    "red",
    "blue",
    "purple",
    "indigo",
  ]),
  className: PropTypes.string,
}

export default PulseBadge
