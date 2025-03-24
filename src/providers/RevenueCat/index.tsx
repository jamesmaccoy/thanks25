'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useUserContext } from "@/context/userContext"
import { Purchases } from '@revenuecat/purchases-js'

// Define types for RevenueCat
type CustomerInfo = any

type RevenueCatContextType = {
  customerInfo: CustomerInfo | null
  isLoading: boolean
  isInitialized: boolean
  error: Error | null
  refreshCustomerInfo: () => Promise<CustomerInfo | void>
  restorePurchases: () => Promise<CustomerInfo | void>
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined)

export const RevenueCatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useUserContext()
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    const initRevenueCat = async () => {
      try {
        setIsLoading(true)
        
        if (!process.env.NEXT_PUBLIC_REVENUECAT_PUBLIC_SDK_KEY) {
          throw new Error('RevenueCat public SDK key is not defined')
        }

        // Configure RevenueCat with user ID or anonymous ID
        let userId: string
        if (currentUser?.id) {
          userId = String(currentUser.id)
        } else {
          // Generate an anonymous ID if no user is logged in
          userId = Purchases.generateRevenueCatAnonymousAppUserId()
        }
        
        // Initialize RevenueCat with the public key and user ID
        const purchases = Purchases.configure(
          process.env.NEXT_PUBLIC_REVENUECAT_PUBLIC_SDK_KEY,
          userId
        )
        
        setIsInitialized(true)

        // Get customer info
        const info = await purchases.getCustomerInfo()
        setCustomerInfo(info)
        setError(null)
      } catch (err) {
        console.error('Failed to initialize RevenueCat:', err)
        setError(err instanceof Error ? err : new Error('Unknown error initializing RevenueCat'))
      } finally {
        setIsLoading(false)
      }
    }

    initRevenueCat()
  }, [currentUser?.id])

  const refreshCustomerInfo = async () => {
    if (typeof window === 'undefined') return

    try {
      setIsLoading(true)
      const purchases = Purchases.getSharedInstance()
      const info = await purchases.getCustomerInfo()
      setCustomerInfo(info)
      return info
    } catch (err) {
      console.error('Failed to refresh customer info:', err)
      setError(err instanceof Error ? err : new Error('Unknown error refreshing customer info'))
    } finally {
      setIsLoading(false)
    }
  }

  const restorePurchases = async () => {
    if (typeof window === 'undefined') return
    
    try {
      setIsLoading(true)
      const purchases = Purchases.getSharedInstance()
      const info = await purchases.getCustomerInfo()
      setCustomerInfo(info)
      return info
    } catch (err) {
      console.error('Failed to restore purchases:', err)
      setError(err instanceof Error ? err : new Error('Unknown error restoring purchases'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RevenueCatContext.Provider
      value={{
        customerInfo,
        isLoading,
        isInitialized,
        error,
        refreshCustomerInfo,
        restorePurchases,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  )
}

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext)
  if (context === undefined) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider')
  }
  return context
} 