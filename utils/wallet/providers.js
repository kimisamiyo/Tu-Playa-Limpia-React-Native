export const ZKSYS_POB_DEVNET = {
  chainId: '0xdf42', // 57042 en HEX
  chainName: 'zkSYS PoB Devnet',
  nativeCurrency: {
    name: 'Test SYS',
    symbol: 'TSYS',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-pob.dev11.top'],
  blockExplorerUrls: ['https://explorer-pob.dev11.top'],
};

export function detectPaliWallet(ethereum) {
  if (!ethereum) return false;
  return ethereum.isPali || ethereum?.provider?.isPali;
}

export async function switchToZkSYSNetwork(ethereum) {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ZKSYS_POB_DEVNET.chainId }],
    });
  } catch (switchError) {
    // Si la red no existe, la agregamos
    if (switchError.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [ZKSYS_POB_DEVNET],
      });
    } else {
      throw switchError;
    }
  }
}
