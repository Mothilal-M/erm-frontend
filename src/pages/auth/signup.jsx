import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import { toast } from "@/components/ui/use-toast"
import {
  loginWithGoogle,
  logoutFirebase,
  signupWithEmail,
} from "@/lib/firebase"
import { getErrorMessage } from "@/lib/utils/auth-errors"
import ct from "@constants/"
import api from "@/services/api"
import { login } from "@store/slices/user.slice"

import SignupUI from "./signup.ui"

const FormSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

const Signup = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  /**
   * Register user in the backend and dispatch to Redux
   */
  const handlePostRegister = async (firebaseUser, name) => {
    const { data } = await api.post(ct.api.auth.register, { name })
    dispatch(
      login({
        userName: data.name || name,
        userEmail: data.email || firebaseUser.email,
        userRole: data.role || "admin",
        uid: data.uid || firebaseUser.uid,
      }),
    )
    toast({
      title: "Welcome!",
      description: "Your account has been created successfully.",
      variant: "success",
    })
    navigate(ct.route.ROOT)
  }

  /**
   * Handle email/password signup
   */
  const handleOnSubmit = async (formData) => {
    setLoading(true)
    try {
      const result = await signupWithEmail(formData.email, formData.password)
      await handlePostRegister(result.user, formData.name)
    } catch (error) {
      // If Firebase account was created but backend registration failed, clean up
      if (error.response) {
        await logoutFirebase()
      }

      const message = getErrorMessage(
        error,
        "Unable to create your account. Please try again.",
      )
      if (message) {
        toast({
          title: "Sign up failed",
          description: message,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle Google sign-up
   */
  const handleGoogleSignup = async () => {
    setLoading(true)
    try {
      const result = await loginWithGoogle()
      await handlePostRegister(
        result.user,
        result.user.displayName || result.user.email.split("@")[0],
      )
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Google sign-up failed. Please try again.",
      )
      if (message) {
        toast({
          title: "Sign up failed",
          description: message,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <SignupUI
      form={form}
      onSubmit={handleOnSubmit}
      onGoogleSignup={handleGoogleSignup}
      loading={loading}
    />
  )
}

export default Signup
