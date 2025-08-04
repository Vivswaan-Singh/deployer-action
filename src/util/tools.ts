import { ethers } from 'ethers'
import createKeccakHash from 'keccak'
import { logger } from '../..';

export function toChecksumAddress(addr: string): string {
  addr = addr.toLowerCase().replace('0x', '');
  const hash = createKeccakHash('keccak256').update(addr).digest('hex');
  let ret = '0x';

  for (let i = 0; i < addr.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += addr[i].toUpperCase();
    } else {
      ret += addr[i];
    }
  }

  return ret;
}

// Checks if an address has a minimum balance of native currency.
export async function hasMinimumEthBalance(
  address: string,
  rpcUrl: string,
  requiredEthBalance: number = 5
) {
  try {
    const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(rpcUrl);

    const balanceWei: bigint = await provider.getBalance(address);
    logger.info(`Balance in Wei for ${address}: ${balanceWei.toString()}`);

    const balanceEth: string = ethers.formatEther(balanceWei);
    logger.info(`Balance in ETH for ${address}: ${balanceEth}`);

    const requiredWei: bigint = ethers.parseEther(requiredEthBalance.toString());

    if (balanceWei < requiredWei) {
      throw new Error(`Required minimum balance of ${requiredEthBalance}`);
    }
  } catch (error: any) {
    logger.error(`An error occurred while checking balance for ${address}:`, error);
    throw new Error("Error while checking native balance of signer");
  }
  
}