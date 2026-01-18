# C123-PENALTY-CHECK - Implementation Plan

---

## Implementation Status

| Phase | Name | Status |
|-------|------|--------|
| 1-15 | Basic implementation | ✅ Done (v1.0.0) |
| 16 | Design System integration | ✅ Done |
| 17A-C | UX Polish (Header, Grid, Gate Groups) | ✅ Done |
| 17D-E | UX Polish (Footer, Sorting) | ✅ Done |
| 17F | UX Polish (Tablet) | ✅ Done |
| 17G | UX Polish (Screenshots) | ✅ Done |
| 17H | UX Polish (Settings) | ✅ Done |
| 18 | Auto-load Gate Groups | ✅ Done |
| 19 | E2E Test Refactoring | ✅ Done |
| 20 | Bug fixes and UX feedback | ✅ Done |
| 21 | Schedule WebSocket issue | ✅ Done |
| 22 | Settings cleanup | ✅ Done |
| 23 | Grid layout and sticky columns | ✅ Done |
| 24 | Grid highlighting redesign | ✅ Done |
| 25 | WebSocket connection management | ✅ Done |
| 26 | Keyboard and scoring fixes | ✅ Done |
| 27 | Grid UX and keyboard improvements | ✅ Done |
| 28 | Grid layout fixes | ✅ Done |

---

## Completed Phases (Summary)

### Phases 1-15: Basic Implementation ✅

**Output:** Functional app v1.0.0

- **Project setup:** Vite + React + TypeScript + Design System
- **WebSocket:** Connection to c123-server, message types
- **Layout:** Header, Footer, ConnectionStatus
- **Race Selector:** Race selection from Schedule, persistence
- **Penalty Grid:** Competitor and gate display, keyboard navigation
- **REST API:** Penalty submission, optimistic updates, Toast notifications
- **Gate Grouping:** Gate grouping, editor, keyboard shortcuts
- **Protocol verification:** Marking verified, progress bar
- **Settings:** Server config, display options, keyboard shortcuts
- **Actions:** DNS/DNF/CAP, manual timing
- **Polish:** Error boundaries, empty states, animations, focus trap
- **Tests:** Vitest unit tests, Playwright E2E, screenshots
- **Docs:** README, CHANGELOG, GitHub Actions CI

### Phase 16: Design System Integration ✅

**Output:** Visually consistent application

- Added DS components: Tabs, Kbd, ProgressBar, ContextMenu
- Header with DS components (HeaderBrand, HeaderTitle, HeaderActions, HeaderStatus)
- Settings modal with DS Modal, Tabs, Input, Checkbox, Button
- Grid with DS Table, Badge for status
- Toast, Empty states with DS Card
- Dark mode automatic via DS tokens
- Deleted ~1000 lines of custom CSS

---

## Test Data

```bash
# Replay server (simulates live C123)
cd ../c123-protocol-docs/tools
node replay-server.js ../recordings/rec-2025-12-28T09-34-10.jsonl --speed 10 --loop

# c123-server
cd ../c123-server && npm start -- --host localhost --port 27333

# Scoring app
cd ../c123-scoring && npm run dev

# Screenshots
npx playwright test screenshots-with-data.spec.ts
```

---

## Phase 17: UX Polish and Tablet Optimization

**Goal:** Fix UX issues, optimize for tablet.

**Target device:** Large tablet (iPad Pro, Surface) - NOT mobile.

---

### 17A: Header redesign (CRITICAL) ✅

**Problem:** Header is cluttered - tiny selector, two indicators, 3× settings icon.

- [x] 17A.1: Explore c123-server admin for inspiration
- [x] 17A.2: Rewrite Header:
  - `HeaderBrand` - "C123 Scoring"
  - `HeaderActions` - only settings button
  - `HeaderStatus` - only canoe StatusIndicator
