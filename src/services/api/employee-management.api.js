import ct from "@constants/"

import api from "."

/**
 * Fetches the full list of employees.
 * @async
 * @function
 * @param {object} options - Request options
 * @param {object} [options.signal] - AbortSignal for request cancellation
 * @returns {Promise} The response from the API containing the employee list
 */
export const getEmployees = async ({ signal } = {}) => {
  const config = { headers: { "Content-Type": "application/json" }, signal }
  return api.get(ct.api.employeeManagement.list, config)
}

/**
 * Fetches the current employee's performance data (sprint tasks & recognition).
 * @async
 * @function
 * @param {object} options - Request options
 * @param {object} [options.signal] - AbortSignal for request cancellation
 * @returns {Promise} The response from the API containing performance data
 */
export const getEmployeePerformance = async ({ signal } = {}) => {
  const config = { headers: { "Content-Type": "application/json" }, signal }
  return api.get(ct.api.employeeManagement.performance, config)
}

/**
 * Fetches a single employee by ID.
 * @async
 * @function
 * @param {string|number} id - Employee ID
 * @param {object} options - Request options
 * @param {object} [options.signal] - AbortSignal for request cancellation
 * @returns {Promise} The response from the API containing the employee record
 */
export const getEmployee = async (id, { signal } = {}) => {
  const config = { headers: { "Content-Type": "application/json" }, signal }
  return api.get(`${ct.api.employeeManagement.detail}/${id}`, config)
}

/**
 * Creates a new employee.
 * @async
 * @function
 * @param {object} payload - Employee creation payload
 * @param {string} payload.name - Full name
 * @param {string} payload.email - Work email
 * @param {string} [payload.phone] - Phone number
 * @param {string} payload.department - Department
 * @param {string} payload.role - Role (employee | manager | admin)
 * @param {string} payload.joinDate - ISO date string
 * @returns {Promise} The response from the API with the created employee record
 */
export const postEmployee = async (payload) => {
  return api.post(ct.api.employeeManagement.create, payload)
}

/**
 * Updates an existing employee record.
 * @async
 * @function
 * @param {string|number} id - Employee ID
 * @param {object} payload - Fields to update
 * @returns {Promise} The response from the API with the updated employee record
 */
export const patchEmployee = async (id, payload) => {
  return api.patch(`${ct.api.employeeManagement.detail}/${id}`, payload)
}

/**
 * Deletes (removes) an employee by ID.
 * @async
 * @function
 * @param {string|number} id - Employee ID
 * @returns {Promise} The response from the API
 */
export const deleteEmployee = async (id) => {
  return api.delete(`${ct.api.employeeManagement.detail}/${id}`)
}

/**
 * Sends an invitation email to a new user.
 * @async
 * @function
 * @param {object} payload - Invitation payload
 * @param {string} payload.email - Email address to invite
 * @param {string} payload.role - Role to assign on sign-up
 * @param {string} [payload.department] - Optional department hint
 * @returns {Promise} The response from the API
 */
export const postInviteUser = async (payload) => {
  return api.post(ct.api.employeeManagement.invite, payload)
}

/**
 * Fetches the complete 360° profile for an employee.
 * Aggregates personal info, attendance, leave, performance, assets, documents, timeline.
 * @async
 * @function
 * @param {string|number} id - Employee ID
 * @param {object} options - Request options
 * @param {object} [options.signal] - AbortSignal for request cancellation
 * @returns {Promise} The response from the API containing the full 360 profile
 */
export const getEmployee360Profile = async (id, { signal } = {}) => {
  const config = { headers: { "Content-Type": "application/json" }, signal }
  return api.get(`${ct.api.employeeManagement.profile360}/${id}/`, config)
}
