import { useState } from "react"

import NotificationsUI from "./notifications.ui"

const mockNotifications = [
  {
    id: "1",
    title: "New Leave Request",
    message: "John Doe has requested 2 days of sick leave.",
    time: "10 minutes ago",
    read: false,
    type: "leave",
  },
  {
    id: "2",
    title: "Project Update",
    message: "The ERM Frontend project has been updated.",
    time: "1 hour ago",
    read: false,
    type: "project",
  },
  {
    id: "3",
    title: "Standup Reminder",
    message: "Don't forget to submit your daily standup.",
    time: "2 hours ago",
    read: true,
    type: "reminder",
  },
  {
    id: "4",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur this weekend.",
    time: "1 day ago",
    read: true,
    type: "system",
  },
]

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(mockNotifications)

  const handleMarkAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((previous) => previous.map((n) => ({ ...n, read: true })))
  }

  const handleDelete = (id) => {
    setNotifications((previous) => previous.filter((n) => n.id !== id))
  }

  return (
    <NotificationsUI
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDelete={handleDelete}
    />
  )
}

export default NotificationsPage
