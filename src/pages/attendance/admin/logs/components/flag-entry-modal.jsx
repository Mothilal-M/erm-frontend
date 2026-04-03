import PropTypes from "prop-types"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const fmtTime = (iso) => {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * FlagEntryModal — admin modal to flag or unflag an attendance entry as suspicious.
 * @param {object} props - Component props.
 * @param {object|null} props.entry - The attendance entry to flag/unflag.
 * @param {() => void} props.onClose - Callback when modal is closed.
 * @param {(data: {isFlagged: boolean, flagReason: string}) => void} props.onSave - Called with { isFlagged, flagReason }.
 * @param {boolean} [props.isLoading] - Whether the save operation is in progress.
 */
const FlagEntryModal = ({ entry, onClose, onSave, isLoading }) => {
  const [flagReason, setFlagReason] = useState("")

  const isCurrentlyFlagged = entry?.isFlagged ?? false

  // If unflagging, we'll immediately confirm without a reason
  const isUnflagging = isCurrentlyFlagged
  const canSave = isUnflagging || flagReason.trim().length >= 5

  useEffect(() => {
    if (entry) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFlagReason(entry.flagReason ?? "")
    }
  }, [entry])

  const handleSave = () => {
    if (!canSave) return
    if (isUnflagging) {
      onSave({ isFlagged: false, flagReason: null })
    } else {
      onSave({ isFlagged: true, flagReason: flagReason.trim() })
    }
  }

  const getButtonText = () => {
    if (isLoading) return "Saving…"
    return isUnflagging ? "Remove Flag" : "Flag Entry"
  }

  const getButtonVariant = () => {
    return isUnflagging ? "outline" : "destructive"
  }

  const getTitle = () => {
    return isUnflagging ? "Unflag Entry" : "Flag Entry as Suspicious"
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={!!entry} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {entry
              ? `${entry.employeeName} — ${entry.date}, ${fmtTime(
                  entry.clockIn,
                )} → ${fmtTime(entry.clockOut)}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {isUnflagging ? (
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              This entry is currently flagged with the reason:
            </p>
            <blockquote className="mt-2 border-l-2 border-red-400 pl-3 text-sm italic text-red-700 dark:text-red-400">
              {entry?.flagReason}
            </blockquote>
            <p className="mt-3 text-sm text-muted-foreground">
              Are you sure you want to remove the flag?
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="flag-reason">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="flag-reason"
                placeholder="e.g. Duration inconsistent with reported tasks, location anomaly…"
                rows={3}
                value={flagReason}
                onChange={(event) => setFlagReason(event.target.value)}
                disabled={isLoading}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Flagging does not alter the entry — it only marks it for review.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={handleSave}
            disabled={!canSave || isLoading}
          >
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

FlagEntryModal.propTypes = {
  entry: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
}

FlagEntryModal.defaultProps = {
  entry: null,
  isLoading: false,
}

export default FlagEntryModal
