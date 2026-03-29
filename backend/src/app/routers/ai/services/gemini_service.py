import json
import re
from copy import deepcopy
from datetime import UTC, datetime

import httpx
from injectq import singleton

from src.app.core import get_settings
from src.app.routers.ai.schemas import (
    AIAnalyticsResponse,
    AIChatRequest,
    AIChatResponse,
    AIInsightsPageResponse,
    AIRecommendationsPageResponse,
    AIRequestContext,
    SprintAnalyticsResponse,
    SprintInsightsResponse,
)


PERCENT_SCALE_THRESHOLD = 1
PERCENT_SCALE_DIVISOR = 100


@singleton
class GeminiAIService:
    def __init__(self):
        """Initialize the Gemini AI service with application settings.

        The service reads model/config values from central settings and uses
        them for all downstream AI generation requests.
        """
        self._settings = get_settings()

    async def get_sprint_insights(self, payload: AIRequestContext) -> SprintInsightsResponse:
        """Generate sprint insights from task context using Gemini.

        Args:
            payload (AIRequestContext): Project/sprint metadata and task context.

        Returns:
            SprintInsightsResponse: Normalized sprint insight response payload.
        """
        default_response = {
            "sprintId": self._to_int(payload.sprint_id),
            "autoEstimates": [],
            "standupSummary": "AI insights are currently unavailable.",
            "riskAssessment": [],
            "recommendations": [],
            "velocityTrend": [40, 42, 44, 46],
            "predictedCompletion": datetime.now(UTC).date().isoformat(),
        }
        prompt = (
            "You are a sprint analyst. Return only valid JSON with keys: "
            "sprintId, autoEstimates[{taskId,suggestedHours,confidence,reason}], "
            "standupSummary, riskAssessment[{issue,severity,recommendation}], "
            "recommendations[string], velocityTrend[number], predictedCompletion. "
            f"Input JSON: {json.dumps(payload.model_dump(by_alias=True), default=str)}"
        )
        raw = await self._generate_json(prompt, default_response)
        result = self._normalize_sprint_insights(raw, payload, default_response)
        return SprintInsightsResponse.model_validate(result)

    async def get_sprint_analytics(self, payload: AIRequestContext) -> SprintAnalyticsResponse:
        """Generate sprint analytics metrics from sprint context.

        Args:
            payload (AIRequestContext): Project/sprint metadata and task context.

        Returns:
            SprintAnalyticsResponse: Normalized sprint analytics response payload.
        """
        task_count = len(payload.tasks)
        default_response: dict[str, object] = {
            "sprintId": self._to_int(payload.sprint_id),
            "plannedVelocity": max(20, task_count * 5),
            "actualVelocity": max(10, task_count * 4),
            "burndownData": [
                {"day": "D1", "remaining": max(task_count * 4, 20)},
                {"day": "D2", "remaining": max(task_count * 3, 15)},
                {"day": "D3", "remaining": max(task_count * 2, 10)},
                {"day": "D4", "remaining": max(task_count, 5)},
            ],
            "teamCapacity": {},
            "taskDistribution": {
                "byStatus": {},
                "byPriority": {},
                "byAssignee": {},
            },
            "defectRate": 0.05,
            "onTimeHistory": [0.86, 0.88, 0.9, 0.92],
        }
        prompt = (
            "You are a sprint analytics engine. Return only valid JSON with keys: "
            "sprintId, plannedVelocity, actualVelocity, burndownData[{day,remaining}], "
            "teamCapacity object where values are {allocated,completed,efficiency}, "
            "taskDistribution{byStatus,byPriority,byAssignee}, defectRate, onTimeHistory. "
            f"Input JSON: {json.dumps(payload.model_dump(by_alias=True), default=str)}"
        )
        raw = await self._generate_json(prompt, default_response)
        result = self._normalize_sprint_analytics(raw, default_response)
        return SprintAnalyticsResponse.model_validate(result)

    async def get_insights_page(self, payload: AIRequestContext) -> AIInsightsPageResponse:
        """Generate portfolio-level insight cards for the AI insights page.

        Args:
            payload (AIRequestContext): Project/sprint metadata and task context.

        Returns:
            AIInsightsPageResponse: Normalized insights page response.
        """
        default_response: dict[str, object] = {
            "insights": [
                {
                    "id": 1,
                    "title": "Delivery Trend",
                    "description": (
                        "Current sprint momentum is stable with moderate " "completion velocity."
                    ),
                    "confidence": "84%",
                    "category": "Productivity",
                    "actionable": True,
                }
            ]
        }
        prompt = (
            "Return only valid JSON with key insights: insights array of objects "
            "{id,title,description,confidence,category,actionable}. Keep 4-6 items. "
            f"Input JSON: {json.dumps(payload.model_dump(by_alias=True), default=str)}"
        )
        raw = await self._generate_json(prompt, default_response)
        result = self._normalize_insights_page(raw, default_response)
        return AIInsightsPageResponse.model_validate(result)

    async def get_recommendations_page(
        self, payload: AIRequestContext
    ) -> AIRecommendationsPageResponse:
        """Generate recommendation cards for AI recommendations page.

        Args:
            payload (AIRequestContext): Project/sprint metadata and task context.

        Returns:
            AIRecommendationsPageResponse: Normalized recommendations payload.
        """
        default_response: dict[str, object] = {
            "recommendations": [
                {
                    "id": 1,
                    "title": "Prioritize Critical Blockers",
                    "description": "Focus team effort on high-priority blocked tasks first.",
                    "impact": "High",
                    "effort": "Low",
                    "status": "pending",
                    "saving": "3 hours/week",
                    "adopted": 0,
                }
            ]
        }
        prompt = (
            "Return only valid JSON with key recommendations containing array of objects "
            "{id,title,description,impact,effort,status,saving,adopted}. "
            "Use impact in [Critical,High,Medium,Low], effort in [High,Medium,Low], "
            "status in [pending,in-progress,completed]. Keep 5 items. "
            f"Input JSON: {json.dumps(payload.model_dump(by_alias=True), default=str)}"
        )
        raw = await self._generate_json(prompt, default_response)
        result = self._normalize_recommendations_page(raw, default_response)
        return AIRecommendationsPageResponse.model_validate(result)

    async def get_analytics_page(self, payload: AIRequestContext) -> AIAnalyticsResponse:
        """Generate AI analytics page sections and pipeline metrics.

        Args:
            payload (AIRequestContext): Project/sprint metadata and task context.

        Returns:
            AIAnalyticsResponse: Normalized analytics page response payload.
        """
        default_response: dict[str, object] = {
            "metrics": [
                {
                    "title": "Team Velocity",
                    "value": "40 points/sprint",
                    "trend": "+5%",
                    "positive": True,
                    "metric": "current sprint",
                }
            ],
            "predictions": [
                {
                    "title": "Next Sprint Velocity",
                    "prediction": "42-46 points",
                    "confidence": "86%",
                    "details": "Projected from current completion trend.",
                }
            ],
            "mlModels": [
                {
                    "name": "Sprint Forecast Model",
                    "accuracy": "86%",
                    "dataPoints": "120 tasks",
                    "lastUpdate": "just now",
                }
            ],
            "pipelineStatus": {
                "recordsPerHour": "320",
                "uptime": "99.0%",
                "avgProcessingTime": "120ms",
                "dataQuality": "98%",
            },
        }
        prompt = (
            "Return only valid JSON with keys: metrics[{title,value,trend,positive,metric}], "
            "predictions[{title,prediction,confidence,details}], "
            "mlModels[{name,accuracy,dataPoints,lastUpdate}], "
            "pipelineStatus{recordsPerHour,uptime,avgProcessingTime,dataQuality}. "
            f"Input JSON: {json.dumps(payload.model_dump(by_alias=True), default=str)}"
        )
        raw = await self._generate_json(prompt, default_response)
        result = self._normalize_analytics_page(raw, default_response)
        return AIAnalyticsResponse.model_validate(result)

    async def chat(self, payload: AIChatRequest) -> AIChatResponse:
        """Generate a conversational AI reply for sprint assistant chat.

        Args:
            payload (AIChatRequest): User message and optional sprint context.

        Returns:
            AIChatResponse: Chat response with assistant reply text.
        """
        fallback = {
            "reply": (
                "I could not reach Gemini right now. Please try again in a moment, "
                "or share more sprint context for a better suggestion."
            )
        }
        prompt = (
            "You are an enterprise sprint assistant. Provide a concise actionable response. "
            "Return only valid JSON with key reply. "
            f"Input JSON: {json.dumps(payload.model_dump(by_alias=True), default=str)}"
        )
        result = await self._generate_json(prompt, fallback)
        if not isinstance(result, dict):
            result = fallback
        reply = self._to_str(result.get("reply"), fallback["reply"]).strip()
        return AIChatResponse.model_validate({"reply": reply or fallback["reply"]})

    async def _generate_json(self, prompt: str, fallback: dict) -> dict:
        """Call Gemini generateContent API and parse a JSON object response.

        Args:
            prompt (str): Prompt text instructing response structure.
            fallback (dict): Fallback payload when API/parsing fails.

        Returns:
            dict: Parsed JSON response or fallback payload.
        """
        api_key = self._settings.GEMINI_API_KEY
        model = self._settings.GEMINI_MODEL

        if not api_key:
            return fallback

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            f"?key={api_key}"
        )
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": self._settings.GEMINI_TEMPERATURE,
                "responseMimeType": "application/json",
                "maxOutputTokens": self._settings.GEMINI_MAX_OUTPUT_TOKENS,
            },
        }

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()

        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        text = parts[0].get("text", "") if parts else ""

        if not text:
            return fallback

        try:
            return json.loads(self._extract_json_text(text))
        except (json.JSONDecodeError, KeyError, TypeError, ValueError):
            return fallback

    @staticmethod
    def _extract_json_text(text: str) -> str:
        """Extract raw JSON text from plain or fenced markdown content.

        Args:
            text (str): Candidate text returned by model.

        Returns:
            str: Clean JSON string content.
        """
        candidate = text.strip()
        if candidate.startswith("```"):
            candidate = re.sub(r"^```(?:json)?", "", candidate)
            candidate = re.sub(r"```$", "", candidate)
            candidate = candidate.strip()
        return candidate

    @staticmethod
    def _to_int(value: int | str | None) -> int | None:
        """Safely coerce a value to integer.

        Args:
            value (int | str | None): Value to convert.

        Returns:
            int | None: Converted integer or None when conversion fails.
        """
        if value is None:
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _to_float(value, default: float = 0.0) -> float:
        """Safely coerce free-form model output into a float.

        Args:
            value: Incoming value from model response.
            default (float): Default number when conversion fails.

        Returns:
            float: Parsed float value.
        """
        result = default
        low = ""
        label_map = {
            "critical": 0.95,
            "high": 0.9,
            "medium": 0.7,
            "low": 0.5,
        }

        if value is None:
            pass
        elif isinstance(value, bool):
            result = 1.0 if value else 0.0
        elif isinstance(value, int | float):
            result = float(value)
        else:
            text = str(value).strip()
            if text:
                low = text.lower()
                if low in label_map:
                    result = label_map[low]
                elif text.endswith("%"):
                    try:
                        result = float(text[:-1].strip()) / PERCENT_SCALE_DIVISOR
                    except ValueError:
                        result = default
                else:
                    match = re.search(r"-?\d+(?:\.\d+)?", text)
                    if match:
                        number = float(match.group(0))
                        if PERCENT_SCALE_THRESHOLD < number <= PERCENT_SCALE_DIVISOR:
                            result = number / PERCENT_SCALE_DIVISOR
                        else:
                            result = number
        return result

    @staticmethod
    def _to_bool(value, default: bool = False) -> bool:
        """Safely coerce free-form model output into a boolean.

        Args:
            value: Incoming value from model response.
            default (bool): Default boolean when conversion fails.

        Returns:
            bool: Parsed boolean value.
        """
        if isinstance(value, bool):
            return value
        if value is None:
            return default

        if isinstance(value, int | float):
            return value != 0

        text = str(value).strip().lower()
        if text in {"true", "yes", "y", "1", "on", "actionable"}:
            return True
        if text in {"false", "no", "n", "0", "off", "not actionable"}:
            return False
        return default

    @staticmethod
    def _to_str(value, default: str = "") -> str:
        """Safely coerce a value to non-empty string.

        Args:
            value: Incoming value from model response.
            default (str): Default string when value is empty/None.

        Returns:
            str: Sanitized string value.
        """
        if value is None:
            return default
        text = str(value).strip()
        return text if text else default

    @staticmethod
    def _extract_int(value, default: int) -> int:
        """Extract integer from scalar or tokenized string identifiers.

        Args:
            value: Incoming value, such as "REC-001".
            default (int): Default integer when extraction fails.

        Returns:
            int: Parsed integer token or default.
        """
        if isinstance(value, int):
            return value
        if isinstance(value, float):
            return int(value)
        text = str(value or "")
        match = re.search(r"\d+", text)
        if match:
            return int(match.group(0))
        return default

    @staticmethod
    def _as_list(value):
        """Return value when it is a list, otherwise empty list.

        Args:
            value: Candidate object.

        Returns:
            list: Original list or empty list fallback.
        """
        return value if isinstance(value, list) else []

    @staticmethod
    def _as_dict(value):
        """Return value when it is a dict, otherwise empty dict.

        Args:
            value: Candidate object.

        Returns:
            dict: Original dict or empty dict fallback.
        """
        return value if isinstance(value, dict) else {}

    def _normalize_sprint_insights(
        self,
        raw: dict,
        payload: AIRequestContext,
        fallback: dict,
    ) -> dict:
        """Normalize sprint insights payload into schema-safe response shape.

        Args:
            raw (dict): Raw model response payload.
            payload (AIRequestContext): Request context used for fallback values.
            fallback (dict): Default payload template.

        Returns:
            dict: Normalized sprint insights payload.
        """
        data = deepcopy(fallback)
        source = self._as_dict(raw)

        data["sprintId"] = self._to_int(source.get("sprintId")) or self._to_int(payload.sprint_id)
        data["standupSummary"] = self._to_str(source.get("standupSummary"), data["standupSummary"])
        data["predictedCompletion"] = self._to_str(
            source.get("predictedCompletion"),
            data["predictedCompletion"],
        )

        auto_estimates = []
        for index, item in enumerate(self._as_list(source.get("autoEstimates"))):
            if not isinstance(item, dict):
                continue
            auto_estimates.append(
                {
                    "taskId": self._to_str(item.get("taskId"), f"task-{index + 1}"),
                    "suggestedHours": max(0, int(self._to_float(item.get("suggestedHours"), 0))),
                    "confidence": min(max(self._to_float(item.get("confidence"), 0.7), 0.0), 1.0),
                    "reason": self._to_str(
                        item.get("reason"), "AI estimate based on task context."
                    ),
                }
            )
        data["autoEstimates"] = auto_estimates

        risks = []
        for item in self._as_list(source.get("riskAssessment")):
            if not isinstance(item, dict):
                continue
            risks.append(
                {
                    "issue": self._to_str(item.get("issue"), "Potential delivery risk"),
                    "severity": self._to_str(item.get("severity"), "Medium"),
                    "recommendation": self._to_str(
                        item.get("recommendation"),
                        "Review sprint blockers in standup.",
                    ),
                }
            )
        data["riskAssessment"] = risks

        recommendations = []
        for item in self._as_list(source.get("recommendations")):
            text = self._to_str(item)
            if text:
                recommendations.append(text)
        data["recommendations"] = recommendations

        trend = []
        for point in self._as_list(source.get("velocityTrend")):
            trend.append(max(0, int(self._to_float(point, 0))))
        data["velocityTrend"] = trend if trend else data["velocityTrend"]

        return data

    def _normalize_sprint_analytics(self, raw: dict, fallback: dict) -> dict:
        """Normalize sprint analytics payload into schema-safe response shape.

        Args:
            raw (dict): Raw model response payload.
            fallback (dict): Default payload template.

        Returns:
            dict: Normalized sprint analytics payload.
        """
        data = deepcopy(fallback)
        source = self._as_dict(raw)

        data["sprintId"] = self._to_int(source.get("sprintId"))
        data["plannedVelocity"] = max(
            0, int(self._to_float(source.get("plannedVelocity"), data["plannedVelocity"]))
        )
        data["actualVelocity"] = max(
            0, int(self._to_float(source.get("actualVelocity"), data["actualVelocity"]))
        )
        data["defectRate"] = max(0.0, self._to_float(source.get("defectRate"), data["defectRate"]))

        burndown = []
        for index, point in enumerate(self._as_list(source.get("burndownData"))):
            if not isinstance(point, dict):
                continue
            burndown.append(
                {
                    "day": self._to_str(point.get("day"), f"D{index + 1}"),
                    "remaining": max(0, int(self._to_float(point.get("remaining"), 0))),
                }
            )
        data["burndownData"] = burndown if burndown else data["burndownData"]

        team_capacity = {}
        for person, metrics in self._as_dict(source.get("teamCapacity")).items():
            metric_obj = self._as_dict(metrics)
            team_capacity[self._to_str(person, "member")] = {
                "allocated": max(0, int(self._to_float(metric_obj.get("allocated"), 0))),
                "completed": max(0, int(self._to_float(metric_obj.get("completed"), 0))),
                "efficiency": max(0.0, self._to_float(metric_obj.get("efficiency"), 0.0)),
            }
        data["teamCapacity"] = team_capacity

        distribution = self._as_dict(source.get("taskDistribution"))
        by_status = {
            self._to_str(k, "Unknown"): max(0, int(self._to_float(v, 0)))
            for k, v in self._as_dict(distribution.get("byStatus")).items()
        }
        by_priority = {
            self._to_str(k, "Unknown"): max(0, int(self._to_float(v, 0)))
            for k, v in self._as_dict(distribution.get("byPriority")).items()
        }
        by_assignee = {
            self._to_str(k, "Unknown"): max(0, int(self._to_float(v, 0)))
            for k, v in self._as_dict(distribution.get("byAssignee")).items()
        }
        data["taskDistribution"] = {
            "byStatus": by_status,
            "byPriority": by_priority,
            "byAssignee": by_assignee,
        }

        history = [
            max(0.0, self._to_float(item, 0.0))
            for item in self._as_list(source.get("onTimeHistory"))
        ]
        data["onTimeHistory"] = history if history else data["onTimeHistory"]

        return data

    def _normalize_insights_page(self, raw: dict, fallback: dict) -> dict:
        """Normalize AI insights page payload into schema-safe response shape.

        Args:
            raw (dict): Raw model response payload.
            fallback (dict): Default payload template.

        Returns:
            dict: Normalized insights page payload.
        """
        data = deepcopy(fallback)
        source = self._as_dict(raw)

        insights = []
        for index, item in enumerate(self._as_list(source.get("insights"))):
            if not isinstance(item, dict):
                continue
            confidence_value = item.get("confidence")
            if isinstance(confidence_value, int | float):
                confidence = (
                    f"{min(max(self._to_float(confidence_value, 0.0), 0.0), 1.0) * 100:.0f}%"
                )
            else:
                confidence = self._to_str(confidence_value, "80%")

            insights.append(
                {
                    "id": self._extract_int(item.get("id"), index + 1),
                    "title": self._to_str(item.get("title"), f"Insight {index + 1}"),
                    "description": self._to_str(
                        item.get("description"), "No description provided."
                    ),
                    "confidence": confidence,
                    "category": self._to_str(item.get("category"), "General"),
                    "actionable": self._to_bool(item.get("actionable"), True),
                }
            )

        data["insights"] = insights if insights else data["insights"]
        return data

    def _normalize_recommendations_page(self, raw: dict, fallback: dict) -> dict:
        """Normalize recommendations payload into schema-safe response shape.

        Args:
            raw (dict): Raw model response payload.
            fallback (dict): Default payload template.

        Returns:
            dict: Normalized recommendations payload.
        """
        data = deepcopy(fallback)
        source = self._as_dict(raw)

        impact_values = {"critical", "high", "medium", "low"}
        effort_values = {"high", "medium", "low"}
        status_values = {"pending", "in-progress", "completed"}

        recommendations = []
        for index, item in enumerate(self._as_list(source.get("recommendations"))):
            if not isinstance(item, dict):
                continue

            impact = self._to_str(item.get("impact"), "Medium")
            effort = self._to_str(item.get("effort"), "Medium")
            status = self._to_str(item.get("status"), "pending").lower()

            if impact.lower() not in impact_values:
                impact = "Medium"
            if effort.lower() not in effort_values:
                effort = "Medium"
            if status not in status_values:
                status = "pending"

            saving_raw = item.get("saving")
            if isinstance(saving_raw, int | float):
                saving = f"{saving_raw:g}"
            else:
                saving = self._to_str(saving_raw, "N/A")

            recommendations.append(
                {
                    "id": self._extract_int(item.get("id"), index + 1),
                    "title": self._to_str(item.get("title"), f"Recommendation {index + 1}"),
                    "description": self._to_str(
                        item.get("description"), "No description provided."
                    ),
                    "impact": impact.capitalize(),
                    "effort": effort.capitalize(),
                    "status": status,
                    "saving": saving,
                    "adopted": max(0, int(self._to_float(item.get("adopted"), 0))),
                }
            )

        data["recommendations"] = recommendations if recommendations else data["recommendations"]
        return data

    def _normalize_analytics_page(self, raw: dict, fallback: dict) -> dict:
        """Normalize analytics page payload into schema-safe response shape.

        Args:
            raw (dict): Raw model response payload.
            fallback (dict): Default payload template.

        Returns:
            dict: Normalized analytics page payload.
        """
        data = deepcopy(fallback)
        source = self._as_dict(raw)

        metrics = []
        for item in self._as_list(source.get("metrics")):
            if not isinstance(item, dict):
                continue
            metrics.append(
                {
                    "title": self._to_str(item.get("title"), "Metric"),
                    "value": self._to_str(item.get("value"), "N/A"),
                    "trend": self._to_str(item.get("trend"), "0%"),
                    "positive": self._to_bool(item.get("positive"), True),
                    "metric": self._to_str(item.get("metric"), "current"),
                }
            )
        data["metrics"] = metrics if metrics else data["metrics"]

        predictions = []
        for item in self._as_list(source.get("predictions")):
            if not isinstance(item, dict):
                continue
            predictions.append(
                {
                    "title": self._to_str(item.get("title"), "Prediction"),
                    "prediction": self._to_str(item.get("prediction"), "N/A"),
                    "confidence": self._to_str(item.get("confidence"), "80%"),
                    "details": self._to_str(item.get("details"), "No details provided."),
                }
            )
        data["predictions"] = predictions if predictions else data["predictions"]

        ml_models = []
        for item in self._as_list(source.get("mlModels")):
            if not isinstance(item, dict):
                continue
            ml_models.append(
                {
                    "name": self._to_str(item.get("name"), "ML Model"),
                    "accuracy": self._to_str(item.get("accuracy"), "N/A"),
                    "dataPoints": self._to_str(item.get("dataPoints"), "N/A"),
                    "lastUpdate": self._to_str(item.get("lastUpdate"), "N/A"),
                }
            )
        data["mlModels"] = ml_models if ml_models else data["mlModels"]

        pipeline = self._as_dict(source.get("pipelineStatus"))
        data["pipelineStatus"] = {
            "recordsPerHour": self._to_str(
                pipeline.get("recordsPerHour"), data["pipelineStatus"]["recordsPerHour"]
            ),
            "uptime": self._to_str(pipeline.get("uptime"), data["pipelineStatus"]["uptime"]),
            "avgProcessingTime": self._to_str(
                pipeline.get("avgProcessingTime"),
                data["pipelineStatus"]["avgProcessingTime"],
            ),
            "dataQuality": self._to_str(
                pipeline.get("dataQuality"), data["pipelineStatus"]["dataQuality"]
            ),
        }

        return data
