"use client"

import { useState, useEffect } from "react"
import { apiClient, mockApi, type User, type Task, type TaskStats, type TaskTypeStats } from "@/lib/api"

// Custom hook for fetching users
export function useUsers(token: string) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const createUser = async (userData: {
    username: string
    password: string
    role: "admin" | "user"
  }) => {
    try {
      const newUser = await apiClient.createUser(userData)
      setUsers((prev: User[]) => [...prev, newUser])
      return newUser
    } catch (err) {
      throw err
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const updatedUser = await apiClient.updateUser(userId, updates)
      setUsers((prev: User[]) => prev.map((user: User) => (user.id === userId ? updatedUser : user)))
      return updatedUser
    } catch (err) {
      throw err
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await apiClient.deleteUser(userId)
      setUsers((prev: User[]) => prev.filter((user: User) => user.id !== userId))
    } catch (err) {
      throw err
    }
  }

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
}

// Custom hook for fetching tasks
export function useTasks(token: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getAllTasks()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const deleteTask = async (taskId: string) => {
    try {
      await apiClient.deleteTask(taskId)
      setTasks((prev: Task[]) => prev.filter((task: Task) => task.id !== taskId))
    } catch (err) {
      throw err
    }
  }

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    deleteTask,
  }
}

// Custom hook for fetching task stats
export function useTaskStats(token: string) {
  const [statsByStatus, setStatsByStatus] = useState<TaskStats | null>(null)
  const [statsByType, setStatsByType] = useState<TaskTypeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const statusStats = await apiClient.getTaskStatsByStatus()
      const typeStats = await apiClient.getTaskStatsByType()
      setStatsByStatus(statusStats)
      setStatsByType(typeStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch task stats")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    statsByStatus,
    statsByType,
    loading,
    error,
    refetch: fetchStats,
  }
}

// Generic hook for API calls with loading states
export function useApiCall<T>(apiFunction: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const execute = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "API call failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    execute()
  }, dependencies)

  return {
    data,
    loading,
    error,
    refetch: execute,
  }
}