import { useState } from 'react'
import { useStacks, contractAddress, contractName, network } from '@/lib/stacks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Settings, Download, XCircle, AlertCircle } from 'lucide-react'
import { openContractCall } from '@stacks/connect'
import {
  AnchorMode,
  PostConditionMode,
  uintCV,
} from '@stacks/transactions'

export function ManageSplits() {
  const { isWalletConnected } = useStacks()
  const [withdrawSplitId, setWithdrawSplitId] = useState('')
  const [cancelSplitId, setCancelSplitId] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleWithdraw = async () => {
    if (!isWalletConnected || !withdrawSplitId) return

    setIsWithdrawing(true)

    try {
      await openContractCall({
        contractAddress,
        contractName,
        functionName: 'withdraw-split',
        functionArgs: [
          uintCV(parseInt(withdrawSplitId)),
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          console.log('Withdrawal submitted:', data.txId)
          alert(`Withdrawal successful! Transaction ID: ${data.txId}`)
          setWithdrawSplitId('')
        },
        onCancel: () => {
          console.log('Withdrawal cancelled')
        },
      })
    } catch (error) {
      console.error('Error withdrawing from split:', error)
      alert('Failed to withdraw. Make sure the split is fully paid.')
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleCancel = async () => {
    if (!isWalletConnected || !cancelSplitId) return

    const confirmed = confirm(
      'Are you sure you want to cancel this split? All payers will be refunded automatically.'
    )
    if (!confirmed) return

    setIsCancelling(true)

    try {
      await openContractCall({
        contractAddress,
        contractName,
        functionName: 'cancel-split',
        functionArgs: [
          uintCV(parseInt(cancelSplitId)),
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          console.log('Cancellation submitted:', data.txId)
          alert(`Split cancelled! All payments refunded. Transaction ID: ${data.txId}`)
          setCancelSplitId('')
        },
        onCancel: () => {
          console.log('Cancellation cancelled')
        },
      })
    } catch (error) {
      console.error('Error cancelling split:', error)
      alert('Failed to cancel split. Please try again.')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Manage Your Splits
        </CardTitle>
        <CardDescription>
          Withdraw funds or cancel splits (creator only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isWalletConnected && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Connect your wallet to manage your splits
            </p>
          </div>
        )}

        {/* Withdraw Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Download className="h-4 w-4 text-green-600 dark:text-green-500" />
            <h3 className="font-semibold">Withdraw Funds</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Withdraw funds from a fully paid split to your wallet
          </p>
          <div className="space-y-2">
            <Label htmlFor="withdraw-split-id">Split ID</Label>
            <Input
              id="withdraw-split-id"
              type="number"
              placeholder="1"
              value={withdrawSplitId}
              onChange={(e) => setWithdrawSplitId(e.target.value)}
              disabled={!isWalletConnected}
            />
          </div>
          <Button
            onClick={handleWithdraw}
            disabled={!isWalletConnected || !withdrawSplitId || isWithdrawing}
            className="w-full"
            variant="default"
          >
            <Download className="h-4 w-4 mr-2" />
            {isWithdrawing ? 'Withdrawing...' : 'Withdraw Funds'}
          </Button>
        </div>

        {/* Cancel Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <XCircle className="h-4 w-4 text-destructive" />
            <h3 className="font-semibold">Cancel Split</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Cancel a split and automatically refund all payers
          </p>
          <div className="space-y-2">
            <Label htmlFor="cancel-split-id">Split ID</Label>
            <Input
              id="cancel-split-id"
              type="number"
              placeholder="1"
              value={cancelSplitId}
              onChange={(e) => setCancelSplitId(e.target.value)}
              disabled={!isWalletConnected}
            />
          </div>
          <Button
            onClick={handleCancel}
            disabled={!isWalletConnected || !cancelSplitId || isCancelling}
            className="w-full"
            variant="destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {isCancelling ? 'Cancelling...' : 'Cancel Split & Refund'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
