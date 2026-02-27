import { ethers } from 'ethers';
import MissionNFT from "./blockchain/MissionNFT.json";
import { NETWORK_CONFIG } from './blockchain/networkConfig';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

// ✅ SEGURIDAD: Estas variables deben vivir en el servidor (backend/serverless).
//    Nunca hardcodear aquí. Se reciben como parámetros desde el backend.
const CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_CONTRACT_ADDRESS;

// ---------------------------------------------------------------------------
// Capas de generación de NFT
// ---------------------------------------------------------------------------
const layersSetup = [
  {
    name: "Fondo",
    elements: [
      { id: 1, name: "Amanecer Costero", path: "amanecer.png", weight: 30 },
      { id: 2, name: "Mediodía Soleado", path: "dia.png", weight: 50 },
      { id: 3, name: "Atardecer Violeta", path: "atardecer.png", weight: 15 },
      { id: 4, name: "Noche Estrellada", path: "noche.png", weight: 5 },
    ],
  },
  {
    name: "Personaje",
    elements: [
      { id: 1, name: "Voluntario", path: "humano.png", weight: 50 },
      { id: 2, name: "Voluntaria", path: "humana.png", weight: 50 },
      { id: 3, name: "Eco-Bot v1", path: "robot.png", weight: 10 },
    ],
  },
  {
    name: "Vestimenta",
    elements: [
      { id: 1, name: "Camiseta Blanca", path: "tshirt_white.png", weight: 40 },
      { id: 2, name: "Chaleco de Seguridad", path: "vest_orange.png", weight: 30 },
      { id: 3, name: "Traje de Buzo", path: "scuba.png", weight: 20 },
      { id: 4, name: "Capa de Héroe", path: "cape.png", weight: 5 },
    ],
  },
  {
    name: "Herramienta",
    elements: [
      { id: 1, name: "Manos", path: "hands.png", weight: 40 },
      { id: 2, name: "Pinza Recolectora", path: "grabber.png", weight: 30 },
      { id: 3, name: "Red de Pesca", path: "net.png", weight: 20 },
      { id: 4, name: "Aspiradora Futurista", path: "vacuum.png", weight: 5 },
    ],
  },
  {
    name: "Residuo Recolectado",
    elements: [
      { id: 1, name: "Botella Plástica", path: "bottle.png", weight: 40 },
      { id: 2, name: "Lata de Refresco", path: "can.png", weight: 30 },
      { id: 3, name: "Bota Vieja", path: "boot.png", weight: 15 },
      { id: 4, name: "Red Fantasma", path: "ghost_net.png", weight: 10 },
      { id: 5, name: "Mensaje en Botella", path: "msg_bottle.png", weight: 1 },
    ],
  },
  {
    name: "Accesorio Cabeza",
    elements: [
      { id: 0, name: "Ninguno", path: "none.png", weight: 20 },
      { id: 1, name: "Gorra Reciclada", path: "cap.png", weight: 40 },
      { id: 2, name: "Sombrero de Paja", path: "hat.png", weight: 30 },
      { id: 3, name: "Gafas de Buceo", path: "goggles.png", weight: 10 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const chooseElement = (layer) => {
  const totalWeight = layer.elements.reduce((sum, el) => sum + el.weight, 0);
  let random = Math.floor(Math.random() * totalWeight);
  for (const element of layer.elements) {
    random -= element.weight;
    if (random < 0) return element;
  }
  return layer.elements[0];
};

export const generateNFTAttributes = () => {
  const attributes = layersSetup.map((layer) => ({
    trait_type: layer.name,
    value: chooseElement(layer).name,
  }));

  return {
    attributes,
    description: `Un guardián equipado con ${attributes.find((a) => a.trait_type === 'Herramienta')?.value
      } salvando el océano de ${attributes.find((a) => a.trait_type === 'Residuo Recolectado')?.value
      }.`,
  };
};

// ---------------------------------------------------------------------------
// Conexión de wallet
// ---------------------------------------------------------------------------

/**
 * Inicializa WalletConnect y devuelve { provider, signer, recipient }.
 * Se usa tanto para MetaMask como para cualquier otra wallet compatible.
 * La sesión WC se conecta a la RPC personalizada de NETWORK_CONFIG.
 */
const connectViaWalletConnect = async () => {
  const wcProvider = await EthereumProvider.init({
    projectId:
      process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || "5c7937e314de0f188fccc2d1f9927e11",

    // ✅ Usamos la cadena personalizada en lugar de mainnet (1).
    //    optionalChains permite que wallets que no la soporten no fallen.
    chains: [NETWORK_CONFIG.chainId],
    optionalChains: [1],

    // ✅ RPC apunta a tu nodo personalizado.
    rpcMap: {
      [NETWORK_CONFIG.chainId]: NETWORK_CONFIG.rpcUrl,
    },

    showQrModal: true,

    // ✅ Metadatos del proyecto: ayudan a que MetaMask/WalletConnect
    //    muestren el nombre correcto en la solicitud de conexión
    //    y reduce la probabilidad de que se marque como phishing.
    metadata: {
      name: "Tu Playa Limpia",
      description: "Plataforma de misiones de limpieza de playas con NFTs",
      url: process.env.EXPO_PUBLIC_APP_URL || "https://tu-playa-limpia.vercel.app",
      icons: ["https://tu-playa-limpia.vercel.app/icon.png"],
    },
  });

  await wcProvider.enable();

  const provider = new ethers.providers.Web3Provider(wcProvider);

  // Verificar y cambiar a la red correcta si hace falta
  const { chainId: connectedChain } = await provider.getNetwork();
  if (connectedChain !== NETWORK_CONFIG.chainId) {
    try {
      await wcProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
      });
    } catch (switchErr) {
      // Si la red no existe en la wallet, la añadimos
      if (switchErr.code === 4902) {
        await wcProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: NETWORK_CONFIG.chainIdHex,
              chainName: NETWORK_CONFIG.chainName,
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              nativeCurrency: NETWORK_CONFIG.nativeCurrency,
              blockExplorerUrls: NETWORK_CONFIG.blockExplorerUrls ?? [],
            },
          ],
        });
      } else {
        throw switchErr;
      }
    }
  }

  const accounts = await provider.listAccounts();
  if (!accounts || accounts.length === 0)
    throw new Error("No hay cuenta conectada en la wallet.");

  return {
    provider,
    signer: provider.getSigner(),
    recipient: accounts[0],
    wcProvider,
  };
};

