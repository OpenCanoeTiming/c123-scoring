import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardInput, type PenaltyValue } from './useKeyboardInput'

// =============================================================================
// Helper Functions
// =============================================================================

function createKeyboardEvent(
  key: string,
  options: Partial<KeyboardEvent> = {}
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  })
  // Override preventDefault since it's readonly in the constructor
  vi.spyOn(event, 'preventDefault')
  return event
}

// =============================================================================
// Tests
// =============================================================================

describe('useKeyboardInput', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('starts with null pending value', () => {
      const { result } = renderHook(() => useKeyboardInput())

      expect(result.current.pendingValue).toBeNull()
    })
  })

  describe('penalty value input', () => {
    it('handles 0 key for clear penalty', () => {
      const onPenaltyInput = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onPenaltyInput }))

      const event = createKeyboardEvent('0')

      act(() => {
        const handled = result.current.handleKeyDown(event)
        expect(handled).toBe(true)
      })

      expect(event.preventDefault).toHaveBeenCalled()
      expect(onPenaltyInput).toHaveBeenCalledWith(0)
      expect(result.current.pendingValue).toBe(0)
    })

    it('handles 2 key for touch penalty', () => {
      const onPenaltyInput = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onPenaltyInput }))

      const event = createKeyboardEvent('2')

      act(() => {
        result.current.handleKeyDown(event)
      })

      expect(onPenaltyInput).toHaveBeenCalledWith(2)
      expect(result.current.pendingValue).toBe(2)
    })

    it('handles 5 key - sets 50 as preview immediately', () => {
      const onPenaltyInput = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onPenaltyInput }))

      const event = createKeyboardEvent('5')

      act(() => {
        result.current.handleKeyDown(event)
      })

      // Should show 50 as preview, but not call onPenaltyInput yet
      expect(result.current.pendingValue).toBe(50)
      expect(onPenaltyInput).not.toHaveBeenCalled()
    })

    it('handles 5 followed by 0 within delay - immediate 50', () => {
      const onPenaltyInput = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onPenaltyInput }))

      // Press 5
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('5'))
      })

      // Press 0 within delay
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('0'))
      })

      expect(onPenaltyInput).toHaveBeenCalledWith(50)
      expect(result.current.pendingValue).toBe(50)
    })

    it('handles 5 alone - submits 50 after delay', () => {
      const onPenaltyInput = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onPenaltyInput }))

      // Press 5
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('5'))
      })

      expect(onPenaltyInput).not.toHaveBeenCalled()

      // Advance time past the delay (300ms)
      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(onPenaltyInput).toHaveBeenCalledWith(50)
    })

    it('handles double 5 press - submits 50 immediately', () => {
      const onPenaltyInput = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onPenaltyInput }))

      // Press 5 twice
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('5'))
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('5'))
      })

      expect(onPenaltyInput).toHaveBeenCalledWith(50)
      expect(onPenaltyInput).toHaveBeenCalledTimes(1)
    })

    it('handles 2 after pending 5 - cancels 50 and submits 2', () => {
      const onPenaltyInput = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onPenaltyInput }))

      // Press 5
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('5'))
      })

      // Press 2 - should cancel the pending 5
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('2'))
      })

      expect(onPenaltyInput).toHaveBeenCalledWith(2)
      expect(result.current.pendingValue).toBe(2)

      // Advance time - should NOT submit 50
      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(onPenaltyInput).toHaveBeenCalledTimes(1)
      expect(onPenaltyInput).toHaveBeenLastCalledWith(2)
    })

    it('handles numpad keys', () => {
      const onPenaltyInput = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onPenaltyInput }))

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Numpad0'))
      })
      expect(onPenaltyInput).toHaveBeenCalledWith(0)

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Numpad2'))
      })
      expect(onPenaltyInput).toHaveBeenCalledWith(2)

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Numpad5'))
        vi.advanceTimersByTime(300)
      })
      expect(onPenaltyInput).toHaveBeenCalledWith(50)
    })
  })

  describe('confirmation and cancellation', () => {
    it('handles Enter key - calls onConfirm', () => {
      const onConfirm = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onConfirm }))

      const event = createKeyboardEvent('Enter')

      act(() => {
        const handled = result.current.handleKeyDown(event)
        expect(handled).toBe(true)
      })

      expect(event.preventDefault).toHaveBeenCalled()
      expect(onConfirm).toHaveBeenCalled()
    })

    it('handles Enter with pending 5 - submits 50 first', () => {
      const onPenaltyInput = vi.fn()
      const onConfirm = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onPenaltyInput, onConfirm }))

      // Press 5
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('5'))
      })

      // Press Enter
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Enter'))
      })

      expect(onPenaltyInput).toHaveBeenCalledWith(50)
      expect(onConfirm).toHaveBeenCalled()
    })

    it('handles Escape key - calls onCancel and clears pending', () => {
      const onCancel = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onCancel }))

      // Set a pending value first
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('2'))
      })
      expect(result.current.pendingValue).toBe(2)

      // Press Escape
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Escape'))
      })

      expect(onCancel).toHaveBeenCalled()
      expect(result.current.pendingValue).toBeNull()
    })

    it('handles Escape with pending 5 - cancels timeout', () => {
      const onPenaltyInput = vi.fn()
      const onCancel = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onPenaltyInput, onCancel }))

      // Press 5
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('5'))
      })

      // Press Escape
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Escape'))
      })

      // Advance time - 50 should NOT be submitted
      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(onPenaltyInput).not.toHaveBeenCalled()
      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe('clear/delete', () => {
    it('handles Delete key - calls onClear', () => {
      const onClear = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onClear }))

      const event = createKeyboardEvent('Delete')

      act(() => {
        const handled = result.current.handleKeyDown(event)
        expect(handled).toBe(true)
      })

      expect(event.preventDefault).toHaveBeenCalled()
      expect(onClear).toHaveBeenCalled()
    })

    it('handles Backspace key - calls onClear', () => {
      const onClear = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onClear }))

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Backspace'))
      })

      expect(onClear).toHaveBeenCalled()
    })

    it('clears pending value on Delete', () => {
      const { result } = renderHook(() => useKeyboardInput())

      // Set a pending value
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('2'))
      })
      expect(result.current.pendingValue).toBe(2)

      // Press Delete
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Delete'))
      })

      expect(result.current.pendingValue).toBeNull()
    })

    it('cancels pending 5 on Delete', () => {
      const onPenaltyInput = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onPenaltyInput }))

      // Press 5
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('5'))
      })

      // Press Delete
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Delete'))
      })

      // Advance time - 50 should NOT be submitted
      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(onPenaltyInput).not.toHaveBeenCalled()
    })
  })

  describe('help', () => {
    it('handles ? key - calls onHelp', () => {
      const onHelp = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onHelp }))

      act(() => {
        const handled = result.current.handleKeyDown(createKeyboardEvent('?'))
        expect(handled).toBe(true)
      })

      expect(onHelp).toHaveBeenCalled()
    })

    it('handles F1 key - calls onHelp', () => {
      const onHelp = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onHelp }))

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('F1'))
      })

      expect(onHelp).toHaveBeenCalled()
    })
  })

  describe('enabled state', () => {
    it('ignores input when disabled', () => {
      const onPenaltyInput = vi.fn()
      const { result } = renderHook(() =>
        useKeyboardInput({ onPenaltyInput, enabled: false })
      )

      act(() => {
        const handled = result.current.handleKeyDown(createKeyboardEvent('2'))
        expect(handled).toBe(false)
      })

      expect(onPenaltyInput).not.toHaveBeenCalled()
    })

    it('processes input when enabled', () => {
      const onPenaltyInput = vi.fn()
      const { result } = renderHook(() =>
        useKeyboardInput({ onPenaltyInput, enabled: true })
      )

      act(() => {
        const handled = result.current.handleKeyDown(createKeyboardEvent('2'))
        expect(handled).toBe(true)
      })

      expect(onPenaltyInput).toHaveBeenCalledWith(2)
    })

    it('defaults to enabled', () => {
      const onPenaltyInput = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onPenaltyInput }))

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('2'))
      })

      expect(onPenaltyInput).toHaveBeenCalled()
    })
  })

  describe('unhandled keys', () => {
    it('returns false for unhandled keys', () => {
      const { result } = renderHook(() => useKeyboardInput())

      act(() => {
        const handled1 = result.current.handleKeyDown(createKeyboardEvent('a'))
        const handled2 = result.current.handleKeyDown(createKeyboardEvent('1'))
        const handled3 = result.current.handleKeyDown(createKeyboardEvent('ArrowUp'))

        expect(handled1).toBe(false)
        expect(handled2).toBe(false)
        expect(handled3).toBe(false)
      })
    })

    it('does not prevent default for unhandled keys', () => {
      const { result } = renderHook(() => useKeyboardInput())

      const event = createKeyboardEvent('a')

      act(() => {
        result.current.handleKeyDown(event)
      })

      expect(event.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('setPendingValue and clearPendingValue', () => {
    it('allows direct setting of pending value', () => {
      const { result } = renderHook(() => useKeyboardInput())

      act(() => {
        result.current.setPendingValue(2)
      })

      expect(result.current.pendingValue).toBe(2)
    })

    it('allows clearing pending value', () => {
      const { result } = renderHook(() => useKeyboardInput())

      act(() => {
        result.current.setPendingValue(50)
      })

      act(() => {
        result.current.clearPendingValue()
      })

      expect(result.current.pendingValue).toBeNull()
    })
  })

  describe('cleanup', () => {
    it('clears timeout on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      const { result, unmount } = renderHook(() => useKeyboardInput())

      // Press 5 to start a timeout
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('5'))
      })

      // Unmount before timeout completes
      unmount()

      // clearTimeout should have been called
      expect(clearTimeoutSpy).toHaveBeenCalled()

      clearTimeoutSpy.mockRestore()
    })
  })

  describe('React.KeyboardEvent compatibility', () => {
    it('works with React keyboard events', () => {
      const onPenaltyInput = vi.fn()
      const { result } = renderHook(() => useKeyboardInput({ onPenaltyInput }))

      // Simulate a React.KeyboardEvent (same interface)
      const event = {
        key: '2',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent

      act(() => {
        result.current.handleKeyDown(event)
      })

      expect(onPenaltyInput).toHaveBeenCalledWith(2)
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })
})
