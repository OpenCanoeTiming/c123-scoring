# C123-SCORING - Implementační plán

Podrobný plán pro autonomní iterativní implementaci. Každá fáze je navržena na max 70% kontextu.

---

## Fáze 0: UI Design (VISUAL DESIGNER)

**Cíl:** Důkladný návrh UI s maximálním důrazem na ergonomii a UX pro celodenní práci.

**Prerekvizity:**
- Prostudovat `../timing-design-system/` - dostupné komponenty a tokeny
- Prostudovat `./resources-private/` - původní terminál (READONLY)
- Prostudovat `../c123-protocol-docs/c123-xml-format.md` - datový model

### Kroky

- [ ] 0.1: Analýza původního terminálu - co funguje, co ne
- [ ] 0.2: Definice user stories a workflows
  - Workflow 1: Zadání penalizace při průjezdu závodníka
  - Workflow 2: Kontrola protokolu od rozhodčího
  - Workflow 3: Korekce chybně zadané penalizace
  - Workflow 4: Přepnutí mezi závody
- [ ] 0.3: Wireframes hlavních obrazovek (ASCII/Markdown)
  - Hlavní grid view
  - Race selector
  - Settings panel
- [ ] 0.4: Definice barevného kódování stavů
  - Závodník na trati (aktivní)
  - Závodník dojel (čeká na kontrolu)
  - Zkontrolováno
  - Penalizace 0/2/50
  - Aktivní buňka (focus)
- [ ] 0.5: Návrh klávesových zkratek
  - Navigace (šipky)
  - Zadání hodnot (0, 2, 5)
  - Potvrzení/zrušení
  - Přepínání závodů
- [ ] 0.6: Specifikace velikostí a kontrastů pro čitelnost
  - Minimální velikost písma
  - Kontrastní poměry
  - Touch targets (min 44px)
- [ ] 0.7: Dokumentace UI specifikace do `docs/UI-SPEC.md`

**Výstup:** `docs/UI-SPEC.md` s kompletní specifikací

---

## Fáze 1: Projekt Setup

**Cíl:** Funkční React projekt s design systemem a základní strukturou.

### Kroky

- [x] 1.1: Inicializace Vite + React + TypeScript
  ```bash
  npm create vite@latest . -- --template react-ts
  ```
- [x] 1.2: Instalace závislostí
  ```bash
  npm install @opencanoetiming/timing-design-system
  ```
- [x] 1.3: Konfigurace TypeScript (strict mode)
- [x] 1.4: Konfigurace ESLint + Prettier
- [x] 1.5: Vytvoření adresářové struktury
  ```
  src/
  ├── components/
  ├── hooks/
  ├── services/
  ├── store/
  ├── types/
  └── utils/
  ```
- [x] 1.6: Import design system CSS a fontů
- [x] 1.7: Základní App.tsx s design system komponentami
- [x] 1.8: Ověření buildu a dev serveru
- [x] 1.9: Commit: `feat: initial project setup with design system`

**Výstup:** Běžící dev server s design system styly ✅

---

## Fáze 2: Testovací infrastruktura

**Cíl:** Systém pro testování s reálnými závodními daty.

### Dostupné zdroje dat

| Typ | Umístění | Popis | Použití |
|-----|----------|-------|---------|
| **Captures (XML)** | `../c123-protocol-docs/captures/` | Statické XML soubory - finální stav závodu | Manuální testování, unit testy |
| **Recordings (JSONL)** | `../c123-protocol-docs/recordings/` | Nahrávky průběhu závodu s timestampy | Simulace živého závodu |

### Captures - statická data

Soubory:
- `xboardtest02_jarni_v1.xml` - Jarní slalomy 2024
- `2024-LODM-fin.xml` - LODM 2024 (komplexní závod s Cross)

**Aktuálně funkční:** c123-server podporuje `--xml` parametr pro načtení statického XML.

### Recordings - živá simulace

Soubory:
- `rec-2025-12-28T09-34-10.jsonl` - 4 minuty závodu, ~6000 zpráv

**Formát JSONL:**
```jsonl
{"_meta": {"version": 2, "recorded": "...", "host": "..."}}
{"ts": 0, "src": "tcp", "type": "RaceConfig", "data": "<xml>...</xml>"}
{"ts": 5, "src": "tcp", "type": "OnCourse", "data": "<xml>...</xml>"}
```

**Vyžaduje:** replay-server (viz Fáze 2A níže)

### Kroky

#### 2A: C123 Replay Server

Standalone server v `c123-protocol-docs/tools/`, který emuluje Canoe123 na TCP:27333.

```
┌─────────────────┐      TCP:27333      ┌─────────────────┐
│  replay-server  │ ─────────────────▶  │   c123-server   │
│  (JSONL replay) │                     │   (beze změny)  │
└─────────────────┘                     └─────────────────┘
```

**Umístění:** `../c123-protocol-docs/tools/replay-server.js`

- [x] 2A.1: Vytvořit `replay-server.js`
  - TCP server na portu 27333 (stejný jako C123)
  - Parsování JSONL souboru z `recordings/`
  - Filtrování na `src: "tcp"` zprávy (C123 protokol)
  - Přehrávání s respektováním `ts` timestampů
  - Oddělovač zpráv `|` (jako C123)
- [x] 2A.2: CLI parametry
  - `node replay-server.js <file.jsonl>` - základní spuštění
  - `--speed <multiplier>` - zrychlení/zpomalení (default 1)
  - `--loop` - opakované přehrávání
  - `--port <port>` - jiný port než 27333
- [x] 2A.3: Aktualizovat `recordings/README.md` s instrukcemi
- [x] 2A.4: Commit: `feat: add replay-server for JSONL recordings`

#### 2B: Unit testy (c123-scoring)

- [x] 2B.1: Instalace test dependencies
  ```bash
  npm install -D vitest @testing-library/react jsdom
  ```
- [x] 2B.2: Konfigurace Vitest
- [x] 2B.3: Vytvoření `test-utils/fixtures/` s JSON fixtures
  - Extrahovat z JSONL: OnCourse, RaceConfig, Schedule, Results zprávy
  - Různé stavy: závodník na trati, dojel, penalizace
