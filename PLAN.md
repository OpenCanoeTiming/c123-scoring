# C123-SCORING - Implementační plán

---

## Stav implementace

| Fáze | Název | Stav |
|------|-------|------|
| 1-15 | Základní implementace | ✅ Hotovo (v1.0.0) |
| 16 | Design System integrace | ✅ Hotovo |
| 17A-C | UX Polish (Header, Grid, Gate Groups) | ✅ Hotovo |
| 17D-E | UX Polish (Footer, Sorting) | ✅ Hotovo |
| 17F | UX Polish (Tablet) | ✅ Hotovo |
| 17G | UX Polish (Screenshots) | ✅ Hotovo |
| 17H | UX Polish (Settings) | ✅ Hotovo |
| 18 | Auto-load Gate Groups | ⏸️ Blokováno (c123-server) |
| 19 | E2E Test Refaktoring | ✅ Hotovo |

---

## Dokončené fáze (shrnutí)

### Fáze 1-15: Základní implementace ✅

**Výstup:** Funkční aplikace v1.0.0

- **Projekt setup:** Vite + React + TypeScript + Design System
- **WebSocket:** Připojení k c123-server, typy pro zprávy
- **Layout:** Header, Footer, ConnectionStatus
- **Race Selector:** Výběr závodu ze Schedule, persistence
- **Penalty Grid:** Zobrazení závodníků a branek, keyboard navigace
- **REST API:** Odesílání penalizací, optimistic updates, Toast notifikace
- **Gate Grouping:** Seskupování branek, editor, keyboard shortcuts
- **Kontrola protokolů:** Označování zkontrolovaných, progress bar
- **Settings:** Server config, display options, keyboard shortcuts
- **Akce:** DNS/DNF/CAP, manuální timing
- **Polish:** Error boundaries, empty states, animace, focus trap
- **Testy:** Vitest unit testy, Playwright E2E, screenshoty
- **Docs:** README, CHANGELOG, GitHub Actions CI

### Fáze 16: Design System integrace ✅

**Výstup:** Vizuálně konzistentní aplikace

- Přidány DS komponenty: Tabs, Kbd, ProgressBar, ContextMenu
- Header s DS komponenty (HeaderBrand, HeaderTitle, HeaderActions, HeaderStatus)
- Settings modal s DS Modal, Tabs, Input, Checkbox, Button
- Grid s DS Table, Badge pro status
- Toast, Empty states s DS Card
- Dark mode automaticky přes DS tokeny
- Smazáno ~1000 řádků vlastního CSS

---

## Testovací data

```bash
# Replay server (simulace živého C123)
cd ../c123-protocol-docs/tools
node replay-server.js ../recordings/rec-2025-12-28T09-34-10.jsonl --speed 10 --loop

# c123-server
cd ../c123-server && npm start -- --host localhost --port 27333

# Scoring app
cd ../c123-scoring && npm run dev

# Screenshoty
npx playwright test screenshots-with-data.spec.ts
```

---

## Fáze 17: UX Polish a Tablet Optimalizace

**Cíl:** Opravit UX problémy, optimalizovat pro tablet.

**Cílové zařízení:** Velký tablet (iPad Pro, Surface) - NE mobil.

---

### 17A: Header redesign (KRITICKÉ) ✅

**Problém:** Header je nepřehledný - titěrný selector, dva indikátory, 3× settings ikona.

- [x] 17A.1: Prozkoumat c123-server admin pro inspiraci
- [x] 17A.2: Přepsat Header:
  - `HeaderBrand` - "C123 Scoring"
  - `HeaderActions` - pouze settings tlačítko
  - `HeaderStatus` - pouze vodácký StatusIndicator
- [x] 17A.3: Race selector - zvětšit (použít `Select size="lg"`) v novém RaceBar
- [x] 17A.4: Změnit ⚙ ikonu u gate groups na ✎ (edit)
- [x] 17A.5: Commit

**Řešení:** Nová RaceBar komponenta pod headerem s velkým názvem závodu a select size="lg"

---

### 17B: Grid UX vylepšení ✅

**Problém:** Chybí zvýraznění řádku/sloupce při navigaci.