/**
 * Conexión directa con Pali Wallet (inyectada en window).
 * Mismo flujo que antes, sin cambios.
 */
const connectViaPali = async () => {
  let ethProvider = window.pali || window.ethereum;

  if (window.ethereum?.providers) {
    ethProvider =
      window.ethereum.providers.find((p) => p.isPali || p.isPaliWallet) ||
      window.ethereum;
  }

  if (!ethProvider) throw new Error("Pali Wallet no detectada.");

  const provider = new ethers.providers.Web3Provider(ethProvider);
  await ethProvider.request({ method: "eth_requestAccounts" });

  const currentChainId = await ethProvider.request({ method: "eth_chainId" });
  const isCorrectChain =
    currentChainId?.toString().toLowerCase() ===
    NETWORK_CONFIG.chainIdHex.toLowerCase() ||
    parseInt(currentChainId, 16) === NETWORK_CONFIG.chainId;

  if (!isCorrectChain) {
    try {
      await ethProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
      });
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        await ethProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: NETWORK_CONFIG.chainIdHex,
              chainName: NETWORK_CONFIG.chainName,
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              nativeCurrency: NETWORK_CONFIG.nativeCurrency,
              blockExplorerUrls: NETWORK_CONFIG.blockExplorerUrls ?? [],
            },
          ],
        });
      } else {
        throw switchErr;
      }
    }
  }

  const accounts = await ethProvider.request({ method: "eth_requestAccounts" });

  return {
    provider,
    signer: provider.getSigner(),
    recipient: accounts[0],
  };
};

// ---------------------------------------------------------------------------
// handleClaim
// ---------------------------------------------------------------------------

/**
 * @param {number}  missionId      - ID de la misión (default 1)
 * @param {'pali'|'metamask'|'external'} walletType
 * @param {ethers.Signer|null} externalSigner - Signer ya conectado (opcional)
 * @param {Function|null} adminMintViaBackend  - Función async que llama a tu
 *   backend/serverless para ejecutar adminMint. Recibe (recipient, missionId, tokenURI)
 *   y devuelve { txHash }. Si es null, se intenta mintear localmente
 *   (solo para desarrollo con EXPO_PUBLIC_ADMIN_PRIVATE_KEY en .env).
 */
export const handleClaim = async (
  missionId = 1,
  walletType = 'pali',
  externalSigner = null,
  adminMintViaBackend = null,
) => {
  try {
    let provider;
    let signer;
    let recipient;

    // --- 1. Conectar wallet ---
    if (externalSigner) {
      recipient = await externalSigner.getAddress();
      signer = externalSigner;
      provider = externalSigner.provider;

    } else if (walletType === 'metamask') {
      // ✅ MetaMask ahora usa WalletConnect igual que cualquier otra wallet.
      //    El usuario escanea el QR (móvil) o hace clic en "MetaMask" (extensión).
      //    La conexión apunta a la RPC personalizada de NETWORK_CONFIG.
      ({ provider, signer, recipient } = await connectViaWalletConnect());

    } else {
      // Pali Wallet inyectada en window
      ({ provider, signer, recipient } = await connectViaPali());
    }

    if (!recipient) throw new Error("No hay ninguna cuenta conectada en la Wallet.");
    console.log("📍 Cuenta activa:", recipient);

    // --- 2. Firma de aceptación del usuario ---
    const message = `Tu Playa Limpia: Acepto reclamar el NFT de la misión #${missionId}`;
    console.log("✍️ Pidiendo firma de aceptación...");
    await signer.signMessage(message);
    console.log("✅ Aceptación firmada.");

    // --- 3. Generar metadata del NFT ---
    const nftData = generateNFTAttributes();
    const metadata = {
      name: "Ocean Guardian NFT",
      description: nftData.description,
      attributes: nftData.attributes,
    };
    const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

    // --- 4. Minteo via backend (recomendado) o local (solo dev) ---
    let txHash;

    if (typeof adminMintViaBackend === 'function') {
      // ✅ PRODUCCIÓN: el backend firma con la clave admin de forma segura.
      const result = await adminMintViaBackend(recipient, missionId, tokenURI);
      txHash = result.txHash;

    } else {
      // ⚠️  SOLO DESARROLLO LOCAL: clave admin en .env, nunca en producción.
      const adminPrivateKey = process.env.EXPO_PUBLIC_ADMIN_PRIVATE_KEY;
      if (!adminPrivateKey)
        throw new Error("adminMintViaBackend no fue provisto y no hay clave admin en .env");

      const adminWallet = new ethers.Wallet(adminPrivateKey, provider);
      const abi = MissionNFT.abi || MissionNFT;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, adminWallet);

      console.log("⏳ Enviando minteo desde Admin (modo dev)...");
      const tx = await contract.adminMint(recipient, missionId, tokenURI);
      await tx.wait();
      txHash = tx.hash;
    }

    console.log("🎉 NFT minteado. TX:", txHash);
    return { success: true, txHash };

  } catch (error) {
    console.error("Error al mintear:", error);
    return { success: false, error };
  }
};