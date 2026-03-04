import ct from "@constants/"

import api from "."

/**
 * Clock in the current employee.
 * @async
 * @param {object} [data] - Optional payload
 * @param {string} [data.note] - Optional note on clock-in
 * @param {string} [data.deviceInfo] - Optional device/browser info
 * @returns {Promise} The response from the API
 */
export const postClockIn = async (data = {}) => {
  return api.post(ct.api.attendance.clockIn, data)
}

/**
 * Clock out the current employee. workSummary is required.
 * @async
 * @param {object} data - Payload
 * @param {string} data.workSummary - What the employee worked on today
 * @returns {Promise} The response from the API
 */
export const postClockOut = async (data) => {
  return api.post(ct.api.attendance.clockOut, data)
}

/**
 * Get the current clock-in status for the authenticated employee.
 * @async
 * @param {object} options - Options object
 * @param {AbortSignal} [options.signal] - Optional AbortSignal for request cancellation
 * @returns {Promise} The response from the API
 */
export const getAttendanceStatus = async ({ signal } = {}) => {
  const config = { headers: { "Content-Type": "application/json" }, signal }
  return api.get(ct.api.attendance.status, config)
}

/**
 * Get today's full attendance detail for the current employee.
 * @async
 * @param {object} options - Options object
 * @param {AbortSignal} [options.signal] - Optional AbortSignal for request cancellation
 * @returns {Promise} The response from the API
 */
export const getTodayAttendance = async ({ signal } = {}) => {
  const config = { headers: { "Content-Type": "application/json" }, signal }
  return api.get(ct.api.attendance.today, config)
}

/**
 * Get paginated personal attendance history.
 * @async
 * @param {object} options - Options object
 * @param {number} [options.page] - Page number for pagination (default: 1)
 * @param {number} [options.month] - 1-indexed month
 * @param {number} [options.year] - 4-digit year
 * @param {AbortSignal} [options.signal] - Optional AbortSignal for request cancellation
 * @returns {Promise} The response from the API
 */
export const getAttendanceHistory = async ({
  page = 1,
  month,
  year,
  signal,
} = {}) => {
  const config = {
    headers: { "Content-Type": "application/json" },
    params: { page, month, year },
    signal,
  }
  return api.get(ct.api.attendance.history, config)
}

// ─── Admin endpoints ──────────────────────────────────────────────────────────

/**
 * Get the paginated admin activity log.
 * @async
 * @param {object} options - Options object with optional filters
 * @param {number} [options.page] - Page number for pagination (default: 1)
 * @param {string} [options.date] - YYYY-MM-DD filter
 * @param {string} [options.dateFrom] - YYYY-MM-DD range start
 * @param {string} [options.dateTo] - YYYY-MM-DD range end
 * @param {number} [options.employeeId] - Filter by employee ID
 * @param {number} [options.departmentId] - Filter by department ID
 * @param {string} [options.status] - IN_PROGRESS|COMPLETED|AUTO_EXPIRED|EDITED|MANUAL|FLAGGED
 * @param {AbortSignal} [options.signal] - Optional AbortSignal for request cancellation
 * @returns {Promise} The response from the API, expected to be a paginated list of attendance log entries matching the filters
 */
export const getAdminAttendanceLogs = async ({
  page = 1,
  date,
  dateFrom,
  dateTo,
  employeeId,
  departmentId,
  status,
  signal,
} = {}) => {
  const config = {
    headers: { "Content-Type": "application/json" },
    params: {
      page,
      date,
      date_from: dateFrom,
      date_to: dateTo,
      employee_id: employeeId,
      department_id: departmentId,
      status,
    },
    signal,
  }
  return api.get(ct.api.attendance.adminLogs, config)
}

/**
 * Edit an attendance entry's clock-in/out times (admin only).
 * @async
 * @param {number} id - Entry ID
 * @param {object} data - Payload
 * @param {string} data.clockIn - ISO datetime
 * @param {string} data.clockOut - ISO datetime
 * @param {string} data.editReason - Required reason
 * @param {string} [data.workSummary] - Optional override
 * @returns {Promise} The response from the API
 */
export const patchAdminAttendanceEntry = async (id, data) => {
  return api.patch(`${ct.api.attendance.adminLogDetail}/${id}`, data)
}

/**
 * Flag or unflag an attendance entry as suspicious (admin only).
 * @async
 * @param {number} id - Entry ID
 * @param {object} data - Payload
 * @param {boolean} data.isFlagged - True to flag, false to unflag
 * @param {string} [data.flagReason] - Required when flagging
 * @returns {Promise} The response from the API
 */
export const patchAdminFlagEntry = async (id, data) => {
  return api.patch(`${ct.api.attendance.adminLogFlag}/${id}/flag`, data)
}

/**
 * Create a manual attendance entry on behalf of an employee (admin only).
 * @async
 * @param {object} data - Payload
 * @param {number} data.employeeId - Employee ID to create the entry for
 * @param {string} data.clockIn - ISO datetime
 * @param {string} data.clockOut - ISO datetime
 * @param {string} data.workSummary - Optional summary of work done
 * @param {string} data.manualEntryReason - Required
 */
export const postAdminManualEntry = async (data) => {
  return api.post(ct.api.attendance.adminManualEntry, data)
}

/**
 * Get who is currently clocked in (admin only, poll every 30s).
 * @async
 * @param {object} options - Options object
 * @param {AbortSignal} [options.signal] - Optional AbortSignal for request cancellation
 * @returns {Promise} The response from the API, expected to be a list of currently clocked-in employees with their details
 */
export const getAdminLiveStatus = async ({ signal } = {}) => {
  const config = { headers: { "Content-Type": "application/json" }, signal }
  return api.get(ct.api.attendance.adminLive, config)
}

/**
 * Get daily/weekly/monthly attendance summary stats (admin only).
 * @async
 * @param {object} options - Options object
 * @param {AbortSignal} [options.signal] - Optional AbortSignal for request cancellation
 * @returns {Promise} The response from the API, expected to contain summary statistics such as total clock-ins, average hours worked, etc., for the specified time period.
 */
export const getAdminAttendanceSummary = async ({ signal } = {}) => {
  const config = { headers: { "Content-Type": "application/json" }, signal }
  return api.get(ct.api.attendance.adminSummary, config)
}
