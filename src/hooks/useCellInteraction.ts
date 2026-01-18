/**
 * useCellInteraction Hook
 *
 * Handles complex cell interaction patterns:
 * - Multi-tap detection (single, double, triple, quadruple)
 */

import { useCallback, useRef } from 'react'

// Timing constants
const MULTI_TAP_DELAY = 300 // Max time between taps to count as multi-tap

interface TapState {
  count: number
  row: number
  col: number
  timer: ReturnType<typeof setTimeout> | null
}

/**
 * Hook that tracks multi-tap (click) count for cells.
 *
 * Returns a click handler that tracks rapid consecutive clicks on the same cell
 * and calls onTapComplete with the final count after the delay.
 *
 * @param onTapComplete - Called with (count, row, col) after tap sequence completes
 */
export function useMultiTap(
  onTapComplete: (count: number, row: number, col: number) => void
) {
  const tapState = useRef<TapState>({ count: 0, row: -1, col: -1, timer: null })

  const handleClick = useCallback(
    (row: number, col: number) => {
      const state = tapState.current

      // If clicking same cell, increment count
      if (state.row === row && state.col === col) {
        state.count++
        if (state.timer) {
          clearTimeout(state.timer)
        }
      } else {
        // Different cell - process previous if any, then reset
        if (state.count > 0 && state.timer) {
          clearTimeout(state.timer)
          onTapComplete(state.count, state.row, state.col)
        }
        state.count = 1
        state.row = row
        state.col = col
      }

      // Set timer to process taps after delay
      state.timer = setTimeout(() => {
        onTapComplete(state.count, state.row, state.col)
        state.count = 0
        state.row = -1
        state.col = -1
        state.timer = null
      }, MULTI_TAP_DELAY)
    },
    [onTapComplete]
  )

  return handleClick
}
