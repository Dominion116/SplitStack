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
import { Plus, Trash2, Receipt } from 'lucide-react'
import { openContractCall } from '@stacks/connect'
import {
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  listCV,
  tupleCV,
  principalCV,
  uintCV,
} from '@stacks/transactions'

interface Payer {
  id: string
  address: string
  amount: string
}

export function CreateBillSplit() {
  const { isWalletConnected } = useStacks()
  const [name, setName] = useState('')
  const [payers, setPayers] = useState<Payer[]>([
    { id: '1', address: '', amount: '' },
  ])
  const [isCreating, setIsCreating] = useState(false)

  const addPayer = () => {
    if (payers.length < 10) {
      setPayers([...payers, { id: Date.now().toString(), address: '', amount: '' }])
    }
  }

  const removePayer = (id: string) => {
    if (payers.length > 1) {
      setPayers(payers.filter(p => p.id !== id))
    }
  }

  const updatePayer = (id: string, field: 'address' | 'amount', value: string) => {
    setPayers(payers.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const calculateTotal = () => {
    return payers.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  }

  const handleCreateSplit = async () => {
    if (!isWalletConnected || !name || payers.length === 0) return

    // Validate all payers have address and amount
    const validPayers = payers.filter(p => p.address && p.amount && parseFloat(p.amount) > 0)
    if (validPayers.length === 0) {
      alert('Please add at least one payer with a valid address and amount')
      return
    }

    setIsCreating(true)

    try {
      // Convert payers to Clarity format: (list 10 {payer: principal, amount: uint})
      const payersList = validPayers.map(p => 
        tupleCV({
          payer: principalCV(p.address),
          amount: uintCV(Math.floor(parseFloat(p.amount) * 1_000_000)) // Convert STX to microSTX
        })
      )

      await openContractCall({
        contractAddress,
        contractName,
        functionName: 'create-split',
        functionArgs: [
          stringAsciiCV(name),
          listCV(payersList),
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          console.log('Transaction submitted:', data.txId)
          alert(`Split created successfully! Transaction ID: ${data.txId}`)
          // Reset form
          setName('')
          setPayers([{ id: '1', address: '', amount: '' }])
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        },
      })
    } catch (error) {
      console.error('Error creating split:', error)
      alert('Failed to create split. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Create Bill Split
        </CardTitle>
        <CardDescription>
          Set up a bill split with fixed amounts for each payer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Split Name */}
        <div className="space-y-2">
          <Label htmlFor="split-name">Split Name</Label>
          <Input
            id="split-name"
            placeholder="Coffee Shop Order #123"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />
        </div>

        {/* Payers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Payers ({payers.length}/10)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPayer}
              disabled={payers.length >= 10}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Payer
            </Button>
          </div>

          <div className="space-y-3">
            {payers.map((payer, index) => (
              <div key={payer.id} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`payer-address-${payer.id}`} className="text-xs">
                    Address {index + 1}
                  </Label>
                  <Input
                    id={`payer-address-${payer.id}`}
                    placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                    value={payer.address}
                    onChange={(e) => updatePayer(payer.id, 'address', e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-32 space-y-2">
                  <Label htmlFor={`payer-amount-${payer.id}`} className="text-xs">
                    Amount (STX)
                  </Label>
                  <Input
                    id={`payer-amount-${payer.id}`}
                    type="number"
                    step="0.000001"
                    min="0"
                    placeholder="0.00"
                    value={payer.amount}
                    onChange={(e) => updatePayer(payer.id, 'amount', e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePayer(payer.id)}
                    disabled={payers.length === 1}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="font-medium">Total Amount</span>
          <span className="text-lg font-bold">{calculateTotal().toFixed(6)} STX</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleCreateSplit}
          disabled={!isWalletConnected || !name || payers.length === 0 || isCreating}
          className="w-full"
          size="lg"
        >
          {isCreating ? 'Creating...' : 'Create Split'}
        </Button>
      </CardFooter>
    </Card>
  )
}
