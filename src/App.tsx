import { useState, useEffect, useCallback, useMemo } from 'react'
import { Layout, Header, ConnectionStatus, RaceSelector, OnCourseGrid, GateGroupSwitcher, GateGroupEditor, CheckProgress, Settings } from './components'
import { useC123WebSocket } from './hooks/useC123WebSocket'
import { useConnectionStatus } from './hooks/useConnectionStatus'
import { useSchedule } from './hooks/useSchedule'
import { useGateGroups } from './hooks/useGateGroups'
import { useGateGroupShortcuts } from './hooks/useGateGroupShortcuts'
import { useCheckedState } from './hooks/useCheckedState'
import { useSettings } from './hooks/useSettings'
import { useSettingsShortcut } from './hooks/useSettingsShortcut'
import './App.css'

const STORAGE_KEY_SELECTED_RACE = 'c123-scoring-selected-race'

function App() {
  // Settings
  const { settings, updateSettings } = useSettings()

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false)

  // Gate group editor state
  const [showGateGroupEditor, setShowGateGroupEditor] = useState(false)

  // Settings keyboard shortcut (Ctrl+,)
  useSettingsShortcut({
    onOpenSettings: () => setShowSettings(true),
    enabled: !showSettings && !showGateGroupEditor,
  })

  const {
    connectionState,
    serverInfo,
    lastMessageTime,
    lastError,
    schedule,
    onCourse,
    raceConfig,
    connect,
  } = useC123WebSocket({ url: settings.serverUrl })

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

  // Gate groups hook
  const {
    allGroups,
    customGroups,
    activeGroup,
    activeGroupId,
    setActiveGroup,
    addGroup,
    updateGroup,
    removeGroup,
  } = useGateGroups({
    raceConfig,
    raceId: selectedRaceId,
  })

  // Gate group keyboard shortcuts (1-9, 0)
  useGateGroupShortcuts({
    groups: allGroups,
    onSelectGroup: setActiveGroup,
    enabled: !showGateGroupEditor && !showSettings, // Disable when modal is open
  })

  // Handler for testing connection from settings
  const handleTestConnection = useCallback(
    (url: string) => {
      // If URL is different from current, we'd need to temporarily connect
      // For now, just trigger a reconnect if same URL
      if (url === settings.serverUrl) {
        connect()
      }
    },
    [settings.serverUrl, connect]
  )

  // Handler for settings change that triggers reconnect
  const handleSettingsChange = useCallback(
    (updates: Parameters<typeof updateSettings>[0]) => {
      updateSettings(updates)
      // If server URL changed, the WebSocket hook will auto-reconnect due to URL change
    },
    [updateSettings]
  )

  // Protocol check state
  const {
    isChecked,
    toggleChecked,
    getProgress,
  } = useCheckedState({
    raceId: selectedRaceId,
    groupId: activeGroupId,
  })

  // Get list of finished competitor bibs for progress calculation
  const finishedCompetitorBibs = useMemo(() => {
    if (!onCourse?.competitors) return []
    return onCourse.competitors
      .filter((c) => c.completed && c.raceId === selectedRaceId)
      .map((c) => c.bib)
  }, [onCourse?.competitors, selectedRaceId])

  // Calculate check progress
  const checkProgress = useMemo(() => {
    return getProgress(finishedCompetitorBibs)
  }, [getProgress, finishedCompetitorBibs])

  return (
    <Layout
      header={
        <Header
          raceInfo={selectedRace?.mainTitle}
          connectionStatus={
            <ConnectionStatus status={status} serverUrl={settings.serverUrl} showDetails />
          }
          actions={
            <>
              <RaceSelector
                races={activeRaces}
                selectedRaceId={selectedRaceId}
                onSelectRace={handleSelectRace}
              />
              <button
                className="settings-button"
                onClick={() => setShowSettings(true)}
                aria-label="Settings"
                title="Settings (Ctrl+,)"
              >
                ⚙
              </button>
            </>
          }
        />
      }
      footer={
        <div className="footer-content">
          <span>C123 Scoring v0.1.0 &bull; Open Canoe Timing</span>
          {finishedCompetitorBibs.length > 0 && (
            <CheckProgress
              progress={checkProgress}
              label={activeGroup ? `${activeGroup.name}` : 'Checked'}
              compact
            />
          )}
        </div>
      }
    >
      {/* Gate Group Switcher */}
      {raceConfig && (
        <GateGroupSwitcher
          groups={allGroups}
          activeGroupId={activeGroupId}
          onSelectGroup={setActiveGroup}
          onOpenEditor={() => setShowGateGroupEditor(true)}
        />
      )}

      {/* Gate Group Editor Modal */}
      {showGateGroupEditor && raceConfig && (
        <div className="modal-overlay" onClick={() => setShowGateGroupEditor(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <GateGroupEditor
              totalGates={raceConfig.nrGates}
              groups={customGroups}
              activeGroupId={activeGroupId}
              onAddGroup={addGroup}
              onUpdateGroup={updateGroup}
              onRemoveGroup={removeGroup}
              onSetActiveGroup={setActiveGroup}
              onClose={() => setShowGateGroupEditor(false)}
            />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Settings
          settings={settings}
          onSettingsChange={handleSettingsChange}
          connectionState={connectionState}
          onTestConnection={handleTestConnection}
          gateGroups={customGroups}
          onOpenGateGroupEditor={() => setShowGateGroupEditor(true)}
          onClose={() => setShowSettings(false)}
        />
      )}

      {onCourse ? (
        <OnCourseGrid
          competitors={onCourse.competitors}
          raceConfig={raceConfig}
          selectedRaceId={selectedRaceId}
          activeGateGroup={activeGroup}
          allGateGroups={allGroups}
          isChecked={isChecked}
          onToggleChecked={toggleChecked}
          showFinished={settings.showFinished}
          showOnCourse={settings.showOnCourse}
        />
      ) : (
        <p className="placeholder">
          {selectedRace
            ? 'Waiting for competitors on course...'
            : 'Select a race to start scoring'}
        </p>
      )}
    </Layout>
  )
}

export default App
