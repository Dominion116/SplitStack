import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Users, CheckCircle2, Clock, Hash } from 'lucide-react'
import { useStacks, contractAddress, contractName, network } from '@/lib/stacks'
import { fetchCallReadOnlyFunction, cvToValue, Cl } from '@stacks/transactions'

interface Payer {
  address: string
  amount: number
  paid: boolean
}

interface SplitInfo {
  id: number
  name: string
  creator: string
  totalAmount: number
  paidAmount: number
  isComplete: boolean
  isActive: boolean
  payers: Payer[]
}

export function ActiveSplits() {
  const { stxAddress } = useStacks()
  const [splitId, setSplitId] = useState('')
  const [splitInfo, setSplitInfo] = useState<SplitInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookupSplit = async () => {
    if (!splitId) return
    
    setLoading(true)
    setError(null)
    setSplitInfo(null)

    try {
      const id = parseInt(splitId)
      
      // Fetch split info
      const infoResult = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-split-info',
        functionArgs: [Cl.uint(id)],
        network,
        senderAddress: stxAddress || contractAddress,
      })
      
      const info = cvToValue(infoResult)
      
      if (!info || info.value === null) {
        setError('Split not found')
        setLoading(false)
        return
      }

      const splitData = info.value || info

      // Fetch payers
      const payersResult = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-split-payers',
        functionArgs: [Cl.uint(id)],
        network,
        senderAddress: stxAddress || contractAddress,
      })
      
      const payersData = cvToValue(payersResult)
      const payersList: Payer[] = []
      
      if (payersData && Array.isArray(payersData)) {
        for (const p of payersData) {
          if (p && p.payer) {
            payersList.push({
              address: p.payer.value || p.payer,
              amount: Number(p.amount?.value || p.amount) / 1000000,
              paid: p.paid?.value || p.paid || false,
            })
          }
        }
      }

      setSplitInfo({
        id,
        name: splitData.name?.value || splitData.name || 'Unnamed',
        creator: splitData.creator?.value || splitData.creator || '',
        totalAmount: Number(splitData['total-amount']?.value || splitData['total-amount'] || 0) / 1000000,
        paidAmount: Number(splitData['paid-amount']?.value || splitData['paid-amount'] || 0) / 1000000,
        isComplete: splitData['is-complete']?.value || splitData['is-complete'] || false,
        isActive: splitData['is-active']?.value || splitData['is-active'] || false,
        payers: payersList,
      })
    } catch (err) {
      console.error('Error fetching split:', err)
      setError('Failed to fetch split details')
    } finally {
      setLoading(false)
    }
  }

  const isUserPayer = splitInfo?.payers.some(
    p => p.address === stxAddress
  )

  const userPayerInfo = splitInfo?.payers.find(
    p => p.address === stxAddress
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Look Up Split
        </CardTitle>
        <CardDescription>
          Enter a split ID to view details and check if you need to pay
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="splitId" className="sr-only">Split ID</Label>
            <Input
              id="splitId"
              type="number"
              placeholder="Enter Split ID (e.g. 1)"
              value={splitId}
              onChange={(e) => setSplitId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookupSplit()}
            />
          </div>
          <Button onClick={lookupSplit} disabled={loading || !splitId}>
            {loading ? 'Loading...' : 'Look Up'}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {splitInfo && (
          <div className="space-y-4 pt-4 border-t">
            {/* Split Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Split ID: {splitInfo.id}</span>
                </div>
                <h3 className="text-lg font-semibold mt-1">{splitInfo.name}</h3>
                <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                  Created by: {splitInfo.creator.slice(0, 8)}...{splitInfo.creator.slice(-4)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {splitInfo.isComplete ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    Complete
                  </span>
                ) : splitInfo.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium">
                    <Clock className="h-3 w-3" />
                    Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">
                    Cancelled
                  </span>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{splitInfo.paidAmount} / {splitInfo.totalAmount} STX</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${splitInfo.totalAmount > 0 ? (splitInfo.paidAmount / splitInfo.totalAmount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* User Status */}
            {stxAddress && isUserPayer && userPayerInfo && (
              <div className={`p-3 rounded-lg ${userPayerInfo.paid ? 'bg-green-500/10 border border-green-500/20' : 'bg-primary/10 border border-primary/20'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Your Share</span>
                  <span className="font-bold">{userPayerInfo.amount} STX</span>
                </div>
                <p className={`text-sm mt-1 ${userPayerInfo.paid ? 'text-green-500' : 'text-primary'}`}>
                  {userPayerInfo.paid ? '✓ You have paid your share' : '⚡ Payment pending - use the "Pay Your Share" section above'}
                </p>
              </div>
            )}

            {/* Payers List */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Payers ({splitInfo.payers.filter(p => p.paid).length}/{splitInfo.payers.length} paid)
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {splitInfo.payers.map((payer, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                      payer.address === stxAddress 
                        ? 'bg-primary/5 border border-primary/20' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {payer.paid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="font-mono text-xs">
                        {payer.address === stxAddress ? 'You' : `${payer.address.slice(0, 6)}...${payer.address.slice(-4)}`}
                      </span>
                    </div>
                    <span className="font-medium">{payer.amount} STX</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
