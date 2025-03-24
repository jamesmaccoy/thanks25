import React from 'react'
import { UserProvider } from '@/context/userContext' // Import UserProvider
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { RevenueCatProvider } from './RevenueCat'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <UserProvider> {/* Wrap with UserProvider */}
        <HeaderThemeProvider>
          <RevenueCatProvider>{children}</RevenueCatProvider>
        </HeaderThemeProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
