/**
 * useToast Hook
 *
 * Hook to access the toast notification system.
 * Must be used within a ToastProvider.
 */

import { useContext } from 'react'
import { ToastContext } from './toastContextDef'
import type { ToastContextValue } from './toastContextDef'

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
