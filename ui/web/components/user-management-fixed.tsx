"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  username: string
  role: "admin" | "user"
  created_at?: string
  last_login?: string
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user" as "admin" | "user"
  })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    username: "",
    password: "",
    role: "user" as "admin" | "user"
  })
  const { toast } = useToast()

  // Fetch users from backend
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const fetchedUsers = await apiClient.getUsers()
      setUsers(fetchedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      if (!newUser.username || !newUser.password) {
        toast({
          title: "Ошибка",
          description: "Имя пользователя и пароль обязательны",
          variant: "destructive",
        })
        return
      }

      await apiClient.createUser({
        username: newUser.username,
        password: newUser.password,
        role: newUser.role
      })
      
      toast({
        title: "Успех",
        description: "Пользователь успешно создан",
      })
      
      // Reset form and close dialog
      setNewUser({ username: "", password: "", role: "user" })
      setIsAddUserOpen(false)
      
      // Refresh users list
      fetchUsers()
    } catch (error: any) {
      console.error("Error creating user:", error)
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать пользователя",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async () => {
    try {
      if (!editingUser) return

      // Only update fields that have changed
      const updates: any = {}
      if (editForm.username !== editingUser.username) {
        updates.username = editForm.username
      }
      if (editForm.password) {
        updates.password = editForm.password
      }
      if (editForm.role !== editingUser.role) {
        updates.role = editForm.role
      }

      if (Object.keys(updates).length === 0) {
        // No changes made
        setIsEditUserOpen(false)
        return
      }

      await apiClient.updateUser(editingUser.id, updates)
      
      toast({
        title: "Успех",
        description: "Пользователь успешно обновлен",
      })
      
      // Close dialog and refresh users list
      setIsEditUserOpen(false)
      fetchUsers()
    } catch (error: any) {
      console.error("Error updating user:", error)
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить пользователя",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    try {
      await apiClient.deleteUser(userId)
      
      toast({
        title: "Успех",
        description: `Пользователь ${username} удален`,
      })
      
      // Refresh users list
      fetchUsers()
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить пользователя",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setEditForm({
      username: user.username,
      password: "",
      role: user.role
    })
    setIsEditUserOpen(true)
  }

  const filteredUsers = users.filter((user) => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Управление пользователями</h2>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить пользователя
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить нового пользователя</DialogTitle>
              <DialogDescription>Создайте новую учетную запись пользователя в системе.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Имя пользователя
                </Label>
                <Input 
                  id="username" 
                  className="col-span-3" 
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({...prev, username: e.target.value}))}
                />
              </div>
