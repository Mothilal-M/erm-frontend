import { BarChart3, PieChart, TrendingUp } from "lucide-react"
import PropTypes from "prop-types"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * BurndownChart - Simple SVG-based burn-down chart
 */
const BurndownChart = ({ data }) => {
  if (!data || data.length === 0) return null

  const maxValue = Math.max(...data.map((d) => d.remaining))
  const points = data
    .map((d, pointIndex) => {
      const x = (pointIndex / (data.length - 1)) * 300
      const y = 150 - (d.remaining / maxValue) * 150
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width="100%" height="200" viewBox="0 0 320 180" className="mt-2">
      {/* Grid lines */}
      {[0, 1, 2, 3].map((gridIndex) => (
        <line
          key={gridIndex}
          x1="20"
          y1={20 + (gridIndex * 150) / 3}
          x2="300"
          y2={20 + (gridIndex * 150) / 3}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      {/* Ideal line (diagonal) */}
      <line
        x1="20"
        y1="20"
        x2="300"
        y2="170"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeDasharray="5,5"
      />

      {/* Actual line */}
      <polyline
        points={`20,170 ${points.split(" ").join(" ")}`}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
      />

      {/* Chart axes */}
      <line x1="20" y1="20" x2="20" y2="170" stroke="#374151" strokeWidth="2" />
      <line
        x1="20"
        y1="170"
        x2="300"
        y2="170"
        stroke="#374151"
        strokeWidth="2"
      />

      {/* Labels */}
      <text x="5" y="25" fontSize="10" fill="#6b7280">
        {maxValue}
      </text>
      <text x="5" y="175" fontSize="10" fill="#6b7280">
        0
      </text>
      <text x="280" y="185" fontSize="10" fill="#6b7280">
        End
      </text>
    </svg>
  )
}

BurndownChart.propTypes = {
  data: PropTypes.array,
}

/**
 * AnalyticsDashboard - Team performance and sprint metrics
 */
const AnalyticsDashboard = ({ analytics, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-sm">Analytics Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Unable to load sprint analytics
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Burn-down Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Sprint Burn-down
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BurndownChart data={analytics.burndownData} />
          <div className="mt-2 grid gap-2 md:grid-cols-2 text-xs">
            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Planned Velocity</p>
              <p className="text-lg font-bold">
                {analytics.plannedVelocity} pts
              </p>
            </div>
            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Actual Velocity</p>
              <p className="text-lg font-bold">
                {analytics.actualVelocity} pts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Capacity */}
      {analytics.teamCapacity && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Team Capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(analytics.teamCapacity).map(([name, capacity]) => (
              <div key={name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{name}</span>
                  <Badge variant="outline" className="text-xs">
                    {(capacity.efficiency * 100).toFixed(0)}% efficient
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex-1 rounded-full bg-gray-200 h-2">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{
                        width: `${(capacity.completed / capacity.allocated) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="whitespace-nowrap">
                    {capacity.completed}/{capacity.allocated}h
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Task Distribution */}
      {analytics.taskDistribution && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Task Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                By Status
              </p>
              <div className="flex gap-1">
                {Object.entries(analytics.taskDistribution.byStatus).map(
                  ([status, count]) => {
                    const colors = {
                      Todo: "bg-gray-200",
                      "In Progress": "bg-blue-200",
                      "In Review": "bg-yellow-200",
                      Done: "bg-green-200",
                    }
                    return (
                      <div
                        key={status}
                        className={`flex-1 h-6 rounded flex items-center justify-center text-xs font-bold ${colors[status]}`}
                        title={`${status}: ${count}`}
                      >
                        {count}
                      </div>
                    )
                  },
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                By Priority
              </p>
              <div className="flex gap-1">
                {Object.entries(analytics.taskDistribution.byPriority).map(
                  ([priority, count]) => {
                    const colors = {
                      High: "bg-red-200",
                      Medium: "bg-yellow-200",
                      Low: "bg-green-200",
                    }
                    return (
                      <div
                        key={priority}
                        className={`flex-1 h-6 rounded flex items-center justify-center text-xs font-bold ${colors[priority]}`}
                        title={`${priority}: ${count}`}
                      >
                        {count}
                      </div>
                    )
                  },
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sprint Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Sprint Health
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3 text-xs">
          <div className="rounded-lg border p-2">
            <p className="text-muted-foreground">Defect Rate</p>
            <p className="text-lg font-bold text-red-600">
              {(analytics.defectRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg border p-2">
            <p className="text-muted-foreground">On-Time Rate</p>
            <p className="text-lg font-bold text-green-600">
              {(
                analytics.onTimeHistory[analytics.onTimeHistory.length - 1] *
                100
              ).toFixed(0)}
              %
            </p>
          </div>
          <div className="rounded-lg border p-2">
            <p className="text-muted-foreground">Trend</p>
            <div className="flex gap-1 mt-1">
              {analytics.onTimeHistory.map((rate, historyIndex) => (
                <div
                  key={`ontime-${historyIndex}`}
                  className="flex-1 h-4 rounded"
                  style={{
                    backgroundColor:
                      rate >= 0.9
                        ? "#10b981"
                        : rate >= 0.8
                          ? "#f59e0b"
                          : "#ef4444",
                  }}
                  title={`${(rate * 100).toFixed(0)}%`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

AnalyticsDashboard.propTypes = {
  analytics: PropTypes.shape({
    sprintId: PropTypes.number,
    plannedVelocity: PropTypes.number,
    actualVelocity: PropTypes.number,
    burndownData: PropTypes.array,
    teamCapacity: PropTypes.object,
    taskDistribution: PropTypes.object,
    defectRate: PropTypes.number,
    onTimeHistory: PropTypes.array,
  }),
  isLoading: PropTypes.bool.isRequired,
}

AnalyticsDashboard.defaultProps = {
  analytics: null,
}

export default AnalyticsDashboard
