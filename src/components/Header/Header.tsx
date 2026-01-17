import type { ReactNode } from 'react'
import {
  Header as DSHeader,
  HeaderBrand,
  HeaderTitle,
  HeaderActions,
  HeaderStatus,
} from '@opencanoetiming/timing-design-system'

interface HeaderProps {
  title?: string
  connectionStatus: ReactNode
  actions?: ReactNode
}

export function Header({
  title = 'C123 Scoring',
  connectionStatus,
  actions,
}: HeaderProps) {
  return (
    <DSHeader>
      <HeaderBrand>
        <HeaderTitle>{title}</HeaderTitle>
      </HeaderBrand>
      {actions && <HeaderActions>{actions}</HeaderActions>}
      <HeaderStatus>
        {connectionStatus}
      </HeaderStatus>
    </DSHeader>
  )
}
