import axios from "axios"

import { toast } from "@/components/ui/use-toast"
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

const PATHS = {
  LOGIN: "/login",
}

// Auth pages handle their own error toasts — skip global toasts for them
const AUTH_PATHS = new Set([PATHS.LOGIN, "/signup"])

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

// Common messages reused across error maps
const MSG_NO_PERMISSION = "You don't have permission to perform this action."
const MSG_NOT_FOUND = "The requested data could not be found."
const MSG_INVALID_INPUT =
  "The submitted data is invalid. Please check and try again."
const MSG_SESSION_EXPIRED = "Your session has expired. Please sign in again."
const MSG_SERVER_ERROR =
  "Something went wrong on the server. Please try again later."

/**
 * Map known backend error codes to user-friendly messages
 */
const ERROR_CODE_MESSAGES = {
  PERMISSION_ERROR: MSG_NO_PERMISSION,
  RESOURCE_NOT_FOUND: MSG_NOT_FOUND,
  DUPLICATE_REQUEST: "This record already exists.",
  VALIDATION_ERROR: MSG_INVALID_INPUT,
  INTEGRITY_ERROR: "This operation conflicts with existing data.",
  INVALID_TOKEN: MSG_SESSION_EXPIRED,
  USER_ACCOUNT_DISABLE:
    "Your account has been disabled. Please contact your administrator.",
  EMPLOYEE_NOT_FOUND:
    "No employee profile found for your account. Please contact your administrator.",
  MULTIPLE_OBJECTS_RETURNED:
    "An unexpected data conflict occurred. Please contact support.",
  InvalidOperationError: "This operation is not allowed.",
}

/**
 * Fallback messages by HTTP status code
 */
const STATUS_MESSAGES = {
  400: "The request was invalid. Please check your input.",
  401: MSG_SESSION_EXPIRED,
  403: MSG_NO_PERMISSION,
  404: MSG_NOT_FOUND,
  422: MSG_INVALID_INPUT,
  429: "Too many requests. Please wait a moment and try again.",
  500: MSG_SERVER_ERROR,
  502: "The server is temporarily unavailable. Please try again.",
  503: "The service is under maintenance. Please try again later.",
  504: "The server took too long to respond. Please try again.",
}

/**
 * Handle HTTP errors — show toast messages instead of redirecting.
 * Only redirect to /login on 401 (expired session).
 */
const handleHttpStatus = (status, error) => {
  const isAuthPage = AUTH_PATHS.has(window.location.pathname)

  // Auth pages handle their own error toasts
  if (isAuthPage) return

  // On 401, redirect to login (session expired)
  if (status === 401) {
    if (window.location.pathname !== PATHS.LOGIN) {
      toast({
        title: "Session expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      })
      window.location.href = PATHS.LOGIN
    }
    return
  }

  // For all other errors, show a toast with a friendly message
  const errorCode = error.response?.data?.error?.code
  const friendlyMessage =
    ERROR_CODE_MESSAGES[errorCode] ||
    STATUS_MESSAGES[status] ||
    "Something went wrong. Please try again later."

  toast({
    title: "Error",
    description: friendlyMessage,
    variant: "destructive",
  })
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
      return Promise.reject(error)
    }

    // Report API error to monitoring service
    reportToMonitoring(error)

    // Handle specific HTTP status codes
    if (!error.response) {
      // Network error — no response from server
      const isAuthPage = AUTH_PATHS.has(window.location.pathname)
      if (!isAuthPage) {
        toast({
          title: "Connection error",
          description: "Unable to reach the server. Please check your internet connection.",
          variant: "destructive",
        })
      }
    } else {
      const { status } = error.response
      handleHttpStatus(status, error)
    }

    return Promise.reject(error)
  }
)

export default instance
