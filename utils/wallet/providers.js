import { ethers } from 'ethers';
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
export async function connectMetaMask() {
  if (!window.ethereum) {
    throw new Error('MetaMask no instalado');
  }

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  await switchToZkSYSNetwork(window.ethereum);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const address = accounts[0];

  return { success: true, address, provider, signer };
}

export async function connectPali() {
  const pali = window.pali || (window.ethereum?.isPaliWallet ? window.ethereum : null);
  if (!pali) {
    throw new Error('Pali Wallet no instalada');
  }

  const accounts = await pali.request({ method: 'eth_requestAccounts' });
  await switchToZkSYSNetwork(pali);

  const provider = new ethers.providers.Web3Provider(pali);
  const signer = provider.getSigner();
  const address = accounts[0];

  return { success: true, address, provider, signer };
}
