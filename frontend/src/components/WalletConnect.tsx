import { LogOut, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStacks } from '@/lib/stacks.tsx'

export function WalletConnect() {
  const { isWalletConnected, stxAddress, connectWallet, disconnectWallet } = useStacks()

  const handleConnect = async () => {
    await connectWallet()
  }

  if (isWalletConnected && stxAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-muted-foreground">Connected</span>
          <span className="text-sm font-mono font-medium">
            {stxAddress.slice(0, 6)}...{stxAddress.slice(-4)}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={disconnectWallet}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleConnect}>
      <Wallet className="h-4 w-4" />
      <span>Connect Wallet</span>
    </Button>
  )
}
