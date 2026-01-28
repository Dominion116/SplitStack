import { useState } from 'react'
import { openContractCall } from '@stacks/connect'
import { uintCV, Pc } from '@stacks/transactions'
import { Send, ArrowDownToLine, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useStacks, network, contractAddress, contractName } from '@/lib/stacks.tsx'

export function PaymentInteraction() {
  const { isConnected, stxAddress } = useStacks()
  const [splitId, setSplitId] = useState('')
  const [amount, setAmount] = useState('')
  const [withdrawSplitId, setWithdrawSplitId] = useState('')
  const [isPayLoading, setIsPayLoading] = useState(false)
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)

  const handlePay = async () => {
    if (!isConnected || !stxAddress) {
      alert('Please connect your wallet first')
      return
    }
    
    setIsPayLoading(true)
    
    try {
      const stxAmount = BigInt(Math.round(parseFloat(amount) * 1000000))

      const postConditions = [
        Pc.principal(stxAddress).willSendEq(stxAmount).ustx()
      ]

      await openContractCall({
        network,
        contractAddress,
        contractName,
        functionName: 'send-to-split',
        functionArgs: [uintCV(parseInt(splitId)), uintCV(stxAmount)],
        postConditions,
        onFinish: (data) => {
          alert('Payment sent! Transaction ID: ' + data.txId)
          setIsPayLoading(false)
          setAmount('')
        },
        onCancel: () => setIsPayLoading(false)
      })
    } catch (error) {
      console.error(error)
      alert('Error sending payment')
      setIsPayLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }
    
    setIsWithdrawLoading(true)
    
    try {
      await openContractCall({
        network,
        contractAddress,
        contractName,
        functionName: 'withdraw',
        functionArgs: [uintCV(parseInt(withdrawSplitId))],
        onFinish: (data) => {
          alert('Withdrawal successful! Transaction ID: ' + data.txId)
          setIsWithdrawLoading(false)
        },
        onCancel: () => setIsWithdrawLoading(false)
      })
    } catch (error) {
      console.error(error)
      alert('Error withdrawing funds')
      setIsWithdrawLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Send Payment Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Send Payment</CardTitle>
              <CardDescription>Pay into a split agreement</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paySplitId">Split ID</Label>
            <Input 
              id="paySplitId"
              type="number"
              placeholder="Enter split ID"
              value={splitId}
              onChange={(e) => setSplitId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payAmount">Amount (STX)</Label>
            <div className="relative">
              <Input 
                id="payAmount"
                type="number"
                placeholder="0.00"
                step="0.000001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                STX
              </span>
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={handlePay}
            disabled={isPayLoading || !splitId || !amount || !isConnected}
          >
            {isPayLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Payment
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Withdraw Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/10">
              <ArrowDownToLine className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle>Withdraw Funds</CardTitle>
              <CardDescription>Claim your accumulated share</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdrawSplitId">Split ID</Label>
            <Input 
              id="withdrawSplitId"
              type="number"
              placeholder="Enter split ID"
              value={withdrawSplitId}
              onChange={(e) => setWithdrawSplitId(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground p-3 rounded-lg bg-secondary/50">
            Withdraw your share from splits with manual distribution enabled.
          </p>
          <Button 
            variant="secondary"
            className="w-full" 
            onClick={handleWithdraw}
            disabled={isWithdrawLoading || !withdrawSplitId || !isConnected}
          >
            {isWithdrawLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-4 w-4" />
                Withdraw Share
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
