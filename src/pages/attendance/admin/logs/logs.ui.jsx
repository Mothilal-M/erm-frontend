import PropTypes from "prop-types"
import { motion } from "framer-motion"
import { ClipboardList } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { exportLogsToCSV, exportLogsToJSON } from "@lib/utils/attendance-export"

import AnimatedCard from "@/components/magicui/animated-card"
import BlurText from "@/components/magicui/blur-text"
import FadeIn from "@/components/magicui/fade-in"
import PulseBadge from "@/components/magicui/pulse-badge"

import EditEntryModal from "./components/edit-entry-modal"
import FlagEntryModal from "./components/flag-entry-modal"
import LogsFilters from "./components/logs-filters"
import LogsTable from "./components/logs-table"
import ManualEntryModal from "./components/manual-entry-modal"

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * EntryDetailOptionalFields — renders optional entry detail fields.
 * @param {object} props - Component props.
 * @param {object} props.entry - The log entry object containing optional fields like flagReason, workSummary, editReason, manualEntryReason.
 */
const EntryDetailOptionalFields = ({ entry }) => (
  <>
    {entry.isFlagged && (
      <div className="col-span-2">
        <p className="text-xs text-destructive">Flag Reason</p>
        <p className="font-medium text-destructive">{entry.flagReason}</p>
      </div>
    )}
    {entry.workSummary && (
      <div className="col-span-2 md:col-span-4">
        <p className="text-xs text-muted-foreground">Work Summary</p>
        <p className="font-medium">{entry.workSummary}</p>
      </div>
    )}
    {entry.editReason && (
      <div className="col-span-2 md:col-span-4">
        <p className="text-xs text-muted-foreground">Edit Reason</p>
        <p className="font-medium">{entry.editReason}</p>
      </div>
    )}
    {entry.manualEntryReason && (
      <div className="col-span-2 md:col-span-4">
        <p className="text-xs text-muted-foreground">Manual Entry Reason</p>
        <p className="font-medium">{entry.manualEntryReason}</p>
      </div>
    )}
  </>
)

EntryDetailOptionalFields.propTypes = {
  entry: PropTypes.shape({
    isFlagged: PropTypes.bool,
    flagReason: PropTypes.string,
    workSummary: PropTypes.string,
    editReason: PropTypes.string,
    manualEntryReason: PropTypes.string,
  }).isRequired,
}

/**
 * EntryDetailPanel — displays details of a selected log entry
 * @param {object} props - Props for the entry detail panel.
 * @param {object} props.entry - The log entry object containing details to display.
 * @param {() => void} props.onClose - Callback when the close button is clicked.
 */
