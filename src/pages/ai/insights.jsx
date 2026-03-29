import {
  ArrowLeft,
  TrendingUp,
  AlertCircle,
  Zap,
  BarChart3,
} from "lucide-react"
import { Link } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { useAIInsightsPage } from "@/services/query/ai.query"

/**
 * AI Insights Page - AI-powered insights and predictions
 */
const AIInsightsPage = () => {
  const { data, isLoading, isError } = useAIInsightsPage({})
  const insights = data?.insights || []
  const categoryIconMap = {
    Productivity: TrendingUp,
    Process: AlertCircle,
    Resources: Zap,
    Quality: BarChart3,
  }

  const handleInsightAction = (title) => {
    toast({
      title: "Insight action recorded",
      description: `We'll use "${title}" to prioritize the next update.`,
      variant: "success",
    })
  }

  const handleLearnMore = (title) => {
    toast({
      title: "Insight details",
      description: `Detailed recommendations for "${title}" will be available soon.`,
    })
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "Productivity":
        return "bg-blue-100 text-blue-800"
      case "Process":
        return "bg-red-100 text-red-800"
      case "Resources":
        return "bg-yellow-100 text-yellow-800"
      case "Quality":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
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
        <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
        <p className="mt-2 text-muted-foreground">
          Machine learning-powered insights about your team&apos;s performance
          and workflows
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {insights.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Active Insights
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {insights.length
                  ? `${Math.round(
                      insights.reduce((sum, item) => {
                        const value = Number.parseInt(item.confidence, 10)
                        return sum + (Number.isNaN(value) ? 0 : value)
                      }, 0) / insights.length
                    )}%`
                  : "0%"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Avg Confidence
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {insights.filter((item) => item.actionable).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Actionable Items
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">Last 24h</p>
              <p className="text-sm text-muted-foreground mt-1">
                Update Frequency
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Insights</h2>
        {isLoading && (
          <div className="grid gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}
        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-700">
                Unable to load AI insights right now. Please try again.
              </p>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4">
          {!isLoading &&
            !isError &&
            insights.map((insight) => {
              const IconComponent =
                categoryIconMap[insight.category] || BarChart3
              return (
                <Card
                  key={insight.id}
                  className="hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                          <IconComponent className="h-6 w-6 text-slate-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {insight.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge
                              className={getCategoryColor(insight.category)}
                            >
                              {insight.category}
                            </Badge>
                            <p className="text-sm font-semibold text-gray-600 mt-2">
                              {insight.confidence} confident
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 pt-4 border-t">
                          {insight.actionable && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleInsightAction(insight.title)}
                            >
                              Take Action
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLearnMore(insight.title)}
                          >
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default AIInsightsPage
