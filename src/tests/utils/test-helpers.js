/**
 * Test Helpers
 *
 * Additional helper functions for testing
 */

import { waitFor } from "@testing-library/react"
import { vi } from "vitest"

/**
 * Wait for element to have specific text content
 * @param {Function} getElement - Function that returns the element
 * @param {string} expectedText - Expected text content
 * @param {Object} options - Wait options
 * @returns {Promise<void>}
 *
 * @example
 * await waitForText(() => screen.getByRole('heading'), 'Welcome')
 */
export async function waitForText(getElement, expectedText, options = {}) {
  await waitFor(
    () => {
      const element = getElement()
      expect(element).toHaveTextContent(expectedText)
    },
    { timeout: 3000, ...options },
  )
}

/**
 * Wait for element to be removed
 * @param {Function} getElement - Function that returns the element
 * @param {Object} options - Wait options
 * @returns {Promise<void>}
 *
 * @example
 * await waitForElementToBeRemoved(() => screen.queryByText('Loading...'))
 */
export async function waitForElementToBeRemoved(getElement, options = {}) {
  await waitFor(
    () => {
      expect(getElement()).not.toBeInTheDocument()
    },
    { timeout: 3000, ...options },
  )
}

/**
 * Wait for async validation
 * Useful for form validation that happens asynchronously
 *
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 *
 * @example
 * fireEvent.change(input, { target: { value: 'test' } })
 * await waitForValidation()
 * expect(screen.getByText('Invalid email')).toBeInTheDocument()
 */
export async function waitForValidation(ms = 500) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Flush all pending promises
 * Useful for waiting for all async operations to complete
 *
 * @returns {Promise<void>}
 *
 * @example
 * await flushPromises()
 */
export async function flushPromises() {
  await new Promise((resolve) => setImmediate(resolve))
}

/**
 * Create a deferred promise for manual control
 * Useful for testing loading states
 *
 * @returns {Object} Object with promise, resolve, and reject
 *
 * @example
 * const { promise, resolve } = createDeferred()
 * mockApi.get.mockReturnValue(promise)
 * // Later...
 * resolve({ data: { id: 1 } })
 */
