import { motion } from "framer-motion"
import PropTypes from "prop-types"
import { forwardRef } from "react"

import { cn } from "@/lib/utils"

/**
 * ShimmerButton — a button with a subtle shimmer animation on hover.
 */
const ShimmerButton = forwardRef(
  ({ children, className, shimmerColor = "rgba(255,255,255,0.2)", ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-sm",
        "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
        "transition-shadow hover:shadow-xl hover:shadow-primary/30",
        className
      )}
      {...props}
    >
      {/* shimmer overlay */}
      <motion.span
        className="absolute inset-0 -translate-x-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${shimmerColor} 50%, transparent 100%)`,
        }}
        animate={{ translateX: ["-100%", "100%"] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut",
        }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  )
)

ShimmerButton.displayName = "ShimmerButton"

ShimmerButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  shimmerColor: PropTypes.string,
}

export default ShimmerButton
