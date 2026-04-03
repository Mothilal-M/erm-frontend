import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  deleteEmployee,
  getEmployee,
  getEmployee360Profile,
  getEmployeePerformance,
  getEmployees,
  patchEmployee,
  postEmployee,
  postInviteUser,
} from "@api/employee-management.api"

const QUERY_KEY_EMPLOYEES = "employee-management-list"
const QUERY_KEY_EMPLOYEE_DETAIL = "employee-management-detail"
const QUERY_KEY_EMPLOYEE_PERFORMANCE = "employee-performance"
const QUERY_KEY_EMPLOYEE_360 = "employee-360-profile"

/**
 * React Query hook for fetching the full employee list.
 * @returns {import("@tanstack/react-query").UseQueryResult} The query result with the employee list
 */
export const useFetchEmployees = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY_EMPLOYEES],
    queryFn: async ({ signal }) => {
      const response = await getEmployees({ signal })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled,
  })
}

/**
 * React Query hook for fetching a single employee by ID.
 * @param {string|number} id - Employee ID
 * @returns {import("@tanstack/react-query").UseQueryResult} The query result with the employee record
 */
export const useFetchEmployee = (id) => {
  return useQuery({
    queryKey: [QUERY_KEY_EMPLOYEE_DETAIL, id],
    queryFn: async ({ signal }) => {
      const response = await getEmployee(id, { signal })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: Boolean(id),
  })
}

/**
 * Mutation hook to create a new employee.
 * Invalidates the employee list on success.
 * @returns {import("@tanstack/react-query").UseMutationResult} The mutation result
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => postEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_EMPLOYEES] })
    },
  })
}

/**
 * Mutation hook to update an existing employee.
 * Invalidates both list and detail cache on success.
 * @returns {import("@tanstack/react-query").UseMutationResult} The mutation result
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => patchEmployee(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_EMPLOYEES] })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_EMPLOYEE_DETAIL, variables.id],
      })
    },
  })
}

/**
 * Mutation hook to delete an employee.
 * Invalidates the employee list on success.
 * @returns {import("@tanstack/react-query").UseMutationResult} The mutation result
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_EMPLOYEES] })
    },
  })
}

/**
 * Mutation hook to send a user invitation.
 * @returns {import("@tanstack/react-query").UseMutationResult} The mutation result
 */
export const useInviteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => postInviteUser(payload),
    onSuccess: () => {
      // Invited users may appear in the employee list as "invited"
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_EMPLOYEES] })
    },
  })
}

/**
 * React Query hook for fetching the current employee's performance data.
 * @returns {import("@tanstack/react-query").UseQueryResult} Sprint tasks, performance & recognition
 */
export const useFetchEmployeePerformance = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY_EMPLOYEE_PERFORMANCE],
    queryFn: async ({ signal }) => {
      const response = await getEmployeePerformance({ signal })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled,
  })
}

/**
 * React Query hook for fetching the full 360° profile for a specific employee.
 * Includes personal info, attendance, leave, performance, assets, documents, timeline.
 * @param {string|number} id - Employee ID
 * @returns {import("@tanstack/react-query").UseQueryResult} The complete 360 profile data
 */
export const useFetchEmployee360 = (id) => {
  return useQuery({
    queryKey: [QUERY_KEY_EMPLOYEE_360, id],
    queryFn: async ({ signal }) => {
      const response = await getEmployee360Profile(id, { signal })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: Boolean(id),
  })
}
