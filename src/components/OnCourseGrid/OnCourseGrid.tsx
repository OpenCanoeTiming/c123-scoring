import { useRef, useEffect, useCallback } from 'react'
import type { C123OnCourseCompetitor, C123RaceConfigData } from '../../types/c123server'
import {
  useFocusNavigation,
  useKeyboardInput,
  type PenaltyValue,
} from '../../hooks'
import { parseGatesWithConfig } from '../../utils/gates'
import { GridCell } from './GridCell'
import './OnCourseGrid.css'

export interface OnCourseGridProps {
  competitors: C123OnCourseCompetitor[]
  raceConfig: C123RaceConfigData | null
  selectedRaceId: string | null
  /** Callback when a penalty is submitted */
  onPenaltySubmit?: (bib: string, gate: number, value: PenaltyValue) => void
}

export function OnCourseGrid({
  competitors,
  raceConfig,
  selectedRaceId,
  onPenaltySubmit,
}: OnCourseGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const focusedCellRef = useRef<HTMLTableCellElement>(null)

  // Filter competitors by selected race
  const filteredCompetitors = selectedRaceId
    ? competitors.filter((c) => c.raceId === selectedRaceId)
    : competitors

  // Sort by position (1 = closest to finish)
  const sortedCompetitors = [...filteredCompetitors].sort(
    (a, b) => a.position - b.position
  )

  const nrGates = raceConfig?.nrGates ?? 0
  const gateConfig = raceConfig?.gateConfig ?? ''

  // Focus navigation
  const {
    position,
    setPosition,
    handleKeyDown: handleNavKeyDown,
    isFocused,
    getCellId,
    activeCellId,
  } = useFocusNavigation({
    rowCount: sortedCompetitors.length,
    columnCount: nrGates,
  })

  // Get current competitor and gate info for keyboard input
  const currentCompetitor = sortedCompetitors[position.row]
  const currentGate = position.column + 1 // 1-based

  // Keyboard input for penalty values
  const {
    pendingValue,
    handleKeyDown: handleInputKeyDown,
  } = useKeyboardInput({
    enabled: sortedCompetitors.length > 0 && nrGates > 0,
    onPenaltyInput: (value) => {
      // Immediate submit on input
      if (!currentCompetitor || !onPenaltySubmit) return
      onPenaltySubmit(currentCompetitor.bib, currentGate, value)
    },
    onClear: () => {
      // Clear = set to 0
      if (!currentCompetitor || !onPenaltySubmit) return
      onPenaltySubmit(currentCompetitor.bib, currentGate, 0)
    },
  })

  // Combined keyboard handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // First try input handling (numbers, enter, escape)
      if (handleInputKeyDown(event)) return

      // Then try navigation (arrows, home, end, etc)
      handleNavKeyDown(event)
    },
    [handleInputKeyDown, handleNavKeyDown]
  )

  // Focus the grid when it mounts or when position changes
  useEffect(() => {
    if (focusedCellRef.current) {
      focusedCellRef.current.focus()
    }
  }, [position])

  // Handle cell click
  const handleCellClick = useCallback(
    (rowIndex: number, columnIndex: number) => {
      setPosition({ row: rowIndex, column: columnIndex })
      gridRef.current?.focus()
    },
    [setPosition]
  )

  if (sortedCompetitors.length === 0) {
    return (
      <div className="on-course-grid on-course-grid--empty">
        <p>No competitors on course</p>
      </div>
    )
  }

  return (
    <div
      ref={gridRef}
      className="on-course-grid"
      role="grid"
      aria-label="Penalty grid"
      aria-activedescendant={activeCellId ?? undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <table className="on-course-table">
        <thead>
          <tr role="row">
            <th className="col-pos" role="columnheader">#</th>
            <th className="col-bib" role="columnheader">Bib</th>
            <th className="col-name" role="columnheader">Name</th>
            <th className="col-time" role="columnheader">Time</th>
            <th className="col-pen" role="columnheader">Pen</th>
            {Array.from({ length: nrGates }, (_, i) => {
              const gateType = gateConfig[i] ?? 'N'
              return (
                <th
                  key={i + 1}
                  className={`col-gate ${gateType === 'R' ? 'gate-reverse' : 'gate-normal'}`}
                  role="columnheader"
                >
                  {i + 1}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sortedCompetitors.map((competitor, rowIndex) => {
            const penalties = parseGatesWithConfig(competitor.gates, gateConfig)

            return (
              <tr
                key={competitor.bib}
                className={`competitor-row ${competitor.completed ? 'completed' : 'on-course'}`}
                role="row"
              >
                <td className="col-pos" role="gridcell">{competitor.position}</td>
                <td className="col-bib" role="gridcell">{competitor.bib}</td>
                <td className="col-name" role="gridcell">
                  <span className="name">{competitor.name}</span>
                  <span className="club">{competitor.club}</span>
                </td>
                <td className="col-time" role="gridcell">{competitor.time}s</td>
                <td className="col-pen" role="gridcell">
                  {competitor.pen > 0 ? `+${competitor.pen}` : ''}
                </td>
                {penalties.map((penalty, colIndex) => {
                  const cellIsFocused = isFocused(rowIndex, colIndex)
                  return (
                    <GridCell
                      key={penalty.gate}
                      ref={cellIsFocused ? focusedCellRef : undefined}
                      gate={penalty.gate}
                      value={penalty.value as PenaltyValue | null}
                      pendingValue={
                        cellIsFocused ? pendingValue : null
                      }
                      gateType={penalty.type}
                      isFocused={cellIsFocused}
                      id={getCellId(rowIndex, colIndex)}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    />
                  )
                })}
                {/* Fill remaining columns if competitor has fewer gates than config */}
                {penalties.length < nrGates &&
                  Array.from({ length: nrGates - penalties.length }, (_, i) => {
                    const colIndex = penalties.length + i
                    const cellIsFocused = isFocused(rowIndex, colIndex)
                    return (
                      <GridCell
                        key={`empty-${i}`}
                        ref={cellIsFocused ? focusedCellRef : undefined}
                        gate={penalties.length + i + 1}
                        value={null}
                        pendingValue={cellIsFocused ? pendingValue : null}
                        gateType={(gateConfig[penalties.length + i] as 'N' | 'R') ?? 'N'}
                        isFocused={cellIsFocused}
                        id={getCellId(rowIndex, colIndex)}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      />
                    )
                  })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
