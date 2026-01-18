/**
 * PenaltyContextMenu - Context menu for quick penalty selection
 *
 * Appears on long press or right-click on a penalty cell.
 */

import { useEffect, useRef } from 'react'
import type { PenaltyValue } from '../../types/scoring'
import styles from './PenaltyContextMenu.module.css'

export interface PenaltyContextMenuProps {
  /** X position (client coordinates) */
  x: number
  /** Y position (client coordinates) */
  y: number
  /** Current value in the cell */
  currentValue: PenaltyValue
  /** Callback when a value is selected */
  onSelect: (value: PenaltyValue) => void
  /** Callback to close the menu */
  onClose: () => void
}

interface MenuOption {
  value: PenaltyValue
  label: string
  shortcut: string
}

const MENU_OPTIONS: MenuOption[] = [
  { value: 0, label: 'Clear (0)', shortcut: '0' },
  { value: 2, label: 'Touch (2s)', shortcut: '2' },
  { value: 50, label: 'Missed (50s)', shortcut: '5' },
  { value: null, label: 'Delete', shortcut: 'Del' },
]

export function PenaltyContextMenu({
  x,
  y,
  currentValue,
  onSelect,
  onClose,
}: PenaltyContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Add listeners after a small delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (!menuRef.current) return

    const menu = menuRef.current
    const rect = menu.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Adjust if menu goes off right edge
    if (rect.right > viewportWidth) {
      menu.style.left = `${x - rect.width}px`
    }

    // Adjust if menu goes off bottom edge
    if (rect.bottom > viewportHeight) {
      menu.style.top = `${y - rect.height}px`
    }
  }, [x, y])

  const handleSelect = (value: PenaltyValue) => {
    onSelect(value)
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={{ left: x, top: y }}
      role="menu"
      aria-label="Penalty options"
    >
      {MENU_OPTIONS.map((option) => {
        const isActive = option.value === currentValue
        return (
          <button
            key={option.label}
            className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
            onClick={() => handleSelect(option.value)}
            role="menuitem"
          >
            <span className={styles.menuItemLabel}>{option.label}</span>
            <span className={styles.menuItemShortcut}>{option.shortcut}</span>
          </button>
        )
      })}
    </div>
  )
}
