import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import { toast } from "@/components/ui/use-toast"
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase"
import { getErrorMessage } from "@/lib/utils/auth-errors"
import ct from "@constants/"
import api from "@/services/api"
import { login } from "@store/slices/user.slice"

import LoginUI from "./login.ui"

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  /**
   * After Firebase sign-in, fetch user profile from backend and dispatch to Redux
   * @param {import("firebase/auth").User} firebaseUser
   */
  const handlePostLogin = async (firebaseUser) => {
    try {
      const { data } = await api.get(ct.api.auth.me)
      dispatch(
        login({
          userName: data.name || firebaseUser.displayName || firebaseUser.email.split("@")[0],
          userEmail: data.email || firebaseUser.email,
          userRole: data.role || "employee",
          uid: data.uid || firebaseUser.uid,
        })
      )
      toast({
        title: "Welcome back!",
        description: "You have signed in successfully.",
        variant: "success",
      })
      navigate(ct.route.ROOT)
    } catch (error) {
      if (error.response?.status === 404) {
        toast({
          title: "Account not found",
          description: "No account found with this email. Redirecting to sign up...",
        })
        navigate("/signup")
      } else {
        const message = getErrorMessage(error, "Unable to sign in. Please try again.")
        toast({
          title: "Sign in failed",
          description: message,
          variant: "destructive",
        })
      }
    }
  }

  /**
   * Handle email/password login
   * @param {object} data - Form data with email and password
   */
  const handleOnSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await loginWithEmail(data.email, data.password)
      await handlePostLogin(result.user)
    } catch (error) {
      const message = getErrorMessage(error, "Unable to sign in. Please check your credentials and try again.")
      if (message) {
        toast({ title: "Sign in failed", description: message, variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle Google sign-in
   */
  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const result = await loginWithGoogle()
      await handlePostLogin(result.user)
    } catch (error) {
      const message = getErrorMessage(error, "Google sign-in failed. Please try again.")
      if (message) {
        toast({
          title: "Google sign-in failed",
          description: message,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <LoginUI
      form={form}
      onSubmit={handleOnSubmit}
      onGoogleLogin={handleGoogleLogin}
      loading={loading}
    />
  )
}

export default Login
