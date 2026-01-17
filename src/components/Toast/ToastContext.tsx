/**
 * Toast Provider Component
 *
 * Provides a global toast notification system via React context.
 * Components can use the useToast hook to show notifications.
 * Uses Toast components from @opencanoetiming/timing-design-system.
 */

import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Toast,
  ToastContainer,
  type ToastVariant,
} from '@opencanoetiming/timing-design-system'
import { ToastContext } from './toastContextDef'
import type { ToastContextValue } from './toastContextDef'

// Re-export types for backward compatibility
export type { ToastContextValue } from './toastContextDef'

interface ToastData {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

let toastIdCounter = 0

function generateToastId(): string {
  return `toast-${++toastIdCounter}-${Date.now()}`
}

export interface ToastProviderProps {
  children: ReactNode
  maxToasts?: number
}

const DEFAULT_DURATION = 4000
const ERROR_DURATION = 6000

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, variant: ToastVariant, duration?: number) => {
      const newToast: ToastData = {
        id: generateToastId(),
        message,
        variant,
        duration:
          duration ?? (variant === 'error' ? ERROR_DURATION : DEFAULT_DURATION),
      }

      setToasts((prev) => {
        const updated = [...prev, newToast]
        // Remove oldest toasts if exceeding max
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts)
        }
        return updated
      })
    },
    [maxToasts]
  )

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'success', duration)
    },
    [showToast]
  )

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'error', duration)
    },
    [showToast]
  )

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'warning', duration)
    },
    [showToast]
  )

  const value: ToastContextValue = {
    showToast,
    showSuccess,
    showError,
    showWarning,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <ToastContainer position="bottom-right">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              variant={toast.variant}
              message={toast.message}
              dismissible
              onDismiss={() => dismissToast(toast.id)}
              duration={toast.duration}
              showProgress
            />
          ))}
        </ToastContainer>
      )}
    </ToastContext.Provider>
  )
}