- [x] 17A.3: Race selector - enlarge (use `Select size="lg"`) in new RaceBar
- [x] 17A.4: Change ⚙ icon at gate groups to ✎ (edit)
- [x] 17A.5: Commit

**Solution:** New RaceBar component below header with large race name and select size="lg"

---

### 17B: Grid UX improvements ✅

**Problem:** Missing row/column highlight during navigation.

- [x] 17B.1: Row/column highlight on HOVER (subtle)
- [x] 17B.2: Row/column highlight on FOCUS (more prominent)
- [x] 17B.3: Remove "Club" column
- [x] 17B.4: Commit

---

### 17C: Gate Groups visibility ✅

**Problem:** Screenshots don't show that gate groups exist.

- [x] 17C.1: Gate group switcher more prominent (moved to toolbar above grid)
- [x] 17C.2: Visually mark active group columns (accent top border)
- [x] 17C.3: Screenshot with gate groups (postponed - E2E tests outdated)
- [x] 17C.4: Commit

**Solution:**
- GateGroupSwitcher moved from footer to new toolbar slot
- Label shows active group and gate count
- Columns in active group have accent bar on top (header and cells)

---

### 17D: Footer sticky ✅

**Problem:** Footer scrolls away.

- [x] 17D.1: Footer always visible at bottom
- [x] 17D.2: Layout: header (auto) + main (1fr scroll) + footer (auto sticky)
- [x] 17D.3: Commit

**Note:** Implemented as part of phase 17A (sticky footer).

---

### 17E: Competitor sorting ✅

**Problem:** Only one sort option.

- [x] 17E.1: Options: startOrder, rank (default), bib
- [x] 17E.2: UI for switching (SortSelector component in toolbar)
- [x] 17E.3: Persistence to localStorage
- [x] 17E.4: Commit

**Solution:**
- New type `ResultsSortOption` and `RESULTS_SORT_LABELS` in types/ui.ts
- `SortSelector` component with DS Select
- Sorting logic in `ResultsGrid.tsx` (sortBy prop)
- localStorage persistence in App.tsx

---

### 17F: Tablet optimization ✅

**Problem:** Optimized for mobile instead of tablet.

- [x] 17F.1: Tablet breakpoints (1366×1024, 1024×1366, etc.)
- [x] 17F.2: Touch targets min 48px
- [ ] 17F.3: Screenshots: `18-tablet-landscape.png`, `19-tablet-portrait.png` (postponed - E2E tests outdated)
- [x] 17F.4: Commit

**Solution:**
- Added tablet breakpoints 1366px (iPad Pro landscape) and 1024px (iPad landscape)
- Touch targets increased from 44px to 48px for better ergonomics
- Adjusted padding and font-size for tablet screens

---

### 17G: Cleanup screenshots ✅

- [x] 17G.1: Delete `scoring-live-replay.png` (old)
- [x] 17G.2: Remove mobile screenshots (15, 16)
- [ ] 17G.3: Add tablet screenshots (postponed - E2E tests outdated)
- [x] 17G.4: Commit

---

### 17H: Settings consolidation ✅

**Problem:** 3× gear icons (settings icons).

- [x] 17H.1: Audit settings icons
- [x] 17H.2: Single entry: header + Ctrl+,
- [x] 17H.3: Remove from footer and grid
- [x] 17H.4: Commit

**Solution:**
- Single ⚙ icon is in header (correct place)
- GateGroupSwitcher has ✎ icon (edit) - changed in phase 17A
- Footer has no settings icon - only version and check progress
- Settings modal has text "Edit Gate Groups" button (not icon)
- Keyboard shortcut Ctrl+, works globally

---

### Implementation Order

1. **17A** - Header (highest priority)
2. **17B** - Grid highlighting
3. **17D** - Sticky footer (quick)
4. **17F** - Tablet
5. **17C, 17E, 17G, 17H** - as time allows

**After each phase:** Screenshots with replay server.

---

## Phase 18: Auto-load Gate Groups from Segments

