import ct from "@constants/"

import api from "."

/**
 * Fetches all company policies.
 * @async
 * @param {object} options - Request options
 * @param {AbortSignal} [options.signal] - Abort signal for request cancellation
 * @returns {Promise} API response with list of policies
 */
export const getPolicies = async ({ signal } = {}) => {
  return api.get(ct.api.policy.list, { signal })
}

/**
 * Fetches a single policy by ID.
 * @async
 * @param {string|number} id - Policy ID
 * @param {object} options - Request options
 * @param {AbortSignal} [options.signal] - Abort signal for request cancellation
 * @returns {Promise} API response with policy data
 */
export const getPolicy = async (id, { signal } = {}) => {
  return api.get(`${ct.api.policy.detail}/${id}`, { signal })
}

/**
 * Creates a new policy.
 * @async
 * @param {object} payload - Policy creation payload
 * @param {string} payload.title - Policy title
 * @param {string} payload.content - Policy content / body
 * @param {string} payload.category - Category (hr | security | leave | general)
 * @param {string} [payload.shareScope] - Share setting (team | public | specific)
 * @param {string} [payload.specificAccess] - Comma-separated users/emails for specific sharing
 * @param {string} [payload.effectiveDate] - Effective date ISO string
 * @returns {Promise} API response with created policy
 */
export const postPolicy = async (payload) => {
  return api.post(ct.api.policy.create, payload)
}

/**
 * Updates an existing policy.
 * @async
 * @param {string|number} id - Policy ID
 * @param {object} payload - Updated fields
 * @returns {Promise} API response with updated policy
 */
export const patchPolicy = async (id, payload) => {
  return api.patch(`${ct.api.policy.update}/${id}`, payload)
}

/**
 * Deletes a policy by ID.
 * @async
 * @param {string|number} id - Policy ID
 * @returns {Promise} API response
 */
export const deletePolicy = async (id) => {
  return api.delete(`${ct.api.policy.delete}/${id}`)
}
