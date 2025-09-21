"use client"

import { useState } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { isAuthenticated, login, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  return <AdminDashboard onLogout={handleLogout} />
}