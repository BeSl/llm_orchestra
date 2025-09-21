"use client"

import { useState } from "react"
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

interface Task {
  id: string
  userId: string
  username: string
  taskType: "summarization" | "translation" | "code_generation"
  status: "pending" | "in_progress" | "completed" | "failed"
  createdAt: string
  completedAt?: string
  result?: string
  error?: string
}

export function TaskMonitoring() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const [tasks] = useState<Task[]>([
    {
      id: "1",
      userId: "2",
      username: "user123",
      taskType: "summarization",
      status: "completed",
      createdAt: "2024-01-15 10:30",
      completedAt: "2024-01-15 10:32",
      result: "Краткое изложение документа успешно создано...",
    },
    {
      id: "2",
      userId: "4",
      username: "user789",
      taskType: "translation",
      status: "in_progress",
      createdAt: "2024-01-15 10:25",
    },
    {
      id: "3",
      userId: "2",
      username: "user123",
      taskType: "code_generation",
      status: "failed",
      createdAt: "2024-01-15 10:20",
      error: "Ошибка при генерации кода: недостаточно контекста",
    },
    {
      id: "4",
      userId: "4",
      username: "user789",
      taskType: "summarization",
      status: "pending",
      createdAt: "2024-01-15 10:15",
    },
    {
      id: "5",
      userId: "3",
      username: "user456",
      taskType: "translation",
      status: "completed",
      createdAt: "2024-01-15 09:45",
      completedAt: "2024-01-15 09:48",
      result: "Перевод текста выполнен успешно...",
    },
  ])

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.taskType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesType = typeFilter === "all" || task.taskType === typeFilter

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

  const getTaskTypeLabel = (type: Task["taskType"]) => {
    const labels = {
      summarization: "Суммаризация",
      translation: "Перевод",
      code_generation: "Генерация кода",
    }
    return labels[type]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Мониторинг задач</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
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
            <div className="text-2xl font-bold text-primary">{tasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Завершено</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter((t) => t.status === "completed").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выполняется</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter((t) => t.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ошибки</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{tasks.filter((t) => t.status === "failed").length}</div>
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
                  <TableCell className="font-mono text-sm">{task.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {task.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{task.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTaskTypeLabel(task.taskType)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      {getStatusBadge(task.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{task.createdAt}</TableCell>
                  <TableCell className="text-muted-foreground">{task.completedAt || "-"}</TableCell>
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
                            <DialogTitle>Детали задачи #{task.id}</DialogTitle>
                            <DialogDescription>Подробная информация о выполнении задачи</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Пользователь:</label>
                                <p className="text-sm text-muted-foreground">{task.username}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Тип задачи:</label>
                                <p className="text-sm text-muted-foreground">{getTaskTypeLabel(task.taskType)}</p>
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
                                <p className="text-sm text-muted-foreground">{task.createdAt}</p>
                              </div>
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
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
