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

// 👇 CUENTA QUE TIENE LOS TSYS
const REQUIRED_ADDRESS =
  "0x12539926A3E4331B411b9d1bFC66fddeD008b72E".toLowerCase();

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
  const formatted = ethers.formatEther(balance);

  console.log("Balance TSYS:", formatted);

  if (balance === 0n) {
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

  // 🔴 VALIDAR QUE SEA LA CUENTA CORRECTA
  if (activeAddress !== REQUIRED_ADDRESS) {
    throw new Error(
      `Debes cambiar a la cuenta con TSYS:\n${REQUIRED_ADDRESS}`
    );
  }

  // 🔄 CAMBIAR A zkSYS
  await switchToZkSys(externalProvider);

  // 🔌 CREAR PROVIDER ETHERS
  const ethersProvider = new ethers.BrowserProvider(externalProvider);

  const signer = await ethersProvider.getSigner();
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
