import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import PropTypes from "prop-types"

import { BlurText, FadeIn } from "@/components/magicui"

import AutoExpiryBanner from "./components/auto-expiry-banner"
import ClockCard from "./components/clock-card"
import ClockOutDialog from "./components/clock-out-dialog"
import SessionTable from "./components/session-table"

const ClockUI = ({
  status,
  statusLoading,
  todayData,
  todayLoading,
  clockOutDialogOpen,
  isMutating,
  onClockIn,
  onOpenClockOutDialog,
  onCloseClockOutDialog,
  onClockOutConfirm,
}) => {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 p-4 md:p-6">
      <FadeIn>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="rounded-xl p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
          >
            <Clock className="h-5 w-5" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <BlurText text="Attendance" />
            </h1>
            <p className="text-sm text-muted-foreground">Track your work sessions</p>
          </div>
        </div>
      </FadeIn>

      {status?.isClocked && status?.willAutoExpire && (
        <AutoExpiryBanner
          expiresInSeconds={status.expiresInSeconds}
          onClockOut={onOpenClockOutDialog}
        />
      )}

      <ClockCard
        status={status}
        isLoading={statusLoading}
        onClockIn={onClockIn}
        onClockOut={onOpenClockOutDialog}
        isMutating={isMutating}
      />

      <SessionTable todayData={todayData} isLoading={todayLoading} />

      <ClockOutDialog
        open={clockOutDialogOpen}
        onClose={onCloseClockOutDialog}
        onConfirm={onClockOutConfirm}
        isLoading={isMutating}
      />
    </div>
  )
}

ClockUI.propTypes = {
  status: PropTypes.object,
  statusLoading: PropTypes.bool.isRequired,
  todayData: PropTypes.object,
  todayLoading: PropTypes.bool.isRequired,
  clockOutDialogOpen: PropTypes.bool.isRequired,
  isMutating: PropTypes.bool.isRequired,
  onClockIn: PropTypes.func.isRequired,
  onOpenClockOutDialog: PropTypes.func.isRequired,
  onCloseClockOutDialog: PropTypes.func.isRequired,
  onClockOutConfirm: PropTypes.func.isRequired,
}
ClockUI.defaultProps = { status: null, todayData: null }

export default ClockUI
