import { useMutation, useQuery } from "@tanstack/react-query"

import {
  postAIAnalyticsPage,
  postAIChat,
  postAIInsightsPage,
  postAIRecommendationsPage,
} from "@api/ai.api"

const aiKeys = {
  all: ["ai"],
  insights: (payload) => [...aiKeys.all, "insights", payload],
  recommendations: (payload) => [...aiKeys.all, "recommendations", payload],
  analytics: (payload) => [...aiKeys.all, "analytics", payload],
}

export const useAIInsightsPage = (payload = {}) => {
  return useQuery({
    queryKey: aiKeys.insights(payload),
    queryFn: async ({ signal }) => {
      const response = await postAIInsightsPage(payload, { signal })
      return response.data
    },
  })
}

export const useAIRecommendationsPage = (payload = {}) => {
  return useQuery({
    queryKey: aiKeys.recommendations(payload),
    queryFn: async ({ signal }) => {
      const response = await postAIRecommendationsPage(payload, { signal })
      return response.data
    },
  })
}

export const useAIAnalyticsPage = (payload = {}) => {
  return useQuery({
    queryKey: aiKeys.analytics(payload),
    queryFn: async ({ signal }) => {
      const response = await postAIAnalyticsPage(payload, { signal })
      return response.data
    },
  })
}

export const useAIChat = () => {
  return useMutation({
    mutationFn: async ({ payload, signal }) => {
      const response = await postAIChat(payload, { signal })
      return response.data
    },
  })
}
