import { ArrowLeft, Loader2, MailPlus } from "lucide-react"
import { motion } from "framer-motion"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
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
import {
  AnimatedCard,
  BlurText,
  FadeIn,
  ShimmerButton,
} from "@/components/magicui"
import ct from "@constants/"

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Product",
  "HR",
  "Finance",
  "Marketing",
  "Operations",
  "Sales",
]

const EMPLOYEE_ROLES = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
]

const InviteUsersUI = ({ form, onSubmit, isSubmitting }) => (
  <div className="space-y-6 p-6 max-w-lg mx-auto">
    {/* Header */}
    <FadeIn delay={0} direction="up">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link to={ct.route.employeeManagement.LIST}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
          >
            <MailPlus className="h-5 w-5" />
          </motion.div>
          <div>
            <BlurText
              text="Invite User"
              className="text-2xl font-bold tracking-tight"
              delay={0.1}
            />
            <p className="text-sm text-muted-foreground mt-0.5">
              Send an invitation email to onboard a new team member
            </p>
          </div>
        </div>
      </div>
    </FadeIn>

    <AnimatedCard delay={0.15} className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <MailPlus className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Send Invitation</CardTitle>
        </div>
        <CardDescription className="text-xs">
          The invited user will receive a setup link to create their account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <FadeIn delay={0.2} direction="up">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="newmember@company.com"
                        className="rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      An invitation link will be sent to this address.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FadeIn>

            {/* Role */}
            <FadeIn delay={0.25} direction="up">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMPLOYEE_ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FadeIn>

            {/* Department (optional) */}
            <FadeIn delay={0.3} direction="up">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Department{" "}
                      <span className="text-muted-foreground font-normal text-xs">
                        (optional)
                      </span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FadeIn>

            <FadeIn delay={0.35} direction="up">
              <div className="flex justify-end gap-3 pt-2">
                <Button asChild variant="outline" type="button">
                  <Link to={ct.route.employeeManagement.LIST}>Cancel</Link>
                </Button>
                <ShimmerButton
                  type="submit"
                  disabled={isSubmitting}
                  className="disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <MailPlus className="mr-2 h-4 w-4" />
                  Send Invite
                </ShimmerButton>
              </div>
            </FadeIn>
          </form>
        </Form>
      </CardContent>
    </AnimatedCard>
  </div>
)

InviteUsersUI.propTypes = {
  form: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
}

export default InviteUsersUI
