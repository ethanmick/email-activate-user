'use client'

import { LotusProvider } from 'lotus-ux'
import { SessionProvider } from 'next-auth/react'

type Props = {
  children?: React.ReactNode
}

export const Providers = ({ children }: Props) => {
  return (
    <SessionProvider>
      <LotusProvider>{children}</LotusProvider>
    </SessionProvider>
  )
}
