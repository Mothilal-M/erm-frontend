import { useState } from "react"

import { useToast } from "@/components/ui/use-toast"
import {
  useAdminAttendanceLogs,
  useAddManualAttendanceEntry,
  useEditAttendanceEntry,
  useFlagAttendanceEntry,
} from "@query/attendance.query"

import AdminLogsUI from "./logs.ui"

const PAGE_SIZE = 20

/** Known employees list — in production you'd query the employees API instead. */
const KNOWN_EMPLOYEES = [
  { id: 1, name: "Jane Smith" },
  { id: 2, name: "Bob Jones" },
  { id: 3, name: "Alice Chen" },
  { id: 4, name: "David Kim" },
  { id: 5, name: "Sara Patel" },
]

const DEFAULT_FILTERS = { status: "ALL", date: "" }

const AdminLogs = () => {
  const { toast } = useToast()

  // ── Filter & pagination state ─────────────────────────────────────────────
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)

  const activeFilters = {
    ...filters,
    page,
    page_size: PAGE_SIZE,
    ...(filters.status === "ALL" ? { status: undefined } : {}),
  }

  const { data: logsData, isLoading } = useAdminAttendanceLogs(activeFilters)
  const logs = logsData?.results ?? []
  const totalCount = logsData?.count ?? 0

  const handleFilterChange = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }))
    setPage(1) // reset on filter change
  }

  const handleFilterReset = () => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  // ── Edit modal ────────────────────────────────────────────────────────────
  const [editEntry, setEditEntry] = useState(null)

  const editMutation = useEditAttendanceEntry()

  const handleEditSave = ({ clockIn, clockOut, editReason }) => {
    editMutation.mutate(
      { id: editEntry.id, clockIn, clockOut, editReason },
      {
        onSuccess: () => {
          toast({ title: "Entry updated successfully." })
          setEditEntry(null)
        },
        onError: () => {
          toast({ title: "Failed to update entry.", variant: "destructive" })
        },
      },
    )
  }

  // ── Flag modal ────────────────────────────────────────────────────────────
  const [flagEntry, setFlagEntry] = useState(null)

  const flagMutation = useFlagAttendanceEntry()

  const handleFlagSave = ({ isFlagged, flagReason }) => {
    flagMutation.mutate(
      { id: flagEntry.id, isFlagged, flagReason },
      {
        onSuccess: () => {
          const label = isFlagged ? "Entry flagged." : "Entry unflagged."
          toast({ title: label })
          setFlagEntry(null)
        },
        onError: () => {
          toast({ title: "Failed to update flag.", variant: "destructive" })
        },
      },
    )
  }

  // ── Manual entry modal ────────────────────────────────────────────────────
  const [manualOpen, setManualOpen] = useState(false)

  const manualMutation = useAddManualAttendanceEntry()

  const handleManualSave = (payload) => {
    manualMutation.mutate(payload, {
      onSuccess: () => {
        toast({ title: "Manual entry added." })
        setManualOpen(false)
      },
      onError: () => {
        toast({ title: "Failed to add manual entry.", variant: "destructive" })
      },
    })
  }

  // ── View detail ───────────────────────────────────────────────────────────
  const [viewEntry, setViewEntry] = useState(null)

  // ── Named handler wrappers for prop naming rules ──────────────────────────
  const handlePageChange = (p) => setPage(p)
  const handleEditOpen = (entry) => setEditEntry(entry)
  const handleFlagOpen = (entry) => setFlagEntry(entry)
  const handleViewOpen = (entry) => setViewEntry(entry)

  return (
    <AdminLogsUI
      logs={logs}
      isLoading={isLoading}
      filters={filters}
      onFilterChange={handleFilterChange}
      onFilterReset={handleFilterReset}
      page={page}
      totalCount={totalCount}
      pageSize={PAGE_SIZE}
      onPageChange={handlePageChange}
      // edit
      editEntry={editEntry}
      editLoading={editMutation.isPending}
      onEditOpen={handleEditOpen}
      onEditClose={() => setEditEntry(null)}
      onEditSave={handleEditSave}
      // flag
      flagEntry={flagEntry}
      flagLoading={flagMutation.isPending}
      onFlagOpen={handleFlagOpen}
      onFlagClose={() => setFlagEntry(null)}
      onFlagSave={handleFlagSave}
      // manual
      manualOpen={manualOpen}
      manualLoading={manualMutation.isPending}
      onManualOpen={() => setManualOpen(true)}
      onManualClose={() => setManualOpen(false)}
      onManualSave={handleManualSave}
      employees={KNOWN_EMPLOYEES}
      // view
      viewEntry={viewEntry}
      onViewOpen={handleViewOpen}
      onViewClose={() => setViewEntry(null)}
    />
  )
}

export default AdminLogs
