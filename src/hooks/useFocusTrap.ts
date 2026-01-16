/**
 * useFocusTrap Hook
 *
 * Traps focus within a container element (typically a modal).
 * - Focus cycles between first and last focusable elements
 * - Restores focus to previously focused element when unmounted
 * - Auto-focuses first focusable element on mount
 */

import { useEffect, useRef, useCallback } from 'react'

// Selector for all focusable elements
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export interface UseFocusTrapOptions {
  /** Whether the focus trap is active (default: true) */
  enabled?: boolean
  /** Whether to auto-focus first element on mount (default: true) */
  autoFocus?: boolean
  /** Whether to restore focus on unmount (default: true) */
  restoreFocus?: boolean
}

export function useFocusTrap<T extends HTMLElement>(
  options: UseFocusTrapOptions = {}
) {
  const { enabled = true, autoFocus = true, restoreFocus = true } = options

  const containerRef = useRef<T>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return []
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter(
      (el) =>
        // Filter out elements that are hidden or have display: none
        el.offsetParent !== null &&
        getComputedStyle(el).visibility !== 'hidden'
    )
  }, [])

  // Handle Tab key to trap focus
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement as HTMLElement

      if (event.shiftKey) {
        // Shift + Tab: if on first element, go to last
        if (activeElement === firstElement || !containerRef.current?.contains(activeElement)) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab: if on last element, go to first
        if (activeElement === lastElement || !containerRef.current?.contains(activeElement)) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    },
    [enabled, getFocusableElements]
  )

  // Store reference to previously focused element and set up event listeners
  useEffect(() => {
    if (!enabled) return

    // Store currently focused element
    previouslyFocusedRef.current = document.activeElement as HTMLElement

    // Auto-focus first focusable element
    if (autoFocus) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        const focusableElements = getFocusableElements()
        if (focusableElements.length > 0) {
          focusableElements[0].focus()
        } else if (containerRef.current) {
          // If no focusable elements, focus the container itself
          containerRef.current.setAttribute('tabindex', '-1')
          containerRef.current.focus()
        }
      })
    }

    // Add keydown listener
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      // Restore focus to previously focused element
      if (restoreFocus && previouslyFocusedRef.current) {
        // Use requestAnimationFrame to ensure this happens after modal is removed
        requestAnimationFrame(() => {
          previouslyFocusedRef.current?.focus()
        })
      }
    }
  }, [enabled, autoFocus, restoreFocus, handleKeyDown, getFocusableElements])

  return containerRef
}
