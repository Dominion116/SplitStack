import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { 
  uintCV, 
  Pc
} from '@stacks/transactions';
import { userSession } from './WalletConnect';
import { network, contractAddress, contractName } from '../lib/stacks';
import { CreditCard, Download } from 'lucide-react';

export const PaymentInteraction = () => {
  const [splitId, setSplitId] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = async () => {
    if (!userSession.isUserSignedIn()) return;
    setIsLoading(true);
    
    try {
      const stxAmount = BigInt(parseFloat(amount) * 1000000); // to micro-STX
      const userData = userSession.loadUserData();
      const senderAddress = userData.profile.stxAddress.testnet;

      const postConditions = [
        Pc.stx(senderAddress).equal(stxAmount)
      ];

      await openContractCall({
        network,
        contractAddress,
        contractName,
        functionName: 'pay-to-split',
        functionArgs: [uintCV(splitId), uintCV(stxAmount)],
        postConditions,
        onFinish: () => {
          alert('Payment successful!');
          setIsLoading(false);
        },
        onCancel: () => setIsLoading(false)
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!userSession.isUserSignedIn()) return;
    setIsLoading(true);
    
    try {
      await openContractCall({
        network,
        contractAddress,
        contractName,
        functionName: 'withdraw-accumulated',
        functionArgs: [uintCV(splitId)],
        onFinish: () => {
          alert('Withdrawal successful!');
          setIsLoading(false);
        },
        onCancel: () => setIsLoading(false)
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 mt-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="glass p-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CreditCard className="text-primary" />
          Send Payment
        </h3>
        <div className="space-y-4">
          <input 
            type="number" 
            placeholder="Split ID" 
            className="input-field"
            value={splitId}
            onChange={(e) => setSplitId(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="Amount (STX)" 
            className="input-field"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handlePay} disabled={isLoading} className="btn-primary w-full justify-center">
            {isLoading ? 'Processing...' : 'Pay to Split'}
          </button>
        </div>
      </div>

      <div className="glass p-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Download className="text-accent" />
          Withdraw Funds
        </h3>
        <p className="text-sm text-text-muted mb-4">
          Withdraw your share from a specific split agreement.
        </p>
        <div className="space-y-4">
          <input 
            type="number" 
            placeholder="Split ID" 
            className="input-field"
            value={splitId}
            onChange={(e) => setSplitId(e.target.value)}
          />
          <button onClick={handleWithdraw} disabled={isLoading} className="btn-secondary w-full justify-center">
            {isLoading ? 'Processing...' : 'Withdraw Share'}
          </button>
        </div>
      </div>
    </div>
  );
};
