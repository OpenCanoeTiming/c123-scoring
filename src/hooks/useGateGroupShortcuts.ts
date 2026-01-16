import { useEffect, useCallback } from 'react'
import type { GateGroup } from '../types/ui'

export interface UseGateGroupShortcutsOptions {
  /** All available gate groups (excluding "all gates" group) */
  groups: GateGroup[]
  /** Callback when a group is selected via keyboard */
  onSelectGroup: (groupId: string | null) => void
  /** Whether shortcuts are enabled (disable when modal is open, etc.) */
  enabled?: boolean
}

/**
 * Hook for handling keyboard shortcuts to switch gate groups.
 *
 * Shortcuts:
 * - 0: Show all gates (no group filter)
 * - 1-9: Select group by index (first 9 custom groups)
 *
 * Only triggers when no input element is focused (to avoid conflicts with
 * penalty input in the grid).
 */
export function useGateGroupShortcuts({
  groups,
  onSelectGroup,
  enabled = true,
}: UseGateGroupShortcutsOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Ignore if modifier keys are pressed (Ctrl, Alt, Meta)
      // Shift is OK (for keyboard layouts)
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return
      }

      // Only handle number keys (both main keyboard and numpad)
      const key = event.key

      // 0 = all gates
      if (key === '0') {
        event.preventDefault()
        onSelectGroup(null)
        return
      }

      // 1-9 = select group by index
      const num = parseInt(key, 10)
      if (num >= 1 && num <= 9) {
        // Filter to custom groups (with gates)
        const customGroups = groups.filter((g) => g.gates.length > 0)
        const groupIndex = num - 1

        if (groupIndex < customGroups.length) {
          event.preventDefault()
          onSelectGroup(customGroups[groupIndex].id)
        }
      }
    },
    [groups, onSelectGroup, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}