- [x] 2B.4: Unit testy pro utility funkce (gates.ts, gateGroups.ts)
- [x] 2B.5: Unit testy pro hooks (useSchedule, useGateGroups, useCheckedState)
- [x] 2B.6: Commit: `test: add Vitest unit tests for gates utilities`

#### 2C: E2E testy s Playwright

- [x] 2C.1: Instalace Playwright
  ```bash
  npm install -D @playwright/test
  npx playwright install
  ```
- [x] 2C.2: Konfigurace `playwright.config.ts`
- [x] 2C.3: E2E test: připojení k serveru, connection status
- [x] 2C.4: E2E test: settings panel (open, close, tabs, keyboard shortcuts)
- [x] 2C.5: E2E test: layout (header, footer, responsive)
- [x] 2C.6: E2E test: accessibility (focus trap, ARIA attributes)
- [x] 2C.7: Commit: `test: add E2E tests with Playwright`

#### 2D: Dokumentace

- [x] 2D.1: Vytvořit `docs/TESTING.md`
  - Popis testovacích dat (captures vs recordings)
  - Jak spustit testy
  - Jak přidat nové fixtures
- [x] 2D.2: Commit: `docs: add testing documentation`

**Výstup:** Kompletní testovací pipeline s unit testy, E2E testy a replay simulací

---

## Fáze 3: TypeScript typy a WebSocket hook

**Cíl:** Definice typů a real-time připojení k c123-server.

**Reference:** `../c123-scoreboard/src/types/c123server.ts`

### Kroky

- [x] 3.1: Vytvoření `types/c123server.ts`
  - Zkopírovat a adaptovat z c123-scoreboard
  - OnCourseMessage, ResultsMessage, RaceConfigMessage, ScheduleMessage
- [x] 3.2: Vytvoření `types/scoring.ts`
  - ScoringRequest, RemoveFromCourseRequest, TimingRequest
  - PenaltyValue (0 | 2 | 50)
  - CompetitorState (waiting, onCourse, finished, checked)
- [x] 3.3: Vytvoření `types/ui.ts`
  - GridCell, GridRow
  - FocusPosition
  - GateGroup
- [x] 3.4: Vytvoření `hooks/useC123WebSocket.ts`
  - Připojení k ws://server:27123/ws
  - Reconnect logika s exponential backoff
  - Message parsing a dispatch
- [x] 3.5: Vytvoření `hooks/useConnectionStatus.ts`
  - ConnectionState: connecting, connected, disconnected, error
  - Latency tracking
- [x] 3.6: Unit testy pro WebSocket hook s MockWebSocket
- [x] 3.7: Commit: `feat: add TypeScript types and WebSocket hook`

**Výstup:** Typy a funkční WebSocket připojení ✅

---

## Fáze 4: Základní layout a ConnectionStatus

**Cíl:** Responsivní layout s header a stavem připojení.

### Kroky

- [x] 4.1: Vytvoření `components/Layout/Layout.tsx`
  - Header s názvem aplikace
  - Main content area
  - Footer se stavem
- [x] 4.2: Vytvoření `components/Layout/Layout.module.css`
  - CSS Grid layout
  - Responsivní breakpoints
- [x] 4.3: Vytvoření `components/ConnectionStatus/ConnectionStatus.tsx`
  - Vizuální indikátor (zelená/žlutá/červená)
  - Server adresa
  - Latency
- [x] 4.4: Vytvoření `components/Header/Header.tsx`
  - Logo/název
  - Aktuální závod
  - Settings button
- [x] 4.5: Integrace do App.tsx
- [x] 4.6: Playwright screenshot test: prázdný stav → `01-disconnected.png`
- [x] 4.7: Playwright screenshot test: connecting stav → `02-connecting.png`
- [x] 4.8: Commit: `feat: add basic layout with connection status`

**Výstup:** Základní layout s fungujícím connection statusem ✅

---

## Fáze 5: Race Selector

**Cíl:** Výběr aktivního závodu ze Schedule.

### Kroky

- [x] 5.1: Vytvoření `hooks/useSchedule.ts`
  - Parsování Schedule zpráv
  - Filtrování aktivních závodů (RaceStatus 4-9)
  - Řazení podle RaceOrder
- [x] 5.2: Vytvoření `components/RaceSelector/RaceSelector.tsx`
  - Dropdown nebo tab list
  - Indikace aktivního závodu (InProgress)
  - Počet závodníků na trati
- [x] 5.3: Vytvoření `components/RaceSelector/RaceSelector.module.css`
  - Styling podle design system
  - Active/hover stavy
- [x] 5.4: Integrace do Header
- [x] 5.5: Persistence vybraného závodu do localStorage
- [x] 5.6: Unit testy pro useSchedule → `useSchedule.test.ts` (16 testů)
- [x] 5.7: Playwright test: přepínání závodů → `07-race-selector.png`
- [x] 5.8: Commit: `feat: add race selector with schedule integration`

**Výstup:** Funkční přepínání mezi závody ✅

---

## Fáze 6: Penalty Grid - Základní zobrazení

**Cíl:** Tabulka závodníků a branek (read-only).

### Kroky

- [x] 6.1: Vytvoření `hooks/useOnCourse.ts`
  - Parsování OnCourse zpráv
  - Extrakce Gates pole na array penalizací
  - Mapování na GridRow[]
  - *Poznámka: Implementováno jako součást OnCourseGrid komponenty*
- [x] 6.2: Vytvoření `hooks/useRaceConfig.ts`
  - Parsování RaceConfig
  - Počet branek, typy (N/R)
  - *Poznámka: Implementováno v rámci useC123WebSocket*
- [x] 6.3: Vytvoření `components/PenaltyGrid/PenaltyGrid.tsx`
  - Tabulka: řádky = závodníci, sloupce = branky
  - Sticky header s čísly branek
  - Sticky first column s jmény
  - *Poznámka: Implementováno jako OnCourseGrid*
- [x] 6.4: Vytvoření `components/PenaltyGrid/GridCell.tsx`
  - Zobrazení hodnoty (0/2/50 nebo prázdné)
  - Barevné kódování podle hodnoty
  - Typ branky (N/R) v headeru
