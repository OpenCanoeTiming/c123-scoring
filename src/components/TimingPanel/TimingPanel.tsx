/**
 * TimingPanel Component
 *
 * Panel for manual timing impulses when photocells fail.
 * Provides Start/Finish/Split buttons for selected competitor.
 */

import { useState, useCallback } from 'react'
import type { ChannelPosition } from '../../types/scoring'
import styles from './TimingPanel.module.css'

export interface TimingPanelProps {
  /** Selected competitor bib (null if none selected) */
  selectedBib?: string | null
  /** Selected competitor name for display */
  selectedName?: string | null
  /** Callback when timing impulse is triggered */
  onTiming: (bib: string, position: ChannelPosition) => void
  /** Whether panel is disabled (e.g., C123 not connected) */
  disabled?: boolean
  /** Whether to show expanded view with split times */
  showSplits?: boolean
}

type TimingAction = {
  position: ChannelPosition
  label: string
  description: string
  variant: 'primary' | 'secondary'
}

const TIMING_ACTIONS: TimingAction[] = [
  {
    position: 'Start',
    label: 'Start',
    description: 'Trigger manual start impulse',
    variant: 'primary',
  },
  {
    position: 'Finish',
    label: 'Finish',
    description: 'Trigger manual finish impulse',
    variant: 'primary',
  },
  {
    position: 'Split1',
    label: 'Split 1',
    description: 'Trigger split 1 time',
    variant: 'secondary',
  },
  {
    position: 'Split2',
    label: 'Split 2',
    description: 'Trigger split 2 time',
    variant: 'secondary',
  },
]

export function TimingPanel({
  selectedBib,
  selectedName,
  onTiming,
  disabled = false,
  showSplits = false,
}: TimingPanelProps) {
  const [pendingAction, setPendingAction] = useState<ChannelPosition | null>(null)

  const handleTimingClick = useCallback(
    (position: ChannelPosition) => {
      if (!selectedBib) return

      // Show confirmation for destructive timing actions
      setPendingAction(position)
    },
    [selectedBib]
  )

  const handleConfirm = useCallback(() => {
    if (!selectedBib || !pendingAction) return

    onTiming(selectedBib, pendingAction)
    setPendingAction(null)
  }, [selectedBib, pendingAction, onTiming])

  const handleCancel = useCallback(() => {
    setPendingAction(null)
  }, [])

  const visibleActions = showSplits
    ? TIMING_ACTIONS
    : TIMING_ACTIONS.filter((a) => a.position === 'Start' || a.position === 'Finish')

  // Confirmation dialog
  if (pendingAction) {
    const action = TIMING_ACTIONS.find((a) => a.position === pendingAction)
    return (
      <div className={styles.panel}>
        <div className={styles.confirmDialog}>
          <p className={styles.confirmText}>
            Send <strong>{action?.label}</strong> impulse for{' '}
            <strong>#{selectedBib} {selectedName}</strong>?
          </p>
          <div className={styles.confirmActions}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              Cancel
            </button>
            <button className={styles.confirmButton} onClick={handleConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Manual Timing</h3>
        {selectedBib ? (
          <span className={styles.selectedCompetitor}>
            #{selectedBib} {selectedName}
          </span>
        ) : (
          <span className={styles.noSelection}>No competitor selected</span>
        )}
      </div>

      <div className={styles.actions}>
        {visibleActions.map((action) => (
          <button
            key={action.position}
            className={`${styles.timingButton} ${styles[action.variant]}`}
            onClick={() => handleTimingClick(action.position)}
            disabled={disabled || !selectedBib}
            title={action.description}
          >
            {action.label}
          </button>
        ))}
      </div>

      <p className={styles.helpText}>
        Use when photocells fail. Click to trigger manual impulse.
      </p>
    </div>
  )
}
