"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, BarChart3, PieChartIcon, Activity, Download } from "lucide-react"

export function StatisticsCharts() {
  const [timeRange, setTimeRange] = useState("7d")

  // Mock data for charts
  const tasksByStatusData = [
    { name: "Завершено", value: 120, color: "hsl(var(--chart-1))" },
    { name: "Выполняется", value: 15, color: "hsl(var(--chart-2))" },
    { name: "Ожидает", value: 8, color: "hsl(var(--chart-3))" },
    { name: "Ошибки", value: 5, color: "hsl(var(--chart-4))" },
  ]

  const tasksByTypeData = [
    { name: "Суммаризация", value: 80, color: "hsl(var(--chart-1))" },
    { name: "Перевод", value: 40, color: "hsl(var(--chart-2))" },
    { name: "Генерация кода", value: 23, color: "hsl(var(--chart-3))" },
  ]

  const dailyTasksData = [
    { date: "09.01", completed: 12, failed: 1, created: 15 },
    { date: "10.01", completed: 18, failed: 2, created: 22 },
    { date: "11.01", completed: 15, failed: 0, created: 18 },
    { date: "12.01", completed: 22, failed: 3, created: 28 },
    { date: "13.01", completed: 25, failed: 1, created: 30 },
    { date: "14.01", completed: 20, failed: 2, created: 25 },
    { date: "15.01", completed: 28, failed: 1, created: 32 },
  ]

  const userActivityData = [
    { date: "09.01", activeUsers: 45 },
    { date: "10.01", activeUsers: 52 },
    { date: "11.01", activeUsers: 48 },
    { date: "12.01", activeUsers: 61 },
    { date: "13.01", activeUsers: 58 },
    { date: "14.01", activeUsers: 55 },
    { date: "15.01", activeUsers: 67 },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Аналитика и статистика</h2>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Последние 7 дней</SelectItem>
              <SelectItem value="30d">Последние 30 дней</SelectItem>
              <SelectItem value="90d">Последние 3 месяца</SelectItem>
              <SelectItem value="1y">Последний год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Успешность выполнения</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+2.1%</span> за неделю
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Среднее время выполнения</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">2.3 мин</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">-0.2 мин</span> за неделю
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных пользователей</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">67</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+12</span> за неделю
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пиковая нагрузка</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">32</div>
            <p className="text-xs text-muted-foreground">задач/час</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Задачи по статусам</span>
            </CardTitle>
            <CardDescription>Распределение задач по текущему статусу</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tasksByStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tasksByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tasks by Type Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Задачи по типам</span>
            </CardTitle>
            <CardDescription>Количество задач по типам операций</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tasksByTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Tasks Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Динамика задач</span>
            </CardTitle>
            <CardDescription>Ежедневная статистика создания и выполнения задач</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTasksData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="created" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Создано" />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Завершено"
                />
                <Line type="monotone" dataKey="failed" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Ошибки" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Activity Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Активность пользователей</span>
            </CardTitle>
            <CardDescription>Количество активных пользователей по дням</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                  strokeWidth={2}
                  name="Активные пользователи"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Детальная статистика</CardTitle>
          <CardDescription>Подробные метрики системы за выбранный период</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Производительность</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Среднее время ответа:</span>
                  <span className="text-sm font-medium">1.2 сек</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Пропускная способность:</span>
                  <span className="text-sm font-medium">450 задач/час</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Время безотказной работы:</span>
                  <span className="text-sm font-medium">99.8%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Использование ресурсов</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">CPU:</span>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Память:</span>
                  <span className="text-sm font-medium">2.1 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Дисковое пространство:</span>
                  <span className="text-sm font-medium">12.5 GB</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Качество обслуживания</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Успешные запросы:</span>
                  <span className="text-sm font-medium">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Повторные попытки:</span>
                  <span className="text-sm font-medium">3.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Критические ошибки:</span>
                  <span className="text-sm font-medium">0.3%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
