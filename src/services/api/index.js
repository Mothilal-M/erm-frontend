import axios from "axios"

// import { firebaseAuth } from '../lib/firebase'
// See src/docs/AUTHENTICATION_PATTERNS.md for authentication implementation examples
import { config } from "@/lib/config"
import { reportApiError } from "@/lib/utils/error-handler"

// Common header values

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

// /**
//  * Cancel pending request if exists
//  * @param {string} requestKey - Request key
//  */
// const cancelPendingRequest = (requestKey) => {
//   if (pendingRequests.has(requestKey)) {
//     const controller = pendingRequests.get(requestKey)
//     controller.abort()
//     pendingRequests.delete(requestKey)
//   }
// }

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

// Request interceptor with AbortController support
instance.interceptors.request.use(
  (request) => {
    // Generate request key for tracking
    const requestKey = generateRequestKey(request)

    // Cancel duplicate pending requests (optional - can be disabled)
    // Uncomment the line below to enable automatic duplicate request cancellation
    // cancelPendingRequest(requestKey)

    // Create new AbortController for this request
    const controller = new AbortController()
    request.signal = controller.signal

    // Store controller for later cancellation
    pendingRequests.set(requestKey, controller)

    // Add cleanup metadata
    request._requestKey = requestKey
    request._startTime = Date.now()

    // Add your authentication token here
    // Example: request.headers.Authorization = `Bearer ${token}`
    // See src/docs/AUTHENTICATION_PATTERNS.md for Firebase and JWT examples

    // ERM: Set current employee ID for dev mode
    if (config.isDevelopment) {
      request.headers["X-Employee-Id"] = "1"
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
        // window.location.href = PATHS.LOGIN
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
        `✅ ${response.config.method.toUpperCase()} ${response.config.url} (${duration}ms)`
      )
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
      // Network error or server not reachable
      console.error("Network error:", error.message)
    } else {
      const { status } = error.response

      handleHttpStatus(status, error)
    }

    return Promise.reject(error)
  }
)

// const firebaseAuthPromise = new Promise((resolve) => {
//     const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
//         unsubscribe()
//         resolve(user)
//     })
// })

// const timeoutPromise = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         reject(new Error('Firebase app initialization timed out'))
//     }, 5000) // Adjust the timeout duration as needed
// })

// instance.interceptors.request.use(async function (config) {
//     console.log('I am intercepting', config)

//     // const firebase = useContext(FirebaseContext)

//     try {
//         await Promise.race([firebaseAuthPromise, timeoutPromise]) // Wait for the Firebase app to initialize or time out
//         const idToken = (await firebaseAuth.currentUser?.getIdToken()) ?? ''
//         if (idToken.length !== 0) {
//             config.headers.Authorization = idToken
//         }
//     } catch (error) {
//         // toast.error("Session Expired, Please Login Again");
//         // window.location.href = PATHS.LOGIN;
//         console.log('DEBUG: I am rejecting', error)
//         // throw error; // Propagate the error to the caller of the interceptor
//         return ''
//     }

//     console.log(config)

//     return config
// })

// // added interceptors to the response
// // easy to debug
// instance.interceptors.response.use(
//     (response) => {
//         console.log('api response,', response)
//         // Edit response config
//         return response
//     },
//     (error) => {
//         if (error.response === null) {
//         if (window.location.pathname !== PATHS.MAINTENANCE) {
//                 window.location.href = PATHS.MAINTENANCE
//             }
//         } else if (Number(error.response?.status) === 400) {
//         } else if (Number(error.response?.status) === 401) {
//             if (window.location.pathname !== PATHS.NOT_AUTHORIZED) {
//                 window.location.href = PATHS.NOT_AUTHORIZED
//             }
//             // window.location.href = "/misc/not-authorized/";
//             // handle 502
//         } else if (Number(error.response?.status) === 502) {
//             if (window.location.pathname !== '/misc/maintenance/') {
//                 window.location.href = '/misc/maintenance/'
//             }
//         }
//         return Promise.reject(error)
//     }
// )

export default instance
