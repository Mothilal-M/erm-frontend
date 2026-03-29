import ct from "@constants/"

import api from "."

export const postSprintInsights = async (payload, { signal } = {}) => {
  return api.post(ct.api.ai.sprintInsights, payload, { signal })
}

export const postSprintAnalytics = async (payload, { signal } = {}) => {
  return api.post(ct.api.ai.sprintAnalytics, payload, { signal })
}

export const postAIInsightsPage = async (payload, { signal } = {}) => {
  return api.post(ct.api.ai.insights, payload, { signal })
}

export const postAIRecommendationsPage = async (payload, { signal } = {}) => {
  return api.post(ct.api.ai.recommendations, payload, { signal })
}

export const postAIAnalyticsPage = async (payload, { signal } = {}) => {
  return api.post(ct.api.ai.analytics, payload, { signal })
}

export const postAIChat = async (payload, { signal } = {}) => {
  return api.post(ct.api.ai.chat, payload, { signal })
}
