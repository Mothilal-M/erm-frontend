import { motion } from "framer-motion"
import {
  Award,
  Gift,
  Medal,
  Search,
  Star,
  Trophy,
  TrendingUp,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

// ─── Constants ────────────────────────────────────────────────────────────────

const REWARD_TYPES = [
  { value: "star", label: "Star", icon: Star, color: "text-yellow-500" },
  { value: "trophy", label: "Trophy", icon: Trophy, color: "text-amber-600" },
  {
    value: "certificate",
    label: "Certificate",
    icon: Award,
    color: "text-blue-500",
  },
  { value: "bonus", label: "Bonus", icon: Gift, color: "text-green-500" },
  { value: "medal", label: "Medal", icon: Medal, color: "text-purple-500" },
]

const getRewardMeta = (type) =>
  REWARD_TYPES.find((t) => t.value === type) ?? REWARD_TYPES[0]

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, iconColor, label, value, isLoading }) => (
  <AnimatedCard delay={0.1} className="border-0 shadow-sm rounded-xl">
    <CardContent className="flex items-center gap-4 pt-6">
      <div className="rounded-xl bg-muted p-2.5">
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        {isLoading ? (
          <Skeleton className="h-7 w-12 mb-1" />
        ) : (
          <p className="text-2xl font-bold">
            {typeof value === "number" ? (
              <NumberTicker value={value} />
            ) : (
              (value ?? 0)
            )}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </AnimatedCard>
)

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconColor: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isLoading: PropTypes.bool,
}

StatCard.defaultProps = {
  value: undefined,
  isLoading: false,
}

// ─── Reward card ──────────────────────────────────────────────────────────────

const RewardCard = ({ reward }) => {
  const meta = getRewardMeta(reward.type)
  const Icon = meta.icon
  const grantedAt = new Date(reward.grantedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="border-0 shadow-sm rounded-xl hover:shadow-lg transition-shadow">
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-muted p-3 shrink-0">
              <Icon className={`h-6 w-6 ${meta.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm leading-snug">
                  {reward.title}
                </p>
                {reward.points != null && (
                  <PulseBadge color="purple">+{reward.points} pts</PulseBadge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {reward.description}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Avatar className="h-6 w-6 text-xs">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                    {getInitials(reward.employeeName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">
                  {reward.employeeName}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {grantedAt}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

RewardCard.propTypes = {
  reward: PropTypes.object.isRequired,
}

// ─── Reward card skeleton ─────────────────────────────────────────────────────

const RewardCardSkeleton = () => (
  <Card className="border-0 shadow-sm rounded-xl">
    <CardContent className="pt-5">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// ─── Grant Reward Dialog ──────────────────────────────────────────────────────

const GrantRewardDialog = ({
  open,
  onClose,
  employees,
  onSubmit,
  isLoading,
}) => {
  const [form, setForm] = useState({
    employeeId: "",
    type: "star",
    title: "",
    description: "",
    points: "50",
  })

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ ...form, points: Number(form.points) })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Grant Reward</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="r-employee">Employee</Label>
            <Select
              value={form.employeeId}
              onValueChange={(value) =>
                setForm((previous) => ({ ...previous, employeeId: value }))
              }
              required
            >
              <SelectTrigger id="r-employee">
                <SelectValue placeholder="Select employee…" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={String(emp.id)}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Reward Type</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {REWARD_TYPES.map(({ value, label, icon: Icon, color }) => (
                <motion.button
                  key={value}
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setForm((previous) => ({ ...previous, type: value }))
                  }
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs transition-colors ${
                    form.type === value
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-muted"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${color}`} />
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-title">Title</Label>
            <Input
              id="r-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Outstanding Performance"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-description">Reason / Description</Label>
            <Textarea
              id="r-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe why this employee is being recognized…"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-points">Points</Label>
            <Input
              id="r-points"
              name="points"
              type="number"
              min="0"
              max="1000"
              value={form.points}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !form.employeeId}>
              {isLoading ? "Granting…" : "Grant Reward"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

GrantRewardDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  employees: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
}

GrantRewardDialog.defaultProps = {
  isLoading: false,
}

// ─── Main UI ──────────────────────────────────────────────────────────────────

const RewardsUI = ({
  rewards,
  stats,
  employees,
  isAdmin,
  isLoading,
  isError,
  isGrantOpen,
  isGranting,
  search,
  onSearchChange,
  onOpenGrant,
  onCloseGrant,
  onGrantReward,
}) => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page header */}
      <FadeIn direction="down">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/20">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <BlurText
                text="Rewards"
                className="text-2xl font-bold"
                delay={0.1}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 ml-13">
              Recognize and celebrate employee achievements.
            </p>
          </div>
          {isAdmin && (
            <ShimmerButton className="shrink-0" onClick={onOpenGrant}>
              <Award className="h-4 w-4 mr-2" />
              Grant Reward
            </ShimmerButton>
          )}
        </div>
      </FadeIn>

      {/* Stats */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <StatCard
            icon={Trophy}
            iconColor="text-amber-600"
            label="Total Rewards"
            value={stats.totalRewards}
            isLoading={isLoading}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={TrendingUp}
            iconColor="text-green-500"
            label="Total Points"
            value={stats.totalPoints?.toLocaleString()}
            isLoading={isLoading}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={Star}
            iconColor="text-yellow-500"
            label="Stars Given"
            value={stats.rewardsByType?.star}
            isLoading={isLoading}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={Medal}
            iconColor="text-purple-500"
            label="Medals Given"
            value={stats.rewardsByType?.medal}
            isLoading={isLoading}
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Search */}
      <FadeIn delay={0.3}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rewards…"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
      </FadeIn>

      {/* Rewards grid */}
      {isError ? (
        <FadeIn>
          <div className="text-center py-12 text-muted-foreground">
            Failed to load rewards. Please try again.
          </div>
        </FadeIn>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {["rsk-1", "rsk-2", "rsk-3", "rsk-4", "rsk-5", "rsk-6"].map(
            (key) => (
              <RewardCardSkeleton key={key} />
            )
          )}
        </div>
      ) : rewards.length === 0 ? (
        <FadeIn>
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No rewards yet</p>
            {isAdmin && (
              <p className="text-sm mt-1">
                Click &quot;Grant Reward&quot; to recognize an employee.
              </p>
            )}
          </div>
        </FadeIn>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <StaggerItem key={reward.id}>
              <RewardCard reward={reward} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Grant dialog */}
      {isAdmin && (
        <GrantRewardDialog
          open={isGrantOpen}
          onClose={onCloseGrant}
          employees={employees}
          onSubmit={onGrantReward}
          isLoading={isGranting}
        />
      )}
    </div>
  )
}

RewardsUI.propTypes = {
  rewards: PropTypes.array.isRequired,
  stats: PropTypes.object.isRequired,
  employees: PropTypes.array.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  isGrantOpen: PropTypes.bool.isRequired,
  isGranting: PropTypes.bool,
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onOpenGrant: PropTypes.func.isRequired,
  onCloseGrant: PropTypes.func.isRequired,
  onGrantReward: PropTypes.func.isRequired,
}

RewardsUI.defaultProps = {
  isLoading: false,
  isError: false,
  isGranting: false,
}

export default RewardsUI
