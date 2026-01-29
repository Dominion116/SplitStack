import { useState } from 'react'
import { request } from '@stacks/connect'
import { 
  uintCV, 
  stringAsciiCV, 
  listCV, 
  principalCV,
  tupleCV,
  boolCV,
  cvToHex
} from '@stacks/transactions'
import { Plus, Trash2, Rocket, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useStacks, contractAddress, contractName } from '@/lib/stacks.tsx'

interface Recipient {
  address: string
  share: string
}

export function CreateSplit() {
  const { isWalletConnected } = useStacks()
  const [name, setName] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([{ address: '', share: '' }])
  const [autoDistribute, setAutoDistribute] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const addRecipient = () => {
    if (recipients.length < 10) {
      setRecipients([...recipients, { address: '', share: '' }])
    }
  }

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const updated = [...recipients]
    updated[index] = { ...updated[index], [field]: value }
    setRecipients(updated)
  }

  const totalShares = recipients.reduce((sum, r) => sum + (parseFloat(r.share) || 0), 0)

  const handleCreate = async () => {
    if (!isWalletConnected) {
      alert('Please connect your wallet first')
      return
    }

    if (totalShares !== 100) {
      alert('Total shares must equal 100%')
      return
    }

    setIsLoading(true)
    try {
      const recipientsCV = recipients.map(r => tupleCV({
        recipient: principalCV(r.address),
        share: uintCV(Math.round(parseFloat(r.share) * 100))
      }))

      const functionArgs = [
        stringAsciiCV(name),
        listCV(recipientsCV),
        boolCV(autoDistribute)
      ]

      const response = await request('stx_callContract', {
        contract: `${contractAddress}.${contractName}`,
        functionName: 'create-split',
        functionArgs: functionArgs.map(arg => cvToHex(arg)),
      })

      console.log('Transaction broadcasted:', response)
      alert('Split created successfully! Transaction ID: ' + response.txid)
      setName('')
      setRecipients([{ address: '', share: '' }])
    } catch (error) {
      console.error(error)
      alert('Error creating split')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Create New Split</CardTitle>
            <CardDescription>Set up automatic payment distribution</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Split Name */}
        <div className="space-y-2">
          <Label htmlFor="splitName">Split Name</Label>
          <Input 
            id="splitName"
            placeholder="e.g. Team Revenue Split"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Auto Distribute Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="space-y-0.5">
            <Label htmlFor="autoDistribute" className="text-foreground cursor-pointer">
              Auto-distribute payments
            </Label>
            <p className="text-xs text-muted-foreground">
              {autoDistribute 
                ? 'Payments are sent immediately to recipients' 
                : 'Recipients withdraw their share manually'}
            </p>
          </div>
          <Switch 
            id="autoDistribute"
            checked={autoDistribute}
            onCheckedChange={setAutoDistribute}
          />
        </div>

        {/* Recipients */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Recipients & Shares</Label>
            <span className={`text-sm font-medium ${totalShares === 100 ? 'text-green-500' : 'text-destructive'}`}>
              Total: {totalShares}%
            </span>
          </div>
          
          <div className="space-y-3">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input 
                  className="flex-[3]"
                  placeholder="ST... address"
                  value={recipient.address}
                  onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                />
                <div className="relative flex-1">
                  <Input 
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={recipient.share}
                    onChange={(e) => updateRecipient(index, 'share', e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
                {recipients.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeRecipient(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {recipients.length < 10 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={addRecipient}
              className="text-primary hover:text-primary"
            >
              <Plus className="h-4 w-4" />
              Add Recipient
            </Button>
          )}
        </div>

        {/* Submit Button */}
        <Button 
          size="lg"
          className="w-full"
          onClick={handleCreate}
          disabled={isLoading || !name || recipients.some(r => !r.address || !r.share) || totalShares !== 100}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              Create Split
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
