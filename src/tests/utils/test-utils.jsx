/**
 * Test Utilities
 *
 * Custom render functions and utilities for testing React components
 * with all necessary providers (Redux, React Query, Router, Theme, etc.)
 */

import { render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"

import { ThemeProvider } from "@/lib/context/theme-provider"
import rootReducer from "@/services/store/reducers"

/**
 * Create a test Redux store with initial state
 * @param {Object} preloadedState - Initial state
 * @returns {Object} Redux store
 */
export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

/**
 * Create a test QueryClient with custom config
 * @param {Object} config - QueryClient config
 * @returns {QueryClient}
 */
export function createTestQueryClient(config = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry in tests
        gcTime: 0, // Don't cache in tests
        staleTime: 0,
        ...config.queries,
      },
      mutations: {
        retry: false,
        ...config.mutations,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  })
}

/**
 * Custom render function that wraps component with all providers
 *
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.preloadedState - Initial Redux state
 * @param {Object} options.store - Custom Redux store
 * @param {Object} options.queryClient - Custom QueryClient
 * @param {Array} options.initialEntries - Router initial entries
 * @param {string} options.initialIndex - Router initial index
 * @param {string} options.route - Initial route
 * @param {Object} options.theme - Theme config
 * @returns {Object} Render result with additional utilities
 *
 * @example
 * const { store, queryClient } = renderWithProviders(<MyComponent />, {
 *   preloadedState: { user: { name: 'John' } },
 *   route: '/dashboard'
 * })
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    queryClient = createTestQueryClient(),
    initialEntries = ["/"],
    initialIndex = 0,
    route = "/",
    theme = "light",
    ...renderOptions
  } = {},
) {
  // Use route if provided, otherwise use initialEntries
  const entries = route !== "/" ? [route] : initialEntries

  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme={theme} storageKey="test-theme">
            <MemoryRouter initialEntries={entries} initialIndex={initialIndex}>
              {children}
            </MemoryRouter>
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    )
  }

  return {
    store,
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

/**
 * Render component with only Redux provider
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result with store
 */
export function renderWithRedux(
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

/**
 * Render component with only React Query provider
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result with queryClient
 */
export function renderWithQuery(
  ui,
  { queryClient = createTestQueryClient(), ...renderOptions } = {},
) {
  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

/**
 * Render component with only Router provider
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result
 */
export function renderWithRouter(
  ui,
  {
    initialEntries = ["/"],
    initialIndex = 0,
    route = "/",
    ...renderOptions
  } = {},
) {
  const entries = route !== "/" ? [route] : initialEntries

  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={entries} initialIndex={initialIndex}>
        {children}
      </MemoryRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Wait for loading to complete
 * Useful for components with loading states
 *
 * @param {Object} screen - Testing Library screen
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<void>}
 *
 * @example
 * await waitForLoadingToFinish(screen)
 */
export async function waitForLoadingToFinish(screen, timeout = 3000) {
  const { queryByText, queryByRole, queryByTestId } = screen

  // Wait for common loading indicators to disappear
  const loadingIndicators = [
    () => queryByText(/loading/i),
    () => queryByRole("status"),
    () => queryByTestId("loading"),
    () => queryByTestId("spinner"),
  ]

  let isLoading = true
  const startTime = Date.now()

  while (isLoading && Date.now() - startTime < timeout) {
    isLoading = loadingIndicators.some((indicator) => indicator() !== null)

    if (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
}

/**
 * Simulate user typing with delay
 * More realistic than fireEvent.change
 *
 * @param {HTMLElement} element - Input element
 * @param {string} value - Value to type
 * @param {number} delay - Delay between keystrokes in ms
 * @returns {Promise<void>}
 *
 * @example
 * await userType(screen.getByRole('textbox'), 'Hello World')
 */
export async function userType(element, value, delay = 50) {
  element.focus()

  for (let i = 0; i < value.length; i++) {
    element.value = value.slice(0, i + 1)
    element.dispatchEvent(new Event("input", { bubbles: true }))
    element.dispatchEvent(new Event("change", { bubbles: true }))

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

/**
 * Create a mock file for file input testing
 * @param {string} name - File name
 * @param {number} size - File size in bytes
 * @param {string} type - MIME type
 * @returns {File}
 *
 * @example
 * const file = createMockFile('test.jpg', 1024, 'image/jpeg')
 */
export function createMockFile(
  name = "test.txt",
  size = 1024,
  type = "text/plain",
) {
  const blob = new Blob(["a".repeat(size)], { type })
  return new File([blob], name, { type })
}

/**
 * Mock IntersectionObserver for testing lazy loading
 */
export function mockIntersectionObserver() {
  global.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback
    }

    observe() {
      // Immediately trigger callback
      this.callback([
        { isIntersecting: true, target: document.createElement("div") },
      ])
    }

    unobserve() {}

    disconnect() {}
  }
}

/**
 * Mock ResizeObserver for testing responsive components
 */
export function mockResizeObserver() {
  global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback
    }

    observe() {
      this.callback([
        {
          target: document.createElement("div"),
          contentRect: { width: 1024, height: 768 },
        },
      ])
    }

    unobserve() {}

    disconnect() {}
  }
}

/**
 * Mock matchMedia for testing responsive behavior
 * @param {boolean} matches - Whether media query matches
 * @returns {Object} matchMedia mock
 */
export function mockMatchMedia(matches = true) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

/**
 * Mock localStorage for testing
 * @returns {Object} localStorage mock with spy methods
 */
export function mockLocalStorage() {
  const store = {}

  const mockLocalStorage = {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key])
    }),
  }

  global.localStorage = mockLocalStorage

  return mockLocalStorage
}

/**
 * Mock window.scrollTo for testing scroll behavior
 */
export function mockScrollTo() {
  global.scrollTo = vi.fn()
}

/**
 * Create a promise that resolves after a delay
 * Useful for testing loading states
 *
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>}
 *
 * @example
 * await delay(1000) // Wait 1 second
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Suppress console methods during tests
 * @param {Array<string>} methods - Console methods to suppress
 * @returns {Function} Cleanup function
 *
 * @example
 * const restore = suppressConsole(['error', 'warn'])
 * // ... test code ...
 * restore()
 */
export function suppressConsole(methods = ["error", "warn"]) {
  const originalMethods = {}

  methods.forEach((method) => {
    originalMethods[method] = console[method]
    console[method] = vi.fn()
  })

  return () => {
    methods.forEach((method) => {
      console[method] = originalMethods[method]
    })
  }
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react"
export { default as userEvent } from "@testing-library/user-event"
