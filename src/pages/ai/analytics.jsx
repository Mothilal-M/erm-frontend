import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import { Link } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { useAIAnalyticsPage } from "@/services/query/ai.query"

/**
 * AI Analytics Page - Advanced machine learning analytics
 */
const AIAnalyticsPage = () => {
  const { data, isLoading, isError } = useAIAnalyticsPage({})
  const metrics = data?.metrics || []
  const predictions = data?.predictions || []
  const mlModels = data?.mlModels || []
  const pipelineStatus = data?.pipelineStatus

  const handleModelDetails = (name) => {
    toast({
      title: "Model details",
      description: `Detailed diagnostics for \"${name}\" are not available yet.`,
    })
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
        <h1 className="text-3xl font-bold tracking-tight">AI Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Advanced machine learning analytics for data-driven decision making
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700">
              Unable to load AI analytics right now. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {!isLoading && !isError && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.title}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        {metric.metric}
                      </p>
                      <div className="flex items-center gap-1">
                        {metric.positive ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-semibold ${
                            metric.positive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {metric.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Predictions */}
      {!isLoading && !isError && (
        <div>
          <h2 className="text-xl font-semibold mb-4">AI Predictions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {predictions.map((pred) => (
              <Card key={pred.title} className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{pred.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Prediction
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {pred.prediction}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Confidence Level
                    </p>
                    <Badge className="bg-blue-100 text-blue-800">
                      {pred.confidence}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {pred.details}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ML Models Status */}
      {!isLoading && !isError && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Active ML Models</h2>
          <div className="space-y-3">
            {mlModels.map((model) => (
              <Card key={model.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">{model.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Trained on {model.dataPoints} • Updated{" "}
                        {model.lastUpdate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        {model.accuracy} Accuracy
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => handleModelDetails(model.name)}
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
      )}

      {/* Data Pipeline Status */}
      {!isLoading && !isError && pipelineStatus && (
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
          <CardHeader>
            <CardTitle>Data Pipeline Status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-3xl font-bold">
                {pipelineStatus.recordsPerHour}
              </p>
              <p className="text-sm text-gray-300 mt-1">Data Records/Hour</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{pipelineStatus.uptime}</p>
              <p className="text-sm text-gray-300 mt-1">Uptime</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {pipelineStatus.avgProcessingTime}
              </p>
              <p className="text-sm text-gray-300 mt-1">Avg Processing Time</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{pipelineStatus.dataQuality}</p>
              <p className="text-sm text-gray-300 mt-1">Data Quality</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AIAnalyticsPage
