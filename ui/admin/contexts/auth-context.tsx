"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { AuthService } from "@/services/auth-service"
import { useRouter } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  user: { username: string; role: string } | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if there's a stored token on initial load
    const token = localStorage.getItem("authToken")
    if (token && AuthService.verifyToken(token)) {
      // Fetch user info
      fetchUserInfo(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserInfo = async (token: string) => {
    try {
      // Set temporary user data from token
      const username = AuthService.getUsernameFromToken(token)
      if (username) {
        setUser({ username, role: "admin" }) // Default to admin, will be updated with real data
        setIsAuthenticated(true)
      }
      
      // Fetch real user data from API
      const userData = await apiClient.getCurrentUser()
      setUser({ username: userData.username, role: userData.role })
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Error fetching user info:", error)
      // Token is invalid, remove it
      localStorage.removeItem("authToken")
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const authResponse = await apiClient.login(username, password)
      const token = authResponse.access_token
      
      // Store token
      localStorage.setItem("authToken", token)
      
      // Set user data from token first to provide immediate feedback
      setUser({ username, role: "admin" }) // Default to admin role
      setIsAuthenticated(true)
      
      // Then fetch real user data from API
      try {
        const userData = await apiClient.getCurrentUser()
        setUser({ username: userData.username, role: userData.role })
      } catch (error) {
        console.error("Error fetching user info after login:", error)
        // If we can't fetch user info, we'll keep the temporary data
        // But we should check if this is a critical error
        // For now, we'll assume the login was successful even if we can't fetch user info
      }
      
      // Redirect to main page after successful login
      router.push("/")
      
      return { success: true }
    } catch (error: any) {
      // Make sure we're not authenticated if login fails
      setIsAuthenticated(false)
      setUser(null)
      localStorage.removeItem("authToken")
      
      // Provide a more user-friendly error message
      let errorMessage = "Неверные учетные данные"
      if (error.message && error.message !== "Invalid credentials") {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
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