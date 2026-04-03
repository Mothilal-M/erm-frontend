/**
 * Mock Factories
 *
 * Factory functions for creating mock data objects for testing.
 * Uses a simple counter-based approach for unique IDs.
 */

let userIdCounter = 1
let commentIdCounter = 1
let postIdCounter = 1

/**
 * Reset all counters (useful in beforeEach)
 */
export function resetCounters() {
  userIdCounter = 1
  commentIdCounter = 1
  postIdCounter = 1
}

/**
 * Create a mock user
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock user object
 *
 * @example
 * const user = createMockUser({ name: 'John Doe', role: 'admin' })
 */
export function createMockUser(overrides = {}) {
  const id = userIdCounter++

  return {
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
    userName: `user${id}`,
    userRole: "user",
    avatar: `https://i.pravatar.cc/150?img=${id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    ...overrides,
  }
}

/**
 * Create multiple mock users
 * @param {number} count - Number of users to create
 * @param {Object} overrides - Override default values
 * @returns {Array<Object>} Array of mock users
 *
 * @example
 * const users = createMockUsers(5)
 */
export function createMockUsers(count, overrides = {}) {
  return Array.from({ length: count }, () => createMockUser(overrides))
}

/**
 * Create a mock comment
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock comment object
 *
 * @example
 * const comment = createMockComment({ text: 'Great post!', userId: 1 })
 */
export function createMockComment(overrides = {}) {
  const id = commentIdCounter++
  const userId = overrides.userId || Math.floor(Math.random() * 10) + 1

  return {
    id,
    postId: overrides.postId || 1,
    userId,
    text: `This is comment ${id}`,
    author: overrides.author || {
      id: userId,
      name: `User ${userId}`,
      avatar: `https://i.pravatar.cc/150?img=${userId}`,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: 0,
    replies: [],
    ...overrides,
  }
}

/**
 * Create multiple mock comments
 * @param {number} count - Number of comments to create
 * @param {Object} overrides - Override default values
 * @returns {Array<Object>} Array of mock comments
 *
 * @example
 * const comments = createMockComments(10, { postId: 5 })
 */
export function createMockComments(count, overrides = {}) {
  return Array.from({ length: count }, () => createMockComment(overrides))
}

/**
 * Create a mock post
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock post object
 *
 * @example
 * const post = createMockPost({ title: 'My Post', userId: 1 })
 */
export function createMockPost(overrides = {}) {
  const id = postIdCounter++
  const userId = overrides.userId || Math.floor(Math.random() * 10) + 1

  return {
    id,
    userId,
    title: `Post Title ${id}`,
    body: `This is the body of post ${id}. It contains some interesting content about various topics.`,
    author: overrides.author || {
      id: userId,
      name: `User ${userId}`,
      avatar: `https://i.pravatar.cc/150?img=${userId}`,
    },
    tags: ["test", "mock"],
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: Math.floor(Math.random() * 1000),
    likes: Math.floor(Math.random() * 100),
    commentsCount: 0,
    ...overrides,
  }
}

/**
 * Create multiple mock posts
 * @param {number} count - Number of posts to create
 * @param {Object} overrides - Override default values
 * @returns {Array<Object>} Array of mock posts
 *
 * @example
 * const posts = createMockPosts(5, { published: true })
 */
export function createMockPosts(count, overrides = {}) {
  return Array.from({ length: count }, () => createMockPost(overrides))
}

/**
 * Create a mock API response
 * @param {*} data - Response data
 * @param {Object} options - Response options
 * @returns {Object} Mock API response
 *
 * @example
 * const response = createMockApiResponse([user1, user2], { status: 200 })
 */
export function createMockApiResponse(data, options = {}) {
  return {
    data,
    status: options.status || 200,
    statusText: options.statusText || "OK",
    headers: options.headers || {},
    config: options.config || {},
    ...options,
  }
}

/**
 * Create a mock API error
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {Object} options - Additional options
 * @returns {Object} Mock API error
 *
 * @example
 * const error = createMockApiError('Not found', 404)
 */
export function createMockApiError(
  message = "Error",
  status = 500,
  options = {},
) {
  const error = new Error(message)
  error.response = {
    data: {
      message,
      error: message,
      ...options.data,
    },
    status,
    statusText: options.statusText || "Error",
    headers: options.headers || {},
  }
  error.config = options.config || {}
  error.code = options.code || "ERR_BAD_REQUEST"
  return error
}

/**
 * Create a mock Redux store state
 * @param {Object} overrides - Override default state
 * @returns {Object} Mock Redux state
 *
 * @example
 * const state = createMockStoreState({
 *   user: { name: 'John', role: 'admin' }
 * })
 */
export function createMockStoreState(overrides = {}) {
  return {
    user: {
      userName: null,
      userRole: null,
      isAuthenticated: false,
      ...overrides.user,
    },
    theme: {
      mode: "light",
      ...overrides.theme,
    },
    ...overrides,
  }
}

