import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect'
import { STACKS_TESTNET } from '@stacks/network'

export const network = STACKS_TESTNET
export const contractAddress = 'ST1P5VMVNKV33KQ7HXA43WVFQHTM9JBFBWXC0WNX8'
export const contractName = 'split-payment'

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
        if (addresses && addresses.length > 0) {
          // Find testnet address first, then mainnet
          const testnetAddr = addresses.find((a: any) => a.address?.startsWith('ST'))?.address
          const mainnetAddr = addresses.find((a: any) => a.address?.startsWith('SP'))?.address
          setStxAddress(testnetAddr || mainnetAddr || null)
        }
      }
    }
    
    checkConnection()
  }, [])

  const connectWallet = useCallback(async () => {
    try {
      const response = await connect()
      console.log('Wallet connected:', response)
      
      if (response && response.addresses) {
        const testnetAddr = response.addresses.find((a: any) => a.address?.startsWith('ST'))?.address
        const mainnetAddr = response.addresses.find((a: any) => a.address?.startsWith('SP'))?.address
        setStxAddress(testnetAddr || mainnetAddr || null)
        setIsWalletConnected(true)
      }
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