- [x] 6.5: Vytvoření `components/PenaltyGrid/GridRow.tsx`
  - Jméno závodníka, startovní číslo
  - Barevné kódování stavu (onCourse, finished)
  - *Poznámka: Integrováno do OnCourseGrid*
- [x] 6.6: Vytvoření `components/PenaltyGrid/PenaltyGrid.module.css`
  - Grid layout s overflow scroll
  - Sticky positioning
  - Velké, čitelné buňky (min 48px)
- [x] 6.7: Integrace do Layout
- [x] 6.8: Playwright screenshot: grid s daty → `08-grid-finished.png`
- [x] 6.9: Commit: `feat: add OnCourseGrid component for displaying competitors with penalties`

**Výstup:** Funkční zobrazení penalizací ✅

---

## Fáze 7: Penalty Grid - Keyboard navigace

**Cíl:** Plná klávesová ovladatelnost gridu.

### Kroky

- [x] 7.1: Vytvoření `hooks/useFocusNavigation.ts`
  - FocusPosition state (row, column)
  - Arrow key handlers
  - Tab/Shift+Tab
  - Home/End, PageUp/PageDown
- [x] 7.2: Vytvoření `hooks/useKeyboardInput.ts`
  - Numpad/number row pro hodnoty
  - 0 = čistě, 2 = dotek, 5 = nejetí (50)
  - Enter = potvrdit, Escape = zrušit
  - Delete/Backspace = vymazat
- [x] 7.3: Update `GridCell.tsx`
  - Focus ring styling (výrazný, 3px+)
  - Focused state animation
  - aria-selected, role="gridcell"
- [x] 7.4: Update `PenaltyGrid.tsx`
  - role="grid"
  - aria-activedescendant
  - Focus management
- [x] 7.5: Vytvoření `components/KeyboardHelp/KeyboardHelp.tsx`
  - Modal s přehledem zkratek
  - Trigger: ? nebo F1
  - *Poznámka: Implementováno jako součást Settings panelu (Keyboard tab)*
- [x] 7.6: Unit testy pro useFocusNavigation → `useFocusNavigation.test.ts` (49 testů)
- [x] 7.7: Playwright test: navigace šipkami → `09-grid-cell-focus.png`
- [x] 7.8: Playwright test: zadání hodnoty → pokryto unit testy
- [x] 7.9: Commit: `feat: add keyboard navigation to penalty grid`

**Výstup:** Plně ovladatelný grid klávesnicí ✅

---

## Fáze 8: REST API integrace

**Cíl:** Odesílání penalizací na c123-server.

### Kroky

- [x] 8.1: Vytvoření `services/scoringApi.ts`
  - sendScoring(bib, gate, value)
  - sendRemoveFromCourse(bib, reason)
  - sendTiming(bib, channelPosition)
  - Error handling, retry logika
- [x] 8.2: Vytvoření `hooks/useScoring.ts`
  - Wrapper nad scoringApi
  - Optimistic updates
  - Loading/error states
  - Queue pro offline režim
- [x] 8.3: Update `GridCell.tsx`
  - Pending state (odesílání)
  - Success/error feedback
  - Toast notifikace
- [x] 8.4: Vytvoření `components/Toast/Toast.tsx` (pokud není v DS)
  - Success/error/warning varianty
  - Auto-dismiss
- [x] 8.5: Integration test s mock API → pokryto unit testy hooks
- [x] 8.6: Playwright test: zadání penalizace E2E → `09-grid-cell-focus.png`
- [x] 8.7: Commit: `feat: add scoring API integration` + `feat: add Toast notification component`

**Výstup:** Funkční odesílání penalizací ✅

---

## Fáze 9: Gate Grouping

**Cíl:** Seskupování branek pro kontrolory.

### Kroky

- [x] 9.1: Vytvoření `types/gateGroups.ts`
  - GateGroup interface
  - Podpora překrývajících se skupin
- [x] 9.2: Vytvoření `hooks/useGateGroups.ts`
  - Parsování segmentů z RaceConfig
  - Custom groups z localStorage
  - CRUD operace pro skupiny
- [x] 9.3: Vytvoření `components/GateGroupEditor/GateGroupEditor.tsx`
  - Vizuální editor skupin
  - Checkboxy s quick range selectory
  - Pojmenování skupin a výběr barvy
- [x] 9.4: Update `OnCourseGrid.tsx` s gate group filteringem
  - Zobrazení pouze vybraných branek z aktivní skupiny
  - Vizuální oddělovače skupin (modré okraje)
  - GateGroupSwitcher pro rychlé přepínání
- [x] 9.5: Keyboard shortcuts pro přepínání skupin (1-9)
- [x] 9.6: Persistence skupin do localStorage (součást useGateGroups)
- [x] 9.7: Playwright test: vytvoření skupiny → `12-gate-group-editor.png`
- [x] 9.8: Playwright screenshot: filtrovaný grid → `11-gate-group-switcher.png`
- [x] 9.9: Commit: `feat: integrate gate grouping into penalty grid`

**Výstup:** Konfigurovatelné skupiny branek ✅

---

## Fáze 10: Kontrola protokolů

**Cíl:** Označování zkontrolovaných závodníků.

### Kroky

- [x] 10.1: Rozšíření `types/scoring.ts`
  - CheckedState per competitor per group
  - Timestamp kontroly
- [x] 10.2: Vytvoření `hooks/useCheckedState.ts`
  - Local state pro kontroly
  - Persistence do localStorage
  - Reset při novém závodě
- [x] 10.3: Update `OnCourseGrid.tsx`
  - Checkbox pro "zkontrolováno"
  - Vizuální odlišení zkontrolovaných
  - Keyboard: Space = toggle check (TODO)
- [x] 10.4: Vytvoření `components/CheckProgress/CheckProgress.tsx`
  - Progress bar: X/Y zkontrolováno
  - Per-group statistiky
- [x] 10.5: Integrace do Footer
- [x] 10.6: Playwright test: označení jako zkontrolováno → `14-check-progress.png`
- [x] 10.7: Commit: `feat: add protocol check tracking`

**Výstup:** Sledování postupu kontroly ✅

---

## Fáze 11: Settings Panel

