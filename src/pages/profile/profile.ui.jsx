import {
  Briefcase,
  BriefcaseBusiness,
  Building2,
  Calendar,
  Cog,
  FileText,
  Key,
  Mail,
  Pencil,
  Plus,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react"
import { motion } from "framer-motion"
import PropTypes from "prop-types"
import { useState } from "react"

import { AnimatedCard } from "@/components/magicui"
import { BlurText } from "@/components/magicui"
import { FadeIn } from "@/components/magicui"
import { PulseBadge } from "@/components/magicui"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import SettingsUI from "../settings/settings.ui"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <Card className="rounded-xl border-0 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2 text-center sm:text-left">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {["contact", "work", "extra-1", "extra-2"].map((key) => (
        <Card key={key} className="rounded-xl border-0 shadow-sm">
          <CardContent className="pt-6 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

// ─── Info row ─────────────────────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="rounded-md bg-muted p-2 mt-0.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  </div>
)

InfoRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
}

InfoRow.defaultProps = {
  value: undefined,
}

// ─── Edit Profile Dialog ──────────────────────────────────────────────────────

const EditProfileDialog = ({ open, onClose, profile, onSubmit, isLoading }) => {
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    bio: profile?.bio ?? "",
    jobTitle: profile?.jobTitle ?? "",
  })

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

EditProfileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  profile: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
}

EditProfileDialog.defaultProps = {
  profile: null,
  isLoading: false,
}

// ─── Change Password Dialog ───────────────────────────────────────────────────

