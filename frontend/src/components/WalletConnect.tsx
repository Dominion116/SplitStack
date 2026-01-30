import { useStacks } from '@/lib/stacks'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut } from 'lucide-react'
import {
  Card,
  CardContent,
} from "@/components/ui/card"

export function WalletConnect() {
  const { isWalletConnected, stxAddress, connectWallet, disconnectWallet } = useStacks()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isWalletConnected && stxAddress) {
    return (
      <div className="flex items-center gap-3">
        <Card className="border-primary/20 bg-card/50">
          <CardContent className="flex items-center gap-2 p-2 px-3">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-mono font-medium">{formatAddress(stxAddress)}</span>
          </CardContent>
        </Card>
        <Button
          onClick={disconnectWallet}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={connectWallet}
      size="sm"
      className="gap-2"
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  )
}
