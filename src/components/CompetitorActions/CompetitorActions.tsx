/**
 * CompetitorActions Component
 *
 * Toolbar/context menu for competitor-specific actions:
 * - Remove from course (DNS, DNF, CAP)
 * - Manual timing triggers
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { RemoveReason, ChannelPosition } from '../../types/scoring'
import styles from './CompetitorActions.module.css'

export interface CompetitorActionsProps {
  /** Competitor bib number */
  bib: string
  /** Competitor name for display */
  name: string
  /** Whether the competitor is currently on course */
  isOnCourse: boolean
  /** Whether the competitor has finished */
  isFinished: boolean
  /** Callback when remove action is triggered */
  onRemove?: (bib: string, reason: RemoveReason) => void
  /** Callback when timing action is triggered */
  onTiming?: (bib: string, position: ChannelPosition) => void
  /** Whether actions are disabled (e.g., C123 not connected) */
  disabled?: boolean
  /** Variant: 'toolbar' for inline display, 'menu' for context menu */
  variant?: 'toolbar' | 'menu'
  /** Position for menu variant */
  menuPosition?: { x: number; y: number }
  /** Callback to close menu */
  onClose?: () => void
}

export function CompetitorActions({
  bib,
  name,
  isOnCourse,
  isFinished,
  onRemove,
  onTiming,
  disabled = false,
  variant = 'toolbar',
  menuPosition,
  onClose,
}: CompetitorActionsProps) {
  const [showConfirm, setShowConfirm] = useState<RemoveReason | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (variant !== 'menu' || !onClose) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [variant, onClose])

  const handleRemoveClick = useCallback((reason: RemoveReason) => {
    setShowConfirm(reason)
  }, [])

  const handleConfirm = useCallback(() => {
    if (showConfirm && onRemove) {
      onRemove(bib, showConfirm)
    }
    setShowConfirm(null)
    onClose?.()
  }, [showConfirm, bib, onRemove, onClose])

  const handleCancel = useCallback(() => {
    setShowConfirm(null)
  }, [])

  const handleTiming = useCallback(
    (position: ChannelPosition) => {
      if (onTiming) {
        onTiming(bib, position)
      }
      onClose?.()
    },
    [bib, onTiming, onClose]
  )

  // Remove actions with descriptions
  const removeActions: { reason: RemoveReason; label: string; description: string }[] = [
    { reason: 'DNS', label: 'DNS', description: 'Did Not Start' },
    { reason: 'DNF', label: 'DNF', description: 'Did Not Finish' },
    { reason: 'CAP', label: 'CAP', description: 'Capsized' },
  ]

  // Timing actions
  const timingActions: { position: ChannelPosition; label: string }[] = [
    { position: 'Start', label: 'Start' },
    { position: 'Finish', label: 'Finish' },
  ]

  // Confirmation dialog content
  if (showConfirm) {
    const action = removeActions.find((a) => a.reason === showConfirm)
    return (
      <div
        className={`${styles.container} ${styles[variant]}`}
        ref={menuRef}
        style={
          variant === 'menu' && menuPosition
            ? { left: menuPosition.x, top: menuPosition.y }
            : undefined
        }
      >
        <div className={styles.confirmDialog}>
          <p className={styles.confirmText}>
            Mark <strong>#{bib} {name}</strong> as <strong>{action?.description}</strong>?
          </p>
          <div className={styles.confirmActions}>
            <button
              className={styles.cancelButton}
              onClick={handleCancel}
              autoFocus
            >
              Cancel
            </button>
            <button
              className={styles.confirmButton}
              onClick={handleConfirm}
              data-reason={showConfirm}
            >
              Confirm {action?.label}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${styles.container} ${styles[variant]}`}
      ref={menuRef}
      style={
        variant === 'menu' && menuPosition
          ? { left: menuPosition.x, top: menuPosition.y }
          : undefined
      }
      role={variant === 'menu' ? 'menu' : 'toolbar'}
      aria-label={`Actions for competitor ${bib}`}
    >
      {variant === 'menu' && (
        <div className={styles.menuHeader}>
          <span className={styles.menuBib}>#{bib}</span>
          <span className={styles.menuName}>{name}</span>
        </div>
      )}

      {/* Remove from course section */}
      <div className={styles.section}>
        {variant === 'menu' && <div className={styles.sectionLabel}>Remove from course</div>}
        <div className={styles.buttonGroup}>
          {removeActions.map(({ reason, label, description }) => (
            <button
              key={reason}
              className={`${styles.actionButton} ${styles.removeButton}`}
              onClick={() => handleRemoveClick(reason)}
              disabled={disabled || isFinished}
              title={description}
              role={variant === 'menu' ? 'menuitem' : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual timing section */}
      {isOnCourse && (
        <div className={styles.section}>
          {variant === 'menu' && <div className={styles.sectionLabel}>Manual timing</div>}
          <div className={styles.buttonGroup}>
            {timingActions.map(({ position, label }) => (
              <button
                key={position}
                className={`${styles.actionButton} ${styles.timingButton}`}
                onClick={() => handleTiming(position)}
                disabled={disabled}
                title={`Trigger manual ${label.toLowerCase()} impulse`}
                role={variant === 'menu' ? 'menuitem' : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
