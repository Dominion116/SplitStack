import { fetchCallReadOnlyFunction, Cl, cvToJSON } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

async function getSplitInfo(splitId: number) {
  const network = STACKS_TESTNET;
  const contractAddress = 'ST30VGN68PSGVWGNMD0HH2WQMM5T486EK3WBNTHCY';
  const contractName = 'split-payment';

  const result = await fetchCallReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName: 'get-split-info',
    functionArgs: [Cl.uint(splitId)],
    senderAddress: contractAddress,
  });

  console.log(`Split #${splitId} Info:`, cvToJSON(result));
}

async function run() {
  console.log("Checking contract state...");
  try {
    await getSplitInfo(1);
  } catch (e) {
    console.error("Error or split not found:", e);
  }
}

run().catch(console.error);
