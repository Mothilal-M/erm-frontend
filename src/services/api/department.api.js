import ct from "@constants/"

import api from "."

/**
 * Fetches the full list of departments.
 * @async
 * @param {object} options - Request options
 * @param {object} [options.signal] - AbortSignal for request cancellation
 * @returns {Promise} API response with department list
 */
export const getDepartments = async ({ signal } = {}) => {
  return api.get(ct.api.employeeManagement.departments, { signal })
}

/**
 * Creates a new department.
 * @async
 * @param {object} payload - { name, description, headId? }
 * @returns {Promise} API response with the created department
 */
export const postDepartment = async (payload) => {
  return api.post(ct.api.employeeManagement.departments, payload)
}

/**
 * Updates an existing department by ID.
 * @async
 * @param {string|number} id - Department ID
 * @param {object} payload - Fields to update
 * @returns {Promise} API response with the updated department
 */
export const patchDepartment = async (id, payload) => {
  return api.patch(
    `${ct.api.employeeManagement.departmentDetail}/${id}`,
    payload,
  )
}

/**
 * Deletes a department by ID.
 * @async
 * @param {string|number} id - Department ID
 * @returns {Promise} API response
 */
export const deleteDepartment = async (id) => {
  return api.delete(`${ct.api.employeeManagement.departmentDetail}/${id}`)
}
