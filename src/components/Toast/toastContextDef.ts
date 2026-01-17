/**
 * Toast Context Definition
 *
 * Separated to avoid fast-refresh issues.
 */

import { createContext } from 'react'
import type { ToastVariant } from './Toast'

export interface ToastContextValue {
  showToast: (message: string, variant: ToastVariant, duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