const ChangePasswordDialog = ({ open, onClose, onSubmit, isLoading }) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }))
    setError("")
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.")
      return
    }
    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.")
      return
    }
    onSubmit({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Changing…" : "Change Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

ChangePasswordDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
}

ChangePasswordDialog.defaultProps = {
  isLoading: false,
}

// ─── Profile header card ─────────────────────────────────────────────────────

const ProfileHeaderCard = ({
  displayName,
  profile,
  userRole,
  onOpenEdit,
  onOpenPassword,
}) => (
  <AnimatedCard delay={0} className="rounded-xl border-0 shadow-sm">
    <CardContent className="pt-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
        >
          <Avatar className="h-24 w-24 text-2xl">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <BlurText
            text={displayName}
            className="text-2xl font-bold"
            delay={0.15}
          />
          <FadeIn delay={0.2} direction="up">
            <p className="text-muted-foreground text-sm">
              {profile?.jobTitle || profile?.department || "—"}
            </p>
          </FadeIn>
          <FadeIn delay={0.25} direction="up">
            <PulseBadge color="indigo">
              {userRole || profile?.role || "employee"}
            </PulseBadge>
          </FadeIn>
          {profile?.bio && (
            <FadeIn delay={0.3} direction="up">
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                {profile.bio}
              </p>
            </FadeIn>
          )}
        </div>
        <FadeIn delay={0.35} direction="left">
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" onClick={onOpenEdit}>
                <Pencil className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" onClick={onOpenPassword}>
                <Key className="h-4 w-4 mr-1.5" />
                Password
              </Button>
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </CardContent>
  </AnimatedCard>
)

ProfileHeaderCard.propTypes = {
  displayName: PropTypes.string.isRequired,
  profile: PropTypes.object,
  userRole: PropTypes.string,
  onOpenEdit: PropTypes.func.isRequired,
  onOpenPassword: PropTypes.func.isRequired,
}

ProfileHeaderCard.defaultProps = {
  profile: null,
  userRole: "",
}

// ─── Profile info grid ────────────────────────────────────────────────────────

const ProfileInfoGrid = ({ profile, joinDate }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <AnimatedCard delay={0.1} className="rounded-xl border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <InfoRow icon={Mail} label="Email" value={profile?.email} />
        </motion.div>
        <Separator />
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
        </motion.div>
      </CardContent>
    </AnimatedCard>

    <AnimatedCard delay={0.2} className="rounded-xl border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Work Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <InfoRow
            icon={Building2}
            label="Department"
            value={profile?.department}
          />
        </motion.div>
        <Separator />
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <InfoRow icon={UserRound} label="Role" value={profile?.role} />
        </motion.div>
        <Separator />
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <InfoRow icon={Calendar} label="Joined" value={joinDate} />
        </motion.div>
      </CardContent>
    </AnimatedCard>
  </div>
)

ProfileInfoGrid.propTypes = {
  profile: PropTypes.object,
  joinDate: PropTypes.string.isRequired,
}

ProfileInfoGrid.defaultProps = {
  profile: null,
}

// ─── Profile content (renders when data is ready) ────────────────────────────

const ProfileContent = ({
  profile,
  userName,
  userRole,
  isEditOpen,
  isPasswordOpen,
  isUpdating,
  isChangingPassword,
  onOpenEdit,
  onCloseEdit,
  onOpenPassword,
  onClosePassword,
  onUpdateProfile,
  onChangePassword,
}) => {
  const displayName = profile?.name ?? userName
  const joinDate = profile?.joinDate
    ? new Date(profile.joinDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—"

  return (
    <div className="space-y-6">
      <ProfileHeaderCard
        displayName={displayName}
        profile={profile}
        userRole={userRole}
        onOpenEdit={onOpenEdit}
        onOpenPassword={onOpenPassword}
      />
      <ProfileInfoGrid profile={profile} joinDate={joinDate} />
      {/* Dialogs */}
      <EditProfileDialog
        open={isEditOpen}
        onClose={onCloseEdit}
        profile={profile}
        onSubmit={onUpdateProfile}
        isLoading={isUpdating}
      />
      <ChangePasswordDialog
        open={isPasswordOpen}
        onClose={onClosePassword}
        onSubmit={onChangePassword}
        isLoading={isChangingPassword}
      />
    </div>
  )
}

ProfileContent.propTypes = {
  profile: PropTypes.object,
  userName: PropTypes.string,
  userRole: PropTypes.string,
  isEditOpen: PropTypes.bool.isRequired,
  isPasswordOpen: PropTypes.bool.isRequired,
  isUpdating: PropTypes.bool,
  isChangingPassword: PropTypes.bool,
  onOpenEdit: PropTypes.func.isRequired,
  onCloseEdit: PropTypes.func.isRequired,
  onOpenPassword: PropTypes.func.isRequired,
  onClosePassword: PropTypes.func.isRequired,
  onUpdateProfile: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
}

ProfileContent.defaultProps = {
  profile: null,
  userName: "",
  userRole: "",
  isUpdating: false,
  isChangingPassword: false,
}

// ─── Assets Section ───────────────────────────────────────────────────────────

const TIMELINE_ICON_STYLE = {
  joined: "bg-emerald-500",
  promotion: "bg-blue-500",
  leave: "bg-amber-500",
  award: "bg-purple-500",
  training: "bg-cyan-500",
  default: "bg-slate-400",
}

const AssetsSection = ({ assets }) => {
  const items = assets ?? []

  return (
    <AnimatedCard delay={0.1} className="rounded-xl border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Briefcase className="h-4 w-4" /> Assigned Assets
        </CardTitle>
        <CardDescription>
          Equipment and resources assigned to you
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assets assigned.</p>
        ) : (
          <div className="space-y-2">
            {items.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08, duration: 0.35 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {asset.type} · {asset.serialNumber}
                    </p>
                  </div>
                </div>
                <PulseBadge color="blue">{asset.condition}</PulseBadge>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </AnimatedCard>
  )
}

AssetsSection.propTypes = {
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      type: PropTypes.string,
      serialNumber: PropTypes.string,
      condition: PropTypes.string,
    }),
  ),
}

AssetsSection.defaultProps = { assets: null }

// ─── Documents Section ────────────────────────────────────────────────────────

