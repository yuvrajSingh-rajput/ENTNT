import { createContext, useContext, useState, type ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive" | "success"
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, toast.duration || 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn("min-w-[300px] rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-2", {
              "bg-background border-border": toast.variant === "default" || !toast.variant,
              "bg-destructive text-destructive-foreground border-destructive": toast.variant === "destructive",
              "bg-green-50 text-green-900 border-green-200": toast.variant === "success",
            })}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold">{toast.title}</div>
                {toast.description && <div className="text-sm opacity-90 mt-1">{toast.description}</div>}
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeToast(toast.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}