import { render, screen, fireEvent } from "@testing-library/react"
import * as reactRedux from "react-redux"
import * as reactRouterDom from "react-router-dom"
import { describe, it, vi, expect, beforeEach } from "vitest"

import * as firebaseModule from "@/lib/firebase"
import Login from "@/pages/auth"

vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
}))

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}))

vi.mock("@constants/", () => ({
  default: {
    route: { ROOT: "/", auth: { LOGIN: "login" } },
    store: { USER_STORE: "user" },
    api: { auth: { me: "v1/auth/me" } },
  },
}))

vi.mock("@/lib/firebase", () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
}))

describe("Login Page", () => {
  let dispatchMock
  let navigateMock

  beforeEach(() => {
    dispatchMock = vi.fn()
    navigateMock = vi.fn()
    reactRedux.useDispatch.mockReturnValue(dispatchMock)
    reactRouterDom.useNavigate.mockReturnValue(navigateMock)
  })

  it("renders login form", () => {
    render(<Login />)
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText("name@company.com")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("does not submit login for invalid email", async () => {
    render(<Login />)

    const emailInput = screen.getByPlaceholderText("name@company.com")
    const passwordInput = screen.getByPlaceholderText("Enter your password")
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: "invalid-email" } })
    fireEvent.change(passwordInput, { target: { value: "123456" } })
    fireEvent.click(submitButton)

    await Promise.resolve()

    expect(firebaseModule.loginWithEmail).not.toHaveBeenCalled()
    expect(dispatchMock).not.toHaveBeenCalled()
  })
})
