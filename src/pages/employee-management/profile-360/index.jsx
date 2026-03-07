import { useEffect } from "react"
import { useParams } from "react-router-dom"

import { toast } from "@/components/ui/use-toast"
import { useFetchEmployee360 } from "@query/employee-management.query"

import Employee360UI from "./employee-360.ui"

/**
 * Employee360 container — fetches and displays the complete 360° profile
 * for a specific employee including personal, attendance, leave,
 * performance, assets, documents, and timeline.
 */
const Employee360 = () => {
  const { id } = useParams()

  const { data, isLoading, isError, error } = useFetchEmployee360(id)

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load employee profile.",
        variant: "destructive",
      })
    }
  }, [error])

  return <Employee360UI data={data} isLoading={isLoading} isError={isError} />
}

export default Employee360
