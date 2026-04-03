import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  FolderOpen,
  Plus,
  Target,
  Activity,
} from "lucide-react"
import { motion } from "framer-motion"
import PropTypes from "prop-types"
import { Link } from "react-router"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

import {
  AnimatedCard,
  BlurText,
  FadeIn,
  PulseBadge,
  AnimatedProgress,
  NumberTicker,
} from "@/components/magicui"
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/magicui/stagger-container"

import { CreateProjectModal } from "./components/create-project-modal"

/**
 * ProjectsUI - Displays a list of projects with their progress and team members.
 */
const ProjectsUI = ({ data, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="space-y-8 p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Skeleton key={index} className="h-70 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <FadeIn direction="up">
          <Card className="border-destructive bg-destructive/10 rounded-xl">
            <CardHeader className="flex flex-row items-start gap-4">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <CardTitle className="text-destructive">
                  Error Loading Projects
                </CardTitle>
                <CardDescription className="text-destructive/80 mt-1">
                  We couldn't load your projects. Please try again later or
                  contact support if the issue persists.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </FadeIn>
      </div>
    )
  }

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "emerald"
      case "completed":
        return "red"
      case "on hold":
        return "amber"
      default:
        return "blue"
    }
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <FadeIn direction="down" duration={0.5}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <BlurText
                text="Projects"
                className="text-3xl font-bold tracking-tight"
                delay={0.1}
              />
            </div>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage your agile projects, sprints, and team progress.
            </p>
          </div>
          <CreateProjectModal />
        </div>
      </FadeIn>

      {/* Projects Grid */}
      {data.length === 0 ? (
        <FadeIn direction="up" delay={0.2}>
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/30">
            <Target className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Get started by creating your first project to organize your team's
              work and track progress.
            </p>
            <CreateProjectModal />
          </div>
        </FadeIn>
      ) : (
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((project, index) => (
            <StaggerItem key={project.id}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <AnimatedCard
                  delay={index * 0.08}
                  className="flex flex-col h-full border-0 shadow-sm rounded-xl group hover:shadow-md transition-shadow duration-200"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <CardTitle className="line-clamp-1 text-xl font-semibold group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <PulseBadge color={getStatusBadgeColor(project.status)}>
                        {project.status === "Active" ? (
                          <Activity className="mr-1 h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        )}
                        {project.status}
                      </PulseBadge>
                    </div>
                    <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                      {project.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-6">
                    {/* Progress Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">
                          Overall Progress
                        </span>
                        <span className="font-bold text-primary">
                          <NumberTicker
                            value={project.progress}
                            delay={index * 0.1}
                            suffix="%"
                          />
                        </span>
                      </div>
                      <AnimatedProgress
                        value={project.progress}
                        max={100}
                        height="h-2"
                        delay={index * 0.1}
                        className="rounded-xl"
                      />
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> Target Date
                        </span>
                        <p className="text-sm font-medium">
                          {new Date(project.endDate).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" /> Team Size
                        </span>
                        <p className="text-sm font-medium">
                          {project.members?.length || 0} Members
                        </p>
                      </div>
                    </div>

                    {/* Team Avatars */}
                    {project.members && project.members.length > 0 && (
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          {project.members.slice(0, 4).map((member) => (
                            <Avatar
                              key={member.id}
                              className="inline-block h-8 w-8 rounded-full border-2 border-background ring-1 ring-border/10"
                            >
                              <AvatarImage
                                src={member.avatar}
                                alt={member.name}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {project.members.length > 4 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground ring-1 ring-border/10">
                              +{project.members.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-4 border-t border-border/50 bg-muted/10 rounded-b-xl">
                    <Button
                      asChild
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors rounded-xl"
                      variant="outline"
                    >
                      <Link to={`/projects/${project.id}`}>
                        View Project Details
                      </Link>
                    </Button>
                  </CardFooter>
                </AnimatedCard>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  )
}

ProjectsUI.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      progress: PropTypes.number.isRequired,
      endDate: PropTypes.string.isRequired,
      members: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          avatar: PropTypes.string.isRequired,
        }),
      ),
    }),
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.oneOf([PropTypes.bool, PropTypes.object]),
}

export default ProjectsUI
