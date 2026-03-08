const EMPLOYEE_MANAGEMENT = "v1/employee-management"
const EMPLOYEE_MANAGEMENT_DEPARTMENTS = "v1/employee-management/departments"
const ATTENDANCE_ADMIN_LOGS = "v1/attendance/admin/logs"

const apiConstant = {
  auth: {
    me: "v1/auth/me",
  },
  comment: {
    comment: "comments/",
  },
  leave: {
    attendance: "v1/leave/attendance",
    adminSummary: "v1/leave/admin/summary",
    adminApprovals: "v1/leave/admin/approvals",
    adminApprovalAction: "v1/leave/admin/approvals",
    adminManualRecord: "v1/leave/admin/manual-record",
    adminEmployees: "v1/leave/admin/employees",
    employeeProfile: "v1/leave/employee/profile",
    employeeRequest: "v1/leave/employee/request",
    adminSettings: "v1/leave/admin/settings",
    attendanceDay: "v1/leave/attendance/day", // GET ?date=YYYY-MM-DD
  },
  employeeManagement: {
    list: EMPLOYEE_MANAGEMENT,
    create: EMPLOYEE_MANAGEMENT,
    detail: EMPLOYEE_MANAGEMENT, // /v1/employee-management/:id
    invite: `${EMPLOYEE_MANAGEMENT}/invite`,
    departments: EMPLOYEE_MANAGEMENT_DEPARTMENTS,
    departmentDetail: EMPLOYEE_MANAGEMENT_DEPARTMENTS, // /departments/:id
    performance: "v1/employee/performance",
    profile360: `${EMPLOYEE_MANAGEMENT}profile`, // /employee-management/profile/:id/
  },
  attendance: {
    clockIn: "v1/attendance/clock-in",
    clockOut: "v1/attendance/clock-out",
    status: "v1/attendance/status",
    today: "v1/attendance/today",
    history: "v1/attendance/history",
    adminLogs: ATTENDANCE_ADMIN_LOGS,
    adminLogDetail: ATTENDANCE_ADMIN_LOGS, // append /{id}
    adminLogFlag: ATTENDANCE_ADMIN_LOGS, // append /{id}/flag
    adminManualEntry: "v1/attendance/admin/manual-entry",
    adminSummary: "v1/attendance/admin/summary",
    adminLive: "v1/attendance/admin/live",
  },
  project: {
    list: "projects/",
    detail: "projects/", // append {id}/
    sprints: (projectId) => `projects/${projectId}/sprints/`,
    sprintDetail: (projectId, sprintId) =>
      `projects/${projectId}/sprints/${sprintId}/`,
    tasks: (projectId, sprintId) =>
      `projects/${projectId}/sprints/${sprintId}/tasks/`,
  },
  profile: {
    me: "profile/me/",
    update: "profile/me/",
    changePassword: "profile/change-password/",
  },
  settings: {
    get: "settings/",
    update: "settings/",
  },
  policy: {
    list: "policies/",
    create: "policies/",
    detail: "policies", // append /{id}/
    update: "policies", // append /{id}/
    delete: "policies", // append /{id}/
  },
  rewards: {
    list: "rewards/",
    create: "rewards/",
    detail: "rewards", // append /{id}/
    myRewards: "rewards/my/",
  },
}
export default apiConstant
