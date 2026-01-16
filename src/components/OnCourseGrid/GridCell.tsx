import { forwardRef } from 'react'
import type { PenaltyValue } from '../../hooks'
import { formatPenalty, getPenaltyClass } from '../../utils/gates'

export interface GridCellProps {
  /** Gate number (1-based) */
  gate: number
  /** Current penalty value */
  value: PenaltyValue | null
  /** Pending value (being edited) */
  pendingValue?: PenaltyValue | null
  /** Gate type (N = normal, R = reverse) */
  gateType: 'N' | 'R'
  /** Whether this cell has focus */
  isFocused: boolean
  /** Cell ID for accessibility */
  id: string
  /** Click handler */
  onClick?: () => void
}

/**
 * Individual gate cell in the penalty grid
 *
 * Displays:
 * - Current penalty value with color coding
 * - Focus ring when selected
 * - Pending value during editing
 */
export const GridCell = forwardRef<HTMLTableCellElement, GridCellProps>(
  function GridCell(
    { gate, value, pendingValue, gateType, isFocused, id, onClick },
    ref
  ) {
    // Use pending value if available, otherwise use current value
    const displayValue = pendingValue ?? value

    const penaltyClass = displayValue !== null ? getPenaltyClass(displayValue) : 'penalty-empty'
    const gateTypeClass = gateType === 'R' ? 'gate-reverse' : 'gate-normal'

    return (
      <td
        ref={ref}
        id={id}
        className={`col-gate ${penaltyClass} ${gateTypeClass} ${isFocused ? 'cell-focused' : ''} ${pendingValue !== null ? 'cell-pending' : ''}`}
        role="gridcell"
        aria-selected={isFocused}
        aria-label={`Gate ${gate}: ${displayValue !== null ? formatPenalty(displayValue) : 'empty'}`}
        tabIndex={isFocused ? 0 : -1}
        onClick={onClick}
        data-gate={gate}
      >
        {formatPenalty(displayValue)}
      </td>
    )
  }
)
