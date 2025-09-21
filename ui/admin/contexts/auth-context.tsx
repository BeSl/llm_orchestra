"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  user: { username: string; role: string } | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if there's a stored token on initial load
    const token = localStorage.getItem("authToken")
    if (token) {
      // Verify token with backend
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      // In a real implementation, you would verify the token with the backend
      // For now, we'll just set the user as authenticated
      setIsAuthenticated(true)
      setUser({ username: "admin", role: "admin" }) // This would come from token verification
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem("authToken")
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const baseUrl = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL 
        ? process.env.NEXT_PUBLIC_API_URL 
        : "http://localhost:8000"
        
      const response = await fetch(`${baseUrl}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username,
          password,
        } as any),
      })

      if (response.ok) {
        const data = await response.json()
        const token = data.access_token
        
        // Store token
        localStorage.setItem("authToken", token)
        
        // Set user data
        setIsAuthenticated(true)
        setUser({ username, role: "admin" }) // In a real app, this would come from a user info endpoint
        
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.detail || "Неверные учетные данные" }
      }
    } catch (error: any) {
      return { success: false, error: "Ошибка подключения к серверу" }
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}