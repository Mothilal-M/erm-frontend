import { motion } from "framer-motion"
import PropTypes from "prop-types"

import { cn } from "@/lib/utils"

/**
 * BlurText — text that fades in from blurred to sharp, word by word.
 */
const BlurText = ({ text, className = "", delay = 0 }) => {
  const words = text.split(" ")

  return (
    <span className={cn("inline-flex flex-wrap gap-x-1.5", className)}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, filter: "blur(8px)", y: 4 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.4,
            delay: delay + i * 0.06,
            ease: "easeOut",
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

BlurText.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
}

export default BlurText
