import { createSlice } from "@reduxjs/toolkit"

import { queryClient } from "@/lib/query-client"
import ct from "@constants/"

export const authSlice = createSlice({
  name: ct.store.USER_STORE,
  initialState: {
    userName: "",
    userEmail: "",
    userRole: "",
    uid: "",
    isAuthenticated: false,
    leave_management_role: "",
    employee_management_role: "",
    attendance_management_role: "",
  },
  reducers: {
    login: (state, action) => {
      const { userName, userEmail, userRole, uid } = action.payload
      state.userName = userName
      state.userEmail = userEmail
      state.userRole = userRole
      state.uid = uid
      state.isAuthenticated = true
      state.leave_management_role = userRole
      state.employee_management_role = userRole
      state.attendance_management_role = userRole
    },
    logout: (state) => {
      state.userName = ""
      state.userEmail = ""
      state.userRole = ""
      state.uid = ""
      state.isAuthenticated = false
      state.attendance_management_role = ""
      state.leave_management_role = ""
      state.employee_management_role = ""

      queryClient.clear()
    },
  },
})

export const { login, logout } = authSlice.actions

export default authSlice.reducer
