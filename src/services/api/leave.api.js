import ct from "@constants/"

import api from "."

/**
 * Fetches attendance records for a specific month/year.
 * @async
 * @function
 * @param {object} options - Request options
 * @param {number} options.year - Year to fetch (e.g., 2026)
 * @param {number} options.month - 0-indexed month (0 = Jan)
 * @param {object} [options.signal] - AbortSignal for request cancellation
 * @returns {Promise} The response from the API containing attendance data
 */
export const getMonthlyAttendance = async ({ year, month, signal } = {}) => {
  const config = {
    headers: { "Content-Type": "application/json" },
    params: { year, month },
    signal,
  }
  return api.get(ct.api.leave.attendance, config)
}

/**
 * Fetches admin leave dashboard summary.
 * @async
 * @function
 * @param {object} options - Request options
 * @param {object} [options.signal] - AbortSignal for request cancellation
 * @returns {Promise} The response from the API containing the admin summary
 */
export const getAdminLeaveSummary = async ({ signal } = {}) => {
  const config = { headers: { "Content-Type": "application/json" }, signal }
  return api.get(ct.api.leave.adminSummary, config)
}

/**
 * Fetches the current employee's leave profile.
 * @async
 * @function
 * @param {object} options - Request options
 * @param {object} [options.signal] - AbortSignal for request cancellation
 * @returns {Promise} The response from the API containing the employee profile
 */
export const getEmployeeLeaveProfile = async ({ signal } = {}) => {
  const config = { headers: { "Content-Type": "application/json" }, signal }
  return api.get(ct.api.leave.employeeProfile, config)
}

/**
 * Fetches the full list of leave approval requests.
 * @async
 * @function
 * @param {object} options - Request options
 * @param {object} [options.signal] - AbortSignal for request cancellation
 * @returns {Promise} The response from the API containing approval requests
 */
export const getAdminApprovals = async ({ signal } = {}) => {
  const config = { headers: { "Content-Type": "application/json" }, signal }
  return api.get(ct.api.leave.adminApprovals, config)
}

/**
 * Approves or rejects a leave request.
 * @async
 * @function
 * @param {number} id - Approval request id
 * @param {"approved"|"rejected"} status - Action to perform on the request
 * @param {string} [note] - Optional note explaining the decision
 * @returns {Promise} The response from the API after performing the action
 */
export const patchLeaveApproval = async (id, status, note = "") => {
  return api.patch(`${ct.api.leave.adminApprovalAction}/${id}`, {
    status,
    note,
  })
}

/**
 * Fetches the employee list for manual record selection.
 * @async
 * @function
 * @param {object} options - Request options
 * @param {object} [options.signal] - AbortSignal for request cancellation
 * @returns {Promise} The response from the API containing the employee list
 */
export const getAdminEmployees = async ({ signal } = {}) => {
  const config = { headers: { "Content-Type": "application/json" }, signal }
  return api.get(ct.api.leave.adminEmployees, config)
}

/**
 * Posts a manual attendance record for an employee.
 * @async
 * @function
 * @param {object} payload - Manual record payload
 * @returns {Promise} The response from the API
 */
export const postManualRecord = async (payload) => {
  return api.post(ct.api.leave.adminManualRecord, payload)
}

/**
 * Posts a leave request from the employee.
 * @async
 * @function
 * @param {object} payload - Leave request payload
 * @returns {Promise} The response from the API
 */
export const postLeaveRequest = async (payload) => {
  return api.post(ct.api.leave.employeeRequest, payload)
}

/**
 * Fetches the leave management settings (admin only).
 * @async
 * @function
 * @param {object} options - Request options
 * @param {object} [options.signal] - AbortSignal for request cancellation
 * @returns {Promise} The response from the API containing leave settings
 */
export const getLeaveSettings = async ({ signal } = {}) => {
  const config = { headers: { "Content-Type": "application/json" }, signal }
  return api.get(ct.api.leave.adminSettings, config)
}

/**
 * Saves updated leave management settings (admin only).
 * @async
 * @function
 * @param {object} payload - Updated settings payload
 * @returns {Promise} The response from the API with the saved settings
 */
export const patchLeaveSettings = async (payload) => {
  return api.patch(ct.api.leave.adminSettings, payload)
}

/**
 * Fetches per-employee attendance detail for a specific date.
 * @async
 * @function
 * @param {object} options - Request options
 * @param {string} options.date - ISO date string (YYYY-MM-DD)
 * @param {object} [options.signal] - AbortSignal for request cancellation
 * @returns {Promise} The response with present/absent/onLeave employee lists
 */
export const getAttendanceDayDetail = async ({ date, signal } = {}) => {
  const config = {
    headers: { "Content-Type": "application/json" },
    params: { date },
    signal,
  }
  return api.get(ct.api.leave.attendanceDay, config)
}
