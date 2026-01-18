# Claude Code Instructions - C123 Penalty Check

## Project

C123 Penalty Check - web application for penalty verification and correction in canoe slalom races timed with Canoe123.

**GitHub:** OpenCanoeTiming/c123-penalty-check | **License:** MIT

---

## Important Rules

1. **DO NOT MODIFY c123-server** - Server is stable, changes only with explicit approval.

2. **Allowed projects for modifications:**
   - `c123-penalty-check` (this project) - main work
   - `c123-protocol-docs/tools/` - helper tools (replay-server, recorder)

3. **Read-only:**
   - `../c123-server/` - reference for API, protocol
   - `../c123-scoreboard/` - reference for types, WebSocket
   - `../timing-design-system/` - UI components

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  c123-penalty-check (FE)                    │
│                      React + TypeScript                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
   WebSocket /ws                    REST API
   (real-time data)              (scoring commands)
          │                               │
          └───────────────┬───────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   c123-server :27123                        │
│                      (Node.js)                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼ TCP :27333
┌─────────────────────────────────────────────────────────────┐
│                       Canoe123                              │
└─────────────────────────────────────────────────────────────┘
```

**Key principle:** c123-penalty-check communicates exclusively with c123-server, never directly with C123.

---

## Paths and Documentation

| Purpose | Path |
|---------|------|
| **This project** | `/workspace/timing/c123-penalty-check/` |
| **Project overview** | `./PROJECT.md` |
| **C123 Server** | `../c123-server/` |
| **Design system** | `../timing-design-system/` |
| **Scoreboard (reference)** | `../c123-scoreboard/` |
| **Protocol docs** | `../c123-protocol-docs/` |

### Key References in c123-server

- **`../c123-server/docs/REST-API.md`** - REST API including Write API
- **`../c123-server/docs/C123-PROTOCOL.md`** - WebSocket protocol, message types
- **`../c123-server/PLAN.md`** - Write API specification (Blocks G, H, I)

### Key References in c123-scoreboard

- **`../c123-scoreboard/src/types/c123server.ts`** - TypeScript types for WebSocket messages
- **`../c123-scoreboard/src/App.tsx`** - WebSocket connection example

### Private Resources

- **`./resources-private/`** - Original business logic (READONLY, do not mention in code)

---

## Communication with c123-server

### WebSocket (reading data)

Connection: `ws://<server>:27123/ws`

**Relevant messages for scoring:**
| Type | Content | Usage |
|------|---------|-------|
| `OnCourse` | Competitors on course + penalties | Main data for grid |
| `Results` | Category results | Historical data |
| `RaceConfig` | Gate count, types (N/R) | Grid configuration |
| `Schedule` | Race list + status | Category switching |

### REST API (writing)

**Scoring endpoint:**
```
POST /api/c123/scoring
{ "bib": "10", "gate": 5, "value": 2 }
```

**Remove from course:**
```
POST /api/c123/remove-from-course
{ "bib": "10", "reason": "DNS" }
```

**Timing (manual impulse):**
```
POST /api/c123/timing
{ "bib": "10", "channelPosition": "Start" }
```

---

## Language

- User communication: **Czech**
- Documentation (README, docs): **English**
- Code, comments, commit messages: **English**

---

## Project Structure (planned)

```
c123-penalty-check/
├── src/
│   ├── index.tsx             # Entry point
│   ├── App.tsx               # Main component
│   ├── components/           # UI components
│   │   ├── RaceSelector/     # Race selection
│   │   ├── PenaltyGrid/      # Penalty grid
│   │   └── ConnectionStatus/ # Connection status
│   ├── hooks/                # React hooks
│   │   ├── useWebSocket.ts   # WebSocket connection
│   │   └── useScoring.ts     # Scoring API calls
│   ├── services/             # API communication
│   │   └── scoringApi.ts     # REST API client
│   ├── store/                # State management
│   └── types/                # TypeScript types
│       └── c123server.ts     # Copy/adaptation from scoreboard
├── resources-private/        # Source materials (NOT in git)
└── package.json
```

---

## Key Features

1. **Server connection** - WebSocket to c123-server, analogous to c123-scoreboard
2. **Race display** - Active races from Schedule, active indicators
3. **Competitor grid** - Who will race, who is racing, who finished, penalty status
4. **Inline editing** - Keyboard control, arrow navigation
5. **Penalty submission** - REST API POST /api/c123/scoring
6. **Gate grouping** - By segments or custom groups
7. **Protocol verification** - Marking verified protocols
8. **Persistence** - Settings in localStorage

---

## Design System

Strictly use `@opencanoetiming/timing-design-system`:
- Basic components from design system
- Specific components (PenaltyGrid) styled according to tokens
- Missing components → create request for DS extension

```bash
npm install @opencanoetiming/timing-design-system
```

---

## Development

```bash
# Installation
npm install

# Dev server
npm run dev

# Build
npm run build
```

**Testing with c123-server:**
```bash
# In another terminal start c123-server
cd ../c123-server && npm start

# Scoring app connects to ws://localhost:27123/ws
```

---

## Screenshots (IMPORTANT!)

**After every visual UI change, update screenshots!**

```bash
# Automatic script - starts replay + c123-server + dev server + Playwright
./scripts/take-screenshots.sh

# Static screenshots only (no server)
./scripts/take-screenshots.sh --static-only
```

**What the script does:**
1. Starts replay-server (simulates C123 on port 27333)
2. Starts c123-server (connects to replay)
3. Starts Vite dev server
4. Runs Playwright tests
5. Automatically cleans up all processes

**When to update screenshots:**
- After layout changes (Header, Footer, Grid)
- After component changes (Settings, Modals)
- After color/style changes
- After adding new features

**Test files:**
- `tests/screenshots-static.spec.ts` - without data (loading, disconnected, settings)
- `tests/screenshots-with-data.spec.ts` - with replay data (grid, gates, actions)

---

## Process

### Before Starting Work

1. Read `PLAN.md` - find current state and what's next
2. Read `DEVLOG.md` - understand context from previous iterations

### During Work

1. **Planning:** First update `PLAN.md` with new steps
2. **Implementation:** Work in blocks (~70% context usage)
3. **Commit:** At latest after each block
4. **Update PLAN.md:** After completing a step, mark `- [x]`
5. Don't do more than one block before clear/compact

### After Completing Block/Iteration

1. **PLAN.md:** Mark completed steps as `- [x]`
2. **DEVLOG.md:** Add record of what was done:
   - What succeeded
   - What problems occurred and how they were solved
   - Notes on decisions
3. **Commit:** Commit changes including documentation

### DEVLOG.md Entry Format

```markdown
## YYYY-MM-DD - Iteration X / Work description

### Completed
- [x] Task description 1
- [x] Task description 2

### Problems and Solutions
1. **Problem:** [description]
   **Solution:** [how it was resolved]

### Notes
[Important decisions, deviations from plan, TODO for next time]
```

### When Problems Occur

- Update `PLAN.md` with new sections and steps
- Write to `DEVLOG.md` what didn't work
- Finish and leave work to fresh instance

---

## Project Files

| File | Purpose |
|------|---------|
| `PROJECT.md` | Project overview and motivation (stable) |
| `PLAN.md` | Implementation plan with checkboxes (update continuously) |
| `DEVLOG.md` | Development diary (add entries after each iteration) |
| `CLAUDE.md` | Claude Code instructions (this file) |

---

## Commit Message Format

```
feat: add penalty grid with keyboard navigation
fix: correct gate grouping logic
refactor: extract WebSocket logic to hook
```

---

*Project overview → see `./PROJECT.md`*
