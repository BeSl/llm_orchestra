"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
}

export function LoadingCard() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-2">
        <LoadingSpinner />
        <span className="text-muted-foreground">Загрузка...</span>
      </div>
    </div>
  )
}

export function ErrorCard({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-destructive mb-2">Ошибка загрузки данных</div>
      <div className="text-sm text-muted-foreground mb-4">{error}</div>
      {onRetry && (
        <button onClick={onRetry} className="text-primary hover:underline text-sm">
          Попробовать снова
        </button>
      )}
    </div>
  )
}
