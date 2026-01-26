import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode, 
  PostConditionMode, 
  Cl
} from '@stacks/transactions';
import { generateWallet, getStxAddress } from '@stacks/wallet-sdk';
import { STACKS_TESTNET } from '@stacks/network';
import 'dotenv/config';

async function createSplit() {
  const secretKey = process.env.STX_MNEMONIC || "";
  const network = STACKS_TESTNET;
  const contractAddress = 'ST30VGN68PSGVWGNMD0HH2WQMM5T486EK3WBNTHCY';
  const contractName = 'split-payment';

  const wallet = await generateWallet({
    secretKey,
    password: '',
  });
  const account = wallet.accounts[0];
  const privateKey = account.stxPrivateKey;
  const senderAddress = getStxAddress(account, network);

  console.log(`Using address: ${senderAddress}`);

  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'create-split',
    functionArgs: [
      Cl.stringAscii("Dev & Designer"),
      Cl.list([
        Cl.tuple({
          recipient: Cl.principal(senderAddress),
          share: Cl.uint(6000) // 60%
        }),
        Cl.tuple({
          recipient: Cl.principal("ST13DKX8W08STR3YTHRWB35PZTTM15WFX9WGSMCTM"),
          share: Cl.uint(4000) // 40%
        })
      ]),
      Cl.bool(true) // auto-distribute
    ],
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  console.log("Transaction object created:", transaction ? "Yes" : "No");
  if (!transaction) throw new Error("Failed to create transaction");
  const broadcastResponse = await broadcastTransaction({ transaction, network });
  
  console.log("Broadcast result:", broadcastResponse);
  if ('error' in broadcastResponse && broadcastResponse.error) {
    console.error("Broadcast failed:", broadcastResponse.error);
  } else {
    console.log("Transaction ID:", broadcastResponse.txid);
    console.log(`View on Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);
  }
}

createSplit().catch(console.error);
