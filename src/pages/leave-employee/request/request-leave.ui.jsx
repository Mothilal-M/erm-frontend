import { motion, AnimatePresence } from "framer-motion"
import { FileText, CalendarDays, AlertTriangle, Send, BarChart3 } from "lucide-react"
import PropTypes from "prop-types"

import {
  AnimatedCard,
  BlurText,
  FadeIn,
  ShimmerButton,
  PulseBadge,
} from "@/components/magicui"
import { Badge } from "@/components/ui/badge"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

/* eslint-disable max-lines-per-function */

const LEAVE_TYPES = [
  { value: "Annual Leave", icon: "🏖️", desc: "Planned vacation / personal time" },
  { value: "Sick Leave", icon: "🤒", desc: "Illness or medical needs" },
  { value: "Casual Leave", icon: "🎲", desc: "Short unplanned leave" },
  { value: "Compensatory", icon: "⚖️", desc: "In lieu of overtime worked" },
  { value: "Unpaid Leave", icon: "💰", desc: "Leave without pay" },
  { value: "Maternity/Paternity", icon: "👶", desc: "Parental leave" },
]

const SUB_TYPES = [
  { value: "full", icon: "📅", label: "Full Day(s)", desc: "One or more full working days" },
  { value: "halfday", icon: "🌗", label: "Half Day", desc: "Morning or afternoon only" },
  { value: "wfh", icon: "🏠", label: "Work From Home", desc: "Working remotely (requires approval)" },
]

const HALF_DAY_SLOTS = [
  { value: "morning", label: "Morning", desc: "Until 1 PM", icon: "🌅" },
  { value: "afternoon", label: "Afternoon", desc: "From 1 PM", icon: "🌇" },
]

const [TODAY] = new Date().toISOString().split("T")

const RequestLeaveUI = ({ form, subType, estimatedDays, isSubmitting, onSubmit }) => {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="rounded-xl p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg"
          >
            <FileText className="h-5 w-5" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <BlurText text="Request Leave" />
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Submit a leave, WFH, or half-day request for approval.
            </p>
          </div>
        </div>
      </FadeIn>

      <AnimatedCard delay={0.1} className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Leave Request Form</CardTitle>
          <CardDescription className="text-xs">
            Fields marked with * are required. Requests are usually reviewed within 1-2 business days.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Request type */}
              <FormField
                control={form.control}
                name="subType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Type *</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {SUB_TYPES.map((st, idx) => (
                        <motion.button
                          key={st.value}
                          type="button"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 + idx * 0.06 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => field.onChange(st.value)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            field.value === st.value
                              ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="text-xl">{st.icon}</div>
                          <p className="text-sm font-semibold mt-1">{st.label}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{st.desc}</p>
                        </motion.button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Leave category */}
              <FadeIn delay={0.2}>
                <FormField
                  control={form.control}
                  name="leaveType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leave Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select leave category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LEAVE_TYPES.map((lt) => (
                            <SelectItem key={lt.value} value={lt.value}>
                              {lt.icon} {lt.value} — <span className="text-muted-foreground">{lt.desc}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FadeIn>

              {/* Date range */}
              <FadeIn delay={0.25}>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="fromDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Date *</FormLabel>
                        <FormControl>
                          <Input type="date" min={TODAY} className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="toDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Date *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            min={form.watch("fromDate") || TODAY}
                            disabled={subType === "wfh" || subType === "halfday"}
                            className="rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        {(subType === "wfh" || subType === "halfday") && (
                          <FormDescription className="text-xs">Auto-set to same day</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FadeIn>

              {/* Half day slot */}
              <AnimatePresence>
                {subType === "halfday" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FormField
                      control={form.control}
                      name="halfDaySlot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Half Day Slot *</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {HALF_DAY_SLOTS.map((slot) => (
                              <motion.button
                                key={slot.value}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => field.onChange(slot.value)}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${
                                  field.value === slot.value
                                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                    : "border-border hover:border-primary/40"
                                }`}
                              >
                                <span className="text-xl">{slot.icon}</span>
                                <p className="text-sm font-medium mt-1">{slot.label}</p>
                                <p className="text-[11px] text-muted-foreground">{slot.desc}</p>
                              </motion.button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Estimated days */}
              <AnimatePresence>
                {estimatedDays > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <BarChart3 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">Estimated:</span>
                    <PulseBadge color="emerald">
                      {estimatedDays} working {estimatedDays === 1 ? "day" : "days"}
                    </PulseBadge>
                    <span className="text-xs text-muted-foreground ml-auto">(weekends excluded)</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ transformOrigin: "left" }}
              >
                <Separator />
              </motion.div>

              {/* Reason */}
              <FadeIn delay={0.3}>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Briefly explain your reason for this leave request..."
                          className="resize-none rounded-xl"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs tabular-nums">
                        {field.value?.length ?? 0}/500 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FadeIn>

              {/* Optional fields */}
              <FadeIn delay={0.35}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="handoverTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Handover To</FormLabel>
                        <FormControl>
                          <Input placeholder="Colleague's name..." className="rounded-xl" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">Who covers your work?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactDuringLeave"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone or email..." className="rounded-xl" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">If urgent contact needed</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FadeIn>

              {/* Policy reminder */}
              <FadeIn delay={0.4}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="flex gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    Requests must be submitted at least <strong>2 working days</strong> in advance
                    (except sick leave). WFH requests require manager approval.
                  </p>
                </motion.div>
              </FadeIn>

              <FadeIn delay={0.45}>
                <ShimmerButton
                  className="w-full h-11 rounded-xl text-sm"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </ShimmerButton>
              </FadeIn>
            </form>
          </Form>
        </CardContent>
      </AnimatedCard>
    </div>
  )
}

RequestLeaveUI.propTypes = {
  form: PropTypes.object.isRequired,
  subType: PropTypes.string.isRequired,
  estimatedDays: PropTypes.number.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default RequestLeaveUI