/**
 * Create a mock form data
 * @param {Object} data - Form data
 * @returns {FormData} Mock FormData object
 *
 * @example
 * const formData = createMockFormData({
 *   name: 'John',
 *   email: 'john@example.com'
 * })
 */
export function createMockFormData(data = {}) {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item))
    } else if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value))
    } else {
      formData.append(key, String(value))
    }
  })

  return formData
}

/**
 * Create a mock file object
 * @param {Object} options - File options
 * @returns {File} Mock File object
 *
 * @example
 * const file = createMockFile({
 *   name: 'avatar.jpg',
 *   type: 'image/jpeg',
 *   size: 1024
 * })
 */
export function createMockFile(options = {}) {
  const {
    name = "test.txt",
    size = 1024,
    type = "text/plain",
    content = "a".repeat(size),
    lastModified = Date.now(),
  } = options

  const blob = new Blob([content], { type })
  return new File([blob], name, { type, lastModified })
}

/**
 * Create a mock image file
 * @param {Object} options - Image options
 * @returns {File} Mock image File object
 *
 * @example
 * const image = createMockImage({ name: 'photo.png' })
 */
export function createMockImage(options = {}) {
  const { name = "image.jpg", size = 2048, type = "image/jpeg" } = options

  // Create a minimal valid image data
  const imageData = new Uint8Array([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46,
  ])

  const blob = new Blob([imageData], { type })
  return new File([blob], name, { type, lastModified: Date.now() })
}

/**
 * Create a mock pagination info
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock pagination object
 *
 * @example
 * const pagination = createMockPagination({ page: 2, total: 100 })
 */
export function createMockPagination(overrides = {}) {
  const page = overrides.page || 1
  const limit = overrides.limit || 10
  const total = overrides.total || 50

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
    ...overrides,
  }
}

/**
 * Create a mock paginated response
 * @param {Array} data - Response data
 * @param {Object} pagination - Pagination options
 * @returns {Object} Mock paginated response
 *
 * @example
 * const response = createMockPaginatedResponse(
 *   createMockUsers(10),
 *   { page: 1, limit: 10, total: 50 }
 * )
 */
export function createMockPaginatedResponse(data, pagination = {}) {
  return {
    data,
    pagination: createMockPagination(pagination),
    meta: {
      timestamp: new Date().toISOString(),
      ...pagination.meta,
    },
  }
}

/**
 * Create a mock event object
 * @param {string} type - Event type
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock event object
 *
 * @example
 * const event = createMockEvent('click', { target: { value: 'test' } })
 */
export function createMockEvent(type = "click", overrides = {}) {
  return {
    type,
    target: overrides.target || {},
    currentTarget: overrides.currentTarget || {},
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    nativeEvent: overrides.nativeEvent || {},
    bubbles: true,
    cancelable: true,
    ...overrides,
  }
}

/**
 * Create a mock router location
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock location object
 *
 * @example
 * const location = createMockLocation({ pathname: '/dashboard' })
 */
export function createMockLocation(overrides = {}) {
  return {
    pathname: "/",
    search: "",
    hash: "",
    state: null,
    key: "default",
    ...overrides,
  }
}

/**
 * Create a mock router match
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock match object
 *
 * @example
 * const match = createMockMatch({ params: { id: '123' } })
 */
export function createMockMatch(overrides = {}) {
  return {
    params: {},
    isExact: true,
    path: "/",
    url: "/",
    ...overrides,
  }
}

/**
 * Create mock query result (React Query)
 * @param {*} data - Query data
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock query result
 *
 * @example
 * const queryResult = createMockQueryResult(users, { isLoading: false })
 */
export function createMockQueryResult(data, overrides = {}) {
  return {
    data,
    error: null,
    isError: false,
    isLoading: false,
    isSuccess: true,
    isFetching: false,
    status: "success",
    refetch: vi.fn(),
    ...overrides,
  }
}

/**
 * Create mock mutation result (React Query)
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock mutation result
 *
 * @example
 * const mutation = createMockMutationResult({ isLoading: true })
 */
export function createMockMutationResult(overrides = {}) {
  return {
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isSuccess: false,
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    status: "idle",
    ...overrides,
  }
}

// Export all factories
export default {
  createMockUser,
  createMockUsers,
  createMockComment,
  createMockComments,
  createMockPost,
  createMockPosts,
  createMockApiResponse,
  createMockApiError,
  createMockStoreState,
  createMockFormData,
  createMockFile,
  createMockImage,
  createMockPagination,
  createMockPaginatedResponse,
  createMockEvent,
  createMockLocation,
  createMockMatch,
  createMockQueryResult,
  createMockMutationResult,
  resetCounters,
}
