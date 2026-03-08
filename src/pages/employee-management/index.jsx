import { useMemo, useState } from "react"

import { toast } from "@/components/ui/use-toast"
import { resetPassword } from "@/lib/firebase"
import {
  useDeleteEmployee,
  useFetchEmployees,
} from "@query/employee-management.query"

import EmployeeListUI from "./employee-list.ui"

/**
 * EmployeeList container — fetches the employee list and handles search/delete.
 */
const EmployeeList = () => {
  const [search, setSearch] = useState("")

  const { data, isLoading, isError, error } = useFetchEmployees()
  const { mutate: deleteEmployee } = useDeleteEmployee()

  const employees = useMemo(() => {
    const list = data?.employees ?? []
    if (!search.trim()) return list
    const lower = search.toLowerCase()
    return list.filter(
      (employee) =>
        employee.name.toLowerCase().includes(lower) ||
        employee.email.toLowerCase().includes(lower)
    )
  }, [data, search])

  const handleSendInvite = async (email) => {
    try {
      await resetPassword(email)
      toast({
        title: "Invite sent",
        description: `Password setup email sent to ${email}.`,
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to send invite email. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (id) => {
    deleteEmployee(id, {
      onSuccess: () => {
        toast({ title: "Employee removed", description: "Record deleted." })
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to remove employee.",
          variant: "destructive",
        })
      },
    })
  }

  return (
    <EmployeeListUI
      employees={employees}
      stats={data?.stats}
      isLoading={isLoading}
      isError={isError || Boolean(error)}
      search={search}
      onSearchChange={setSearch}
      onSendInvite={handleSendInvite}
      onDelete={handleDelete}
    />
  )
}

export default EmployeeList
