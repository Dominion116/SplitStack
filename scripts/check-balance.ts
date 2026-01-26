import { STACKS_TESTNET } from '@stacks/network';
import { generateWallet, getStxAddress } from '@stacks/wallet-sdk';
import 'dotenv/config';

async function checkBalance() {
  const secretKey = process.env.STX_MNEMONIC || "";
  const wallet = await generateWallet({
    secretKey,
    password: '',
  });
  const account = wallet.accounts[0];
  const address = getStxAddress(account, STACKS_TESTNET);

  console.log(`Checking balance for: ${address}`);
  
  const response = await fetch(`https://api.testnet.hiro.so/v2/accounts/${address}`);
  const data = await response.json();
  
  console.log("Account Data:", data);
  const balance = BigInt(data.balance) / BigInt(1000000);
  console.log(`Available Balance: ${balance} STX`);
}

checkBalance().catch(console.error);