- [x] 17B.1: Row/column highlight při HOVER (jemné)
- [x] 17B.2: Row/column highlight při FOCUS (výraznější)
- [x] 17B.3: Odstranit sloupec "Klub"
- [x] 17B.4: Commit

---

### 17C: Gate Groups viditelnost ✅

**Problém:** Na screenshotech není vidět že gate groups existují.

- [x] 17C.1: Gate group switcher výraznější (přesunuto do toolbar nad grid)
- [x] 17C.2: Vizuálně označit aktivní skupinu sloupců (accent top border)
- [x] 17C.3: Screenshot s gate groups (odloženo - E2E testy zastaralé)
- [x] 17C.4: Commit

**Řešení:**
- GateGroupSwitcher přesunut z footeru do nového toolbar slotu
- Label zobrazuje aktivní skupinu a počet branek
- Sloupce v aktivní skupině mají accent pruh nahoře (header i buňky)

---

### 17D: Footer sticky ✅

**Problém:** Footer se odscrolluje.

- [x] 17D.1: Footer vždy viditelný dole
- [x] 17D.2: Layout: header (auto) + main (1fr scroll) + footer (auto sticky)
- [x] 17D.3: Commit

**Poznámka:** Implementováno v rámci fáze 17A (sticky footer).

---

### 17E: Řazení závodníků ✅

**Problém:** Jen jedno řazení.

- [x] 17E.1: Možnosti: startOrder, rank (default), bib
- [x] 17E.2: UI pro přepínání (SortSelector komponenta v toolbaru)
- [x] 17E.3: Persistence do localStorage
- [x] 17E.4: Commit

**Řešení:**
- Nový typ `ResultsSortOption` a `RESULTS_SORT_LABELS` v types/ui.ts
- `SortSelector` komponenta s DS Select
- Sorting logic v `ResultsGrid.tsx` (sortBy prop)
- localStorage persistence v App.tsx

---

### 17F: Tablet optimalizace ✅

**Problém:** Optimalizace pro mobil místo tabletu.

- [x] 17F.1: Tablet breakpointy (1366×1024, 1024×1366, atd.)
- [x] 17F.2: Touch targets min 48px
- [ ] 17F.3: Screenshoty: `18-tablet-landscape.png`, `19-tablet-portrait.png` (odloženo - E2E testy zastaralé)
- [x] 17F.4: Commit

**Řešení:**
- Přidány tablet breakpointy 1366px (iPad Pro landscape) a 1024px (iPad landscape)
- Touch targets zvětšeny z 44px na 48px pro lepší ergonomii
- Upraveny padding a font-size pro tablet obrazovky

---

### 17G: Cleanup screenshoty ✅

- [x] 17G.1: Smazat `scoring-live-replay.png` (starý)
- [x] 17G.2: Odstranit mobilní screenshoty (15, 16)
- [ ] 17G.3: Přidat tablet screenshoty (odloženo - E2E testy zastaralé)
- [x] 17G.4: Commit

---

### 17H: Settings konsolidace ✅

**Problém:** 3× zubatá kola (settings ikony).

- [x] 17H.1: Audit settings ikon
- [x] 17H.2: Jediný vstup: header + Ctrl+,
- [x] 17H.3: Odstranit z footeru a od gridu
- [x] 17H.4: Commit

**Řešení:**
- Jediná ⚙ ikona je v headeru (správné místo)
- GateGroupSwitcher má ✎ ikonu (edit) - změněno ve fázi 17A
- Footer nemá settings ikonu - pouze verzi a check progress
- Settings modal má textové "Edit Gate Groups" tlačítko (ne ikonu)
- Klávesová zkratka Ctrl+, funguje globálně

---

### Pořadí implementace

1. **17A** - Header (nejvyšší priorita)
2. **17B** - Grid highlighting
3. **17D** - Sticky footer (rychlé)
4. **17F** - Tablet
5. **17C, 17E, 17G, 17H** - podle času

**Po každé fázi:** Screenshoty s replay serverem.

---

## Fáze 18: Auto-load Gate Groups ze segmentů

**Cíl:** Automaticky načítat gate groups podle segmentů trati z XML dat.

**Status:** ⏸️ BLOKOVÁNO - vyžaduje změny v c123-server

