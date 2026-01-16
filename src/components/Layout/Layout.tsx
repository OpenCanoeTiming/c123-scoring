import type { ReactNode } from 'react'
import styles from './Layout.module.css'

interface LayoutProps {
  header: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function Layout({ header, children, footer }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>{header}</header>
      <main className={styles.main}>{children}</main>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  )
}
