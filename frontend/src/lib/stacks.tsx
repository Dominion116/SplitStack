import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { UserSession, AppConfig } from '@stacks/connect'
import { STACKS_TESTNET } from '@stacks/network'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

export const network = STACKS_TESTNET
export const contractAddress = 'ST1P5VMVNKV33KQ7HXA43WVFQHTM9JBFBWXC0WNX8'
export const contractName = 'split-payment'

export const appDetails = {
  name: 'SplitStack',
  icon: window.location.origin + '/logo.svg',
}

interface StacksContextType {
  userSession: UserSession
  userData: any | null
  isConnected: boolean
  stxAddress: string | null
}

const StacksContext = createContext<StacksContextType | null>(null)

export function StacksProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((data) => {
        setUserData(data)
      })
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData())
    }
  }, [])

  const stxAddress = userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet || null

  return (
    <StacksContext.Provider
      value={{
        userSession,
        userData,
        isConnected: !!userData,
        stxAddress,
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

export { userSession }
