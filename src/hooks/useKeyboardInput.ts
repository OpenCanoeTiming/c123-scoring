import { useCallback, useState } from 'react'

/**
 * Penalty values supported by C123
 * 0 = Clear (no touch)
 * 2 = Touch (2 seconds)
 * 50 = Missed gate (50 seconds)
 */
export type PenaltyValue = 0 | 2 | 50

export interface PendingEdit {
  /** Competitor bib number */
  bib: string
  /** Gate number (1-based) */
  gate: number
  /** New penalty value */
  value: PenaltyValue
}

export interface KeyboardInputOptions {
  /** Callback when a penalty value is entered */
  onPenaltyInput?: (value: PenaltyValue) => void
  /** Callback when edit is confirmed (Enter) */
  onConfirm?: () => void
  /** Callback when edit is cancelled (Escape) */
  onCancel?: () => void
  /** Callback when clear is requested (Delete/Backspace) */
  onClear?: () => void
  /** Callback when help is requested (? or F1) */
  onHelp?: () => void
  /** Whether input is currently enabled */
  enabled?: boolean
}

export interface KeyboardInputResult {
  /** Currently pending/staged value (before confirmation) */
  pendingValue: PenaltyValue | null
  /** Set pending value directly */
  setPendingValue: (value: PenaltyValue | null) => void
  /** Clear pending value */
  clearPendingValue: () => void
  /** Handle keyboard event - returns true if handled */
  handleKeyDown: (event: KeyboardEvent | React.KeyboardEvent) => boolean
}

/**
 * Hook for keyboard input of penalty values
 *
 * Supports:
 * - 0 key = Clear (no penalty)
 * - 2 key = Touch (2 seconds)
 * - 5 key = Missed gate (50 seconds)
 * - Enter = Confirm
 * - Escape = Cancel
 * - Delete/Backspace = Clear value
 * - ? or F1 = Show help
 */
export function useKeyboardInput(
  options: KeyboardInputOptions = {}
): KeyboardInputResult {
  const {
    onPenaltyInput,
    onConfirm,
    onCancel,
    onClear,
    onHelp,
    enabled = true,
  } = options

  const [pendingValue, setPendingValue] = useState<PenaltyValue | null>(null)

  const clearPendingValue = useCallback(() => {
    setPendingValue(null)
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent | React.KeyboardEvent): boolean => {
      if (!enabled) {
        return false
      }

      const key = event.key

      // Number keys for penalty values
      if (key === '0' || key === 'Numpad0') {
        event.preventDefault()
        setPendingValue(0)
        onPenaltyInput?.(0)
        return true
      }

      if (key === '2' || key === 'Numpad2') {
        event.preventDefault()
        setPendingValue(2)
        onPenaltyInput?.(2)
        return true
      }

      // 5 key = 50 (missed gate)
      if (key === '5' || key === 'Numpad5') {
        event.preventDefault()
        setPendingValue(50)
        onPenaltyInput?.(50)
        return true
      }

      // Confirmation
      if (key === 'Enter') {
        event.preventDefault()
        onConfirm?.()
        return true
      }

      // Cancel
      if (key === 'Escape') {
        event.preventDefault()
        clearPendingValue()
        onCancel?.()
        return true
      }

      // Clear/Delete
      if (key === 'Delete' || key === 'Backspace') {
        event.preventDefault()
        clearPendingValue()
        onClear?.()
        return true
      }

      // Help
      if (key === '?' || key === 'F1') {
        event.preventDefault()
        onHelp?.()
        return true
      }

      return false
    },
    [
      enabled,
      onPenaltyInput,
      onConfirm,
      onCancel,
      onClear,
      onHelp,
      clearPendingValue,
    ]
  )

  return {
    pendingValue,
    setPendingValue,
    clearPendingValue,
    handleKeyDown,
  }
}
