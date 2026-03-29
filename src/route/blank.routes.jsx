import { lazy } from "react"

// Lazy load authentication pages
const Login = lazy(() => import("@/pages/auth"))
const Signup = lazy(() => import("@/pages/auth/signup"))

const blankRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]

export default blankRoutes
