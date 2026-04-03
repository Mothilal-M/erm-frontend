import { Flag, Pencil, Eye } from "lucide-react"
import PropTypes from "prop-types"
import { useRef } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—"

const fmtDurationMins = (mins) => {
  if (!mins) return "—"
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const STATUS_BADGE = {
  IN_PROGRESS:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  COMPLETED:
    "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  AUTO_EXPIRED:
    "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  EDITED:
    "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  MANUAL: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
}

const STATUS_LABEL = {
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  AUTO_EXPIRED: "Auto-Expired",
  EDITED: "Edited",
  MANUAL: "Manual",
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * LogsTable — the data table for admin attendance logs.
 * @param {object} props - Component props.
 * @param {Array} props.logs - Array of log entries.
 * @param {boolean} props.isLoading - Whether logs are loading.
 * @param {number} props.page - Current page number.
 * @param {number} props.totalCount - Total number of records.
 * @param {number} props.pageSize - Number of records per page.
 * @param {(page: number) => void} props.onPageChange - Called when page changes.
 * @param {(entry: object) => void} props.onEdit - Called to edit an entry.
 * @param {(entry: object) => void} props.onFlag - Called to flag an entry.
 * @param {(entry: object) => void} props.onView - Called to view an entry.
 */
/* eslint-disable max-lines-per-function, complexity */
const LogsTable = ({
  logs,
  isLoading,
  page,
  totalCount,
  pageSize,
  onPageChange,
  onEdit,
  onFlag,
  onView,
}) => {
  const handleView = (entry) => {
    onView(entry)
  }

  const handleEdit = (entry) => {
    onEdit(entry)
  }

  const handleFlag = (entry) => {
    onFlag(entry)
  }

  const handlePreviousPage = () => {
    onPageChange(page - 1)
  }

  const handleNextPage = () => {
    onPageChange(page + 1)
  }

  // hook must be called unconditionally
  // eslint-disable-next-line react-hooks/purity
  const skeletonIdReference = useRef(`skeleton-${Date.now()}`)

  if (isLoading) {
    const skeletonIds = Array.from(
      { length: 8 },
      (_, index) => `${skeletonIdReference.current}-${index}`,
    )

    return (
      <div className="flex flex-col gap-2">
        {skeletonIds.map((id) => (
          <Skeleton key={id} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <TooltipProvider delayDuration={300}>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                Employee
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                Dept
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                Clock In
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                Clock Out
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                Duration
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                Work Summary
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No entries found.
                </td>
              </tr>
            ) : (
              logs.map((entry) => (
                <tr
                  key={entry.id}
                  className={[
                    "border-b last:border-0 transition-colors hover:bg-muted/30",
                    entry.isFlagged ? "bg-red-500/5 hover:bg-red-500/10" : "",
                    entry.status === "AUTO_EXPIRED"
                      ? "bg-amber-500/5 hover:bg-amber-500/10"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {entry.isFlagged && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Flag className="w-3.5 h-3.5 text-red-500 fill-red-500 flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-52">
                              <span className="font-semibold">Flagged:</span>{" "}
                              {entry.flagReason}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {entry.employeeName}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                    {entry.department}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                    {entry.date}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">
                    {fmtTime(entry.clockIn)}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">
                    {fmtTime(entry.clockOut)}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">
                    {fmtDurationMins(entry.durationMinutes)}
                  </td>
                  <td className="px-3 py-2.5 max-w-[180px]">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate block max-w-[180px] cursor-default text-muted-foreground">
                          {entry.workSummary ?? "—"}
                        </span>
                      </TooltipTrigger>
                      {entry.workSummary && (
                        <TooltipContent side="top" className="max-w-64">
                          <p>{entry.workSummary}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-0.5">
                      <Badge
                        className={`text-xs ${STATUS_BADGE[entry.status] ?? STATUS_BADGE.COMPLETED}`}
                        variant="outline"
                      >
                        {STATUS_LABEL[entry.status] ?? entry.status}
                      </Badge>
                      {entry.isManualEntry && (
                        <Badge
                          className="text-xs bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30"
                          variant="outline"
                        >
                          Manual
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleView(entry)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View details</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleEdit(entry)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit entry</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-7 w-7 ${entry.isFlagged ? "text-red-500 hover:text-red-600" : ""}`}
                            onClick={() => handleFlag(entry)}
                          >
                            <Flag
                              className={`h-3.5 w-3.5 ${entry.isFlagged ? "fill-red-500" : ""}`}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {entry.isFlagged ? "Unflag" : "Flag as suspicious"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} ({totalCount} entries)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={handlePreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}

LogsTable.propTypes = {
  logs: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  page: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onFlag: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
}

export default LogsTable