const DocumentsSection = ({ documents }) => {
  const docs = documents ?? []

  return (
    <AnimatedCard delay={0.2} className="rounded-xl border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" /> My Documents
        </CardTitle>
        <CardDescription>Uploaded documents and files</CardDescription>
      </CardHeader>
      <CardContent>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents uploaded.
          </p>
        ) : (
          <div className="space-y-2">
            {docs.map((document_, index) => (
              <motion.div
                key={document_.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.08, duration: 0.35 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{document_.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {document_.category} · {document_.uploadedAt}
                    </p>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" size="sm" className="text-xs">
                    View
                  </Button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </AnimatedCard>
  )
}

DocumentsSection.propTypes = {
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      category: PropTypes.string,
      uploadedAt: PropTypes.string,
    }),
  ),
}

DocumentsSection.defaultProps = { documents: null }

// ─── Assets & Documents Tab Content ───────────────────────────────────────────

const AssetsAndDocsContent = ({ assets, documents }) => (
  <div className="space-y-4 p-4 md:p-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AssetsSection assets={assets} />
      <DocumentsSection documents={documents} />
    </div>
  </div>
)

AssetsAndDocsContent.propTypes = {
  assets: PropTypes.array,
  documents: PropTypes.array,
}

AssetsAndDocsContent.defaultProps = {
  assets: null,
  documents: null,
}

// ─── Timeline Section ─────────────────────────────────────────────────────────

const TimelineContent = ({ timeline }) => {
  const events = timeline ?? []

  return (
    <div className="p-4 md:p-6">
      <AnimatedCard delay={0.1} className="rounded-xl border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Career Timeline</CardTitle>
          <CardDescription className="text-xs">
            Key milestones and events in your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No timeline events yet.
            </p>
          ) : (
            <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-border">
              {events.map((event, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                >
                  <div
                    className={`absolute -left-6 top-1 w-4 h-4 rounded-full ${
                      TIMELINE_ICON_STYLE[event.type] ??
                      TIMELINE_ICON_STYLE.default
                    }`}
                  />
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {event.date}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </AnimatedCard>
    </div>
  )
}

TimelineContent.propTypes = {
  timeline: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      title: PropTypes.string,
      date: PropTypes.string,
      description: PropTypes.string,
    }),
  ),
}

TimelineContent.defaultProps = { timeline: null }

// ─── Roles & Responsibilities ────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: "none", label: "No Access" },
  { value: "viewer", label: "Viewer" },
  { value: "employee", label: "Employee" },
  { value: "editor", label: "Editor" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
]

const MODULE_ROLE_CONFIG = [
  {
    key: "attendance",
    label: "Attendance",
    description: "Clock in/out, live logs, and attendance summary access.",
  },
  {
    key: "leaveManagement",
    label: "Leave Management",
    description: "Leave requests, approvals, and policy enforcement.",
  },
  {
    key: "employeeManagement",
    label: "Employee Management",
    description: "Employee directory, invitations, and department setup.",
  },
  {
    key: "projectManagement",
    label: "Project Management",
    description: "Projects, sprint boards, notes, and project settings.",
  },
  {
    key: "policyManagement",
    label: "Policy Management",
    description: "Create, update, and publish company policies.",
  },
  {
    key: "rewardsManagement",
    label: "Rewards Management",
    description: "Grant and track employee rewards and recognition.",
  },
]

const renderAdminNotice = () => (
  <AnimatedCard delay={0.1} className="rounded-xl border-0 shadow-sm">
    <CardHeader>
      <CardTitle className="text-base flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" />
        Roles & Responsibilities
      </CardTitle>
      <CardDescription>
        Team-level responsibility management is available for admins.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        You can view your assigned responsibilities from team leads or workspace
        admins.
      </p>
    </CardContent>
  </AnimatedCard>
)

const renderTeamSetup = ({
  teamDraft,
  employees,
  onTeamDraftChange,
  onToggleTeamMember,
  onCreateTeam,
}) => (
  <AnimatedCard delay={0.1} className="rounded-xl border-0 shadow-sm">
    <CardHeader>
      <CardTitle className="text-base flex items-center gap-2">
        <Users className="h-4 w-4" />
        Team Setup
      </CardTitle>
      <CardDescription>
        Create teams and assign members before mapping module responsibilities.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5 md:col-span-1">
          <Label htmlFor="team-name">Team Name</Label>
          <Input
            id="team-name"
            placeholder="e.g. Delivery Ops"
            value={teamDraft.name}
            onChange={(event) => onTeamDraftChange("name", event.target.value)}
          />
        </div>
        <div className="space-y-1.5 md:col-span-1">
          <Label>Team Lead</Label>
          <Select
            value={teamDraft.leadId}
            onValueChange={(value) => onTeamDraftChange("leadId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lead" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={String(employee.id)}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-1">
          <Label>Members</Label>
          <div className="h-24 rounded-md border p-2 overflow-y-auto space-y-1">
            {employees.length === 0 ? (
              <p className="text-xs text-muted-foreground px-1 py-1">
                No employees available.
              </p>
            ) : (
              employees.map((employee) => (
                <button
                  type="button"
                  key={employee.id}
                  className="w-full flex items-center justify-between text-left px-2 py-1.5 rounded hover:bg-muted"
                  onClick={() => onToggleTeamMember(String(employee.id))}
                >
                  <span className="text-xs font-medium">{employee.name}</span>
                  {teamDraft.memberIds.includes(String(employee.id)) && (
                    <PulseBadge color="emerald">Added</PulseBadge>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={onCreateTeam} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Create Team
          </Button>
        </motion.div>
      </div>
    </CardContent>
  </AnimatedCard>
)

const renderTeamDirectory = ({ teams, selectedTeamId, onTeamSelect }) => (
  <AnimatedCard
    delay={0.15}
    className="lg:col-span-1 rounded-xl border-0 shadow-sm"
  >
    <CardHeader>
      <CardTitle className="text-base">Teams</CardTitle>
      <CardDescription>
        Select a team to assign module ownership.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      {teams.map((team, index) => {
        const isSelected = team.id === selectedTeamId
        return (
          <motion.button
            type="button"
            key={team.id}
            onClick={() => onTeamSelect(team.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.06 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            }`}
          >
            <p className="text-sm font-medium">{team.name}</p>
            <p
              className={`text-xs ${
                isSelected
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground"
              }`}
            >
              {team.memberIds.length} members
            </p>
          </motion.button>
        )
      })}
    </CardContent>
  </AnimatedCard>
)

const renderResponsibilityPanel = ({
  selectedTeam,
  employees,
  onTeamResponsibilityChange,
  onSaveRoles,
}) => {
  const leadName =
    employees.find((employee) => String(employee.id) === selectedTeam?.leadId)
      ?.name ?? "Not assigned"

  return (
    <AnimatedCard
      delay={0.2}
      className="lg:col-span-2 rounded-xl border-0 shadow-sm"
    >
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Team Responsibilities
        </CardTitle>
        <CardDescription>
          Set module access levels for the selected team.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedTeam ? (
          <>
            <FadeIn delay={0.1} direction="up">
              <div className="flex flex-wrap items-center gap-2">
                <PulseBadge color="purple">{selectedTeam.name}</PulseBadge>
                <PulseBadge color="blue">Lead: {leadName}</PulseBadge>
                <PulseBadge color="amber">
                  Members: {selectedTeam.memberIds.length}
                </PulseBadge>
              </div>
            </FadeIn>

            {MODULE_ROLE_CONFIG.map((module, index) => (
              <motion.div
                key={module.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.07, duration: 0.35 }}
                className="rounded-lg border p-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{module.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {module.description}
                  </p>
                </div>
                <Select
                  value={selectedTeam.responsibilities[module.key] || "none"}
                  onValueChange={(value) =>
                    onTeamResponsibilityChange(
                      selectedTeam.id,
                      module.key,
                      value,
                    )
                  }
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((roleOption) => (
                      <SelectItem
                        key={roleOption.value}
                        value={roleOption.value}
                      >
                        {roleOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            ))}

            <div className="flex justify-end">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button onClick={onSaveRoles}>
                  Save Team Responsibilities
                </Button>
              </motion.div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a team to configure module responsibilities.
          </p>
        )}
      </CardContent>
    </AnimatedCard>
  )
}

const RolesAndResponsibilities = ({
  isAdmin,
  teams,
  selectedTeamId,
  teamDraft,
  employees,
  onTeamSelect,
  onTeamDraftChange,
  onToggleTeamMember,
  onCreateTeam,
  onTeamResponsibilityChange,
  onSaveRoles,
}) => {
  const selectedTeam = teams.find((team) => team.id === selectedTeamId)

  if (!isAdmin) return renderAdminNotice()

  return (
    <div className="space-y-4">
      {renderTeamSetup({
        teamDraft,
        employees,
        onTeamDraftChange,
        onToggleTeamMember,
        onCreateTeam,
      })}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {renderTeamDirectory({ teams, selectedTeamId, onTeamSelect })}
        {renderResponsibilityPanel({
          selectedTeam,
          employees,
          onTeamResponsibilityChange,
          onSaveRoles,
        })}
      </div>
    </div>
  )
}

RolesAndResponsibilities.propTypes = {
  isAdmin: PropTypes.bool,
  teams: PropTypes.array,
  selectedTeamId: PropTypes.string,
  teamDraft: PropTypes.object,
  employees: PropTypes.array,
  onTeamSelect: PropTypes.func.isRequired,
  onTeamDraftChange: PropTypes.func.isRequired,
  onToggleTeamMember: PropTypes.func.isRequired,
  onCreateTeam: PropTypes.func.isRequired,
  onTeamResponsibilityChange: PropTypes.func.isRequired,
  onSaveRoles: PropTypes.func.isRequired,
}

RolesAndResponsibilities.defaultProps = {
  isAdmin: false,
  teams: [],
  selectedTeamId: "",
  teamDraft: {},
  employees: [],
}

// ─── Main UI ──────────────────────────────────────────────────────────────────

const ProfileUI = ({
  profile,
  userName,
  userRole,
  isLoading,
  isError,
  isEditOpen,
  isPasswordOpen,
  isUpdating,
  isChangingPassword,
  onOpenEdit,
  onCloseEdit,
  onOpenPassword,
  onClosePassword,
  onUpdateProfile,
  onChangePassword,
  theme,
  currentLanguage,
  notifications,
  isAdmin,
  teams,
  selectedTeamId,
  teamDraft,
  employees,
  onThemeChange,
  onLanguageChange,
  onNotificationToggle,
  onTeamSelect,
  onTeamDraftChange,
  onToggleTeamMember,
  onCreateTeam,
  onTeamResponsibilityChange,
  onSaveRoles,
}) => {
  const profileContent = () => {
    if (isLoading) {
      return (
        <div className="p-6">
          <ProfileSkeleton />
        </div>
      )
    }
    if (isError) {
      return (
        <FadeIn delay={0.1} direction="up">
          <div className="p-6 text-center text-muted-foreground">
            Failed to load profile. Please try again.
          </div>
        </FadeIn>
      )
    }
    return (
      <ProfileContent
        profile={profile}
        userName={userName}
        userRole={userRole}
        isEditOpen={isEditOpen}
        isPasswordOpen={isPasswordOpen}
        isUpdating={isUpdating}
        isChangingPassword={isChangingPassword}
        onOpenEdit={onOpenEdit}
        onCloseEdit={onCloseEdit}
        onOpenPassword={onOpenPassword}
        onClosePassword={onClosePassword}
        onUpdateProfile={onUpdateProfile}
        onChangePassword={onChangePassword}
      />
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <FadeIn delay={0} direction="down">
        <AnimatedCard delay={0} className="rounded-xl border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Account Center</p>
              <BlurText
                text="My Account"
                className="text-2xl font-semibold tracking-tight"
                delay={0.1}
              />
              <p className="text-sm text-muted-foreground">
                Manage profile details, workspace preferences, and module
                responsibilities from one place.
              </p>
            </div>
          </CardContent>
        </AnimatedCard>
      </FadeIn>

      <FadeIn delay={0.15} direction="up">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto gap-1 w-full rounded-lg">
            <TabsTrigger
              value="profile"
              className="gap-2 justify-center py-2 rounded-lg"
            >
              <UserRound className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="assets"
              className="gap-2 justify-center py-2 rounded-lg"
            >
              <Briefcase className="h-4 w-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="gap-2 justify-center py-2 rounded-lg"
            >
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="gap-2 justify-center py-2 rounded-lg"
            >
              <Cog className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="roles"
              className="gap-2 justify-center py-2 rounded-lg"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              Teams & Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            {profileContent()}
          </TabsContent>
          <TabsContent value="assets" className="mt-0">
            <AssetsAndDocsContent
              assets={profile?.assets}
              documents={profile?.documents}
            />
          </TabsContent>
          <TabsContent value="timeline" className="mt-0">
            <TimelineContent timeline={profile?.timeline} />
          </TabsContent>
          <TabsContent value="settings" className="mt-0">
            <SettingsUI
              theme={theme}
              currentLanguage={currentLanguage}
              notifications={notifications}
              onThemeChange={onThemeChange}
              onLanguageChange={onLanguageChange}
              onNotificationToggle={onNotificationToggle}
            />
          </TabsContent>
          <TabsContent value="roles" className="mt-0">
            <RolesAndResponsibilities
              isAdmin={isAdmin}
              teams={teams}
              selectedTeamId={selectedTeamId}
              teamDraft={teamDraft}
              employees={employees}
              onTeamSelect={onTeamSelect}
              onTeamDraftChange={onTeamDraftChange}
              onToggleTeamMember={onToggleTeamMember}
              onCreateTeam={onCreateTeam}
              onTeamResponsibilityChange={onTeamResponsibilityChange}
              onSaveRoles={onSaveRoles}
            />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}

ProfileUI.propTypes = {
  profile: PropTypes.object,
  userName: PropTypes.string,
  userRole: PropTypes.string,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  isEditOpen: PropTypes.bool.isRequired,
  isPasswordOpen: PropTypes.bool.isRequired,
  isUpdating: PropTypes.bool,
  isChangingPassword: PropTypes.bool,
  onOpenEdit: PropTypes.func.isRequired,
  onCloseEdit: PropTypes.func.isRequired,
  onOpenPassword: PropTypes.func.isRequired,
  onClosePassword: PropTypes.func.isRequired,
  onUpdateProfile: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
  theme: PropTypes.string,
  currentLanguage: PropTypes.string,
  notifications: PropTypes.object,
  isAdmin: PropTypes.bool,
  teams: PropTypes.array,
  selectedTeamId: PropTypes.string,
  teamDraft: PropTypes.object,
  employees: PropTypes.array,
  onThemeChange: PropTypes.func.isRequired,
  onLanguageChange: PropTypes.func.isRequired,
  onNotificationToggle: PropTypes.func.isRequired,
  onTeamSelect: PropTypes.func.isRequired,
  onTeamDraftChange: PropTypes.func.isRequired,
  onToggleTeamMember: PropTypes.func.isRequired,
  onCreateTeam: PropTypes.func.isRequired,
  onTeamResponsibilityChange: PropTypes.func.isRequired,
  onSaveRoles: PropTypes.func.isRequired,
}

ProfileUI.defaultProps = {
  profile: null,
  userName: "",
  userRole: "",
  isLoading: false,
  isError: false,
  isUpdating: false,
  isChangingPassword: false,
  theme: "system",
  currentLanguage: "en",
  notifications: {},
  isAdmin: false,
  teams: [],
  selectedTeamId: "",
  teamDraft: {},
  employees: [],
}

export default ProfileUI
