import { useState, useEffect, useCallback } from 'react'
import { Layout, Header, ConnectionStatus, RaceSelector } from './components'
import { useC123WebSocket } from './hooks/useC123WebSocket'
import { useConnectionStatus } from './hooks/useConnectionStatus'
import { useSchedule } from './hooks/useSchedule'
import './App.css'

const DEFAULT_SERVER_URL = 'ws://localhost:27123/ws'
const STORAGE_KEY_SELECTED_RACE = 'c123-scoring-selected-race'

function App() {
  const serverUrl = DEFAULT_SERVER_URL

  const {
    connectionState,
    serverInfo,
    lastMessageTime,
    lastError,
    schedule,
  } = useC123WebSocket({ url: serverUrl })

  const status = useConnectionStatus(
    connectionState,
    serverInfo,
    lastMessageTime,
    lastError
  )

  const { activeRaces, runningRace, getRaceById } = useSchedule(schedule)

  // Selected race with localStorage persistence
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_SELECTED_RACE)
    } catch {
      return null
    }
  })

  // Auto-select running race if nothing selected
  useEffect(() => {
    if (!selectedRaceId && runningRace) {
      setSelectedRaceId(runningRace.raceId)
    }
  }, [selectedRaceId, runningRace])

  // Persist selected race to localStorage
  const handleSelectRace = useCallback((raceId: string) => {
    setSelectedRaceId(raceId)
    try {
      localStorage.setItem(STORAGE_KEY_SELECTED_RACE, raceId)
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const selectedRace = selectedRaceId ? getRaceById(selectedRaceId) : null

  return (
    <Layout
      header={
        <Header
          raceInfo={selectedRace?.mainTitle}
          connectionStatus={
            <ConnectionStatus status={status} serverUrl={serverUrl} showDetails />
          }
          actions={
            <RaceSelector
              races={activeRaces}
              selectedRaceId={selectedRaceId}
              onSelectRace={handleSelectRace}
            />
          }
        />
      }
      footer={
        <span>C123 Scoring v0.1.0 &bull; Open Canoe Timing</span>
      }
    >
      <p className="placeholder">
        {selectedRace
          ? `Selected: ${selectedRace.mainTitle}`
          : 'Select a race to start scoring'}
      </p>
    </Layout>
  )
}

export default App
