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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Trash2, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: string
  user_id: string
  task_type: string
  status: "pending" | "in_progress" | "completed" | "failed"
  created_at: string
  completed_at?: string
  result?: string
  error?: string
  username?: string // Added for UI display
}

export function TaskMonitoring() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    failed: 0,
    byType: {
      summarization: 0,
      translation: 0,
      codeGeneration: 0
    }
  })
  const { toast } = useToast()

  // Fetch tasks and stats from backend
  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const fetchedTasks = await apiClient.getAllTasks()
      // Transform API response to match our interface and add username
      const transformedTasks = fetchedTasks.map(task => ({
        ...task,
        username: `User ${task.user_id.substring(0, 8)}` // Placeholder, would need user lookup in real app
      }))
      setTasks(transformedTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список задач",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Fetch stats by status
      const statusStats = await apiClient.getTaskStatsByStatus()
      
      // Fetch stats by type
      const typeStats = await apiClient.getTaskStatsByType()
      
      setStats({
        total: statusStats.pending + statusStats.in_progress + statusStats.completed + statusStats.failed,
        completed: statusStats.completed,
        inProgress: statusStats.in_progress,
        failed: statusStats.failed,
        byType: {
          summarization: typeStats.summarization,
          translation: typeStats.translation,
          codeGeneration: typeStats.code_generation
        }
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статистику задач",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiClient.deleteTask(taskId)
      toast({
        title: "Успех",
        description: "Задача успешно удалена",
      })
      // Refresh tasks and stats
      fetchTasks()
      fetchStats()
    } catch (error: any) {
      console.error("Error deleting task:", error)
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить задачу",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = () => {
    fetchTasks()
    fetchStats()
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.username && task.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      task.task_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesType = typeFilter === "all" || task.task_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "in_progress":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: Task["status"]) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      in_progress: "secondary",
      pending: "outline",
    } as const

    const labels = {
      completed: "Завершено",
      failed: "Ошибка",
      in_progress: "Выполняется",
      pending: "Ожидает",
    }

    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getTaskTypeLabel = (type: string) => {
    const labels = {
      summarization: "Суммаризация",
      translation: "Перевод",
      code_generation: "Генерация кода",
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Мониторинг задач</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего задач</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Завершено</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выполняется</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ошибки</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по пользователю или типу задачи..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидает</SelectItem>
                <SelectItem value="in_progress">Выполняется</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
                <SelectItem value="failed">Ошибка</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Тип задачи" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="summarization">Суммаризация</SelectItem>
                <SelectItem value="translation">Перевод</SelectItem>
                <SelectItem value="code_generation">Генерация кода</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список задач</CardTitle>
          <CardDescription>Найдено задач: {filteredTasks.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Тип задачи</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Создано</TableHead>
                  <TableHead>Завершено</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-mono text-sm">{task.id.substring(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {task.username ? task.username.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <span className="font-medium">{task.username || `User ${task.user_id.substring(0, 8)}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTaskTypeLabel(task.task_type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status)}
                        {getStatusBadge(task.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(task.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {task.completed_at ? new Date(task.completed_at).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Детали задачи #{task.id.substring(0, 8)}</DialogTitle>
                              <DialogDescription>Подробная информация о выполнении задачи</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Пользователь:</label>
                                  <p className="text-sm text-muted-foreground">{task.username || `User ${task.user_id.substring(0, 8)}`}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Тип задачи:</label>
                                  <p className="text-sm text-muted-foreground">{getTaskTypeLabel(task.task_type)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Статус:</label>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {getStatusIcon(task.status)}
                                    {getStatusBadge(task.status)}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Создано:</label>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(task.created_at).toLocaleString()}
                                  </p>
                                </div>
                                {task.completed_at && (
                                  <div>
                                    <label className="text-sm font-medium">Завершено:</label>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(task.completed_at).toLocaleString()}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {task.result && (
                                <div>
                                  <label className="text-sm font-medium">Результат:</label>
                                  <div className="mt-2 p-3 bg-muted rounded-md">
                                    <p className="text-sm">{task.result}</p>
                                  </div>
                                </div>
                              )}

                              {task.error && (
                                <div>
                                  <label className="text-sm font-medium text-red-600">Ошибка:</label>
                                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-700">{task.error}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}