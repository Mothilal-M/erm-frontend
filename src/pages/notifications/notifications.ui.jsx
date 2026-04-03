import { Bell, Check, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import PropTypes from "prop-types"

import { Button } from "@/components/ui/button"
import { CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AnimatedCard } from "@/components/magicui"
import { BlurText } from "@/components/magicui"
import { FadeIn } from "@/components/magicui"
import { PulseBadge } from "@/components/magicui"

const NotificationsUI = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AnimatedCard delay={0.1} className="border-0 shadow-sm rounded-xl">
        <FadeIn delay={0.15} direction="down">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <BlurText
                text="Notifications"
                className="text-xl font-bold"
                delay={0.2}
              />
              {unreadCount > 0 && (
                <PulseBadge color="blue">
                  {unreadCount} new
                </PulseBadge>
              )}
            </div>
            {unreadCount > 0 && (
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark all as read
                </Button>
              </motion.div>
            )}
          </CardHeader>
        </FadeIn>
        <CardContent>
          {notifications.length === 0 ? (
            <motion.div
              className="text-center py-8 text-muted-foreground"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              No notifications to display.
            </motion.div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.06,
                      ease: "easeOut",
                    }}
                    className={`flex items-start justify-between p-4 rounded-xl border transition-colors ${
                      notification.read
                        ? "bg-background"
                        : "bg-muted/50 border-primary/20"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground mt-1">
                        {notification.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onMarkAsRead(notification.id)}
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      )}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(notification.id)}
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </AnimatedCard>
    </div>
  )
}

NotificationsUI.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      read: PropTypes.bool.isRequired,
      type: PropTypes.string.isRequired,
    })
  ).isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onMarkAllAsRead: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default NotificationsUI
