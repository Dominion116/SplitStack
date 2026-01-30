import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect'
import { STACKS_TESTNET } from '@stacks/network'

export const network = STACKS_TESTNET
export const contractAddress = 'ST30VGN68PSGVWGNMD0HH2WQMM5T486EK3WBNTHCY'
export const contractName = 'split-stack-v2'

export const appDetails = {
  name: 'SplitStack',
  icon: window.location.origin + '/vite.svg',
}

interface StacksContextType {
  isWalletConnected: boolean
  stxAddress: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const StacksContext = createContext<StacksContextType | null>(null)

export function StacksProvider({ children }: { children: ReactNode }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [stxAddress, setStxAddress] = useState<string | null>(null)

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = () => {
      const connected = isConnected()
      setIsWalletConnected(connected)
      
      if (connected) {
        const storage = getLocalStorage()
        const addresses = storage?.addresses
        if (addresses) {
          // Access STX addresses from the storage object
          const stxAddresses = (addresses as any)?.stx || []
          if (stxAddresses.length > 0) {
            // Get the first STX address
            const address = stxAddresses[0]?.address
            setStxAddress(address || null)
          }
        }
      }
    }
    
    checkConnection()
  }, [])

  const connectWallet = useCallback(async () => {
    try {
      const response = await connect({
        appDetails: {
          name: 'SplitStack',
          icon: window.location.origin + '/vite.svg',
        },
        onFinish: (data) => {
          console.log('Wallet connected:', data)
          setIsWalletConnected(true)
          
          // Get address from userSession
          const userData = data.userSession.loadUserData()
          const profile = userData.profile
          const stxAddress = profile?.stxAddress?.testnet || profile?.stxAddress?.mainnet
          
          if (stxAddress) {
            setStxAddress(stxAddress)
          }
        },
        onCancel: () => {
          console.log('Wallet connection cancelled')
        },
      })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    disconnect()
    setIsWalletConnected(false)
    setStxAddress(null)
  }, [])

  return (
    <StacksContext.Provider
      value={{
        isWalletConnected,
        stxAddress,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </StacksContext.Provider>
  )
}

export function useStacks() {
  const context = useContext(StacksContext)
  if (!context) {
    throw new Error('useStacks must be used within a StacksProvider')
  }
  return context
}

// Re-export request for contract calls
export { request }
