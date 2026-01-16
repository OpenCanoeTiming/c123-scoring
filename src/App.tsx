import { Layout, Header, ConnectionStatus } from './components'
import { useC123WebSocket } from './hooks/useC123WebSocket'
import { useConnectionStatus } from './hooks/useConnectionStatus'
import './App.css'

const DEFAULT_SERVER_URL = 'ws://localhost:27123/ws'

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

  // Get active race info from schedule (raceStatus 3 = running)
  const activeRace = schedule?.races.find((r) => r.raceStatus >= 3 && r.raceStatus <= 5)
  const raceInfo = activeRace ? activeRace.mainTitle : undefined

  return (
    <Layout
      header={
        <Header
          raceInfo={raceInfo}
          connectionStatus={
            <ConnectionStatus status={status} serverUrl={serverUrl} showDetails />
          }
        />
      }
      footer={
        <span>C123 Scoring v0.1.0 &bull; Open Canoe Timing</span>
      }
    >
      <p className="placeholder">
        Penalty scoring application for canoe slalom timing
      </p>
    </Layout>
  )
}

export default App