export function createDeferred() {
  let resolve, reject

  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

/**
 * Create a spy object with methods
 * @param {Array<string>} methods - Method names to spy on
 * @returns {Object} Object with spy methods
 *
 * @example
 * const api = createSpy(['get', 'post'])
 * api.get.mockResolvedValue({ data: { id: 1 } })
 */
export function createSpy(methods = []) {
  const spy = {}

  methods.forEach((method) => {
    spy[method] = vi.fn()
  })

  return spy
}

/**
 * Create a counter spy
 * Useful for tracking number of calls
 *
 * @returns {Object} Counter object with methods
 *
 * @example
 * const counter = createCounter()
 * counter.increment() // count = 1
 * counter.get() // returns 1
 */
export function createCounter() {
  let count = 0

  return {
    increment: vi.fn(() => ++count),
    decrement: vi.fn(() => --count),
    get: vi.fn(() => count),
    reset: vi.fn(() => (count = 0)),
  }
}

/**
 * Assert that element has attribute
 * @param {HTMLElement} element - Element to check
 * @param {string} attribute - Attribute name
 * @param {string} value - Expected value
 *
 * @example
 * assertAttribute(button, 'disabled', 'true')
 */
export function assertAttribute(element, attribute, value) {
  expect(element).toHaveAttribute(attribute, value)
}

/**
 * Assert that element has class
 * @param {HTMLElement} element - Element to check
 * @param {string} className - Class name
 *
 * @example
 * assertClass(button, 'btn-primary')
 */
export function assertClass(element, className) {
  expect(element).toHaveClass(className)
}

/**
 * Assert that element is visible
 * @param {HTMLElement} element - Element to check
 *
 * @example
 * assertVisible(modal)
 */
export function assertVisible(element) {
  expect(element).toBeVisible()
}

/**
 * Assert that element is not visible
 * @param {HTMLElement} element - Element to check
 *
 * @example
 * assertNotVisible(modal)
 */
export function assertNotVisible(element) {
  expect(element).not.toBeVisible()
}

/**
 * Assert that function was called with
 * @param {Function} fn - Mock function
 * @param {Array} args - Expected arguments
 *
 * @example
 * assertCalledWith(mockFn, [1, 'test'])
 */
export function assertCalledWith(fn, args) {
  expect(fn).toHaveBeenCalledWith(...args)
}

/**
 * Assert that function was called times
 * @param {Function} fn - Mock function
 * @param {number} times - Expected number of calls
 *
 * @example
 * assertCalledTimes(mockFn, 3)
 */
export function assertCalledTimes(fn, times) {
  expect(fn).toHaveBeenCalledTimes(times)
}

/**
 * Create a mock timer and advance time
 * @returns {Object} Timer control object
 *
 * @example
 * const timer = useFakeTimers()
 * // ... code with timers ...
 * timer.advance(1000)
 * timer.restore()
 */
export function useFakeTimers() {
  vi.useFakeTimers()

  return {
    advance: (ms) => vi.advanceTimersByTime(ms),
    advanceToNext: () => vi.runOnlyPendingTimers(),
    advanceAll: () => vi.runAllTimers(),
    restore: () => vi.useRealTimers(),
  }
}

/**
 * Create a mock console
 * Useful for testing console output
 *
 * @param {Array<string>} methods - Console methods to mock
 * @returns {Object} Mock console with restore function
 *
 * @example
 * const console = mockConsole(['log', 'error'])
 * // ... test code ...
 * expect(console.log).toHaveBeenCalledWith('test')
 * console.restore()
 */
export function mockConsole(methods = ["log", "error", "warn"]) {
  const original = {}
  const mocks = {}

  methods.forEach((method) => {
    original[method] = console[method]
    mocks[method] = vi.fn()
    console[method] = mocks[method]
  })

  return {
    ...mocks,
    restore: () => {
      methods.forEach((method) => {
        console[method] = original[method]
      })
    },
  }
}

/**
 * Test a11y (accessibility)
 * Checks for basic accessibility violations
 *
 * @param {HTMLElement} container - Container element
 * @returns {Promise<void>}
 *
 * @example
 * const { container } = render(<MyComponent />)
 * await testA11y(container)
 */
export async function testA11y(container) {
  // Check for basic a11y attributes
  const images = container.querySelectorAll("img")
  images.forEach((img) => {
    expect(img).toHaveAttribute("alt")
  })

  const buttons = container.querySelectorAll("button")
  buttons.forEach((button) => {
    // Button should have text or aria-label
    const hasText = button.textContent.trim().length > 0
    const hasAriaLabel = button.hasAttribute("aria-label")
    expect(hasText || hasAriaLabel).toBe(true)
  })

  const inputs = container.querySelectorAll("input")
  inputs.forEach((input) => {
    // Input should have label or aria-label
    const id = input.getAttribute("id")
    const hasLabel = id && container.querySelector(`label[for="${id}"]`)
    const hasAriaLabel = input.hasAttribute("aria-label")
    expect(hasLabel || hasAriaLabel).toBe(true)
  })
}

/**
 * Create a mock implementation that cycles through values
 * @param {Array} values - Values to cycle through
 * @returns {Function} Mock function
 *
 * @example
 * const mock = createCyclicMock([1, 2, 3])
 * mock() // returns 1
 * mock() // returns 2
 * mock() // returns 3
 * mock() // returns 1
 */
export function createCyclicMock(values) {
  let index = 0

  return vi.fn(() => {
    const value = values[index]
    index = (index + 1) % values.length
    return value
  })
}

/**
 * Create a mock implementation that calls original function
 * Useful for spying on functions without changing behavior
 *
 * @param {Function} fn - Original function
 * @returns {Function} Spy function
 *
 * @example
 * const originalFn = (x) => x * 2
 * const spy = createPassThroughSpy(originalFn)
 * spy(5) // returns 10
 * expect(spy).toHaveBeenCalledWith(5)
 */
export function createPassThroughSpy(fn) {
  return vi.fn((...args) => fn(...args))
}

/**
 * Wait for next tick
 * @returns {Promise<void>}
 *
 * @example
 * await waitForNextTick()
 */
export async function waitForNextTick() {
  await new Promise((resolve) => process.nextTick(resolve))
}

/**
 * Create a mock ref
 * @param {*} current - Initial current value
 * @returns {Object} Ref object
 *
 * @example
 * const ref = createMockRef(null)
 */
export function createMockRef(current = null) {
  return { current }
}

/**
 * Find element by text content (case-insensitive)
 * @param {HTMLElement} container - Container element
 * @param {string} text - Text to find
 * @returns {HTMLElement|null} Found element
 *
 * @example
 * const button = findByTextContent(container, 'click me')
 */
export function findByTextContent(container, text) {
  const regex = new RegExp(text, "i")
  return Array.from(container.querySelectorAll("*")).find((element) =>
    regex.test(element.textContent),
  )
}

/**
 * Get all elements by text content (case-insensitive)
 * @param {HTMLElement} container - Container element
 * @param {string} text - Text to find
 * @returns {Array<HTMLElement>} Found elements
 *
 * @example
 * const buttons = getAllByTextContent(container, 'click')
 */
export function getAllByTextContent(container, text) {
  const regex = new RegExp(text, "i")
  return Array.from(container.querySelectorAll("*")).filter((element) =>
    regex.test(element.textContent),
  )
}

export default {
  waitForText,
  waitForElementToBeRemoved,
  waitForValidation,
  flushPromises,
  createDeferred,
  createSpy,
  createCounter,
  assertAttribute,
  assertClass,
  assertVisible,
  assertNotVisible,
  assertCalledWith,
  assertCalledTimes,
  useFakeTimers,
  mockConsole,
  testA11y,
  createCyclicMock,
  createPassThroughSpy,
  waitForNextTick,
  createMockRef,
  findByTextContent,
  getAllByTextContent,
}
