export const FUJI_CHAIN_ID = 43113;
export const FUJI_HEX = '0xa869';

export const FUJI_PARAMS = {
  chainId: FUJI_HEX,
  chainName: 'Avalanche Fuji C-Chain',
  nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowscan.xyz'],
};

export async function switchToFuji(): Promise<boolean> {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: FUJI_HEX }],
    });
    return true;
  } catch (err: any) {
    if (err.code === 4902) {
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
