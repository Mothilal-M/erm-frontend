import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"

import { toast } from "@/components/ui/use-toast"
import ct from "@constants/"
import {
  useFetchEmployee,
  useUpdateEmployee,
} from "@query/employee-management.query"

import EditEmployeeUI from "./edit-employee.ui"

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  department: z.string().min(1, "Please select a department"),
  role: z.string().min(1, "Please select a role"),
  joinDate: z.string().min(1, "Join date is required"),
  status: z.string().min(1, "Please select a status"),
})

// ─── Container ────────────────────────────────────────────────────────────────

/**
 * EditEmployee container — loads employee data by ID and handles form updates.
 */
const EditEmployee = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useFetchEmployee(id)
  const { mutate: updateEmployee, isPending } = useUpdateEmployee()

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      department: "",
      role: "",
      joinDate: "",
      status: "",
    },
  })

  // Populate form once data is available
  useEffect(() => {
    if (data) {
      form.reset(data)
    }
  }, [data, form])

  const handleSubmit = (values) => {
    updateEmployee(
      { id, ...values },
      {
        onSuccess: () => {
          toast({
            title: "Changes saved",
            description: `${values.name}'s profile has been updated.`,
          })
          navigate(ct.route.employeeManagement.LIST)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save changes. Please try again.",
            variant: "destructive",
          })
        },
      },
    )
  }

  return (
    <EditEmployeeUI
      form={form}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      isLoading={isLoading}
      employeeId={id}
    />
  )
}

export default EditEmployee
