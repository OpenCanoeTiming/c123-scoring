/**
 * useSettingsShortcut Hook
 *
 * Handles Ctrl+, keyboard shortcut to open settings.
 */

import { useEffect, useCallback } from 'react'

export interface UseSettingsShortcutOptions {
  /** Callback when shortcut is triggered */
  onOpenSettings: () => void
  /** Whether the shortcut is enabled */
  enabled?: boolean
}

export function useSettingsShortcut({
  onOpenSettings,
  enabled = true,
}: UseSettingsShortcutOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Ctrl+, or Cmd+, (comma)
      if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        event.preventDefault()
        onOpenSettings()
      }
    },
    [enabled, onOpenSettings]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])
}
