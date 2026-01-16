# C123-Scoring API Reference

Tato dokumentace popisuje API, které c123-scoring aplikace používá pro komunikaci s c123-server.

---

## Přehled

C123-scoring komunikuje s c123-server dvěma způsoby:

| Typ | Účel | Endpoint |
|-----|------|----------|
| **WebSocket** | Real-time data (čtení) | `ws://<server>:27123/ws` |
| **REST API** | Příkazy (zápis) | `http://<server>:27123/api/c123/*` |

```
┌─────────────────────────────────────────────────────────────┐
│                    c123-scoring (FE)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
   WebSocket /ws                    REST API
   (OnCourse, Results,           (/api/c123/*)
    RaceConfig, Schedule)
          │                               │
          └───────────────┬───────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   c123-server :27123                        │
└─────────────────────────────────────────────────────────────┘
```

---

## WebSocket API (čtení dat)

### Připojení

```javascript
const ws = new WebSocket('ws://localhost:27123/ws');
```

### Formát zpráv

Všechny zprávy jsou JSON objekty:

```typescript
interface WebSocketMessage {
  type: string;
  timestamp: string;  // ISO 8601
  data: unknown;
}
```

### Relevantní typy zpráv

#### OnCourse

Závodníci aktuálně na trati s penalizacemi. Hlavní zdroj dat pro scoring grid.

```json
{
  "type": "OnCourse",
  "timestamp": "2025-01-16T10:30:00.000Z",
  "data": {
    "competitors": [
      {
        "bib": "10",
        "position": 3,
        "rank": 0,
        "completed": false,
        "time": 4523,
        "pen": 2,
        "gates": "00020000000000000000",
        "firstName": "Jan",
        "lastName": "NOVAK",
        "club": "TJ DUKLA Praha"
      }
    ]
  }
}
```

| Pole | Typ | Popis |
|------|-----|-------|
| `bib` | string | Startovní číslo |
| `position` | number | Pozice na trati (1 = první startoval) |
| `rank` | number | Pořadí po dojezdu (0 = ještě jede) |
| `completed` | boolean | Zda závodník dojel |
| `time` | number | Čas v centisekundách |
| `pen` | number | Celková penalizace v sekundách |
| `gates` | string | Penalizace po brankách (pozice = branka-1, hodnota = 0/2/5) |
| `firstName` | string | Křestní jméno |
| `lastName` | string | Příjmení |
| `club` | string | Klub |

**Dekódování `gates` pole:**

```typescript
function parseGates(gates: string): number[] {
  return gates.split('').map(char => {
    if (char === '0') return 0;
    if (char === '2') return 2;
    if (char === '5') return 50;
    return -1; // neznámá hodnota
  });
}

// Příklad: "00020000..." => [0, 0, 0, 2, 0, 0, 0, 0, ...]
// Index 3 = branka 4 = penalizace 2s
```

---

#### RaceConfig

Konfigurace aktuálního závodu - počet branek a jejich typy.

```json
{
  "type": "RaceConfig",
  "timestamp": "2025-01-16T10:30:00.000Z",
  "data": {
    "raceId": "K1M_ST_BR1_6",
    "gateCount": 20,
    "gateTypes": "RNNRNNNRNNNRNNNNNNRN"
  }
}
```

| Pole | Typ | Popis |
|------|-----|-------|
| `raceId` | string | ID závodu |
| `gateCount` | number | Počet branek |
| `gateTypes` | string | Typy branek (N = normální/zelená, R = reverse/červená) |

---

#### Schedule

Seznam všech závodů s jejich stavem.

```json
{
  "type": "Schedule",
  "timestamp": "2025-01-16T10:30:00.000Z",
  "data": {
    "races": [
      {
        "raceId": "K1M_ST_BR1_6",
        "classId": "K1M_ST",
        "disId": "BR1",
        "raceOrder": 101,
        "startTime": "10:00:00",
        "raceStatus": 5,
        "customTitle": "K1m - short track - 1st run"
      }
    ]
  }
}
```

| Pole | Typ | Popis |
|------|-----|-------|
| `raceId` | string | Unikátní ID závodu |
| `classId` | string | ID kategorie (K1M_ST, C1W, ...) |
| `disId` | string | ID jízdy (BR1 = 1. jízda, BR2 = 2. jízda) |
| `raceOrder` | number | Pořadí v programu |
| `startTime` | string | Plánovaný čas startu (HH:MM:SS) |
| `raceStatus` | number | Stav závodu (viz tabulka níže) |
| `customTitle` | string | Zobrazovaný název |

**RaceStatus hodnoty:**

| Hodnota | Stav | Popis |
|---------|------|-------|
| 1 | Planned | Naplánováno |
| 2 | Ready | Připraveno ke startu |
| 3 | Running | Probíhá |
| 4 | Paused | Pozastaveno |
| 5 | Finished | Dokončeno |
| 9 | Cancelled | Zrušeno |

Pro scoring jsou relevantní závody se statusem **3 (Running)** nebo **5 (Finished)**.

---

#### Results

Výsledky závodu (po dojezdu závodníků).

```json
{
  "type": "Results",
  "timestamp": "2025-01-16T10:30:00.000Z",
  "data": {
    "raceId": "K1M_ST_BR1_6",
    "results": [
      {
        "bib": "10",
        "rank": 1,
        "time": 7899,
        "pen": 2,
        "total": 8099,
        "status": "",
        "firstName": "Jan",
        "lastName": "NOVAK"
      }
    ]
  }
}
```

