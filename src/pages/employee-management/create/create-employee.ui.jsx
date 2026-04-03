import { ArrowLeft, Loader2, UserPlus } from "lucide-react"
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

const CreateEmployeeUI = ({ form, onSubmit, isSubmitting }) => (
  <div className="space-y-6 p-6 max-w-2xl mx-auto">
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
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/25"
          >
            <UserPlus className="h-5 w-5" />
          </motion.div>
          <div>
            <BlurText
              text="New Employee"
              className="text-2xl font-bold tracking-tight"
              delay={0.1}
            />
            <p className="text-sm text-muted-foreground mt-0.5">
              Add a new member to your organisation
            </p>
          </div>
        </div>
      </div>
    </FadeIn>

    <AnimatedCard delay={0.15} className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Employee Details</CardTitle>
        <CardDescription className="text-xs">
          Fill in the information below to create a new employee profile.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Full name */}
            <FadeIn delay={0.2} direction="up">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Alice Johnson"
                        className="rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FadeIn>

            {/* Email */}
            <FadeIn delay={0.25} direction="up">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="alice@company.com"
                        className="rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FadeIn>

            {/* Phone */}
            <FadeIn delay={0.3} direction="up">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 555 000 0000"
                        className="rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FadeIn>

            <FadeIn delay={0.35} direction="up">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Department */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
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

                {/* Role */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select role" />
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
              </div>
            </FadeIn>

            {/* Join date */}
            <FadeIn delay={0.4} direction="up">
              <FormField
                control={form.control}
                name="joinDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Join Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FadeIn>

            <FadeIn delay={0.45} direction="up">
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
                  Create Employee
                </ShimmerButton>
              </div>
            </FadeIn>
          </form>
        </Form>
      </CardContent>
    </AnimatedCard>
  </div>
)

CreateEmployeeUI.propTypes = {
  form: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
}

export default CreateEmployeeUI
