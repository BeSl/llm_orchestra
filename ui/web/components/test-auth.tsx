"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export function TestAuth() {
  const { isAuthenticated, user, login, logout, loading } = useAuth()
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("admin")
  const [loginLoading, setLoginLoading] = useState(false)

  const handleLogin = async () => {
    setLoginLoading(true)
    try {
      const result = await login(username, password)
      console.log("Login result:", result)
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setLoginLoading(false)
    }
  }

  if (loading) {
    return <div>Loading auth state...</div>
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Authentication Test</h2>
      
      <div className="mb-4">
        <p className="font-medium">Auth Status:</p>
        <p className={isAuthenticated ? "text-green-600" : "text-red-600"}>
          {isAuthenticated ? "Authenticated" : "Not Authenticated"}
        </p>
      </div>

      {user && (
        <div className="mb-4">
          <p className="font-medium">User Info:</p>
          <p>Username: {user.username}</p>
          <p>Role: {user.role}</p>
        </div>
      )}

      {!isAuthenticated ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loginLoading ? "Logging in..." : "Login"}
          </button>
        </div>
      ) : (
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      )}
    </div>
  )
}