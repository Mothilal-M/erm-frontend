import { useEffect, useRef, useState } from "react"

import { cancelAllRequests } from "@/services/api"

/**
 * Custom hook to handle request cancellation on component unmount
 * Automatically cancels all pending API requests when component unmounts
 * @example
 * function MyComponent() {
 *   useRequestCancellation()
 *
 *   const { data } = useQuery({
 *     queryKey: ['users'],
 *     queryFn: () => api.get('/users')
 *   })
 *
 *   return <div>{data?.name}</div>
 * }
 */
export const useRequestCancellation = () => {
  const cancelledReference = useRef(false)

  useEffect(() => {
    return () => {
      if (!cancelledReference.current) {
        cancelAllRequests()
        cancelledReference.current = true
      }
    }
  }, [])
}

/**
 * Custom hook to create an AbortController for manual request cancellation
 * Useful for cancelling requests on user actions (e.g., navigation, button clicks)
 * @returns {{ signal: (AbortController['signal']|null), cancel: () => void }} The abort signal and cancel function
 * @example
 * function SearchComponent() {
 *   const { signal, cancel } = useAbortController()
 *
 *   const searchUsers = async (query) => {
 *     try {
 *       const response = await api.get('/users/search', {
 *         params: { q: query },
 *         signal
 *       })
 *       return response.data
 *     } catch (error) {
 *       if (axios.isCancel(error)) {
 *         console.log('Request cancelled')
 *       }
 *     }
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={cancel}>Cancel Search</button>
 *     </div>
 *   )
 * }
 */
export const useAbortController = () => {
  const controllerReference = useRef(null)
  const [signal, setSignal] = useState(null)

  useEffect(() => {
    controllerReference.current = new AbortController()
    setSignal(controllerReference.current.signal)

    return () => {
      if (controllerReference.current) {
        controllerReference.current.abort()
      }
    }
  }, [])

  const cancel = () => {
    if (controllerReference.current) {
      controllerReference.current.abort()
      // Create new controller for subsequent requests
      controllerReference.current = new AbortController()
      setSignal(controllerReference.current.signal)
    }
  }

  return {
    signal,
    cancel,
  }
}

/**
 * Custom hook to automatically cancel requests when a dependency changes
 * Useful for search inputs, filters, etc.
 * @param {(...args: unknown[]) => unknown} requestFunction - Function that makes the API request
 * @param {Array} deps - Dependencies to watch for changes
 * @param {object} options - Configuration options
 * @returns {{ cancel: () => void }} The cancel function to abort in-flight requests
 * @example
 * function SearchComponent({ searchTerm }) {
 *   const { isLoading, error, cancel } = useCancellableRequest(
 *     async (signal) => {
 *       const response = await api.get('/users/search', {
 *         params: { q: searchTerm },
 *         signal
 *       })
 *       return response.data
 *     },
 *     [searchTerm], // Cancel and retry when searchTerm changes
 *     { debounce: 300 }
 *   )
 *
 *   return <div>Loading: {isLoading}</div>
 * }
 */
export const useCancellableRequest = (
  requestFunction,
  deps = [],
  options = {},
) => {
  const { debounce = 0, onSuccess, onError } = options
  const controllerReference = useRef(null)
  const timeoutReference = useRef(null)

  useEffect(() => {
    // Cancel previous request
    if (controllerReference.current) {
      controllerReference.current.abort()
    }

    // Clear previous timeout
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current)
    }

    // Create new controller
    controllerReference.current = new AbortController()
    const controller = controllerReference.current

    // Execute request with optional debounce
    const executeRequest = async () => {
      try {
        const result = await requestFunction(controller.signal)
        if (onSuccess && !controller.signal.aborted) {
          onSuccess(result)
        }
      } catch (error) {
        if (error.name === "CanceledError" || error.name === "AbortError") {
          // Request was cancelled, don't call onError
          return
        }
        if (onError && !controller.signal.aborted) {
          onError(error)
        }
      }
    }

    if (debounce > 0) {
      timeoutReference.current = setTimeout(executeRequest, debounce)
    } else {
      executeRequest()
    }

    return () => {
      if (controller) {
        controller.abort()
      }
      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current)
      }
    }
  }, [requestFunction, debounce, onError, onSuccess, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps

  const cancel = () => {
    if (controllerReference.current) {
      controllerReference.current.abort()
    }
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current)
    }
  }

  return { cancel }
}
