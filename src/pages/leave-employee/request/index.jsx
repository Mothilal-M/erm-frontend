import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { toast } from "@/components/ui/use-toast"
import { usePostLeaveRequest } from "@query/leave.query"

import RequestLeaveUI from "./request-leave.ui"

/* eslint-disable react-hooks/incompatible-library */

const schema = z
  .object({
    leaveType: z.string().min(1, "Select a leave type"),
    subType: z.enum(["full", "wfh", "halfday"], {
      required_error: "Select a request type",
    }),
    halfDaySlot: z.enum(["morning", "afternoon"]).optional(),
    fromDate: z.string().min(1, "Start date is required"),
    toDate: z.string().min(1, "End date is required"),
    reason: z
      .string()
      .min(10, "Please provide at least 10 characters")
      .max(500, "Reason must be under 500 characters"),
    contactDuringLeave: z.string().optional(),
    handoverTo: z.string().optional(),
  })
  .refine((d) => new Date(d.toDate) >= new Date(d.fromDate), {
    message: "End date must be on or after start date",
    path: ["toDate"],
  })
  .refine((d) => d.subType !== "halfday" || !!d.halfDaySlot, {
    message: "Select morning or afternoon for half day",
    path: ["halfDaySlot"],
  })

/**
 * RequestLeavePage container — employee leave application form.
 */
const RequestLeavePage = () => {
  const {
    mutate: submitRequest,
    isPending: isSubmitting,
    isSuccess,
    reset: resetMutation,
  } = usePostLeaveRequest()

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      leaveType: "",
      subType: "",
      halfDaySlot: "",
      fromDate: "",
      toDate: "",
      reason: "",
      contactDuringLeave: "",
      handoverTo: "",
    },
  })

  const subType = form.watch("subType")
  const fromDate = form.watch("fromDate")
  const toDate = form.watch("toDate")

  // Auto-lock toDate = fromDate for single-day types (wfh, halfday)
  useEffect(() => {
    if ((subType === "wfh" || subType === "halfday") && fromDate) {
      form.setValue("toDate", fromDate, { shouldValidate: true })
    }
  }, [subType, fromDate, form])

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Request Submitted ✓",
        description: "Your leave request has been sent for approval.",
      })
      form.reset()
      resetMutation()
    }
  }, [isSuccess, form, resetMutation])

  const onSubmit = (values) => {
    const days = calcDays()
    const payload = {
      leaveType: values.leaveType,
      subType: values.subType,
      dateFrom: values.fromDate,
      dateTo: values.toDate,
      days,
      reason: values.reason || undefined,
    }
    submitRequest(payload, {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to submit request. Please try again.",
          variant: "destructive",
        })
      },
    })
  }

  // Calculate number of working days selected
  const calcDays = () => {
    if (!fromDate || !toDate) return 0
    const from = new Date(fromDate)
    const to = new Date(toDate)
    if (subType === "halfday") return 0.5
    let count = 0
    const current = new Date(from)
    while (current <= to) {
      const day = current.getDay()
      if (day !== 0 && day !== 6) count++
      current.setDate(current.getDate() + 1)
    }
    return count
  }

  const handleSubmit = form.handleSubmit(onSubmit)

  return (
    <RequestLeaveUI
      form={form}
      subType={subType}
      estimatedDays={calcDays()}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  )
}

export default RequestLeavePage
