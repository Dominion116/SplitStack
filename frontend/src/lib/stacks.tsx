import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect'
import { STACKS_MAINNET } from '@stacks/network'

export const network = STACKS_MAINNET
export const contractAddress = 'SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y'
export const contractName = 'split-stack-v2'

export const appDetails = {
  name: 'SplitStack',
  icon: window.location.origin + '/vite.svg',
}

interface StacksContextType {
  isWalletConnected: boolean
  stxAddress: string | null
  connectWallet: () => void
  disconnectWallet: () => void
}

const StacksContext = createContext<StacksContextType | null>(null)

export function StacksProvider({ children }: { children: ReactNode }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [stxAddress, setStxAddress] = useState<string | null>(null)

  // Check connection status on mount
  useEffect(() => {
    const connected = isConnected()
    if (connected) {
      setIsWalletConnected(true)
      const storage = getLocalStorage()
      if (storage?.addresses?.stx?.[0]?.address) {
        setStxAddress(storage.addresses.stx[0].address)
      }
    }
  }, [])

  const connectWallet = useCallback(async () => {
    try {
      const response = await connect({
        appDetails,
      })
      console.log('Connect response:', JSON.stringify(response, null, 2))
      
      // Try to get address from response first
      let address = response?.addresses?.stx?.[0]?.address
      
      // If not in response, check localStorage
      if (!address) {
        const storage = getLocalStorage()
        console.log('Storage:', JSON.stringify(storage, null, 2))
        address = storage?.addresses?.stx?.[0]?.address
      }
      
      if (address) {
        setStxAddress(address)
        setIsWalletConnected(true)
      } else {
        // Fallback: mark as connected anyway and let user see it worked
        setIsWalletConnected(true)
        console.log('Connected but could not extract address')
      }
    } catch (error) {
      console.error('Failed to connect:', error)
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
