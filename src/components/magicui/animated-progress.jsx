import { motion, useInView } from "framer-motion"
import PropTypes from "prop-types"
import { useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * AnimatedProgress — a progress bar that animates from 0 to value on scroll into view.
 */
const AnimatedProgress = ({
  value = 0,
  max = 100,
  className = "",
  barClassName = "",
  height = "h-2",
  delay = 0,
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-30px" })
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      ref={ref}
      className={cn(
        "w-full rounded-full bg-muted/60 overflow-hidden",
        height,
        className,
      )}
    >
      <motion.div
        className={cn("h-full rounded-full bg-primary", barClassName)}
        initial={{ width: "0%" }}
        animate={isInView ? { width: `${pct}%` } : { width: "0%" }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.25, 0.4, 0.25, 1],
        }}
      />
    </div>
  )
}

AnimatedProgress.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  className: PropTypes.string,
  barClassName: PropTypes.string,
  height: PropTypes.string,
  delay: PropTypes.number,
}

export default AnimatedProgress
