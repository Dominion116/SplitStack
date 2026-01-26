import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode, 
  PostConditionMode,
  Cl,
  Pc
} from '@stacks/transactions';
import { generateWallet, getStxAddress } from '@stacks/wallet-sdk';
import { network, contractAddress, contractName, secretKey } from './constants';

async function sendToSplit(splitId: number, stxAmount: number) {
  const wallet = await generateWallet({
    secretKey,
    password: '',
  });
  const account = wallet.accounts[0];
  const privateKey = account.stxPrivateKey;
  const senderAddress = getStxAddress(account, network);
  
  const microStxAmount = stxAmount * 1000000;

  const postCondition = Pc.principal(senderAddress).willSendEq(microStxAmount).ustx();

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'send-to-split',
    functionArgs: [
      Cl.uint(splitId),
      Cl.uint(microStxAmount)
    ],
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    postConditions: [postCondition],
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction({ transaction, network });
  
  if ('error' in broadcastResponse && broadcastResponse.error) {
    console.error("Broadcast failed:", broadcastResponse.error);
  } else {
    console.log(`Sent ${stxAmount} STX to Split #${splitId}`);
    console.log("Transaction ID:", (broadcastResponse as any).txid);
    console.log(`View on Explorer: https://explorer.hiro.so/txid/${(broadcastResponse as any).txid}?chain=testnet`);
  }
}

sendToSplit(1, 0.1).catch(console.error);
