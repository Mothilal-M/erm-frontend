import { motion } from "framer-motion"
import { ArrowLeft, MessageSquare, Send } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

import {
  AnimatedCard,
  BlurText,
  FadeIn,
  PulseBadge,
  ShimmerButton,
  StaggerContainer,
  StaggerItem,
} from "@/components/magicui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

/**
 * Daily Standup Page - Team members share their daily progress
 */
const DailyStandupPage = () => {
  const [standup, setStandup] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const teamUpdates = [
    {
      name: "Alice Smith",
      role: "Frontend Developer",
      today: "Completed UI components library setup",
      blockers: "None",
      time: "2 hours ago",
    },
    {
      name: "Bob Jones",
      role: "Backend Developer",
      today: "Implemented API authentication",
      blockers: "Waiting for design specs",
      time: "1 hour ago",
    },
  ]

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      setStandup("")
      setSubmitted(false)
    }, 2000)
  }

  return (
    <div className="space-y-6 p-6">
      <FadeIn direction="down">
        <Button variant="ghost" asChild>
          <Link to="/daily-update">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Daily Updates
          </Link>
        </Button>
      </FadeIn>

      <FadeIn direction="down" delay={0.1}>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <BlurText
              text="Daily Standup"
              className="text-3xl font-bold tracking-tight"
              delay={0.15}
            />
            <p className="mt-1 text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Standup Input */}
        <FadeIn delay={0.2} direction="right">
          <AnimatedCard delay={0.25} className="border-0 shadow-sm rounded-xl lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Your Standup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  What did you accomplish today?
                </label>
                <Textarea
                  placeholder="Share your progress..."
                  value={standup}
                  onChange={(e) => setStandup(e.target.value)}
                  className="mt-2 rounded-xl"
                  rows={6}
                />
              </div>
              <ShimmerButton
                onClick={handleSubmit}
                disabled={!standup.trim() || submitted}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {submitted ? "Submitted!" : "Submit Standup"}
              </ShimmerButton>
            </CardContent>
          </AnimatedCard>
        </FadeIn>

        {/* Team Updates */}
        <FadeIn delay={0.3} direction="left" className="lg:col-span-2">
          <AnimatedCard delay={0.35} className="border-0 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Team Standups</CardTitle>
            </CardHeader>
            <CardContent>
              <StaggerContainer className="space-y-4">
                {teamUpdates.map((update) => (
                  <StaggerItem key={update.name}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="border-l-4 border-blue-500 pl-4 py-2 rounded-r-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{update.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {update.role}
                          </p>
                        </div>
                        <PulseBadge color="blue">{update.time}</PulseBadge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Today:</span>{" "}
                          {update.today}
                        </p>
                        <p>
                          <span className="font-medium">Blockers:</span>{" "}
                          {update.blockers === "None" ? (
                            <PulseBadge color="emerald">None</PulseBadge>
                          ) : (
                            <PulseBadge color="red">
                              {update.blockers}
                            </PulseBadge>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </CardContent>
          </AnimatedCard>
        </FadeIn>
      </div>
    </div>
  )
}

export default DailyStandupPage
