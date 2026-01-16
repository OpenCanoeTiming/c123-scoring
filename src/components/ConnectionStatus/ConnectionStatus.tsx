import type { ConnectionStatus as ConnectionStatusType } from '../../hooks/useConnectionStatus'
import styles from './ConnectionStatus.module.css'

interface ConnectionStatusProps {
  status: ConnectionStatusType
  serverUrl?: string
  showDetails?: boolean
}

export function ConnectionStatus({
  status,
  serverUrl,
  showDetails = false,
}: ConnectionStatusProps) {
  const indicatorClass = styles[`indicator--${status.statusClass}`] || ''

  return (
    <div className={styles.container} data-testid="connection-status" data-status={status.statusClass}>
      <div className={`${styles.indicator} ${indicatorClass}`} />
      <div className={styles.content}>
        <span className={styles.text}>{status.statusText}</span>
        {showDetails && (
          <div className={styles.details}>
            {serverUrl && <span className={styles.server}>{serverUrl}</span>}
            {status.latency !== null && status.isHealthy && (
              <span className={styles.latency}>{formatLatency(status.latency)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}
