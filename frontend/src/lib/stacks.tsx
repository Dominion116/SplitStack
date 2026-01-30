import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect'
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
      console.log('Connected!', response)
      if (response?.addresses?.stx?.[0]?.address) {
        setStxAddress(response.addresses.stx[0].address)
        setIsWalletConnected(true)
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
