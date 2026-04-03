import { motion } from "framer-motion"
import { LogOut, FileText } from "lucide-react"
import PropTypes from "prop-types"
import { useState } from "react"

import { AnimatedProgress } from "@/components/magicui"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const MIN_LENGTH = 10

const ClockOutDialog = ({ open, onClose, onConfirm, isLoading }) => {
  const [summary, setSummary] = useState("")
  const progress = Math.min(summary.trim().length / MIN_LENGTH, 1)
  const isValid = summary.trim().length >= MIN_LENGTH

  const handleConfirm = () => {
    if (!isValid) return
    onConfirm({ workSummary: summary.trim() })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg p-1.5 bg-gradient-to-br from-red-500 to-rose-600 text-white">
              <LogOut className="h-3.5 w-3.5" />
            </div>
            Clock Out
          </DialogTitle>
          <DialogDescription>
            What did you work on today? This will be saved with your attendance
            record.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
            <Textarea
              placeholder="e.g. Reviewed pull requests, fixed login bug, attended sprint planning..."
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={isLoading}
              className="resize-none pl-9 rounded-xl"
            />
          </div>
          <div className="flex items-center justify-between">
            <AnimatedProgress
              value={progress * 100}
              height="h-1"
              className="flex-1 mr-3"
              barClassName={isValid ? "bg-emerald-500" : "bg-amber-500"}
            />
            <span
              className={`text-xs tabular-nums ${isValid ? "text-emerald-600 font-medium" : "text-muted-foreground"}`}
            >
              {summary.trim().length}/{MIN_LENGTH}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl"
            >
              Cancel
            </Button>
          </motion.div>
          <motion.div
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.97 } : {}}
          >
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!isValid || isLoading}
              className="rounded-xl shadow-lg shadow-red-500/20"
            >
              {isLoading ? "Clocking out..." : "Confirm Clock Out"}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

ClockOutDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
}
ClockOutDialog.defaultProps = { isLoading: false }

export default ClockOutDialog