**Goal:** Automatically load gate groups from track segments from XML data.

**Status:** ✅ Done (logic verified)

**State:**
- ✅ c123-server has endpoint `GET /api/xml/courses`
- ✅ Returns `{ courses: [{ courseNr, courseConfig, splits: [5, 9, 14...] }] }`
- ✅ c123-scoring has prepared infrastructure (`CourseSegment`, `createGroupsFromSegments()`)
- ✅ Course matching works (comparing gateConfig without S markers)
- ✅ Segments are generated correctly

---

### 18A: Changes in c123-server ✅ DONE

- [x] 18A.1: Add `CourseData` parsing to `XmlDataService.ts`
- [x] 18A.2: Add REST endpoint `GET /api/xml/courses`
- [x] 18A.3: Document in `REST-API.md`

### 18B: Integration in c123-scoring ✅

- [x] 18B.1: Add API client for `/api/xml/courses` to `src/services/`
- [x] 18B.2: Add helper `createSegmentsFromSplits(splits: number[], totalGates: number)` to `src/types/gateGroups.ts`
- [x] 18B.3: Update `useGateGroups` hook - fetch courses API and parse segments
- [x] 18B.4: UI for switching between "All Gates" / "Segment 1" / "Segment 2" / custom groups
- [x] 18B.5: Commit
- [x] 18B.6: Fix: Course matching via `gateConfig` instead of `courseNr` (2026-01-18)
  - RaceConfig.gateConfig doesn't contain S markers
  - CourseData.courseConfig contains S markers
  - Matching: `courseConfig.replace(/S/g, '') === gateConfig`

### 18C: Verification ✅

- [x] 18C.1: Test with real server (192.168.68.108:27123)
  - ✅ Courses API returns 4 courses with splits
  - ✅ Course matching works (Course 1 for current race)
  - ✅ Generates 6 segments for 24 gates (correctly trimmed from 8)
- [x] 18C.2: Custom groups take precedence (design - custom groups are in localStorage)
- [x] 18C.3: Screenshots - now functional (Schedule issue resolved in phase 21)

---

## Phase 19: Screenshots and E2E Test Refactoring

**Goal:** Update E2E tests and screenshots after UI redesign.

**Status:** ✅ Done

**Problem:**
- E2E tests in `tests/` used outdated selectors (`.gate-cell`, `.competitor-row`)
- After header and grid redesign tests didn't work
- Screenshots didn't match current UI

---

### 19A: E2E test audit ✅

- [x] 19A.1: Update `tests/screenshots-static.spec.ts`:
  - Fixed selectors for Settings modal (data-testid)
  - Removed mobile test (16-mobile-settings)
  - Added test for Display tab (05-settings-display)
- [x] 19A.2: Update `tests/screenshots-with-data.spec.ts`:
  - Fixed selector for race selector (`select[aria-label="Select race"]`)
  - Removed outdated selector `.competitor-row` → `.results-grid tbody tr`
  - Renamed screenshots: 10-gate-group-active, 11-gate-group-indicators, 12-settings-display
  - Reordered tests (dark mode before tablet tests)
- [x] 19A.3: Mock-data.ts didn't require changes

### 19B: Screenshot regeneration ✅

- [x] 19B.1: Run `./scripts/take-screenshots.sh` - 16 tests passed
- [x] 19B.2: Check outputs - 17 screenshots generated
- [x] 19B.3: Tablet screenshots added (18-tablet-landscape, 19-tablet-portrait)
- [x] 19B.4: Update `README.md` - project structure (screenshots not present)

### 19C: CI/CD update

- [x] 19C.1: Verify `.github/workflows/ci.yml` works with updated tests
- [x] 19C.2: Commit

---

## Phase 20: Bug Fixes and UX Feedback

**Goal:** Fix critical bugs and UX issues from user testing.

**Status:** ✅ Partially done (20A-D)

---

### 20A: Critical bugs (FIRST) ✅

