import { fetchCallReadOnlyFunction, Cl, cvToJSON } from '@stacks/transactions';
import { network, contractAddress, contractName } from './constants';

async function getSplitInfo(splitId: number) {
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
