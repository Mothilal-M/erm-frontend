import { motion } from "framer-motion"
import PropTypes from "prop-types"

import { cn } from "@/lib/utils"

/**
 * AnimatedCard — a card with hover lift, glow border, and entrance animation.
 */
const AnimatedCard = ({
  children,
  className = "",
  delay = 0,
  glowColor,
  ...props
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      duration: 0.45,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    }}
    whileHover={{
      y: -4,
      transition: { duration: 0.2 },
    }}
    className={cn(
      "group relative rounded-2xl border bg-card text-card-foreground shadow-sm",
      "transition-shadow duration-300 hover:shadow-lg",
      glowColor && "hover:shadow-xl",
      className,
    )}
    style={glowColor ? { "--glow-color": glowColor } : undefined}
    {...props}
  >
    {/* subtle gradient border on hover */}
    {glowColor && (
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${glowColor}15, transparent 50%, ${glowColor}10)`,
        }}
      />
    )}
    <div className="relative z-10">{children}</div>
  </motion.div>
)

AnimatedCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
  glowColor: PropTypes.string,
}

export default AnimatedCard
