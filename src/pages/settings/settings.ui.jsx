import { motion } from "framer-motion"
import { Bell, Globe, Monitor, Moon, Sun } from "lucide-react"
import PropTypes from "prop-types"

import AnimatedCard from "@/components/magicui/animated-card"
import FadeIn from "@/components/magicui/fade-in"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

// ─── Theme option button ──────────────────────────────────────────────────────

const ThemeButton = ({ icon: Icon, label, value, active, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.03, y: -1 }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
    className="w-full"
  >
    <Button
      variant={active ? "default" : "outline"}
      className="justify-start gap-2 h-10 w-full rounded-xl"
      onClick={() => onClick(value)}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  </motion.button>
)

ThemeButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
}

ThemeButton.defaultProps = {
  active: false,
}

// ─── Notification row ─────────────────────────────────────────────────────────

const NotificationRow = ({ label, description, checked, onChange, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
      duration: 0.35,
      delay: 0.3 + index * 0.07,
      ease: [0.25, 0.4, 0.25, 1],
    }}
    className="flex items-start justify-between gap-4 py-2.5"
  >
    <div>
      <p className="text-sm font-medium">{label}</p>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </motion.div>
)

NotificationRow.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  index: PropTypes.number,
}

NotificationRow.defaultProps = {
  description: undefined,
  index: 0,
}

// ─── Main UI ──────────────────────────────────────────────────────────────────

const SettingsUI = ({
  theme,
  currentLanguage,
  notifications,
  onThemeChange,
  onLanguageChange,
  onNotificationToggle,
}) => {
  const notificationItems = [
    {
      key: "emailAlerts",
      label: "Email Alerts",
      description: "Receive important notifications via email.",
    },
    {
      key: "leaveUpdates",
      label: "Leave Updates",
      description: "Notifications for leave approvals and rejections.",
    },
    {
      key: "projectUpdates",
      label: "Project Updates",
      description: "Sprint and task activity in your projects.",
    },
    {
      key: "attendanceReminders",
      label: "Attendance Reminders",
      description: "Reminders to clock in and out.",
    },
    {
      key: "weeklyDigest",
      label: "Weekly Digest",
      description: "A summary of your week every Friday.",
    },
  ]

  return (
    <FadeIn direction="up" delay={0} duration={0.4}>
      <div className="space-y-5">
        {/* Appearance */}
        <AnimatedCard delay={0.1} className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>
              Choose how this workspace looks for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <ThemeButton
                icon={Sun}
                label="Light"
                value="light"
                active={theme === "light"}
                onClick={onThemeChange}
              />
              <ThemeButton
                icon={Moon}
                label="Dark"
                value="dark"
                active={theme === "dark"}
                onClick={onThemeChange}
              />
              <ThemeButton
                icon={Monitor}
                label="System"
                value="system"
                active={theme === "system"}
                onClick={onThemeChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Changes are applied immediately and saved for your next login.
            </p>
          </CardContent>
        </AnimatedCard>

        {/* Language */}
        <AnimatedCard delay={0.2} className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Language
            </CardTitle>
            <CardDescription>
              Select your preferred language for labels and content.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { value: "en", label: "English" },
              { value: "hi", label: "हिन्दी" },
            ].map(({ value, label }) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-full"
              >
                <Button
                  variant={currentLanguage === value ? "default" : "outline"}
                  onClick={() => onLanguageChange(value)}
                  className="justify-between w-full rounded-xl"
                >
                  {label}
                  {currentLanguage === value && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      Active
                    </Badge>
                  )}
                </Button>
              </motion.button>
            ))}
          </CardContent>
        </AnimatedCard>

        {/* Notifications */}
        <AnimatedCard delay={0.3} className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
            <CardDescription>
              Control which notifications you receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {notificationItems.map((item, idx) => (
              <div key={item.key}>
                {idx > 0 && <Separator />}
                <NotificationRow
                  label={item.label}
                  description={item.description}
                  checked={notifications[item.key]}
                  onChange={() => onNotificationToggle(item.key)}
                  index={idx}
                />
              </div>
            ))}
          </CardContent>
        </AnimatedCard>
      </div>
    </FadeIn>
  )
}

SettingsUI.propTypes = {
  theme: PropTypes.string.isRequired,
  currentLanguage: PropTypes.string.isRequired,
  notifications: PropTypes.object.isRequired,
  onThemeChange: PropTypes.func.isRequired,
  onLanguageChange: PropTypes.func.isRequired,
  onNotificationToggle: PropTypes.func.isRequired,
}

export default SettingsUI
