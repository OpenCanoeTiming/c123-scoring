import type { ReactNode } from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  title?: string
  raceInfo?: string
  connectionStatus: ReactNode
  actions?: ReactNode
}

export function Header({
  title = 'C123 Scoring',
  raceInfo,
  connectionStatus,
  actions,
}: HeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        {raceInfo && <span className={styles.raceInfo}>{raceInfo}</span>}
      </div>
      <div className={styles.right}>
        {actions}
        {connectionStatus}
      </div>
    </div>
  )
}
