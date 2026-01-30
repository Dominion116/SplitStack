import { useState } from 'react'
import { useStacks, contractAddress, contractName, network } from '@/lib/stacks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreditCard, AlertCircle } from 'lucide-react'
import { openContractCall } from '@stacks/connect'
import {
  AnchorMode,
  PostConditionMode,
  uintCV,
} from '@stacks/transactions'

export function PayBill() {
  const { isWalletConnected, stxAddress } = useStacks()
  const [splitId, setSplitId] = useState('')
  const [isPaying, setIsPaying] = useState(false)

  const handlePaySplit = async () => {
    if (!isWalletConnected || !splitId) return

    setIsPaying(true)

    try {
      await openContractCall({
        contractAddress,
        contractName,
        functionName: 'pay-split',
        functionArgs: [
          uintCV(parseInt(splitId)),
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          console.log('Payment submitted:', data.txId)
          alert(`Payment successful! Transaction ID: ${data.txId}`)
          setSplitId('')
        },
        onCancel: () => {
          console.log('Payment cancelled')
        },
      })
    } catch (error) {
      console.error('Error paying split:', error)
      alert('Failed to pay split. Please try again.')
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pay Your Share
        </CardTitle>
        <CardDescription>
          Enter the split ID to pay your assigned amount
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isWalletConnected && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Connect your wallet to pay your share of a split
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="split-id">Split ID</Label>
          <Input
            id="split-id"
            type="number"
            placeholder="1"
            value={splitId}
            onChange={(e) => setSplitId(e.target.value)}
            disabled={!isWalletConnected}
          />
        </div>

        {stxAddress && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Paying from</p>
            <p className="text-sm font-mono font-medium break-all">{stxAddress}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handlePaySplit}
          disabled={!isWalletConnected || !splitId || isPaying}
          className="w-full"
          size="lg"
        >
          {isPaying ? 'Processing...' : 'Pay Split'}
        </Button>
      </CardFooter>
    </Card>
  )
}
