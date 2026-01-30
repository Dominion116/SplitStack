import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import { STACKS_TESTNET } from '@stacks/network'

export const network = STACKS_TESTNET
export const contractAddress = 'ST30VGN68PSGVWGNMD0HH2WQMM5T486EK3WBNTHCY'
export const contractName = 'split-stack-v2'

const appConfig = new AppConfig(['store_write', 'publish_data'])
export const userSession = new UserSession({ appConfig })

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

  // Check connection status on mount and after auth
  useEffect(() => {
    const checkConnection = () => {
      if (userSession.isUserSignedIn()) {
        setIsWalletConnected(true)
        const userData = userSession.loadUserData()
        const address = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet
        setStxAddress(address)
      } else if (userSession.isSignInPending()) {
        userSession.handlePendingSignIn().then(() => {
          if (userSession.isUserSignedIn()) {
            const userData = userSession.loadUserData()
            const address = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet
            setStxAddress(address)
            setIsWalletConnected(true)
          }
        })
      }
    }
    
    checkConnection()
  }, [])

  const connectWallet = useCallback(() => {
    showConnect({
      appDetails,
      redirectTo: '/',
      onFinish: () => {
        window.location.reload()
      },
      userSession,
    })
  }, [])

  const disconnectWallet = useCallback(() => {
    userSession.signUserOut()
    setIsWalletConnected(false)
    setStxAddress(null)
    window.location.reload()
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

// Export userSession for contract calls
export { userSession }