const EntryDetailPanel = ({ entry, onClose }) => {
  if (!entry) return null

  return (
    <AnimatedCard delay={0.1} className="border-0 shadow-sm">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-base">Entry Detail</CardTitle>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Employee</p>
            <p className="font-medium">{entry.employeeName ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Department</p>
            <p className="font-medium">{entry.department ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Clock In</p>
            <p className="font-medium">
              {entry.clockIn ? new Date(entry.clockIn).toLocaleString() : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Clock Out</p>
            <p className="font-medium">
              {entry.clockOut ? new Date(entry.clockOut).toLocaleString() : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-medium">{entry.durationDisplay ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="font-medium">{entry.status ?? "—"}</p>
          </div>
          <EntryDetailOptionalFields entry={entry} />
        </CardContent>
      </Card>
    </AnimatedCard>
  )
}

EntryDetailPanel.propTypes = {
  entry: PropTypes.object,
  onClose: PropTypes.func.isRequired,
}

EntryDetailPanel.defaultProps = {
  entry: null,
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * AdminLogsUI — presenter for the admin attendance logs page.
 * @param {object} props - Component props.
 * @param {Array} props.logs - Array of log entries.
 * @param {boolean} props.isLoading - Whether logs are loading.
 * @param {object} props.filters - Current filter state.
 * @param {(key: string, value: string | undefined) => void} props.onFilterChange - Handle filter changes.
 * @param {() => void} props.onFilterReset - Reset filters.
 * @param {number} props.page - Current page number.
 * @param {number} props.totalCount - Total count of logs.
 * @param {number} props.pageSize - Page size.
 * @param {(page: number) => void} props.onPageChange - Handle page changes.
 * @param {object} props.editEntry - Entry being edited.
 * @param {boolean} props.editLoading - Whether edit is in progress.
 * @param {(entry: object) => void} props.onEditOpen - Open edit modal.
 * @param {() => void} props.onEditClose - Close edit modal.
 * @param {(data: object) => void} props.onEditSave - Save edited entry.
 * @param {object} props.flagEntry - Entry being flagged.
 * @param {boolean} props.flagLoading - Whether flag is in progress.
 * @param {(entry: object) => void} props.onFlagOpen - Open flag modal.
 * @param {() => void} props.onFlagClose - Close flag modal.
 * @param {(data: object) => void} props.onFlagSave - Save flag entry.
 * @param {boolean} props.manualOpen - Whether manual entry dialog is open.
 * @param {boolean} props.manualLoading - Whether manual entry is in progress.
 * @param {() => void} props.onManualOpen - Open manual entry modal.
 * @param {() => void} props.onManualClose - Close manual entry modal.
 * @param {(data: object) => void} props.onManualSave - Save manual entry.
 * @param {Array} props.employees - Array of employees.
 * @param {object} props.viewEntry - Entry being viewed.
 * @param {(entry: object) => void} props.onViewOpen - Open detail view.
 * @param {() => void} props.onViewClose - Close detail view.
 */
const AdminLogsUI = ({
  logs,
  isLoading,
  filters,
  onFilterChange,
  onFilterReset,
  page,
  totalCount,
  pageSize,
  onPageChange,
  // edit modal
  editEntry,
  editLoading,
  onEditOpen,
  onEditClose,
  onEditSave,
  // flag modal
  flagEntry,
  flagLoading,
  onFlagOpen,
  onFlagClose,
  onFlagSave,
  // manual entry modal
  manualOpen,
  manualLoading,
  onManualOpen,
  onManualClose,
  onManualSave,
  employees,
  // optional: selected entry for details
  viewEntry,
  onViewOpen,
  onViewClose,
}) => {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Page header */}
      <FadeIn direction="down" delay={0} duration={0.5}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
            <div>
              <BlurText
                text="Attendance Logs"
                className="text-xl font-semibold"
                delay={0.05}
              />
              <p className="text-sm text-muted-foreground">
                Review, edit, and manage employee attendance records.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PulseBadge color="blue">
              {totalCount ?? 0} record{totalCount !== 1 ? "s" : ""}
            </PulseBadge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <DropdownMenuItem
                    onClick={() =>
                      exportLogsToCSV(
                        logs,
                        `attendance-logs-${new Date().toISOString().split("T")[0]}.csv`,
                      )
                    }
                  >
                    Export as CSV
                  </DropdownMenuItem>
                </motion.div>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <DropdownMenuItem
                    onClick={() =>
                      exportLogsToJSON(
                        logs,
                        `attendance-logs-${new Date().toISOString().split("T")[0]}.json`,
                      )
                    }
                  >
                    Export as JSON
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </FadeIn>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        style={{ originX: 0 }}
      >
        <div className="h-px w-full bg-border" />
      </motion.div>

      {/* Filters row */}
      <FadeIn direction="up" delay={0.15} duration={0.4}>
        <LogsFilters
          filters={filters}
          onChange={onFilterChange}
          onReset={onFilterReset}
          onAddManualEntry={onManualOpen}
        />
      </FadeIn>

      {/* Logs table */}
      <FadeIn direction="up" delay={0.25} duration={0.4}>
        <LogsTable
          logs={logs}
          isLoading={isLoading}
          page={page}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onEdit={onEditOpen}
          onFlag={onFlagOpen}
          onView={onViewOpen}
        />
      </FadeIn>

      {/* View detail panel (inline card) */}
      <EntryDetailPanel entry={viewEntry} onClose={onViewClose} />

      {/* Edit Entry Modal */}
      <EditEntryModal
        entry={editEntry}
        onClose={onEditClose}
        onSave={onEditSave}
        isLoading={editLoading}
      />

      {/* Flag / Unflag Modal */}
      <FlagEntryModal
        entry={flagEntry}
        onClose={onFlagClose}
        onSave={onFlagSave}
        isLoading={flagLoading}
      />

      {/* Manual Entry Modal */}
      <ManualEntryModal
        open={manualOpen}
        onClose={onManualClose}
        onSave={onManualSave}
        isLoading={manualLoading}
        employees={employees}
      />
    </div>
  )
}

AdminLogsUI.propTypes = {
  logs: PropTypes.array,
  isLoading: PropTypes.bool,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func.isRequired,
  onFilterReset: PropTypes.func.isRequired,
  page: PropTypes.number,
  totalCount: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  editEntry: PropTypes.object,
  editLoading: PropTypes.bool,
  onEditOpen: PropTypes.func.isRequired,
  onEditClose: PropTypes.func.isRequired,
  onEditSave: PropTypes.func.isRequired,
  flagEntry: PropTypes.object,
  flagLoading: PropTypes.bool,
  onFlagOpen: PropTypes.func.isRequired,
  onFlagClose: PropTypes.func.isRequired,
  onFlagSave: PropTypes.func.isRequired,
  manualOpen: PropTypes.bool,
  manualLoading: PropTypes.bool,
  onManualOpen: PropTypes.func.isRequired,
  onManualClose: PropTypes.func.isRequired,
  onManualSave: PropTypes.func.isRequired,
  employees: PropTypes.array,
  viewEntry: PropTypes.object,
  onViewOpen: PropTypes.func.isRequired,
  onViewClose: PropTypes.func.isRequired,
}

AdminLogsUI.defaultProps = {
  logs: [],
  isLoading: false,
  filters: {},
  page: 1,
  totalCount: 0,
  pageSize: 20,
  editEntry: null,
  editLoading: false,
  flagEntry: null,
  flagLoading: false,
  manualOpen: false,
  manualLoading: false,
  employees: [],
  viewEntry: null,
}

export default AdminLogsUI
