"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TestAuthPage() {
  const { isAuthenticated, user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Authentication Status:</p>
            <p className={isAuthenticated ? "text-green-600" : "text-red-600"}>
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </p>
          </div>
          {user && (
            <div>
              <p className="text-sm font-medium">User Info:</p>
              <p>Username: {user.username}</p>
              <p>Role: {user.role}</p>
            </div>
          )}
          <div className="flex space-x-2">
            <button
              onClick={() => router.push("/login")}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
            >
              Go to Login
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:opacity-90"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}