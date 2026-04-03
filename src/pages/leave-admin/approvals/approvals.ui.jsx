import { motion } from "framer-motion"
import PropTypes from "prop-types"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import { AnimatedCard } from "@/components/magicui"
import { BlurText } from "@/components/magicui"
import { FadeIn } from "@/components/magicui"
import { PulseBadge } from "@/components/magicui"
import { ShimmerButton } from "@/components/magicui"
import { StaggerContainer, StaggerItem } from "@/components/magicui"

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
]

const STATUS_STYLE = {
  approved:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  pending:
    "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
}

const STATUS_PULSE_COLOR = {
  approved: "emerald",
  rejected: "red",
  pending: "amber",
}

const SUBTYPE_STYLE = {
  wfh: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
  halfday:
    "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  full: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
}

const SUBTYPE_LABEL = {
  wfh: "🏠 WFH",
  halfday: "🌗 Half Day",
  full: "📅 Full Day",
}

// ─── Request Card ─────────────────────────────────────────────────────────────

const RequestCard = ({ item, isActing, note, onNoteChange, onAction }) => (
  <AnimatedCard className="rounded-xl border border-border/60 hover:bg-muted/30 transition-colors">
    <div className="p-4 space-y-3">
      {/* Top row: avatar + info + status badge */}
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 shrink-0 border">
          <AvatarImage src={item.avatar} alt={item.name} />
          <AvatarFallback className="text-xs font-bold">
            {item.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold leading-none">{item.name}</p>
            <span className="text-xs text-muted-foreground">
              {item.department}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Applied: {item.appliedOn}
          </p>
        </div>
        <PulseBadge color={STATUS_PULSE_COLOR[item.status] ?? "blue"}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </PulseBadge>
      </div>

      {/* Leave details */}
      <div className="flex flex-wrap gap-2 items-center">
        <Badge
          variant="outline"
          className={`text-xs ${SUBTYPE_STYLE[item.subType] ?? ""}`}
        >
          {SUBTYPE_LABEL[item.subType] ?? item.subType}
        </Badge>
        <span className="text-sm font-medium">{item.type}</span>
        <span className="text-xs text-muted-foreground">
          {item.from === item.to ? item.from : `${item.from} → ${item.to}`}
        </span>
        <Badge variant="secondary" className="text-xs ml-auto">
          {item.days}d
        </Badge>
      </div>

      {/* Reason */}
      <p className="text-sm text-muted-foreground bg-muted/40 rounded-xl px-3 py-2 border border-border/40">
        <span className="font-medium text-foreground">Reason:</span>{" "}
        {item.reason}
      </p>

      {/* Note input + actions — only for pending */}
      {item.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Input
            placeholder="Add a note (optional)…"
            value={note ?? ""}
            onChange={(event) => onNoteChange(item.id, event.target.value)}
            className="text-sm flex-1 rounded-xl"
            disabled={isActing}
          />
          <div className="flex gap-2 shrink-0">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none rounded-xl"
                onClick={() => onAction(item.id, "approved")}
                disabled={isActing}
              >
                Approve
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="sm"
                variant="outline"
                className="border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 flex-1 sm:flex-none rounded-xl"
                onClick={() => onAction(item.id, "rejected")}
                disabled={isActing}
              >
                Reject
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  </AnimatedCard>
)

RequestCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    department: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    subType: PropTypes.string.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    days: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    reason: PropTypes.string.isRequired,
    appliedOn: PropTypes.string.isRequired,
  }).isRequired,
  isActing: PropTypes.bool.isRequired,
  note: PropTypes.string,
  onNoteChange: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
}

RequestCard.defaultProps = {
  note: undefined,
}

// ─── Main UI ──────────────────────────────────────────────────────────────────

const ApprovalsUI = ({
  requests,
  isLoading,
  isError,
  isActing,
  filter,
  onFilterChange,
  noteMap,
  onNoteChange,
  onAction,
  onManualRecord,
}) => {
  const filtered =
    filter === "all" ? requests : requests.filter((r) => r.status === filter)

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  }

  if (isError) {
    return (
      <FadeIn direction="up" delay={0.1}>
        <div className="flex items-center justify-center h-64 text-destructive">
          Failed to load approval requests. Please try again.
        </div>
      </FadeIn>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <FadeIn direction="up" delay={0}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <BlurText
              text="Leave Approvals"
              className="text-2xl font-bold tracking-tight"
              delay={0.05}
            />
            <p className="text-muted-foreground text-sm mt-0.5">
              Review and act on employee leave, WFH, and half-day requests.
            </p>
          </div>
          <ShimmerButton
            onClick={onManualRecord}
            className="shrink-0 px-4 py-2 text-sm rounded-xl"
          >
            ✏️ Manual Record
          </ShimmerButton>
        </div>
      </FadeIn>

      {/* Summary count chips */}
      {!isLoading && (
        <FadeIn direction="up" delay={0.15}>
          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map(({ key, label }) => (
              <motion.button
                key={key}
                onClick={() => onFilterChange(key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                  filter === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                {label}
                <span
                  className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    filter === key ? "bg-primary-foreground/20" : "bg-muted"
                  }`}
                >
                  {counts[key]}
                </span>
              </motion.button>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Request list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={`skeleton-${index}`} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <FadeIn direction="up" delay={0.2}>
          <Card className="shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground text-center py-8">
                No {filter === "all" ? "" : filter} requests found.
              </CardTitle>
            </CardHeader>
          </Card>
        </FadeIn>
      ) : (
        <StaggerContainer className="space-y-3">
          {filtered.map((item) => (
            <StaggerItem key={item.id}>
              <RequestCard
                item={item}
                isActing={isActing}
                note={noteMap[item.id]}
                onNoteChange={onNoteChange}
                onAction={onAction}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  )
}

ApprovalsUI.propTypes = {
  requests: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  isActing: PropTypes.bool.isRequired,
  filter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  noteMap: PropTypes.object.isRequired,
  onNoteChange: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
  onManualRecord: PropTypes.func.isRequired,
}

export default ApprovalsUI