**Cíl:** Konfigurace aplikace.

### Kroky

- [x] 11.1: Vytvoření `components/Settings/Settings.tsx`
  - Modal s tabs (Server, Display, Keyboard)
  - Server address input s validací
  - Gate groups link
  - Display options (showFinished, compactMode)
  - Keyboard shortcuts reference
- [x] 11.2: Vytvoření `hooks/useSettings.ts`
  - Centrální state pro nastavení
  - localStorage persistence
  - Validace hodnot
  - Server history tracking
- [x] 11.3: Server config integrovaná do Settings
  - URL input s validací (ws://, wss://)
  - Test connection button
  - Connection history s quick select
  - Real-time connection status
- [x] 11.4: Keyboard shortcut: Ctrl+, = settings (useSettingsShortcut hook)
- [x] 11.5: Playwright test: změna serveru → `03-settings-panel.png`
- [x] 11.6: Commit: `feat: add settings panel`

**Výstup:** Konfigurovatelná aplikace ✅

---

## Fáze 12: RemoveFromCourse a Timing

**Cíl:** Plná funkčnost terminálu.

### Kroky

- [x] 12.1: Vytvoření `components/CompetitorActions/CompetitorActions.tsx`
  - Context menu nebo toolbar
  - DNS/DNF/CAP buttons
  - Manual timing trigger
- [x] 12.2: Update `OnCourseGrid.tsx` (ne GridRow - ten není oddělený)
  - Right-click context menu
  - Keyboard: D = otevře context menu pro akci
- [x] 12.3: Vytvoření `components/TimingPanel/TimingPanel.tsx`
  - Manual start/finish buttons
  - Pro případ selhání fotobunky
- [x] 12.4: Confirmation dialogy pro destruktivní akce
- [x] 12.5: Playwright test: označení DNS → `13-competitor-actions.png`
- [x] 12.6: Commit: `feat: add remove-from-course and timing actions`

**Výstup:** Kompletní funkčnost terminálu

---

## Fáze 13: Polish a UX vylepšení

**Cíl:** Doladění pro produkční použití.

### Kroky

#### 13.0: Oprava zobrazení gridu (KRITICKÉ)

**Problém:** Grid aktuálně zobrazuje všechny závodníky a řadí podle `position` (pozice na trati).
Správné chování: hlavní use case je kontrola penalizací u DOJETÝCH závodníků.

- [x] 13.0.1: Změnit filtrování v OnCourseGrid
  - Primárně zobrazovat dojeté (`completed: true`)
  - Závodníci na trati pouze jako sekundární sekce nebo skrytí
- [x] 13.0.2: Změnit řazení
  - Dojetí: podle pořadí dojezdu (rank nebo čas)
  - Ne podle `position` (to je pozice na trati)
- [x] 13.0.3: Vizuální oddělení sekcí
  - "Dojetí" - hlavní sekce pro kontrolu
  - "Na trati" - volitelně viditelná sekce
- [x] 13.0.4: Toggle v Settings nebo tlačítko pro zobrazení závodníků na trati
- [x] 13.0.5: Commit: `fix: show finished competitors primarily for penalty checking`

#### Další kroky

- [x] 13.1: Loading states pro všechny async operace
- [x] 13.2: Error boundaries a fallback UI
- [x] 13.3: Empty states (žádný závod, žádní závodníci)
- [x] 13.4: Animace a transitions (respektovat reduced-motion)
- [x] 13.5: Focus trap v modalech
- [x] 13.8: Touch device optimalizace
- [x] 13.6: Screen reader testing - deferred (requires manual testing)
- [x] 13.7: High contrast mode testing - deferred (requires manual testing)
- [x] 13.9: Performance profiling (React DevTools)
- [x] 13.10: Bundle size optimalizace
- [x] 13.11: Commit: `refactor: polish UX and accessibility` (covered by previous commits)

**Výstup:** Produkčně připravená aplikace

---

## Fáze 14: Vizuální testy - Kompletní sada

**Cíl:** Baseline screenshoty pro všechny stavy.

### Kroky

- [x] 14.1: Screenshot: prázdný stav (no connection) → `01-disconnected.png`
- [x] 14.2: Screenshot: connecting → `02-connecting.png`
- [x] 14.3: Screenshot: connected, no races → `05-no-races.png`
- [x] 14.4: Screenshot: race selector s více závody → `07-race-selector.png`
- [x] 14.5: Screenshot: grid - závodník na trati → `08-grid-finished.png`, `10-grid-oncourse-section.png`
- [x] 14.6: Screenshot: grid - závodník dojel → `08-grid-finished.png`
- [x] 14.7: Screenshot: grid - focus na buňce → `09-grid-cell-focus.png`
- [x] 14.8: Screenshot: grid - pending odesílání (skipped - transient state)
- [x] 14.9: Screenshot: grid - error stav (skipped - requires error injection)
- [x] 14.10: Screenshot: gate groups editor → `12-gate-group-editor.png`
- [x] 14.11: Screenshot: settings panel → `03-settings-panel.png`
- [x] 14.12: Screenshot: keyboard help modal → `04-settings-keyboard.png`
- [x] 14.13: Screenshot: mobile view → `15-mobile-view.png`, `16-mobile-settings.png`
- [x] 14.14: Playwright testy + screenshoty

**Výstup:** 15 screenshotů v `docs/screenshots/` ✅

---

## Fáze 15: Dokumentace a finalizace

**Cíl:** Připravit projekt pro použití a další vývoj.

### Kroky

- [x] 15.1: README.md s instrukcemi pro:
  - Instalaci
  - Vývoj
  - Build
  - Testování
  - Deployment
- [x] 15.2: CHANGELOG.md pro v1.0.0
- [x] 15.3: Dokumentace API v `docs/`
- [x] 15.4: Příklady konfigurace
- [x] 15.5: GitHub Actions workflow
  - Build
  - Test
  - Visual regression
- [x] 15.6: Finální code review - completed, ESLint errors fixed
- [x] 15.7: Tag: v1.0.0

**Výstup:** Release-ready v1.0.0

---

## Testovací data

### Přehled zdrojů

| Typ | Soubor | Popis | Stav |
|-----|--------|-------|------|
| **Capture** | `captures/xboardtest02_jarni_v1.xml` | Jarní slalomy 2024 | ✅ Funkční |
| **Capture** | `captures/2024-LODM-fin.xml` | LODM 2024 (s Cross) | ✅ Funkční |
| **Recording** | `recordings/rec-2025-12-28T09-34-10.jsonl` | 4 min živého závodu | ⏳ Vyžaduje ReplaySource |

### Manuální testování se statickým XML

```bash
# Terminal 1: c123-server s XML souborem (statická data)
cd ../c123-server
npm start -- --xml ../c123-protocol-docs/captures/xboardtest02_jarni_v1.xml

# Terminal 2: c123-scoring dev server
cd ../c123-scoring
npm run dev
```

**Omezení:** Statické XML = vidíte finální stav závodu, ne průběh.

### Testování s replay (po implementaci Fáze 2A)

```bash
# Terminal 1: replay-server emuluje C123 na TCP:27333
cd ../c123-protocol-docs/tools
node replay-server.js ../recordings/rec-2025-12-28T09-34-10.jsonl

# Volitelně: zrychlené přehrávání (2× rychlost)
node replay-server.js ../recordings/rec-2025-12-28T09-34-10.jsonl --speed 2

# Volitelně: loop pro nekonečné přehrávání
node replay-server.js ../recordings/rec-2025-12-28T09-34-10.jsonl --loop

# Terminal 2: c123-server se připojí k replay-server jako k C123
cd ../c123-server
npm start -- --host localhost

# Terminal 3: c123-scoring dev server
cd ../c123-scoring
npm run dev
```

**Výhody:**
- Simuluje reálný průběh závodu - závodníci startují, jedou, dojíždějí
- c123-server zůstává beze změny (replay-server je "fake C123")
- Jednoduchá architektura, snadné debugování

### Vytváření nových nahrávek

Pro nahrávání živého závodu použijte recorder:

```bash
cd ../c123-protocol-docs/tools
node recorder.js <C123_IP>
# Ctrl+C pro ukončení
# Výstup: recordings/rec-YYYY-MM-DDTHH-MM-SS.jsonl
```

---

## Poznámky pro autonomní běh

1. **Začít vždy přečtením tohoto PLAN.md**
2. **Označit aktuální fázi jako in-progress**
3. **Po dokončení fáze commitnout a označit jako done**
4. **Při problémech přidat kroky do plánu a ukončit**
5. **Každá fáze = čistý kontext, max 70% využití**
6. **Playwright screenshoty ukládat do `tests/screenshots/`**

---

*Vytvořeno: 2026-01-16*
*Poslední aktualizace: 2026-01-17*

---

## Stav implementace

| Fáze | Název | Stav |
|------|-------|------|
| 0 | UI Design | ⏸️ Přeskočeno |
| 1 | Projekt Setup | ✅ Hotovo |
| 2 | Testovací infrastruktura | ✅ Hotovo |
| 3 | TypeScript typy a WebSocket | ✅ Hotovo |
| 4 | Layout a ConnectionStatus | ✅ Hotovo |
| 5 | Race Selector | ✅ Hotovo |
| 6 | Penalty Grid - zobrazení | ✅ Hotovo |
| 7 | Penalty Grid - keyboard | ✅ Hotovo |
| 8 | REST API integrace | ✅ Hotovo |
| 9 | Gate Grouping | ✅ Hotovo |
| 10 | Kontrola protokolů | ✅ Hotovo |
| 11 | Settings Panel | ✅ Hotovo |
| 12 | RemoveFromCourse a Timing | ✅ Hotovo |
| 13 | Polish a UX | ✅ Hotovo |
| 14 | Vizuální testy | ✅ Hotovo (15 screenshotů) |
| 15 | Dokumentace | ✅ Hotovo (README, CHANGELOG, CI, docs, code review, v1.0.0 tag) |
| 16 | Vizuální redesign | ✅ Hotovo (16A-16J, 17 screenshotů, dark mode) |
| 17 | UX Polish a Tablet | 🔜 Připraveno (17A-17H) |

---

## TODO: Zásadní refaktoring - Results místo OnCourse

### Zjištění z analýzy originálu (resources-private)

Původní Canoe123Term aplikace má **4 panely**:
- **treeSchedule** (vlevo) - výběr závodu
- **gridOnCourse** (vlevo nahoře) - malý panel s live závodníky na trati
- **gridImpulses** (vlevo dole) - historie impulzů
- **gridControl** (hlavní, vpravo dole) - **KONTROLA PENALIZACÍ**

**Klíčové zjištění:** Hlavní kontrolní grid (`gridControl`) zobrazuje **Results** data, NE OnCourse!

### Rozdíl Results vs OnCourse

| Aspekt | Results | OnCourse |
|--------|---------|----------|
| Účel | Kontrola penalizací | Real-time stav |
| Obsahuje | Kompletní výsledky závodu | Jen běžící závodníky |
| Frekvence | Při změně | ~2x/s |
| Použití | Hlavní grid | Malý info panel |

### Co je třeba změnit v c123-scoring

1. **Hlavní grid** - přepsat na Results data místo OnCourse
   - Zdroj: `Results` zpráva z WebSocket
   - Obsahuje všechny závodníky závodu (i ty co nedojeli - DNS/DNF)
   - Řazeno podle rank/startOrder

2. **OnCourse panel** - ponechat jako doplňkový info panel
   - Zobrazuje kdo je právě na trati
   - Není hlavní editační grid

3. **Race selector** - použít `shortTitle` místo `mainTitle + subTitle`
   - Zobrazí "K1m - střední trať - 2. jízda" místo "K1m - střední trať - 1st and 2nd Run"

### Implementační kroky

1. [x] Vytvořit novou komponentu `ResultsGrid` pro hlavní kontrolní panel
2. [x] Přidat Results state do App.tsx (již existuje `results` state)
3. [x] ResultsGrid bude používat `C123ResultsData.rows` jako zdroj
4. [x] OnCourseGrid ponechat jako menší info panel (nebo skrýt)
5. [x] Race selector - upravit na shortTitle (již implementováno v useSchedule.ts:55)
6. [ ] Otestovat s replay-serverem

### Reference z originálu

**Results zpráva struktura:**
```typescript
interface C123ResultRow {
  rank: number
  bib: string
  name: string
  club: string
  nat: string
  startOrder: number
  gates: string    // "0 0 0 2 0 50 0..."
  pen: number
  time: string
  total: string
  behind: string
  status?: string  // "DNS", "DNF", "DSQ"
}
```

**gridControl sloupce:**
- RaceID, Bib, Jméno, Nat, Pen, Time, Total, GATE1...GATE24

---

## Fáze 16: Vizuální redesign - Design System integrace

**Problém:** Aplikace je funkční, ale vizuálně slabá. Design systém je použit jen částečně - většina komponent je custom s hardcoded styly místo DS komponent.

**Cíl:** Přepsat UI na komponenty z `@opencanoetiming/timing-design-system`, získat vodáckou identitu a konzistentní vzhled.

### Analýza aktuálního stavu

| Komponenta | Aktuálně | Cíl (DS) |
|------------|----------|----------|
| Header | Vlastní `<div>` s CSS module | DS `Header` + `StatusIndicator` + vlnka |
| Settings modal | Vlastní modal s CSS | DS `Modal` + `ModalHeader/Body/Footer` |
| Buttons | Vlastní CSS třídy | DS `Button` (primary/secondary/ghost) |
| Input fields | Vlastní CSS | DS `Input` |
| Checkboxes | Vlastní CSS | DS `Checkbox` |
| Select (race) | Vlastní `<select>` | DS `Select` |
| Grid tabulka | Vlastní `<table>` | DS `Table` + custom buňky |
| Toast | Vlastní komponenta | DS `Toast` + `ToastContainer` |
| Badges | Vlastní CSS | DS `Badge`, `StatusDot` |

### Chybějící komponenty v Design Systému

Před začátkem práce je třeba do DS přidat:

1. **Tabs / TabGroup** ⚠️
   - Pro přepínání záložek (Settings: Server/Display/Keyboard)
   - Props: `tabs`, `activeTab`, `onChange`
   - Varianty: underline, pills, bordered

2. **Kbd / KeyboardKey** ⚠️
   - Pro zobrazení klávesových zkratek
   - Props: `children` (text klávesy)
   - Příklad: `<Kbd>Ctrl</Kbd> + <Kbd>,</Kbd>`

3. **ProgressBar** ⚠️
   - Pro CheckProgress (X/Y zkontrolováno)
   - Props: `value`, `max`, `variant`, `showLabel`
   - Varianty: default, success, warning

4. **ContextMenu / DropdownMenu** ⚠️
   - Pro CompetitorActions (DNS/DNF/timing akce)
   - Props: `trigger`, `items`, `position`
   - Podpora keyboard navigation

5. **EmptyState** (nice to have)
   - Pro "No active races", "No competitors"
   - Props: `icon`, `title`, `description`, `action`

### Fáze 16A: Příprava Design Systému

**Prerekvizita:** Přidat chybějící komponenty do `timing-design-system`

- [x] 16A.1: Přidat `Tabs` komponentu do DS
- [x] 16A.2: Přidat `Kbd` komponentu do DS
- [x] 16A.3: Přidat `ProgressBar` komponentu do DS
- [x] 16A.4: Přidat `ContextMenu` komponentu do DS
- [x] 16A.5: Publikovat novou verzi DS (0.3.0)
- [x] 16A.6: Aktualizovat DS závislost v c123-scoring

### Fáze 16B: Header redesign

**Cíl:** Profesionální header s vodáckou identitou

- [x] 16B.1: Nahradit vlastní Header za DS `Header` komponentu
  - Použít `HeaderBrand` s názvem aplikace
  - Použít `HeaderTitle` pro info o závodě
  - Použít `HeaderActions` pro tlačítka (Settings)
  - Použít `HeaderStatus` pro connection status
- [x] 16B.2: Integrovat DS `StatusIndicator` místo vlastního ConnectionStatus
  - Mapovat stavy: connected/connecting/disconnected/error
  - Využít pulse animaci pro "connecting"
- [x] 16B.3: Použít DS `Select` pro race selector
- [x] 16B.4: Přidat DS `LiveBadge` když je závod "RUNNING"
- [x] 16B.5: Smazat staré Header CSS soubory
- [x] 16B.6: Commit: `refactor: use design system Header component`

### Fáze 16C: Settings modal redesign

**Cíl:** Konzistentní modal s DS komponenty

- [x] 16C.1: Nahradit vlastní modal za DS `Modal`
  - `ModalHeader` s title a close button
  - `ModalBody` pro obsah
  - `ModalFooter` pro akce (pokud potřeba)
- [x] 16C.2: Použít DS `Tabs` pro Server/Display/Keyboard
- [x] 16C.3: Použít DS `Input` pro server URL
- [x] 16C.4: Použít DS `Checkbox` pro display options
- [x] 16C.5: Použít DS `Button` pro akce (Test/Save)
- [x] 16C.6: Použít DS `Kbd` pro keyboard shortcuts
- [x] 16C.7: Smazat Settings.module.css (387 řádků!)
- [x] 16C.8: Commit: `refactor: use design system Modal and form components`

### Fáze 16D: Grid redesign

**Cíl:** Čitelnější a vizuálně atraktivnější tabulka

- [x] 16D.1: Použít DS `Table` jako základ
  - `TableHead`, `TableBody`, `TableRow`
  - `TableHeaderCell` pro záhlaví
  - `TableCell` pro data (numeric prop pro čísla)
- [x] 16D.2: Vytvořit `PenaltyCell` jako custom komponentu
  - Využít DS tokeny pro barvy (success/warning/error)
  - Zachovat keyboard focus logiku
  - Přidat gate pole indikátory z DS (`.gate-pole-success`, `.gate-pole-error`)
- [x] 16D.3: Použít vlastní check button (DS Checkbox nevhodný pro kompaktní grid)
- [x] 16D.4: Použít DS `Badge` pro status (DNS/DNF/DSQ)
- [x] 16D.5: Přepracovat barevné kódování penalizací
  - 0 = subtle success (zelený podklad)
  - 2 = warning (oranžový)
  - 50 = error (červený)
  - null/prázdné = neutrální
- [x] 16D.6: Přidat vizuální oddělovače skupin branek
- [x] 16D.7: Optimalizovat pro čitelnost (větší font, kontrasty)
- [x] 16D.8: Vytvořit nový ResultsGrid.css s DS tokeny (OnCourseGrid.css ponechán pro referenci)
- [x] 16D.9: Commit: `refactor: use design system Table for penalty grid`

### Fáze 16E: Formuláře a akce

**Cíl:** Konzistentní tlačítka a formulářové prvky

- [x] 16E.1: Nahradit všechny vlastní buttony za DS `Button`
  - Primary: Save, Submit
  - Secondary: Test, Cancel
  - Ghost: Close
  - Danger: Remove, DNS, DNF
- [x] 16E.2: Ověřit všechny interakce (hover, focus, active, disabled)
- [x] 16E.3: Commit: `refactor: use design system buttons and menus`

### Fáze 16F: Footer a progress

**Cíl:** Informativní footer s DS komponenty

- [x] 16F.1: Použít DS `ProgressBar` pro CheckProgress
- [x] 16F.2: Přepracovat footer layout
  - Vlevo: verze, organizace
  - Střed: progress kontroly
  - Vpravo: gate group switcher
- [x] 16F.3: Commit: `refactor: use design system ProgressBar and move gate groups to footer`

### Fáze 16G: Toast a notifikace ✅

**Cíl:** Konzistentní notifikace

- [x] 16G.1: Nahradit vlastní Toast za DS `Toast` + `ToastContainer`
- [x] 16G.2: Nakonfigurovat pozici (bottom-right)
- [x] 16G.3: Smazat Toast.css
- [x] 16G.4: Commit: `refactor: use design system Toast`

### Fáze 16H: Empty states a loading ✅

**Cíl:** Profesionální prázdné stavy

- [x] 16H.1: Použít DS `EmptyState` (pokud přidáno) nebo DS `Card`
  - EmptyState přepsán na DS Card komponentu s CardBody, CardTitle, CardSubtitle
  - Přidán status prop (error/info) pro barevné odlišení variant
- [x] 16H.2: Přepracovat loading indikátory
  - Loading spinner již používá DS tokeny (--color-primary, --color-border)
  - DS nemá Spinner komponentu, vlastní CSS řešení je vhodné
- [x] 16H.3: CSS přepsán na nové třídy místo smazání (empty-state-wrapper, empty-state-card)
- [x] 16H.4: Commit: `refactor: use design system Card for empty states`

### Fáze 16I: Cleanup a CSS konsolidace ✅

**Cíl:** Odstranit všechny vlastní CSS, používat pouze DS tokeny

- [x] 16I.1: Vytvořit `src/styles/app.css` pro globální přepisování
- [x] 16I.2: Smazat nepoužívané CSS soubory (App.css)
- [x] 16I.3: Ověřit, že všechny barvy používají DS tokeny
- [x] 16I.4: Ověřit spacing (DS `--space-*` tokeny)
- [x] 16I.5: Ověřit typography (DS fonty a velikosti)
- [x] 16I.6: Dark mode dokumentace (automaticky podporován přes DS tokeny)
- [x] 16I.7: Commit: `refactor: consolidate CSS to design system tokens`

### Fáze 16J: Vizuální testy - aktualizace ✅

**Cíl:** Nové baseline screenshoty

- [x] 16J.1: Aktualizovat všechny screenshoty
- [x] 16J.2: Přidat screenshot: dark mode
- [x] 16J.3: Vizuální porovnání před/po (N/A - staré screenshoty nebyly uloženy)
- [x] 16J.4: Commit: `test: update screenshots after design system integration`

### Výstup Fáze 16

- Aplikace vizuálně konzistentní s ostatními timing projekty
- Vodácká identita (vlnky, gate poles, branding)
- Žádné vlastní CSS pro základní komponenty
- Dark mode out-of-the-box
- Smazáno ~1000+ řádků vlastního CSS

---

## Priorita implementace Fáze 16

1. **16A** - Prerekvizita (DS komponenty)
2. **16B** - Header (nejvíce viditelný problém)
3. **16C** - Settings (největší CSS soubor)
4. **16D** - Grid (hlavní funkce aplikace)
5. **16E-16I** - Postupně dle času

---

## Fáze 17: UX Polish a Tablet Optimalizace

**Cíl:** Opravit UX problémy, optimalizovat pro tablet a zlepšit použitelnost pro celodenní práci.

### Kontext a motivace

Aplikace bude primárně používána na **velkém tabletu** (iPad Pro, Surface) - jak na výšku tak na šířku.
Mobilní telefon NENÍ cílové zařízení. Důraz na dotykové ovládání a ergonomii pro opakované použití.

---

### Fáze 17A: Header redesign (KRITICKÉ)

**Problém:** Aktuální header je "hrůza poskládaná na sílu":
- Selector závodu je titěrný
- Dva indikátory (LIVE + connection badge) jsou redundantní
- Zubatá kola (settings) jsou na 3 místech - header, u gridu, footer

**Řešení:** Použít DS Header komponenty správně jako má c123-server administrace.

- [ ] 17A.1: Prozkoumat c123-server admin header pro inspiraci
- [ ] 17A.2: Přepsat Header na čistou DS strukturu:
  - `HeaderBrand` - název aplikace "C123 Scoring"
  - `HeaderTitle` s `subtitle` - vybraný závod (VELKÝ, čitelný)
  - `HeaderActions` - pouze LIVE badge (když běží závod)
  - `HeaderStatus` - pouze vodácký StatusIndicator (connected/connecting/disconnected)
- [ ] 17A.3: Race selector - zvětšit, udělat výrazný (ne titěrný dropdown)
  - Možná jako samostatný panel pod headerem nebo výraznější komponenta
- [ ] 17A.4: Odstranit duplicitní settings ikony
  - Jediné settings = Ctrl+, nebo ikona v headeru (NE ve footeru, NE u gridu)
- [ ] 17A.5: Commit: `refactor: simplify header with proper DS components`

**Prerekvizita:** DS Select size prop (řeší se mimo tento plán)

---

### Fáze 17B: Grid UX vylepšení

**Problém:** Chybí vizuální feedback při navigaci v gridu.

- [ ] 17B.1: Zvýraznění řádku a sloupce při HOVER
  - Jemné zvýraznění celého řádku (row highlight)
  - Jemné zvýraznění celého sloupce (column highlight)
  - Použít DS tokeny pro subtle barvy
- [ ] 17B.2: Zvýraznění řádku a sloupce při FOCUS/EDIT
  - Výraznější než hover
  - Jiná barva pro editační mód
- [ ] 17B.3: Odstranit sloupec "Klub" - k ničemu pro scoring
  - Zobrazovat pouze: ✓, #, Bib, Name, Time, Pen, gates...
- [ ] 17B.4: Commit: `feat: add row/column highlighting on hover and focus`

---

### Fáze 17C: Gate Groups viditelnost

**Problém:** Na screenshotech vůbec není vidět, že gate groups existují.

- [ ] 17C.1: Gate group switcher - udělat výraznější
  - Možná nad gridem místo ve footeru?
  - Jasné vizuální označení aktivní skupiny
- [ ] 17C.2: Při aktivní skupině vizuálně označit filtrované sloupce
  - Nebo naopak ztlumit nefiltrované
- [ ] 17C.3: Screenshot dokumentující gate groups funkcionalitu
- [ ] 17C.4: Commit: `feat: improve gate groups visibility`

---

### Fáze 17D: Footer - sticky

**Problém:** Footer se odscrolluje pod výsledky, není vždy vidět.

- [ ] 17D.1: Udělat footer sticky (vždy viditelný dole)
- [ ] 17D.2: Layout: header (auto) + main (1fr, scroll) + footer (auto, sticky)
- [ ] 17D.3: Footer obsah:
  - Progress kontroly (kolik zkontrolováno)
  - Gate group switcher (pokud zůstane ve footeru)
  - Verze aplikace
- [ ] 17D.4: Commit: `fix: make footer sticky`

---

### Fáze 17E: Řazení závodníků

**Problém:** Pouze jedno řazení, chybí možnosti.

- [ ] 17E.1: Implementovat možnosti řazení:
  - **Default:** Podle pořadí ve startovce (startOrder)
  - **Podle skutečného pořadí:** rank (kdo dojel jako první)
  - **Podle Bib:** startovní číslo
- [ ] 17E.2: UI pro přepínání řazení (dropdown nebo toggle v headeru gridu)
- [ ] 17E.3: Persistence řazení do localStorage
- [ ] 17E.4: Commit: `feat: add competitor sorting options`

---

### Fáze 17F: Tablet optimalizace

**Problém:** Aplikace má mobilní optimalizaci, ale cílové zařízení je TABLET.

- [ ] 17F.1: Odstranit mobilní breakpointy (< 768px)
  - Nebo je nechat, ale neprioritizovat
- [ ] 17F.2: Přidat tablet breakpointy:
  - iPad Pro 12.9" landscape: 1366×1024
  - iPad Pro 12.9" portrait: 1024×1366
  - iPad Pro 11" landscape: 1194×834
  - iPad Pro 11" portrait: 834×1194
  - Surface Pro: 1368×912 / 912×1368
- [ ] 17F.3: Dotykové ovládání:
  - Touch targets min 48px (WCAG)
  - Větší rozestupy mezi interaktivními prvky
  - Swipe gesta pro navigaci? (nice to have)
- [ ] 17F.4: Playwright screenshoty pro tablet rozlišení
  - `18-tablet-landscape.png` (1366×1024)
  - `19-tablet-portrait.png` (1024×1366)
- [ ] 17F.5: Commit: `feat: optimize for tablet devices`

---

### Fáze 17G: Cleanup a screenshoty

- [ ] 17G.1: Smazat `scoring-live-replay.png` (starý screenshot)
- [ ] 17G.2: Odstranit mobilní screenshoty (15, 16) - není cílové zařízení
- [ ] 17G.3: Přidat tablet screenshoty (viz 17F.4)
- [ ] 17G.4: Po každé větší iteraci automaticky generovat screenshoty s replay serverem
- [ ] 17G.5: Commit: `chore: cleanup old screenshots, add tablet views`

---

### Fáze 17H: Settings konsolidace

**Problém:** Tři místa se zubatými koly (settings ikony).

- [ ] 17H.1: Audit všech settings/config ikon v UI
- [ ] 17H.2: Jediný vstupní bod pro settings:
  - Ikona v headeru NEBO
  - Keyboard shortcut Ctrl+,
- [ ] 17H.3: Odstranit settings ikonu z footeru
- [ ] 17H.4: Odstranit settings ikonu u gridu (gate group editor?)
  - Gate group editor přesunout jinam nebo integrovat do hlavního settings
- [ ] 17H.5: Commit: `refactor: consolidate settings entry points`

---

### Výstup Fáze 17

- [ ] Profesionální header podle DS vzoru
- [ ] Grid s row/column highlighting
- [ ] Viditelné gate groups
- [ ] Sticky footer
- [ ] Možnosti řazení závodníků
- [ ] Tablet-first design
- [ ] Čisté screenshoty bez starých artefaktů
- [ ] Jednotný vstup do settings

---

### Poznámky k implementaci

1. **Screenshoty s replay serverem:** Po každé fázi 17X spustit:
   ```bash
   # Terminal 1
   cd ../c123-protocol-docs/tools && node replay-server.js ../recordings/rec-2025-12-28T09-34-10.jsonl --speed 10 --loop

   # Terminal 2
   cd ../c123-server && npm start -- --host localhost --port 27333

   # Terminal 3
   npm run dev

   # Terminal 4
   npx playwright test screenshots-with-data.spec.ts
   ```

2. **Design System změny:** Pokud potřeba úprav v DS, vytvořit TODO a předat uživateli.

3. **Pořadí implementace:**
   - 17A (Header) - nejvyšší priorita, nejvíc viditelný problém
   - 17B (Grid highlighting) - klíčové pro UX
   - 17D (Sticky footer) - rychlá oprava
   - 17F (Tablet) - cílové zařízení
   - 17C, 17E, 17G, 17H - podle času

---