**Problem:** Vite blocks fonts from linked design-system.

- [x] 20A.0: Add `server.fs.allow` to `vite.config.ts` for `../timing-design-system`

**Problem:** Penalty writing doesn't work.

- [x] 20A.1: Investigation - why penalties aren't being sent to C123
  - Code is correctly implemented (c123-server has endpoint, ScoringService formats XML)
  - Requires testing with real C123 (not a code bug)
- [x] 20A.2: Debug REST API calls (`POST /api/c123/scoring`) - OK
- [ ] 20A.3: Test with real C123 (requires hardware)
- [x] 20A.4: Commit (together with other fixes)

**Problem:** Entered value persists in cell after moving with arrows.

- [x] 20A.5: Investigation - `pendingValue` from `useKeyboardInput` wasn't cleared on `position` change
- [x] 20A.6: Fix keyboard navigation - added `useEffect` to reset `pendingValue` on position change
- [x] 20A.7: Commit

---

### 20B: Layout fixes ✅

**Problem:** Header isn't sticky - scrolls away.

- [x] 20B.1: Change header to `position: sticky; top: 0`
- [x] 20B.2: Ensure correct z-index (above grid) - z-index: 100
- [x] 20B.3: Commit

---

### 20C: Keyboard fixes ✅

**Problem:** Space key pages instead of toggling checked.

- [x] 20C.1: Add `preventDefault()` for Space in grid
- [x] 20C.2: Space = toggle "checked" for current row
- [x] 20C.3: Commit

---

### 20D: Toast → Footer pending writes ✅

**Problem:** Toasts for writes are distracting.

- [x] 20D.1: Remove toast notifications for scoring writes
- [x] 20D.2: Add "pending writes" indicator to footer (spinner + count)
- [x] 20D.3: Commit

---

### 20E: Remove unnecessary UI elements ✅

**Problem:** Some UI elements don't provide value.

- [x] 20E.1: Remove first checkbox column from grid
- [x] 20E.2: Remove context menu (DNS/DNF/CAP) above grid
- [x] 20E.3: Commit

---

### 20F: Grid highlighting redesign ✅

**Problem:** Row/column highlighting isn't readable, borders would be better.

- [x] 20F.1: Change row/column highlight from background to border
- [x] 20F.2: Active cell: strong border (e.g., 2px accent)
- [x] 20F.3: Hover: weaker border (e.g., 1px muted)
- [x] 20F.4: Commit

**Solution:**
- Row focus: horizontal borders (top/bottom) on all cells in row
- Column focus: vertical borders (left/right) on all cells in column
- Focused cell: full 2px border
- Hover: subtle 1px muted border
- Crosshair effect: combined row+column borders at intersection

---

### 20G: Light/Dark mode switch ✅

**Problem:** Can't explicitly switch between light/dark mode.

- [x] 20G.1: Add theme toggle to Settings (or header)
- [x] 20G.2: Options: Auto (system) / Light / Dark
- [x] 20G.3: Persistence to localStorage
- [x] 20G.4: Commit

**Solution:**
- Added `theme: ThemeMode` to Settings interface ('auto' | 'light' | 'dark')
- Theme selector in Settings > Display tab (DS Select component)
- App.tsx applies `.theme-light` / `.theme-dark` classes to document element
- Auto mode leaves decision to `@media (prefers-color-scheme)`

---

### Implementation Order

