import { useState } from "react"
import { useSelector } from "react-redux"

import { toast } from "@/components/ui/use-toast"
import { useFetchEmployees } from "@query/employee-management.query"
import { useFetchRewards, useGrantReward } from "@query/rewards.query"

import RewardsUI from "./rewards.ui"

/**
 * Rewards container — admin can view all rewards and grant new ones.
 */
const RewardsPage = () => {
  const userRole = useSelector((state) => state.user.userRole)
  const employeeManagementRole = useSelector(
    (state) => state.user.employee_management_role
  )

  const [isGrantOpen, setIsGrantOpen] = useState(false)
  const [search, setSearch] = useState("")

  const isAdmin = employeeManagementRole === "admin" || userRole === "admin"

  const { data: rewardsData, isLoading, isError } = useFetchRewards()
  const { data: employeesData } = useFetchEmployees({ enabled: isAdmin })
  const { mutate: grantReward, isPending: isGranting } = useGrantReward()

  const rewards = rewardsData?.rewards ?? []
  const stats = rewardsData?.stats ?? {}
  const employees = employeesData?.employees ?? []

  const filteredRewards = rewards.filter((r) => {
    if (!search.trim()) return true
    const lower = search.toLowerCase()
    return (
      r.employeeName?.toLowerCase().includes(lower) ||
      r.title?.toLowerCase().includes(lower) ||
      r.type?.toLowerCase().includes(lower)
    )
  })

  const handleGrantReward = (payload) => {
    const employee = employees.find(
      (emp) => String(emp.id) === String(payload.employeeId)
    )
    grantReward(
      {
        ...payload,
        employeeName: employee?.name ?? payload.employeeId,
        employeeEmail: employee?.email ?? "",
      },
      {
        onSuccess: () => {
          toast({
            title: "Reward granted!",
            description: `${employee?.name ?? "Employee"} has been recognized.`,
          })
          setIsGrantOpen(false)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to grant reward.",
            variant: "destructive",
          })
        },
      }
    )
  }

  return (
    <RewardsUI
      rewards={filteredRewards}
      stats={stats}
      employees={employees}
      isAdmin={isAdmin}
      isLoading={isLoading}
      isError={isError}
      isGrantOpen={isGrantOpen}
      isGranting={isGranting}
      search={search}
      onSearchChange={setSearch}
      onOpenGrant={() => setIsGrantOpen(true)}
      onCloseGrant={() => setIsGrantOpen(false)}
      onGrantReward={handleGrantReward}
    />
  )
}

export default RewardsPage
