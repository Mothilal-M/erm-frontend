from pydantic import Field

from src.app.utils.schemas.camel_schema import CamelModel


class SprintTaskInput(CamelModel):
    id: str = Field(..., description="Task identifier")
    title: str = Field(..., description="Task title")
    description: str = Field(default="", description="Task description")
    status: str = Field(default="", description="Workflow status")
    priority: str = Field(default="", description="Task priority")
    estimated_hours: float | None = Field(default=None, description="Estimated effort in hours")
    actual_hours: float | None = Field(default=None, description="Actual effort in hours")


class AIRequestContext(CamelModel):
    project_id: int | str | None = Field(default=None, description="Project identifier")
    sprint_id: int | str | None = Field(default=None, description="Sprint identifier")
    tasks: list[SprintTaskInput] = Field(default_factory=list, description="Sprint tasks")


class SprintAutoEstimate(CamelModel):
    task_id: str
    suggested_hours: int
    confidence: float
    reason: str


class SprintRisk(CamelModel):
    issue: str
    severity: str
    recommendation: str


class SprintInsightsResponse(CamelModel):
    sprint_id: int | None = None
    auto_estimates: list[SprintAutoEstimate] = Field(default_factory=list)
    standup_summary: str = ""
    risk_assessment: list[SprintRisk] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    velocity_trend: list[int] = Field(default_factory=list)
    predicted_completion: str = ""


class BurndownPoint(CamelModel):
    day: str
    remaining: int


class TeamCapacityItem(CamelModel):
    allocated: int
    completed: int
    efficiency: float


class TaskDistribution(CamelModel):
    by_status: dict[str, int] = Field(default_factory=dict)
    by_priority: dict[str, int] = Field(default_factory=dict)
    by_assignee: dict[str, int] = Field(default_factory=dict)


class SprintAnalyticsResponse(CamelModel):
    sprint_id: int | None = None
    planned_velocity: int
    actual_velocity: int
    burndown_data: list[BurndownPoint] = Field(default_factory=list)
    team_capacity: dict[str, TeamCapacityItem] = Field(default_factory=dict)
    task_distribution: TaskDistribution
    defect_rate: float
    on_time_history: list[float] = Field(default_factory=list)


class AIInsightCard(CamelModel):
    id: int
    title: str
    description: str
    confidence: str
    category: str
    actionable: bool


class AIInsightsPageResponse(CamelModel):
    insights: list[AIInsightCard] = Field(default_factory=list)


class AIRecommendationItem(CamelModel):
    id: int
    title: str
    description: str
    impact: str
    effort: str
    status: str
    saving: str
    adopted: int


class AIRecommendationsPageResponse(CamelModel):
    recommendations: list[AIRecommendationItem] = Field(default_factory=list)


class MetricItem(CamelModel):
    title: str
    value: str
    trend: str
    positive: bool
    metric: str


class PredictionItem(CamelModel):
    title: str
    prediction: str
    confidence: str
    details: str


class MLModelItem(CamelModel):
    name: str
    accuracy: str
    data_points: str
    last_update: str


class PipelineStatus(CamelModel):
    records_per_hour: str
    uptime: str
    avg_processing_time: str
    data_quality: str


class AIAnalyticsResponse(CamelModel):
    metrics: list[MetricItem] = Field(default_factory=list)
    predictions: list[PredictionItem] = Field(default_factory=list)
    ml_models: list[MLModelItem] = Field(default_factory=list)
    pipeline_status: PipelineStatus


class ChatHistoryItem(CamelModel):
    role: str
    content: str


class AIChatRequest(CamelModel):
    message: str = Field(..., min_length=1)
    project_id: int | str | None = None
    sprint_id: int | str | None = None
    tasks: list[SprintTaskInput] = Field(default_factory=list)
    history: list[ChatHistoryItem] = Field(default_factory=list)


class AIChatResponse(CamelModel):
    reply: str
