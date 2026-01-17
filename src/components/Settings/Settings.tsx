/**
 * Settings Component
 *
 * Modal panel for configuring application settings:
 * - Server connection URL
 * - Gate groups (links to GateGroupEditor)
 * - Other preferences
 */

import { useState, useCallback } from 'react'
import type { GateGroup } from '../../types/ui'
import type { Settings as SettingsType } from '../../hooks/useSettings'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import styles from './Settings.module.css'

export interface SettingsProps {
  /** Current settings values */
  settings: SettingsType
  /** Callback when settings change */
  onSettingsChange: (settings: Partial<SettingsType>) => void
  /** Current connection status for testing */
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error'
  /** Callback to test connection */
  onTestConnection: (url: string) => void
  /** Gate groups for the gate group tab */
  gateGroups?: GateGroup[]
  /** Callback to open gate group editor */
  onOpenGateGroupEditor?: () => void
  /** Callback to close settings */
  onClose: () => void
}

type SettingsTab = 'server' | 'display' | 'keyboard'

export function Settings({
  settings,
  onSettingsChange,
  connectionState,
  onTestConnection,
  gateGroups,
  onOpenGateGroupEditor,
  onClose,
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('server')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  // Local edit state for URL - tracks if user is editing
  const [localServerUrl, setLocalServerUrl] = useState<string | null>(null)

  // Use local edit state if user has edited, otherwise use settings value
  const serverUrl = localServerUrl ?? settings.serverUrl

  // Focus trap for modal accessibility
  const modalRef = useFocusTrap<HTMLDivElement>({ enabled: true })

  // Validate WebSocket URL
  const validateUrl = useCallback((url: string): string | null => {
    if (!url.trim()) {
      return 'Server URL is required'
    }
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'ws:' && parsed.protocol !== 'wss:') {
        return 'URL must use ws:// or wss:// protocol'
      }
      return null
    } catch {
      return 'Invalid URL format'
    }
  }, [])

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = e.target.value
      setLocalServerUrl(newUrl)
      setUrlError(validateUrl(newUrl))
    },
    [validateUrl]
  )

  const handleSaveUrl = useCallback(() => {
    const error = validateUrl(serverUrl)
    if (error) {
      setUrlError(error)
      return
    }
    onSettingsChange({ serverUrl })
  }, [serverUrl, validateUrl, onSettingsChange])

  const handleTestConnection = useCallback(() => {
    const error = validateUrl(serverUrl)
    if (error) {
      setUrlError(error)
      return
    }
    setIsTesting(true)
    onTestConnection(serverUrl)
    // Reset testing state after a delay
    setTimeout(() => setIsTesting(false), 2000)
  }, [serverUrl, validateUrl, onTestConnection])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  // Connection status indicator
  const getConnectionStatusDisplay = () => {
    if (isTesting) {
      return { text: 'Testing...', className: styles.statusConnecting }
    }
    switch (connectionState) {
      case 'connected':
        return { text: 'Connected', className: styles.statusConnected }
      case 'connecting':
        return { text: 'Connecting...', className: styles.statusConnecting }
      case 'error':
        return { text: 'Error', className: styles.statusError }
      default:
        return { text: 'Disconnected', className: styles.statusDisconnected }
    }
  }

  const connectionStatus = getConnectionStatusDisplay()

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div ref={modalRef} className={styles.modal} data-testid="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="settings-title" className={styles.title}>
            Settings
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close settings"
            data-testid="settings-close"
          >
            ×
          </button>
        </div>

        <div className={styles.tabs} role="tablist">
          <button
            className={`${styles.tab} ${activeTab === 'server' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('server')}
            role="tab"
            aria-selected={activeTab === 'server'}
            data-testid="settings-tab-server"
          >
            Server
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'display' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('display')}
            role="tab"
            aria-selected={activeTab === 'display'}
            data-testid="settings-tab-display"
          >
            Display
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'keyboard' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('keyboard')}
            role="tab"
            aria-selected={activeTab === 'keyboard'}
            data-testid="settings-tab-keyboard"
          >
            Keyboard
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'server' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Server Connection</h3>

              <div className={styles.field}>
                <label htmlFor="server-url" className={styles.label}>
                  WebSocket URL
                </label>
                <div className={styles.inputGroup}>
                  <input
                    id="server-url"
                    type="text"
                    className={`${styles.input} ${urlError ? styles.inputError : ''}`}
                    value={serverUrl}
                    onChange={handleUrlChange}
                    placeholder="ws://localhost:27123/ws"
                    autoComplete="url"
                    data-testid="settings-server-url"
                  />
                  <span className={`${styles.status} ${connectionStatus.className}`}>
                    {connectionStatus.text}
                  </span>
                </div>
                {urlError && <p className={styles.errorText}>{urlError}</p>}
                <p className={styles.helpText}>
                  Enter the WebSocket URL of the c123-server instance.
                </p>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.secondaryButton}
                  onClick={handleTestConnection}
                  disabled={!!urlError || isTesting}
                >
                  Test Connection
                </button>
                <button
                  className={styles.primaryButton}
                  onClick={handleSaveUrl}
                  disabled={!!urlError || serverUrl === settings.serverUrl}
                >
                  Save & Reconnect
                </button>
              </div>

              {/* Connection History */}
              {settings.serverHistory && settings.serverHistory.length > 0 && (
                <div className={styles.field}>
                  <label className={styles.label}>Recent Servers</label>
                  <div className={styles.historyList}>
                    {settings.serverHistory.slice(0, 5).map((url) => (
                      <button
                        key={url}
                        className={styles.historyItem}
                        onClick={() => {
                          setLocalServerUrl(url)
                          setUrlError(null)
                        }}
                      >
                        {url}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'display' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Display Options</h3>

              <div className={styles.field}>
                <label className={styles.label}>Gate Groups</label>
                {gateGroups && gateGroups.length > 0 ? (
                  <p className={styles.helpText}>
                    {gateGroups.length} custom group(s) configured.
                  </p>
                ) : (
                  <p className={styles.helpText}>No custom gate groups configured.</p>
                )}
                {onOpenGateGroupEditor && (
                  <button
                    className={styles.secondaryButton}
                    onClick={() => {
                      onClose()
                      onOpenGateGroupEditor()
                    }}
                  >
                    Edit Gate Groups
                  </button>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.showFinished ?? true}
                    onChange={(e) =>
                      onSettingsChange({ showFinished: e.target.checked })
                    }
                  />
                  <span>Show finished competitors</span>
                </label>
                <p className={styles.helpText}>
                  Display competitors who have completed their run in the grid.
                </p>
              </div>

              <div className={styles.field}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.showOnCourse ?? true}
                    onChange={(e) =>
                      onSettingsChange({ showOnCourse: e.target.checked })
                    }
                  />
                  <span>Show on-course competitors</span>
                </label>
                <p className={styles.helpText}>
                  Display competitors who are still racing on the course.
                </p>
              </div>

              <div className={styles.field}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.compactMode ?? false}
                    onChange={(e) =>
                      onSettingsChange({ compactMode: e.target.checked })
                    }
                  />
                  <span>Compact mode</span>
                </label>
                <p className={styles.helpText}>
                  Use smaller cell sizes for more gates on screen.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'keyboard' && (
            <div className={styles.section} data-testid="settings-keyboard-content">
              <h3 className={styles.sectionTitle}>Keyboard Shortcuts</h3>

              <div className={styles.shortcutList}>
                <div className={styles.shortcutGroup}>
                  <h4 className={styles.shortcutGroupTitle}>Navigation</h4>
                  <Shortcut keys={['Arrow Keys']} description="Move between cells" />
                  <Shortcut keys={['Tab']} description="Move to next cell" />
                  <Shortcut keys={['Shift', 'Tab']} description="Move to previous cell" />
                  <Shortcut keys={['Home']} description="Go to first gate" />
                  <Shortcut keys={['End']} description="Go to last gate" />
                </div>

                <div className={styles.shortcutGroup}>
                  <h4 className={styles.shortcutGroupTitle}>Penalty Entry</h4>
                  <Shortcut keys={['0']} description="Clear / 0 penalty" />
                  <Shortcut keys={['2']} description="2s touch penalty" />
                  <Shortcut keys={['5']} description="50s missed gate" />
                  <Shortcut keys={['Delete']} description="Clear penalty" />
                  <Shortcut keys={['Space']} description="Toggle checked status" />
                </div>

                <div className={styles.shortcutGroup}>
                  <h4 className={styles.shortcutGroupTitle}>Gate Groups</h4>
                  <Shortcut keys={['1', '-', '9']} description="Switch to group 1-9" />
                  <Shortcut keys={['0']} description="Show all gates" />
                </div>

                <div className={styles.shortcutGroup}>
                  <h4 className={styles.shortcutGroupTitle}>General</h4>
                  <Shortcut keys={['Ctrl', ',']} description="Open settings" />
                  <Shortcut keys={['Escape']} description="Close dialog" />
                  <Shortcut keys={['?']} description="Show keyboard help" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ShortcutProps {
  keys: string[]
  description: string
}

function Shortcut({ keys, description }: ShortcutProps) {
  return (
    <div className={styles.shortcut}>
      <div className={styles.shortcutKeys}>
        {keys.map((key, i) => (
          <span key={i}>
            <kbd className={styles.key}>{key}</kbd>
            {i < keys.length - 1 && <span className={styles.keyPlus}>+</span>}
          </span>
        ))}
      </div>
      <span className={styles.shortcutDescription}>{description}</span>
    </div>
  )
}
