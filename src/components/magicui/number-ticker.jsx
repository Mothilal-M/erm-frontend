import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion"
import PropTypes from "prop-types"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * NumberTicker — animates a number counting up from 0.
 */
const NumberTicker = ({ value, className = "", duration = 1.2, delay = 0, suffix = "" }) => {
  const ref = useRef(null)
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => Math.round(v))
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  useEffect(() => {
    if (!isInView) return
    const controls = animate(motionValue, value, {
      duration,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    })
    return controls.stop
  }, [isInView, value, duration, delay, motionValue])

  return (
    <motion.span ref={ref} className={cn("tabular-nums", className)}>
      {suffix ? (
        <TickerWithSuffix rounded={rounded} suffix={suffix} />
      ) : (
        <TickerValue rounded={rounded} />
      )}
    </motion.span>
  )
}

const TickerValue = ({ rounded }) => {
  const ref = useRef(null)

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v
    })
    return unsubscribe
  }, [rounded])

  return <span ref={ref}>0</span>
}

const TickerWithSuffix = ({ rounded, suffix }) => {
  const ref = useRef(null)

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = `${v}${suffix}`
    })
    return unsubscribe
  }, [rounded, suffix])

  return <span ref={ref}>0{suffix}</span>
}

NumberTicker.propTypes = {
  value: PropTypes.number.isRequired,
  className: PropTypes.string,
  duration: PropTypes.number,
  delay: PropTypes.number,
  suffix: PropTypes.string,
}

TickerValue.propTypes = { rounded: PropTypes.object.isRequired }
TickerWithSuffix.propTypes = {
  rounded: PropTypes.object.isRequired,
  suffix: PropTypes.string.isRequired,
}

export default NumberTicker
