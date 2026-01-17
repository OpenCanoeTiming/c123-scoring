/**
 * GateGroupIndicatorRow
 *
 * Displays gate group indicators as a row above gate column headers.
 * Each group shows as a colored span over its gates.
 * Clicking a group activates it (highlights those columns, dims others).
 */

import type { GateGroup } from '../../types/ui'
import './GateGroupIndicatorRow.css'

interface GateGroupIndicatorRowProps {
  /** All available gate groups (excluding 'all') */
  groups: GateGroup[]
  /** Total number of gates in the race */
  totalGates: number
  /** Currently active group ID (null = all gates visible) */
  activeGroupId: string | null
  /** Callback when a group is clicked */
  onGroupClick: (groupId: string | null) => void
  /** Number of fixed columns before gate columns (check, #, bib, name, time, pen) */
  fixedColumnsCount: number
  /** Array of visible gate indices (0-based) when filtering is active */
  visibleGateIndices: number[]
}

interface GroupSpan {
  group: GateGroup
  startCol: number // 0-based column index within visible gates
  endCol: number // 0-based column index (inclusive)
  span: number // number of columns
}

/**
 * Calculate group spans based on visible gates
 */
function calculateGroupSpans(
  groups: GateGroup[],
  visibleGateIndices: number[]
): GroupSpan[] {
  if (groups.length === 0 || visibleGateIndices.length === 0) {
    return []
  }

  const spans: GroupSpan[] = []

  for (const group of groups) {
    if (group.gates.length === 0) continue // Skip "all gates" group

    // Find which visible columns this group covers
    const visibleCols: number[] = []
    visibleGateIndices.forEach((gateIdx, colIdx) => {
      const gateNum = gateIdx + 1 // Convert to 1-based gate number
      if (group.gates.includes(gateNum)) {
        visibleCols.push(colIdx)
      }
    })

    if (visibleCols.length === 0) continue

    // For now, create a single span from min to max
    // (handles non-contiguous gates with a full span)
    const startCol = Math.min(...visibleCols)
    const endCol = Math.max(...visibleCols)

    spans.push({
      group,
      startCol,
      endCol,
      span: endCol - startCol + 1,
    })
  }

  return spans
}

export function GateGroupIndicatorRow({
  groups,
  totalGates,
  activeGroupId,
  onGroupClick,
  fixedColumnsCount,
  visibleGateIndices,
}: GateGroupIndicatorRowProps) {
  // Filter out "all" group
  const customGroups = groups.filter((g) => g.id !== 'all' && g.gates.length > 0)

  // Don't render if no custom groups or no gates
  if (customGroups.length === 0 || totalGates === 0) {
    return null
  }

  // Calculate spans for each group
  const groupSpans = calculateGroupSpans(customGroups, visibleGateIndices)

  if (groupSpans.length === 0) {
    return null
  }

  // Check for overlapping groups - need multiple rows if overlapping
  // For now, render in a single row with stacking via positioning
  // Future: detect overlaps and render multiple tr elements

  const handleGroupClick = (groupId: string) => {
    // If clicking the active group, deactivate it
    if (activeGroupId === groupId) {
      onGroupClick(null)
    } else {
      onGroupClick(groupId)
    }
  }

  return (
    <tr className="gate-group-indicator-row">
      {/* Fixed columns spacer */}
      <td colSpan={fixedColumnsCount} className="gate-group-indicator-spacer" />

      {/* Gate columns with group indicators */}
      {visibleGateIndices.map((gateIdx, colIdx) => {
        const gateNum = gateIdx + 1

        // Find if any group starts at this column
        const startingSpan = groupSpans.find((s) => s.startCol === colIdx)

        // Find if this column is part of any group
        const containingSpans = groupSpans.filter(
          (s) => colIdx >= s.startCol && colIdx <= s.endCol
        )

        if (startingSpan) {
          // Render the group indicator that starts here
          const isActive = activeGroupId === startingSpan.group.id
          const color = startingSpan.group.color || 'var(--color-accent)'

          return (
            <td
              key={gateNum}
              colSpan={startingSpan.span}
              className={`gate-group-indicator ${isActive ? 'gate-group-indicator--active' : ''}`}
              style={{
                '--group-color': color,
              } as React.CSSProperties}
            >
              <button
                type="button"
                className="gate-group-indicator-btn"
                onClick={() => handleGroupClick(startingSpan.group.id)}
                title={`${startingSpan.group.name}: Gates ${startingSpan.group.gates.join(', ')}`}
              >
                {startingSpan.group.name}
              </button>
            </td>
          )
        }

        // If this column is covered by a spanning group, skip it
        if (containingSpans.some((s) => s.startCol !== colIdx)) {
          return null
        }

        // Empty cell (no group covers this gate)
        return <td key={gateNum} className="gate-group-indicator-empty" />
      })}
    </tr>
  )
}
