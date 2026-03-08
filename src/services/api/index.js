import axios from "axios"

import { config } from "@/lib/config"
import { getIdToken } from "@/lib/firebase"
import { reportApiError } from "@/lib/utils/error-handler"

const JSON_CONTENT_TYPE = "application/json"

const instance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    "Content-Type": JSON_CONTENT_TYPE,
  },
})

// AbortController management for request cancellation
const pendingRequests = new Map()

// Common route paths used for redirects
const PATHS = {
  NOT_AUTHORIZED: "/misc/not-authorized/",
  MAINTENANCE: "/misc/maintenance/",
  LOGIN: "/login",
}

/**
 * Generate a unique key for each request
 * @param {object} config - Axios request config
 * @returns {string} Unique request key
 */
const generateRequestKey = (config) => {
  const { method, url, params, data } = config
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
}

/**
 * Cancel all pending requests
 * @returns {void} No return value.
 */
export const cancelAllRequests = () => {
  pendingRequests.forEach((controller) => {
    controller.abort()
  })
  pendingRequests.clear()
}

/**
 * Get current number of pending requests
 * @returns {number} Number of pending requests
 */
export const getPendingRequestsCount = () => pendingRequests.size

// Request interceptor — injects Firebase ID token
instance.interceptors.request.use(
  async (request) => {
    // Generate request key for tracking
    const requestKey = generateRequestKey(request)

    // Create new AbortController for this request
    const controller = new AbortController()
    request.signal = controller.signal

    // Store controller for later cancellation
    pendingRequests.set(requestKey, controller)

    // Add cleanup metadata
    request._requestKey = requestKey
    request._startTime = Date.now()

    // Inject Firebase ID token
    try {
      const token = await getIdToken()
      if (token) {
        request.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      console.warn("Failed to get Firebase ID token")
    }

    return request
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor with error handling and cleanup

/**
 * Delete pending request entry for a request (if present)
 * @param {object|undefined} originalRequest - Axios request config
 * @returns {void}
 */
const cleanupPendingRequest = (originalRequest) => {
  if (originalRequest?._requestKey) {
    pendingRequests.delete(originalRequest._requestKey)
  }
}

/**
 * Report error to monitoring service
 * @param {Error} error - Axios error object
 * @returns {void}
 */
const reportToMonitoring = (error) => {
  reportApiError({
    url: error.config?.url || error.request?.responseURL,
    status: error.response?.status,
    response: error.response,
    request: error.request,
    config: error.config,
  })
}

/**
 * Handle HTTP status specific actions
 * @param {number} status - HTTP status code
 * @param {object} error - Axios error object
 * @returns {void}
 */
const handleHttpStatus = (status, error) => {
  const serverStatuses = new Set([500, 502, 503, 504])

  const handlers = {
    400: (error_) => console.error("Bad request:", error_.response.data),
    401: () => {
      if (window.location.pathname !== PATHS.LOGIN) {
        window.location.href = PATHS.LOGIN
      }
    },
    403: () => {
      if (window.location.pathname !== PATHS.NOT_AUTHORIZED) {
        window.location.href = PATHS.NOT_AUTHORIZED
      }
    },
    404: (error_) => console.error("Resource not found:", error_.config?.url),
    429: () => console.error("Rate limit exceeded"),
  }

  if (serverStatuses.has(status)) {
    console.error(`Server error (${status}):`, error.response.data)
    return
  }

  if (handlers[status]) {
    handlers[status](error)
    return
  }

  console.error(`API error (${status}):`, error.response.data)
}

instance.interceptors.response.use(
  (response) => {
    // Clean up pending request tracking
    const requestKey = response.config._requestKey
    if (requestKey) {
      pendingRequests.delete(requestKey)
    }

    // Log request duration in development
    if (config.isDevelopment && response.config._startTime) {
      const duration = Date.now() - response.config._startTime
      console.warn(
        `${response.config.method.toUpperCase()} ${response.config.url} (${duration}ms)`
      )
    }

    // Unwrap backend SuccessResponse wrapper { data, metadata }
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data &&
      "metadata" in response.data
    ) {
      response.data = response.data.data
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Clean up pending request tracking
    cleanupPendingRequest(originalRequest)

    // Handle request cancellation (don't report to monitoring)
    if (axios.isCancel(error)) {
      console.warn("Request cancelled:", originalRequest?.url)
      return Promise.reject(error)
    }

    // Report API error to monitoring service
    reportToMonitoring(error)

    // Handle specific HTTP status codes
    if (!error.response) {
      console.error("Network error:", error.message)
    } else {
      const { status } = error.response
      handleHttpStatus(status, error)
    }

    return Promise.reject(error)
  }
)

export default instance
