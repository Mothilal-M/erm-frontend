import { motion } from "framer-motion"
import PropTypes from "prop-types"

/**
 * FadeIn — animates children with a fade + slide-up on mount.
 */
const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  className = "",
}) => {
  const directionMap = {
    up: { y: 24 },
    down: { y: -24 },
    left: { x: 24 },
    right: { x: -24 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

FadeIn.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  duration: PropTypes.number,
  direction: PropTypes.oneOf(["up", "down", "left", "right"]),
  className: PropTypes.string,
}

export default FadeIn
