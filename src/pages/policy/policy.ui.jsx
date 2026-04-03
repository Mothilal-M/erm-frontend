import { motion } from "framer-motion"
import {
  FileText,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react"
import PropTypes from "prop-types"
import { useState } from "react"

import {
  AnimatedCard,
  BlurText,
  FadeIn,
  NumberTicker,
  PulseBadge,
  ShimmerButton,
  StaggerContainer,
  StaggerItem,
} from "@/components/magicui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "hr", label: "HR" },
  { value: "leave", label: "Leave" },
  { value: "security", label: "Security" },
  { value: "general", label: "General" },
]

const CATEGORY_META = {
  hr: { label: "HR", color: "blue", icon: Users },
  leave: { label: "Leave", color: "amber", icon: FileText },
  security: { label: "Security", color: "red", icon: ShieldCheck },
  general: { label: "General", color: "purple", icon: FileText },
}

const SHARE_SCOPES = [
  { value: "team", label: "Team" },
  { value: "public", label: "Public" },
  { value: "specific", label: "Specific" },
]

const SHARE_SCOPE_LABELS = {
  team: "Team",
  public: "Public",
  specific: "Specific",
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const PolicyCardSkeleton = () => (
  <Card className="border-0 shadow-sm rounded-xl">
    <CardHeader className="pb-2">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-16 rounded-full" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4" />
    </CardContent>
    <CardFooter>
      <Skeleton className="h-4 w-32" />
    </CardFooter>
  </Card>
)

// ─── Policy form ──────────────────────────────────────────────────────────────

const PolicyForm = ({ initial, onSubmit, onClose, isLoading, title }) => {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    content: initial?.content ?? "",
    category: initial?.category ?? "general",
    effectiveDate: initial?.effectiveDate ?? "",
    shareScope: initial?.shareScope ?? "team",
    specificAccess: initial?.specificAccess ?? "",
  })

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      ...form,
      specificAccess: form.shareScope === "specific" ? form.specificAccess : "",
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-title">Title</Label>
            <Input
              id="p-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Policy title"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-category">Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) =>
                setForm((previous) => ({ ...previous, category: value }))
              }
            >
              <SelectTrigger id="p-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-effective">Effective Date</Label>
            <Input
              id="p-effective"
              name="effectiveDate"
              type="date"
              value={form.effectiveDate}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-share-scope">Share Setting</Label>
            <Select
              value={form.shareScope}
              onValueChange={(value) =>
                setForm((previous) => ({ ...previous, shareScope: value }))
              }
            >
              <SelectTrigger id="p-share-scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHARE_SCOPES.map((scope) => (
                  <SelectItem key={scope.value} value={scope.value}>
                    {scope.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.shareScope === "specific" && (
            <div className="space-y-1.5">
              <Label htmlFor="p-specific-access">
                Specific Access (emails or usernames)
              </Label>
              <Input
                id="p-specific-access"
                name="specificAccess"
                value={form.specificAccess}
                onChange={handleChange}
                placeholder="e.g. alex@company.com, priya@company.com"
                required
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="p-content">Content</Label>
            <Textarea
              id="p-content"
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={6}
              placeholder="Write the full policy text here…"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Save Policy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

PolicyForm.propTypes = {
  initial: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  title: PropTypes.string.isRequired,
}

PolicyForm.defaultProps = {
  initial: null,
  isLoading: false,
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

const DeleteConfirmDialog = ({ onConfirm, onClose, isLoading }) => (
  <Dialog open onOpenChange={onClose}>
    <DialogContent className="max-w-sm rounded-xl">
      <DialogHeader>
        <DialogTitle>Delete Policy</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this policy? This action cannot be
          undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Deleting…" : "Delete"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

DeleteConfirmDialog.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
}

DeleteConfirmDialog.defaultProps = {
  isLoading: false,
}

// ─── Policy card ──────────────────────────────────────────────────────────────

const PolicyCard = ({ policy, onEdit, onDelete, isDeleting }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const meta = CATEGORY_META[policy.category] ?? CATEGORY_META.general
  const Icon = meta.icon

  const effectiveDate = policy.effectiveDate
    ? new Date(policy.effectiveDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null
  const shareScopeLabel = SHARE_SCOPE_LABELS[policy.shareScope] ?? "Team"

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="flex flex-col border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base leading-snug">
                {policy.title}
              </CardTitle>
              <PulseBadge color={meta.color}>
                <Icon className="h-3 w-3 mr-1" />
                {meta.label}
              </PulseBadge>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {policy.content}
            </p>
          </CardContent>
          <CardFooter className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {effectiveDate
                  ? `Effective: ${effectiveDate}`
                  : "No effective date"}
              </p>
              <Badge variant="outline" className="text-[10px] h-5 rounded-lg">
                Share: {shareScopeLabel}
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(policy)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      {showDeleteConfirm && (
        <DeleteConfirmDialog
          onConfirm={() => {
            setShowDeleteConfirm(false)
            onDelete(policy.id)
          }}
          onClose={() => setShowDeleteConfirm(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  )
}

PolicyCard.propTypes = {
  policy: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
}

PolicyCard.defaultProps = {
  isDeleting: false,
}

// ─── Main UI ──────────────────────────────────────────────────────────────────

const PolicyUI = ({
  policies,
  totalCount,
  isLoading,
  isError,
  search,
  categoryFilter,
  isCreateOpen,
  editingPolicy,
  deletingId,
  isCreating,
  isUpdating,
  onSearchChange,
  onCategoryFilterChange,
  onOpenCreate,
  onCloseCreate,
  onEditPolicy,
  onCloseEdit,
  onCreatePolicy,
  onUpdatePolicy,
  onDeletePolicy,
}) => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page header */}
      <FadeIn direction="down">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <BlurText
                text="Policy Management"
                className="text-2xl font-bold"
                delay={0.1}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 ml-13">
              <NumberTicker value={totalCount} />{" "}
              {totalCount === 1 ? "policy" : "policies"} total
            </p>
          </div>
          <ShimmerButton className="shrink-0" onClick={onOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Policy
          </ShimmerButton>
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.2}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies…"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="w-full sm:w-44 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FadeIn>

      {/* Content */}
      {isError ? (
        <FadeIn>
          <div className="text-center py-12 text-muted-foreground">
            Failed to load policies. Please try again.
          </div>
        </FadeIn>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {["sk-1", "sk-2", "sk-3", "sk-4"].map((key) => (
            <PolicyCardSkeleton key={key} />
          ))}
        </div>
      ) : policies.length === 0 ? (
        <FadeIn>
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No policies found</p>
            <p className="text-sm mt-1">
              {search || categoryFilter !== "all"
                ? "Try adjusting your filters."
                : "Click 'New Policy' to create one."}
            </p>
          </div>
        </FadeIn>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {policies.map((policy) => (
            <StaggerItem key={policy.id}>
              <PolicyCard
                policy={policy}
                onEdit={onEditPolicy}
                onDelete={onDeletePolicy}
                isDeleting={deletingId === policy.id}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Create dialog */}
      {isCreateOpen && (
        <PolicyForm
          title="Create Policy"
          onSubmit={onCreatePolicy}
          onClose={onCloseCreate}
          isLoading={isCreating}
        />
      )}

      {/* Edit dialog */}
      {editingPolicy && (
        <PolicyForm
          title="Edit Policy"
          initial={editingPolicy}
          onSubmit={onUpdatePolicy}
          onClose={onCloseEdit}
          isLoading={isUpdating}
        />
      )}
    </div>
  )
}

PolicyUI.propTypes = {
  policies: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  search: PropTypes.string.isRequired,
  categoryFilter: PropTypes.string.isRequired,
  isCreateOpen: PropTypes.bool.isRequired,
  editingPolicy: PropTypes.object,
  deletingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isCreating: PropTypes.bool,
  isUpdating: PropTypes.bool,
  isDeleting: PropTypes.bool,
  onSearchChange: PropTypes.func.isRequired,
  onCategoryFilterChange: PropTypes.func.isRequired,
  onOpenCreate: PropTypes.func.isRequired,
  onCloseCreate: PropTypes.func.isRequired,
  onEditPolicy: PropTypes.func.isRequired,
  onCloseEdit: PropTypes.func.isRequired,
  onCreatePolicy: PropTypes.func.isRequired,
  onUpdatePolicy: PropTypes.func.isRequired,
  onDeletePolicy: PropTypes.func.isRequired,
}

PolicyUI.defaultProps = {
  isLoading: false,
  isError: false,
  editingPolicy: null,
  deletingId: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
}

export default PolicyUI
