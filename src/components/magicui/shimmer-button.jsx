import { motion } from "framer-motion"
import PropTypes from "prop-types"
import { forwardRef } from "react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

const baseClasses = cn(
  "relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-sm",
  "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
  "transition-shadow hover:shadow-xl hover:shadow-primary/30"
)

const ShimmerOverlay = ({ shimmerColor }) => (
  <motion.span
    className="absolute inset-0 -translate-x-full pointer-events-none"
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
)

ShimmerOverlay.propTypes = { shimmerColor: PropTypes.string.isRequired }

/**
 * ShimmerButton — a button with a subtle shimmer animation on hover.
 * Pass `to="/path"` to render as a React Router Link instead of a button.
 */
const ShimmerButton = forwardRef(
  ({ children, className, shimmerColor = "rgba(255,255,255,0.2)", to, ...props }, ref) => {
    const content = (
      <>
        <ShimmerOverlay shimmerColor={shimmerColor} />
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      </>
    )

    if (to) {
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block"
        >
          <Link
            ref={ref}
            to={to}
            className={cn(baseClasses, "inline-flex items-center justify-center no-underline", className)}
            {...props}
          >
            {content}
          </Link>
        </motion.div>
      )
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={cn(baseClasses, className)}
        {...props}
      >
        {content}
      </motion.button>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"

ShimmerButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  shimmerColor: PropTypes.string,
  to: PropTypes.string,
}

export default ShimmerButton
