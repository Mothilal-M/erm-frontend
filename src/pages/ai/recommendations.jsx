import { ArrowLeft, CheckCircle2, Clock, Lightbulb } from "lucide-react"
import { Link } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { useAIRecommendationsPage } from "@/services/query/ai.query"

/**
 * AI Recommendations Page - AI-generated process improvement recommendations
 */
const AIRecommendationsPage = () => {
  const { data, isLoading, isError } = useAIRecommendationsPage({})
  const recommendations = data?.recommendations || []

  const handleAdopt = (title) => {
    toast({
      title: "Recommendation adopted",
      description: `"${title}" has been queued for follow-up.`,
      variant: "success",
    })
  }

  const handleRecommendationDetails = (title) => {
    toast({
      title: "Recommendation details",
      description: `Expanded details for "${title}" are coming soon.`,
    })
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case "Critical":
        return "bg-red-100 text-red-800"
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEffortColor = (effort) => {
    switch (effort) {
      case "Low":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "High":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-600" />
    }
  }

  return (
    <div className="space-y-6 p-6">
      <Button variant="ghost" asChild>
        <Link to="/ai">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to AI Hub
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          AI Recommendations
        </h1>
        <p className="mt-2 text-muted-foreground">
          Smart recommendations to optimize your team's processes and improve
          productivity
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{recommendations.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Total Recommendations
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {
                  recommendations.filter((item) => item.status === "completed")
                    .length
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">Implemented</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {
                  recommendations.filter(
                    (item) => item.status === "in-progress",
                  ).length
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">17.5h</p>
              <p className="text-sm text-muted-foreground mt-1">
                Potential Savings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {isLoading && (
          <>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </>
        )}
        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-700">
                Unable to load recommendations right now. Please try again.
              </p>
            </CardContent>
          </Card>
        )}
        {!isLoading &&
          !isError &&
          recommendations.map((rec) => (
            <Card
              key={rec.id}
              className={`hover:shadow-lg transition-shadow ${
                rec.status === "completed" ? "opacity-75" : ""
              }`}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(rec.status)}
                      <div>
                        <h3 className="font-semibold text-lg">{rec.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Impact
                      </p>
                      <Badge className={getImpactColor(rec.impact)}>
                        {rec.impact}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Effort
                      </p>
                      <Badge className={getEffortColor(rec.effort)}>
                        {rec.effort}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Status
                      </p>
                      <Badge variant="outline" className="capitalize">
                        {rec.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Savings
                      </p>
                      <p className="text-sm font-semibold">{rec.saving}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAdopt(rec.title)}
                    >
                      {rec.status === "completed" ? "Already Done" : "Adopt"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRecommendationDetails(rec.title)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}

export default AIRecommendationsPage
