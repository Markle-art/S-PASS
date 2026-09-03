import { ethers } from 'ethers';

export const FUJI_CHAIN_ID = 43113;
export const FUJI_HEX = '0xa869';

export const FUJI_RPC_URLS = [
  'https://api.avax-test.network/ext/bc/C/rpc',
  'https://avalanche-fuji-c-chain-rpc.publicnode.com',
  'https://rpc.ankr.com/avalanche_fuji',
];

export const FUJI_PARAMS = {
  chainId: FUJI_HEX,
  chainName: 'Avalanche Fuji C-Chain',
  nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  rpcUrls: FUJI_RPC_URLS,
  blockExplorerUrls: ['https://testnet.snowscan.xyz'],
};

export function getFallbackProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(FUJI_RPC_URLS[0], undefined, {
    staticNetwork: ethers.Network.from(FUJI_CHAIN_ID),
  });
}

export async function switchToFuji(): Promise<boolean> {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: FUJI_HEX }],
    });
    return true;
  } catch (err: any) {
    if (err.code === 4902 || err.data?.originalError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [FUJI_PARAMS],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

