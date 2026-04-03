import { motion } from "framer-motion"
import PropTypes from "prop-types"

/**
 * StaggerContainer — staggers the entrance of its children.
 * Wrap each child with StaggerItem.
 */
const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const StaggerContainer = ({ children, className = "" }) => (
  <motion.div
    variants={staggerVariants}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
)

StaggerContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
  },
}

const StaggerItem = ({ children, className = "" }) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
)

StaggerItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

export { StaggerContainer, StaggerItem }