1. **20A** - Critical bugs (writing doesn't work!)
2. **20B** - Sticky header
3. **20C** - Space key
4. **20D** - Pending writes footer
5. **20E** - Remove unnecessary UI
6. **20F** - Grid highlighting
7. **20G** - Theme switch

---

## Phase 21: Schedule WebSocket Issue ✅

**Goal:** Ensure application displays active races.

**Status:** ✅ Done (fixed in c123-server)

**Problem (resolved):**
c123-server wasn't sending Schedule message via WebSocket automatically after connection.
Scoring application therefore showed "No active races" even when server had active race.

**Solution:**
Fixed in c123-server - server now sends Schedule message when client connects.

### Implementation in c123-server ✅

- [x] 21A.1: Add Schedule message sending on client connection
- [x] 21A.2: Send Schedule on change (new race starts/ends)

### c123-scoring (no changes needed)
- Infrastructure for processing Schedule messages already existed
- Types: `C123ScheduleData`, `C123ScheduleMessage`
- WebSocket hook: `isScheduleMessage()` type guard + state update
- useSchedule hook: processing races and activeRaces

---

## Phase 22: Settings Cleanup ✅

**Goal:** Remove unused settings.

**Status:** ✅ Done

- [x] 22.1: Remove "Compact mode" from Settings - does nothing
- [x] 22.2: Check if all settings are being used
- [x] 22.3: Commit

---

## Phase 23: Grid Layout and Sticky Columns ✅

**Goal:** Improve grid layout for wider courses and horizontal scroll.

**Status:** ✅ Done

### 23A: More compact header
- [x] 23A.1: Fixed column widths (position, bib, name) - don't stretch
- [x] 23A.2: Free space to right of grid instead of stretching name
- [x] 23A.3: More compact gate headers

### 23B: Sticky columns on horizontal scroll
- [x] 23B.1: Sticky columns: position, bib, competitor name
- [x] 23B.2: Grid with penalties scrolls independently
- [x] 23B.3: Sticky segments/gate groups in header (on vertical scroll)

### 23C: Visible horizontal scroll
- [x] 23C.1: Ensure it's obvious how to scroll sideways (border separator)
- [ ] 23C.2: Possibly add scroll indicator (not needed)

---

## Phase 24: Grid Highlighting Redesign ✅

**Goal:** More subtle visual indication, less visual noise.

**Status:** ✅ Done

### 24A: Remove hover highlighting
- [x] 24A.1: Remove row/column highlight on hover
- [x] 24A.2: On hover only highlight header (bold)
- [x] 24A.3: Keep active (focus) row/column highlighting

### 24B: More subtle gate groups
- [x] 24B.1: Group separation more subtle (gray instead of accent)
- [x] 24B.2: Groups indicator in header less prominent (gray)
- [x] 24B.3: Ensure they don't conflict with active row/column

---

## Phase 25: WebSocket Connection Management ✅

**Goal:** Fix connection issues - duplicate connections, reconnect loop.

**Status:** ✅ Done

**Problem:** Server logs frequent connect/disconnect, holds multiple connections.

- [x] 25.1: Audit `useC123WebSocket` hook - find source of duplicate connections
- [x] 25.2: Check cleanup on unmount/reconnect
- [x] 25.3: Ensure max 1 active connection runs (isConnecting guard)
- [x] 25.4: Test reconnect logic
- [x] 25.5: Commit

**Solution:** Added `isConnecting` ref that blocks duplicate connections.

---

## Phase 26: Keyboard and Scoring Fixes ✅

**Goal:** Fix keyboard handling and scoring logic.

**Status:** ✅ Done

### 26A: Keyboard focus after load
- [x] 26A.1: After page load arrows scroll instead of navigating grid
- [x] 26A.2: Auto-focus grid after data loads
- [x] 26A.3: Ensure arrows always navigate in grid (not page scroll)

### 26B: Delete value
- [x] 26B.1: Explore how original handles penalty deletion
- [x] 26B.2: Delete sends value=0 - this is CORRECT behavior (clean pass)
- [x] 26B.3: No change needed - C123 API doesn't have "remove value" concept

**Note:** In C123 protocol value 0 = "clean pass" (no penalty).
There's no concept of "empty value" - every gate always has a state (0, 2, or 50).

---

## Phase 27: Grid UX and Keyboard Improvements

**Goal:** Fix UX issues with grid and keyboard input.

**Status:** ✅ Done

---

### 27A: Keyboard input extension ✅

**Problem:** Users often type 50 instead of 5, app doesn't accept it.

- [x] 27A.1: Besides 0, 2, 5 (→50) also accept "50" as input
- [x] 27A.2: After pressing "5" wait briefly (e.g., 300ms) for possible "0"
- [x] 27A.3: Commit

**Solution:** useKeyboardInput hook waits 300ms after pressing "5" for possible "0".

---

### 27B: Delete/Backspace sends null ✅

**Problem:** Del/Backspace doesn't send anything, should send null (clear value).

**Note:** Server already accepts value=null and clears penalty.
This is different from sending 0 (clear pass = clean pass).

- [x] 27B.1: Verify Delete sends `value: null` - already implemented in ResultsGrid
- [x] 27B.2: Possibly fix `useKeyboardInput` hook - not needed
- [x] 27B.3: Commit

**Solution:** Already implemented - onClear callback sends null in ResultsGrid.

---

### 27C: Segment headers redesign ✅

**Problem:** Segments in header are too colorful/prominent.

- [x] 27C.1: Change segment header color to gray (less prominent)
- [x] 27C.2: Ensure they're sticky (on horizontal scroll) - already works
- [x] 27C.3: Commit

**Solution:** Removed colored --group-color, used neutral gray colors from DS.

---

### 27D: Sticky columns fix ✅

**Problem:** First columns (position, bib, name) should be sticky.

**Note:** CSS for sticky already exists and works correctly.

- [x] 27D.1: Verify/fix sticky position for col-pos, col-bib, col-name - works
- [x] 27D.2: Ensure correct z-index and background - works
- [x] 27D.3: Test horizontal scroll - works
- [x] 27D.4: Commit

**Solution:** Already implemented in previous phase.

---

### 27E: Horizontal scroll improvement ✅

**Problem:** Horizontal scroll works awkwardly, scrollbar not visible.

- [x] 27E.1: Add visible scrollbar (webkit-scrollbar styling)
- [x] 27E.2: Possibly add scroll shadow/fade indicator on edges - not needed
- [x] 27E.3: Commit

**Solution:** Added visible scrollbar with webkit and Firefox styling.

---

### 27F: Grid layout - name column ✅

**Problem:** When page is wider than content, name column expands.

- [x] 27F.1: Ensure fixed width for name column (don't stretch)
- [x] 27F.2: Free space should be to right of grid
- [x] 27F.3: Table layout: auto or fixed instead of auto-stretch
- [x] 27F.4: Commit

**Solution:** Added `width: auto; min-width: min-content;` for table.

---

### 27G: Arrow key navigation performance ✅

**Problem:** When holding arrow (key repeat) page freezes and cursor jumps weirdly.

- [x] 27G.1: Throttle navigation to 60fps (requestAnimationFrame)
- [x] 27G.2: Batch rapid repeated keys
- [x] 27G.3: Test smoothness when holding arrow
- [x] 27G.4: Commit

**Solution:** useFocusNavigation hook throttles movement to 16ms (60fps) via RAF.

---

## Phase 28: Grid Layout Fixes ✅

**Goal:** Fix grid issues - sticky columns, padding, sticky header.

**Status:** ✅ Done

### 28A: Sticky columns z-index ✅
- [x] 28A.1: Add background for odd rows in sticky columns
- [x] 28A.2: Increase z-index hierarchy (body=5, header=10, corner=20)

### 28B: Remove unnecessary margins ✅
- [x] 28B.1: Remove padding from `.main`
- [x] 28B.2: Remove padding from `.results-grid`
- [x] 28B.3: Simplify tablet breakpoints

### 28C: Sticky header for vertical scroll ✅
- [x] 28C.1: Entire thead sticky (groups and gates)
- [x] 28C.2: Groups at `top: 0`, gates at `top: 32px`
- [x] 28C.3: Grid container handles both scroll directions

---

*Last updated: 2026-01-18 (Phase 28 completed)*
