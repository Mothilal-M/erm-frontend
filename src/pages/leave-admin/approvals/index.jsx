import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { toast } from "@/components/ui/use-toast"
import ct from "@constants/"
import { useApproveLeave, useFetchAdminApprovals } from "@query/leave.query"

import ApprovalsUI from "./approvals.ui"

/**
 * ApprovalsPage container — fetches all leave requests and handles approve/reject actions.
 */
const ApprovalsPage = () => {
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useFetchAdminApprovals()
  const { mutate: approveLeave, isPending: isActing } = useApproveLeave()

  const [filter, setFilter] = useState("pending")
  const [noteMap, setNoteMap] = useState({})

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load approvals.",
        variant: "destructive",
      })
    }
  }, [error])

  const handleAction = (id, status) => {
    approveLeave(
      { id, status, note: noteMap[id] ?? "" },
      {
        onSuccess: (response) => {
          toast({
            title: status === "approved" ? "Approved ✓" : "Rejected",
            description: response.data?.message,
          })
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Action failed. Please try again.",
            variant: "destructive",
          })
        },
      },
    )
  }

  const handleNoteChange = (id, value) => {
    setNoteMap((previous) => ({ ...previous, [id]: value }))
  }

  const handleFilterChange = (value) => setFilter(value)

  return (
    <ApprovalsUI
      requests={data ?? []}
      isLoading={isLoading}
      isError={isError}
      isActing={isActing}
      filter={filter}
      onFilterChange={handleFilterChange}
      noteMap={noteMap}
      onNoteChange={handleNoteChange}
      onAction={handleAction}
      onManualRecord={() => navigate(ct.route.leave.ADMIN_MANUAL_RECORD)}
    />
  )
}

export default ApprovalsPage
