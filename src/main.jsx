import React from "react"
import ReactDOM from "react-dom/client"

// eslint-disable-next-line import/order
import App from "./App"

import "./main.css"

import { config } from "./lib/config"
import { initializePWA } from "./lib/pwa"
import { getUserTimezone } from "./lib/utils/datetime"
import { initGlobalErrorHandlers } from "./lib/utils/error-handler"
import { initPerformanceMonitoring } from "./lib/utils/performance-monitoring"
import "./lib/i18n"
import { enableMocking } from "./mock"

// Initialize global error handlers
initGlobalErrorHandlers()

// Initialize PWA (service worker, install prompt, offline detection)
initializePWA()

// Initialize performance monitoring (Web Vitals, custom metrics)
initPerformanceMonitoring()

// Detect user timezone (no library needed!)
const userTimezone = getUserTimezone()
if (config.isDevelopment) {
  console.warn("User timezone:", userTimezone)
}

// Render function
/**
 *
 */
const renderApp = () => {
  if (typeof document !== "undefined") {
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  }
}

// Enable mocking only in development or when explicitly enabled
if (config.enableMocking && config.isDevelopment) {
  console.warn("🔧 Mocking enabled in development mode")
  enableMocking()
    .then(() => {
      renderApp()
      return true
    })
    .catch((error) => {
      // Log error but still try to render the app
      console.error("Failed to enable mocking:", error)
      renderApp()
    })
} else {
  if (config.isProduction) {
    console.warn("🚀 Running in production mode")
  }
  // Render app directly without mocking
  renderApp()
}
