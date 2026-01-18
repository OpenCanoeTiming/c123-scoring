import { useCallback, useState, useRef, useEffect } from 'react'

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

// Delay to wait for second digit when typing "50"
const MULTI_DIGIT_DELAY = 300

/**
 * Hook for keyboard input of penalty values
 *
 * Supports:
 * - 0 key = Clear (no penalty)
 * - 2 key = Touch (2 seconds)
 * - 5 key = Missed gate (50 seconds)
 * - 50 keys = Missed gate (50 seconds) - when typed quickly
 * - Enter = Confirm
 * - Escape = Cancel
 * - Delete/Backspace = Clear value (sends null)
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

  // Track pending "5" input waiting for possible "0"
  const pendingFiveRef = useRef<boolean>(false)
  const fiveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (fiveTimeoutRef.current) {
        clearTimeout(fiveTimeoutRef.current)
      }
    }
  }, [])

  const clearPendingValue = useCallback(() => {
    setPendingValue(null)
  }, [])

  const submitFifty = useCallback(() => {
    pendingFiveRef.current = false
    if (fiveTimeoutRef.current) {
      clearTimeout(fiveTimeoutRef.current)
      fiveTimeoutRef.current = null
    }
    setPendingValue(50)
    onPenaltyInput?.(50)
  }, [onPenaltyInput])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent | React.KeyboardEvent): boolean => {
      if (!enabled) {
        return false
      }

      const key = event.key

      // Number keys for penalty values
      if (key === '0' || key === 'Numpad0') {
        event.preventDefault()

        // If we had a pending "5", this completes "50"
        if (pendingFiveRef.current) {
          submitFifty()
          return true
        }

        setPendingValue(0)
        onPenaltyInput?.(0)
        return true
      }

      if (key === '2' || key === 'Numpad2') {
        event.preventDefault()

        // Cancel any pending "5"
        if (pendingFiveRef.current) {
          pendingFiveRef.current = false
          if (fiveTimeoutRef.current) {
            clearTimeout(fiveTimeoutRef.current)
            fiveTimeoutRef.current = null
          }
        }

        setPendingValue(2)
        onPenaltyInput?.(2)
        return true
      }

      // 5 key = 50 (missed gate) - wait briefly for possible "0"
      if (key === '5' || key === 'Numpad5') {
        event.preventDefault()

        // If already pending, submit immediately
        if (pendingFiveRef.current) {
          submitFifty()
          return true
        }

        // Start waiting for possible "0"
        pendingFiveRef.current = true
        setPendingValue(50) // Show 50 immediately as preview

        // After delay, submit 50 if no "0" was pressed
        fiveTimeoutRef.current = setTimeout(() => {
          if (pendingFiveRef.current) {
            submitFifty()
          }
        }, MULTI_DIGIT_DELAY)

        return true
      }

      // Confirmation
      if (key === 'Enter') {
        event.preventDefault()

        // If we have pending 5, submit it first
        if (pendingFiveRef.current) {
          submitFifty()
        }

        onConfirm?.()
        return true
      }

      // Cancel
      if (key === 'Escape') {
        event.preventDefault()

        // Cancel pending 5
        if (pendingFiveRef.current) {
          pendingFiveRef.current = false
          if (fiveTimeoutRef.current) {
            clearTimeout(fiveTimeoutRef.current)
            fiveTimeoutRef.current = null
          }
        }

        clearPendingValue()
        onCancel?.()
        return true
      }

      // Clear/Delete - sends null to clear the penalty
      if (key === 'Delete' || key === 'Backspace') {
        event.preventDefault()

        // Cancel pending 5
        if (pendingFiveRef.current) {
          pendingFiveRef.current = false
          if (fiveTimeoutRef.current) {
            clearTimeout(fiveTimeoutRef.current)
            fiveTimeoutRef.current = null
          }
        }

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
      submitFifty,
    ]
  )

  return {
    pendingValue,
    setPendingValue,
    clearPendingValue,
    handleKeyDown,
  }
}
