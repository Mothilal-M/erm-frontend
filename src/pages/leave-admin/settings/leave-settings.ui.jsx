import { motion } from "framer-motion"
import { Loader2, Save, Settings2 } from "lucide-react"
import PropTypes from "prop-types"

import {
  AnimatedCard,
  BlurText,
  FadeIn,
  ShimmerButton,
} from "@/components/magicui"
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"

// ─── Loading skeleton ─────────────────────────────────────────────────────────

const SettingsSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 3 }).map((_, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <div key={index} className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-60 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          ))}
        </CardContent>
      </div>
    ))}
  </div>
)

// ─── Form field components ────────────────────────────────────────────────────

/**
 * LeaveQuotasCard — renders the leave quotas configuration section.
 * @param {object} props - Component props.
 * @param {object} props.form - React Hook Form instance for managing form state and validation.
 */
const LeaveQuotasCard = ({ form }) => (
  <AnimatedCard delay={0.1} className="border-0 shadow-sm">
    <CardHeader>
      <CardTitle className="text-base">Leave Quotas</CardTitle>
      <CardDescription className="text-xs">
        Annual allocations per employee (in days)
      </CardDescription>
    </CardHeader>
    <CardContent className="grid gap-5 sm:grid-cols-3">
      <FormField
        control={form.control}
        name="annualLeaveQuota"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Annual Leave</FormLabel>
            <FormControl>
              <Input
                className="rounded-xl"
                type="number"
                min={0}
                max={365}
                {...field}
                onChange={(event) => field.onChange(Number(event.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="sickLeaveQuota"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sick Leave</FormLabel>
            <FormControl>
              <Input
                className="rounded-xl"
                type="number"
                min={0}
                max={365}
                {...field}
                onChange={(event) => field.onChange(Number(event.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="casualLeaveQuota"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Casual Leave</FormLabel>
            <FormControl>
              <Input
                className="rounded-xl"
                type="number"
                min={0}
                max={365}
                {...field}
                onChange={(event) => field.onChange(Number(event.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </CardContent>
  </AnimatedCard>
)

LeaveQuotasCard.propTypes = {
  form: PropTypes.object.isRequired,
}

/**
 * CarryForwardCard — renders the carry forward configuration section.
 * @param {object} props - Component props.
 * @param {object} props.form - React Hook Form instance for managing form state and validation.
 */
const CarryForwardCard = ({ form }) => (
  <AnimatedCard delay={0.2} className="border-0 shadow-sm">
    <CardHeader>
      <CardTitle className="text-base">Carry Forward</CardTitle>
      <CardDescription className="text-xs">
        Allow unused leave to roll over to the next year
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-5">
      <FormField
        control={form.control}
        name="carryForwardEnabled"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <FormLabel className="text-sm font-medium">
                Enable Carry Forward
              </FormLabel>
              <FormDescription className="text-xs mt-0.5">
                Employees can carry unused annual leave to the next year
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                className="rounded-xl"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="carryForwardLimit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Carry Forward Limit (days)</FormLabel>
            <FormControl>
              <Input
                className="rounded-xl"
                type="number"
                min={0}
                max={365}
                disabled={!form.watch("carryForwardEnabled")}
                {...field}
                onChange={(event) => field.onChange(Number(event.target.value))}
              />
            </FormControl>
            <FormDescription className="text-xs">
              Maximum number of days that can be carried forward
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </CardContent>
  </AnimatedCard>
)

CarryForwardCard.propTypes = {
  form: PropTypes.object.isRequired,
}

/**
 * LeaveOptionsCard — renders the leave options configuration section.
 * @param {object} props - Component props.
 * @param {object} props.form - React Hook Form instance for managing form state and validation.
 */
const LeaveOptionsCard = ({ form }) => (
  <AnimatedCard delay={0.3} className="border-0 shadow-sm">
    <CardHeader>
      <CardTitle className="text-base">Leave Options</CardTitle>
      <CardDescription className="text-xs">
        Configure available leave sub-types
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <FormField
        control={form.control}
        name="halfDayEnabled"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <FormLabel className="text-sm font-medium">
                Half-Day Leave
              </FormLabel>
              <FormDescription className="text-xs mt-0.5">
                Allow employees to apply for half-day leave
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                className="rounded-xl"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <Separator />

      <FormField
        control={form.control}
        name="wfhEnabled"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <FormLabel className="text-sm font-medium">
                Work From Home (WFH)
              </FormLabel>
              <FormDescription className="text-xs mt-0.5">
                Allow employees to submit WFH requests through leave
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                className="rounded-xl"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </CardContent>
  </AnimatedCard>
)

LeaveOptionsCard.propTypes = {
  form: PropTypes.object.isRequired,
}

/**
 * LeaveYearCard — renders the leave year configuration section.
 * @param {object} props - Component props.
 * @param {object} props.form - React Hook Form instance for managing form state and validation.
 */
const LeaveYearCard = ({ form }) => (
  <AnimatedCard delay={0.4} className="border-0 shadow-sm">
    <CardHeader>
      <CardTitle className="text-base">Leave Year</CardTitle>
      <CardDescription className="text-xs">
        Define when the leave year resets
      </CardDescription>
    </CardHeader>
    <CardContent>
      <FormField
        control={form.control}
        name="leaveYearStart"
        render={({ field }) => (
          <FormItem className="max-w-xs">
            <FormLabel>Year Start (MM-DD)</FormLabel>
            <FormControl>
              <Input
                className="rounded-xl"
                placeholder="01-01"
                maxLength={5}
                {...field}
              />
            </FormControl>
            <FormDescription className="text-xs">
              Format: MM-DD (e.g. 04-01 for April 1st)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </CardContent>
  </AnimatedCard>
)

LeaveYearCard.propTypes = {
  form: PropTypes.object.isRequired,
}

// ─── Main UI ──────────────────────────────────────────────────────────────────

const LeaveSettingsUI = ({ form, onSubmit, isSubmitting, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6 p-6 max-w-2xl mx-auto">
        <div>
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-3 w-72 mt-2" />
        </div>
        <SettingsSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <FadeIn direction="up" delay={0}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 14,
                delay: 0.1,
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25"
            >
              <Settings2 className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <BlurText text="Leave Settings" delay={0.15} />
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Configure leave quotas and policies for the organisation
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <LeaveQuotasCard form={form} />
          <CarryForwardCard form={form} />
          <LeaveOptionsCard form={form} />
          <LeaveYearCard form={form} />

          <FadeIn direction="up" delay={0.5}>
            <div className="flex justify-end">
              <ShimmerButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Settings
              </ShimmerButton>
            </div>
          </FadeIn>
        </form>
      </Form>
    </div>
  )
}

LeaveSettingsUI.propTypes = {
  form: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

export default LeaveSettingsUI
