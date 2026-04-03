import PropTypes from "prop-types"
import { useMemo, useState, useEffect } from "react"
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary"

import { reportError } from "@/lib/utils/error-handler"
import ErrorPage from "@/pages/misc/error-found"

const ErrorBoundary = ({ children }) => {
  const handleError = (error, errorInfo) => {
    // Generate unique error ID
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

    // Log error to error reporting service
    const errorData = {
      error,
      errorInfo: {
        ...errorInfo,
        componentStack: errorInfo?.componentStack,
      },
      errorId,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    // Report to error monitoring service
    reportError(errorData)

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error("Error caught by boundary:", error, errorInfo)
    }
  }

  const handleReset = () => {
    // Reset error state - the library handles this automatically
    window.location.reload()
  }

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ReactErrorBoundary>
  )
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
}

ErrorBoundary.defaultProps = {
  children: null,
}

/**
 * Error Fallback Component
 * Wrapper to pass error details to our ErrorPage component
 */
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const [errorId, setErrorId] = useState(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrorId(`ERR-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`)
  }, [])

  const errorInfo = useMemo(
    () => ({
      error: error?.message,
      stack: error?.stack,
      name: error?.name,
    }),
    [error],
  )

  return (
    <ErrorPage
      error={error}
      errorInfo={errorInfo}
      errorId={errorId}
      handleReset={resetErrorBoundary}
    />
  )
}

ErrorFallback.propTypes = {
  error: PropTypes.instanceOf(Error),
  resetErrorBoundary: PropTypes.func.isRequired,
}

ErrorFallback.defaultProps = {
  error: null,
}

export default ErrorBoundary
