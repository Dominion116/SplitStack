import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { 
  uintCV, 
  stringAsciiCV, 
  listCV, 
  principalCV,
  tupleCV,
  boolCV,
  PostConditionMode
} from '@stacks/transactions';
import { userSession } from './WalletConnect';
import { network, contractAddress, contractName } from '../lib/stacks';
import { Plus, Trash2, Send } from 'lucide-react';

export const CreateSplit = () => {
  const [name, setName] = useState('');
  const [recipients, setRecipients] = useState([{ address: '', share: '' }]);
  const [autoDistribute, setAutoDistribute] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const addRecipient = () => {
    setRecipients([...recipients, { address: '', share: '' }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: string, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };

  const handleCreate = async () => {
    if (!userSession.isUserSignedIn()) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      const recipientsCV = recipients.map(r => tupleCV({
        recipient: principalCV(r.address),
        share: uintCV(parseInt(r.share) * 100)
      }));

      await openContractCall({
        network,
        contractAddress,
        contractName,
        functionName: 'create-split',
        functionArgs: [
          stringAsciiCV(name),
          listCV(recipientsCV),
          boolCV(autoDistribute)
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          console.log('Transaction broadcasted:', data);
          alert('Split created successfully!');
          setIsLoading(false);
          setName('');
          setRecipients([{ address: '', share: '' }]);
        },
        onCancel: () => {
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error(error);
      alert('Error creating split');
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-8 max-w-2xl w-full mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 gradient-text">Create New Split</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Split Name</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="e.g. Project Alpha"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 glass p-4 rounded-xl border-dashed">
          <input 
            type="checkbox" 
            id="autoDistribute"
            className="w-5 h-5 accent-primary"
            checked={autoDistribute}
            onChange={(e) => setAutoDistribute(e.target.checked)}
          />
          <label htmlFor="autoDistribute" className="text-sm font-medium cursor-pointer">
            Auto-distribute payments immediately
          </label>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-text-muted">Recipients & Shares (%)</label>
          {recipients.map((recipient, index) => (
            <div key={index} className="flex gap-3 items-center">
              <input 
                type="text" 
                className="input-field flex-[3]" 
                placeholder="Stacks Address (ST...)"
                value={recipient.address}
                onChange={(e) => updateRecipient(index, 'address', e.target.value)}
              />
              <input 
                type="number" 
                className="input-field flex-1" 
                placeholder="%"
                value={recipient.share}
                onChange={(e) => updateRecipient(index, 'share', e.target.value)}
              />
              {recipients.length > 1 && (
                <button 
                  onClick={() => removeRecipient(index)}
                  className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
          
          <button 
            onClick={addRecipient}
            className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
          >
            <Plus size={18} />
            <span>Add Recipient</span>
          </button>
        </div>

        <button 
          onClick={handleCreate}
          disabled={isLoading}
          className="btn-primary w-full justify-center py-4 text-lg"
        >
          {isLoading ? 'Processing...' : (
            <>
              <Send size={20} />
              <span>Broadcast Split</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