| Pole | Typ | Popis |
|------|-----|-------|
| `bib` | string | Startovní číslo |
| `rank` | number | Pořadí ve výsledcích |
| `time` | number | Čistý čas v centisekundách |
| `pen` | number | Penalizace v sekundách |
| `total` | number | Celkový čas v centisekundách |
| `status` | string | Prázdné = platný, jinak DSQ/DNS/DNF |

---

## REST API (zápis příkazů)

### Prerekvizity

- c123-server musí mít aktivní TCP spojení s Canoe123
- Pokud TCP není připojeno, všechny endpointy vrací `503 Service Unavailable`

---

### POST /api/c123/scoring

Odeslání penalizace do C123.

**Request:**

```json
{
  "bib": "10",
  "gate": 5,
  "value": 2
}
```

| Pole | Typ | Povinné | Validace | Popis |
|------|-----|---------|----------|-------|
| `bib` | string | Ano | Neprázdný | Startovní číslo |
| `gate` | number | Ano | 1-24 | Číslo branky |
| `value` | number | Ano | 0, 2, nebo 50 | Penalizace |

**Hodnoty penalizací:**

| Hodnota | Význam |
|---------|--------|
| `0` | Čistě (bez penalizace) |
| `2` | Dotek (+2 sekundy) |
| `50` | Nejetí (+50 sekund) |

**Response (200):**

```json
{
  "success": true,
  "bib": "10",
  "gate": 5,
  "value": 2
}
```

**Errors:**

| Status | Popis |
|--------|-------|
| 400 | Chybějící nebo neplatné parametry |
| 503 | TCP spojení s C123 není aktivní |

---

### POST /api/c123/remove-from-course

Odstranění závodníka z trati (DNS, DNF, CAP).

**Request:**

```json
{
  "bib": "10",
  "reason": "DNS",
  "position": 1
}
```

| Pole | Typ | Povinné | Validace | Popis |
|------|-----|---------|----------|-------|
| `bib` | string | Ano | Neprázdný | Startovní číslo |
| `reason` | string | Ano | DNS, DNF, CAP | Důvod |
| `position` | number | Ne | > 0 | Pozice (default: 1) |

**Hodnoty reason:**

| Hodnota | Význam |
|---------|--------|
| `DNS` | Did Not Start - neodstartoval |
| `DNF` | Did Not Finish - nedojel |
| `CAP` | Capsized - převrátil se |

**Response (200):**

```json
{
  "success": true,
  "bib": "10",
  "reason": "DNS",
  "position": 1
}
```

---

### POST /api/c123/timing

Manuální timing impuls (náhrada za fotobunku).

**Request:**

```json
{
  "bib": "10",
  "channelPosition": "Start"
}
```

| Pole | Typ | Povinné | Validace | Popis |
|------|-----|---------|----------|-------|
| `bib` | string | Ano | Neprázdný | Startovní číslo |
| `channelPosition` | string | Ano | Start, Finish, Split1, Split2 | Pozice |

**Hodnoty channelPosition:**

| Hodnota | Popis |
|---------|-------|
| `Start` | Start impuls |
| `Finish` | Cíl impuls |
| `Split1` | První mezičas |
| `Split2` | Druhý mezičas |

**Response (200):**

```json
{
  "success": true,
  "bib": "10",
  "channelPosition": "Start"
}
```

---

## Implementace v c123-scoring

### WebSocket hook

```typescript
// hooks/useC123WebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';

export function useC123WebSocket(serverUrl: string) {
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [onCourse, setOnCourse] = useState<Competitor[]>([]);
  const [schedule, setSchedule] = useState<Race[]>([]);
  const [raceConfig, setRaceConfig] = useState<RaceConfig | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${serverUrl}/ws`);
    wsRef.current = ws;

    ws.onopen = () => setConnectionState('connected');
    ws.onclose = () => setConnectionState('disconnected');

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case 'OnCourse':
          setOnCourse(msg.data.competitors);
          break;
        case 'Schedule':
          setSchedule(msg.data.races);
          break;
        case 'RaceConfig':
          setRaceConfig(msg.data);
          break;
      }
    };

    return () => ws.close();
  }, [serverUrl]);

  return { connectionState, onCourse, schedule, raceConfig };
}
```

### Scoring API service

```typescript
// services/scoringApi.ts
const API_BASE = 'http://localhost:27123';

export async function sendScoring(bib: string, gate: number, value: 0 | 2 | 50): Promise<void> {
  const response = await fetch(`${API_BASE}/api/c123/scoring`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bib, gate, value })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Scoring failed');
  }
}

export async function sendRemoveFromCourse(
  bib: string,
  reason: 'DNS' | 'DNF' | 'CAP'
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/c123/remove-from-course`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bib, reason })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Remove from course failed');
  }
}

export async function sendTiming(
  bib: string,
  channelPosition: 'Start' | 'Finish' | 'Split1' | 'Split2'
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/c123/timing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bib, channelPosition })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Timing failed');
  }
}
```

---

## Časový formát

Časy jsou v **centisekundách** (1/100 sekundy):

| Hodnota | Zobrazení |
|---------|-----------|
| `7899` | 78.99s |
| `8156` | 81.56s |
| `12345` | 123.45s = 2:03.45 |

```typescript
function formatTime(centiseconds: number): string {
  const totalSeconds = centiseconds / 100;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
  }
  return seconds.toFixed(2);
}
```

---

## Viz také

- [c123-server REST-API.md](../../c123-server/docs/REST-API.md) - Kompletní REST API dokumentace
- [c123-server C123-PROTOCOL.md](../../c123-server/docs/C123-PROTOCOL.md) - WebSocket protokol
- [README.md](../README.md) - Hlavní dokumentace projektu
