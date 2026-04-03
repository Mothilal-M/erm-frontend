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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

/**
 * ManualEntryModal — admin modal to create a manual attendance entry on behalf of an employee.
 * @param {object} props - Component props.
 * @param {boolean} props.open - Whether the modal is open.
 * @param {() => void} props.onClose - Callback when modal is closed.
 * @param {(data: object) => void} props.onSave - Called with the full payload.
 * @param {boolean} props.isLoading - Whether the save operation is in progress.
 * @param {Array} props.employees - Array of { id, name } employee objects.
 */
const ManualEntryModal = ({ open, onClose, onSave, isLoading, employees }) => {
  const [employeeId, setEmployeeId] = useState("")
  const [clockIn, setClockIn] = useState("")
  const [clockOut, setClockOut] = useState("")
  const [workSummary, setWorkSummary] = useState("")
  const [manualEntryReason, setManualEntryReason] = useState("")

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmployeeId("")

      setClockIn("")

      setClockOut("")

      setWorkSummary("")

      setManualEntryReason("")
    }
  }, [open])

  const canSave =
    employeeId &&
    clockIn &&
    clockOut &&
    manualEntryReason.trim().length >= 5 &&
    new Date(clockOut) > new Date(clockIn)

  const handleSave = () => {
    if (!canSave) return
    onSave({
      employeeId: Number(employeeId),
      clockIn: new Date(clockIn).toISOString(),
      clockOut: new Date(clockOut).toISOString(),
      workSummary: workSummary.trim() || undefined,
      manualEntryReason: manualEntryReason.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Manual Attendance Entry</DialogTitle>
          <DialogDescription>
            Create a clock-in/out record on behalf of an employee. The entry
            will be marked as a manual entry.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Employee select */}
          <div className="flex flex-col gap-1.5">
            <Label>
              Employee <span className="text-destructive">*</span>
            </Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee…" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clock In */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="manual-clock-in">
              Clock In <span className="text-destructive">*</span>
            </Label>
            <Input
              id="manual-clock-in"
              type="datetime-local"
              value={clockIn}
              onChange={(event) => setClockIn(event.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Clock Out */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="manual-clock-out">
              Clock Out <span className="text-destructive">*</span>
            </Label>
            <Input
              id="manual-clock-out"
              type="datetime-local"
              value={clockOut}
              onChange={(event) => setClockOut(event.target.value)}
              disabled={isLoading}
            />
            {clockIn && clockOut && new Date(clockOut) <= new Date(clockIn) && (
              <p className="text-xs text-destructive">
                Clock-out must be after clock-in.
              </p>
            )}
          </div>

          {/* Work summary */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="manual-summary">Work Summary</Label>
            <Textarea
              id="manual-summary"
              placeholder="e.g. Employee reported working on the budget report"
              rows={2}
              value={workSummary}
              onChange={(event) => setWorkSummary(event.target.value)}
              disabled={isLoading}
              className="resize-none"
            />
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="manual-reason">
              Reason for Manual Entry{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="manual-reason"
              placeholder="e.g. Employee forgot to clock in — confirmed via email on 2026-02-19"
              rows={2}
              value={manualEntryReason}
              onChange={(event) => setManualEntryReason(event.target.value)}
              disabled={isLoading}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave || isLoading}>
            {isLoading ? "Adding…" : "Add Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

ManualEntryModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  employees: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }),
  ),
}

ManualEntryModal.defaultProps = {
  isLoading: false,
  employees: [],
}

export default ManualEntryModal
