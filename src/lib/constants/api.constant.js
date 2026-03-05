const EMPLOYEE_MANAGEMENT = "employee-management/"
const EMPLOYEE_MANAGEMENT_DETAILS = "employee-management"
const EMPLOYEE_MANAGEMENT_DEPARTMENTS = "employee-management/departments"
const ATTENDANCE_ADMIN_LOGS = "attendance/admin/logs"

const apiConstant = {
  comment: {
    comment: "comments/",
  },
  leave: {
    attendance: "leave/attendance/",
    adminSummary: "leave/admin/summary/",
    adminApprovals: "leave/admin/approvals/",
    adminApprovalAction: "leave/admin/approvals",
    adminManualRecord: "leave/admin/manual-record/",
    adminEmployees: "leave/admin/employees/",
    employeeProfile: "leave/employee/profile/",
    employeeRequest: "leave/employee/request/",
    adminSettings: "leave/admin/settings/",
    attendanceDay: "leave/attendance/day/", // GET ?date=YYYY-MM-DD
  },
  employeeManagement: {
    list: EMPLOYEE_MANAGEMENT,
    create: EMPLOYEE_MANAGEMENT,
    detail: EMPLOYEE_MANAGEMENT_DETAILS, // /employee-management/:id/
    invite: `${EMPLOYEE_MANAGEMENT}invite/`,
    departments: EMPLOYEE_MANAGEMENT_DEPARTMENTS,
    departmentDetail: EMPLOYEE_MANAGEMENT_DEPARTMENTS, // /departments/:id/
    performance: "employee/performance/",
    profile360: `${EMPLOYEE_MANAGEMENT}profile`, // /employee-management/profile/:id/
  },
  attendance: {
    clockIn: "attendance/clock-in/",
    clockOut: "attendance/clock-out/",
    status: "attendance/status/",
    today: "attendance/today/",
    history: "attendance/history/",
    adminLogs: `${ATTENDANCE_ADMIN_LOGS}/`,
    adminLogDetail: ATTENDANCE_ADMIN_LOGS, // append /{id}/
    adminLogFlag: ATTENDANCE_ADMIN_LOGS, // append /{id}/flag/
    adminManualEntry: "attendance/admin/manual-entry/",
    adminSummary: "attendance/admin/summary/",
    adminLive: "attendance/admin/live/",
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
