import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import PropTypes from "prop-types"

import { Button } from "@/components/ui/button"

const pad = (n) => String(n).padStart(2, "0")

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${pad(m)}:${pad(s)}`
}

const AutoExpiryBanner = ({ expiresInSeconds, onClockOut }) => {
  if (!expiresInSeconds || expiresInSeconds <= 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-5 py-4 text-amber-800 dark:text-amber-300 shadow-sm"
    >
      <div className="flex items-center gap-3 text-sm font-medium">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
        >
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </motion.div>
        <span>
          Session auto-closes in{" "}
          <strong className="tabular-nums">{formatTime(expiresInSeconds)}</strong>.
          Please clock out with your work summary.
        </span>
      </div>
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 border-amber-500/60 text-amber-800 hover:bg-amber-500/20 dark:text-amber-300 rounded-lg"
          onClick={onClockOut}
        >
          Clock Out Now
        </Button>
      </motion.div>
    </motion.div>
  )
}

AutoExpiryBanner.propTypes = {
  expiresInSeconds: PropTypes.number,
  onClockOut: PropTypes.func.isRequired,
}
AutoExpiryBanner.defaultProps = { expiresInSeconds: null }

export default AutoExpiryBanner
