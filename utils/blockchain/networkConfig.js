import { ethers } from "ethers";

// =====================================================
// 🌐 CONFIGURACIÓN DE RED - zkSYS PoB Devnet
// =====================================================

export const NETWORK_CONFIG = {
  chainId: 57042,
  chainIdHex: "0xded2",
  chainName: "zkSYS PoB Devnet",
  nativeCurrency: {
    name: "TSYS",
    symbol: "TSYS",
    decimals: 18
  },
  rpcUrl: "https://rpc-pob.dev11.top",
  blockExplorerUrl: "https://explorer-pob.dev11.top"
};


// =====================================================
// 🔗 OBTENER PROVIDER
// =====================================================

export function getProvider() {
  if (!window.ethereum) {
    throw new Error("No Ethereum provider found");
  }
  return window.ethereum;
}

// =====================================================
// 🔄 CAMBIAR / AGREGAR RED
// =====================================================

async function switchToZkSys(provider) {
  const currentChainId = await provider.request({
    method: "eth_chainId"
  });

  if (currentChainId === NETWORK_CONFIG.chainIdHex) return;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: NETWORK_CONFIG.chainIdHex }]
    });
  } catch (error) {
    if (error.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: NETWORK_CONFIG.chainIdHex,
          chainName: NETWORK_CONFIG.chainName,
          nativeCurrency: NETWORK_CONFIG.nativeCurrency,
          rpcUrls: [NETWORK_CONFIG.rpcUrl],
          blockExplorerUrls: [NETWORK_CONFIG.blockExplorerUrl]
        }]
      });
    } else {
      throw error;
    }
  }
}

// =====================================================
// 💰 VERIFICAR BALANCE
// =====================================================

async function verifyBalance(ethersProvider, address) {
  const balance = await ethersProvider.getBalance(address);
  const formatted = ethers.utils.formatEther(balance);

  console.log("Balance TSYS:", formatted);

  if (balance.isZero()) {
    throw new Error("La cuenta no tiene TSYS para pagar gas");
  }
}

// =====================================================
// 🔗 CONECTAR WALLET PRO
// =====================================================

export async function connectWallet() {
  const externalProvider = getProvider();

  // Solicitar cuentas
  const accounts = await externalProvider.request({
    method: "eth_requestAccounts"
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts available");
  }

  const activeAddress = accounts[0].toLowerCase();

  // 🔄 CAMBIAR A zkSYS
  await switchToZkSys(externalProvider);

  // 🔌 CREAR PROVIDER ETHERS
  const ethersProvider = new ethers.providers.Web3Provider(externalProvider);

  const signer = ethersProvider.getSigner();
  const address = await signer.getAddress();

  // 💰 VERIFICAR BALANCE
  await verifyBalance(ethersProvider, address);

  return {
    provider: ethersProvider,
    signer,
    address
  };
}

// =====================================================
// 👂 LISTENERS
// =====================================================

export function setupWalletListeners() {
  const provider = getProvider();

  provider.on("accountsChanged", () => {
    window.location.reload();
  });

  provider.on("chainChanged", () => {
    window.location.reload();
  });
}