**Problém:**
- WS zpráva `RaceConfig` posílá `gateConfig` bez `S` (splitů)
- V XML je `CourseData.CourseConfig: "NNRNSNNRNSRNNNSRNNNSRRNS"` kde `S` = split boundary
- c123-server **neparsuje** `CourseData` element z XML (viz `XmlDataService.ts`)
- c123-scoring má připravenou infrastrukturu (`CourseSegment`, `createGroupsFromSegments()`) ale žádná data

**Závislost:** Vyžaduje změny v c123-server:
1. Přidat parsování `CourseData` do `XmlDataService.ts`
2. Vystavit nový REST endpoint `/api/xml/courses`
3. Nebo: rozšířit `RaceConfig` WS zprávu o segment info

**Reference:**
- c123-protocol-docs/c123-xml-format.md - sekce "CourseData (Course Configuration)"
- c123-server/src/service/XmlDataService.ts - parsuje pouze Participants, Schedule, Results

---

### 18A: Změny v c123-server (PRVNÍ)

> ⚠️ Vyžaduje schválení - pravidlo "NEMĚNIT c123-server" v CLAUDE.md

- [ ] 18A.1: Přidat parsování `CourseData` do `XmlDataService.ts`
- [ ] 18A.2: Přidat REST endpoint `GET /api/xml/courses`
- [ ] 18A.3: Dokumentovat v `REST-API.md`
- [ ] 18A.4: Commit v c123-server

### 18B: Integrace v c123-scoring

- [ ] 18B.1: Přidat helper `createGroupsFromCourseConfig(courseConfig: string)` do `src/types/gateGroups.ts`
- [ ] 18B.2: Update `useGateGroups` hook - fetch `/api/xml/courses` při změně raceConfig
- [ ] 18B.3: Vrátit skutečné `segmentGroups` místo prázdného pole
- [ ] 18B.4: Commit

### 18C: Verifikace

- [ ] 18C.1: Otestovat s reálným XML (CourseData se segmenty)
- [ ] 18C.2: Zkontrolovat že custom groups mají přednost před segmenty
- [ ] 18C.3: Screenshoty (poznámka: replay nemá CourseData, segmenty nebudou vidět)

---

## Fáze 19: Screenshoty a E2E test refaktoring

**Cíl:** Aktualizovat E2E testy a screenshoty po redesignu UI.

**Status:** ✅ Hotovo

**Problém:**
- E2E testy v `tests/` používaly zastaralé selektory (`.gate-cell`, `.competitor-row`)
- Po redesignu headeru a gridu testy nefungovaly
- Screenshoty neodpovídaly aktuálnímu UI

---

### 19A: E2E test audit ✅

- [x] 19A.1: Aktualizovat `tests/screenshots-static.spec.ts`:
  - Opraveny selektory pro Settings modal (data-testid)
  - Odstraněn mobilní test (16-mobile-settings)
  - Přidán test pro Display tab (05-settings-display)
- [x] 19A.2: Aktualizovat `tests/screenshots-with-data.spec.ts`:
  - Opraven selektor pro race selector (`select[aria-label="Select race"]`)
  - Odstraněn zastaralý selektor `.competitor-row` → `.results-grid tbody tr`
  - Přejmenované screenshoty: 10-gate-group-active, 11-gate-group-indicators, 12-settings-display
  - Přeuspořádány testy (dark mode před tablet testy)
- [x] 19A.3: Mock-data.ts nevyžadovaly změny

### 19B: Screenshot regenerace ✅

- [x] 19B.1: Spustit `./scripts/take-screenshots.sh` - 16 testů prošlo
- [x] 19B.2: Zkontrolovat výstupy - 17 screenshotů vygenerováno
- [x] 19B.3: Tablet screenshoty přidány (18-tablet-landscape, 19-tablet-portrait)
- [ ] 19B.4: Aktualizovat `README.md` s novými screenshoty (TODO)

### 19C: CI/CD update

- [ ] 19C.1: Ověřit že `.github/workflows/ci.yml` funguje s aktualizovanými testy
- [ ] 19C.2: Commit

---

*Poslední aktualizace: 2026-01-18 (Phase 19 completed)*
