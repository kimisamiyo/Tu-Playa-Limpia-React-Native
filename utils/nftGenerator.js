import { ethers } from 'ethers';
import MissionNFT from "./blockchain/MissionNFT.json";
import { NETWORK_CONFIG } from './blockchain/networkConfig';


// =====================================================
// 📍 CONFIGURACIÓN DE CONTRATO Y ADMIN
// =====================================================

const CONTRACT_ADDRESS = "0x8d4c2a3d11b94874f362453d1bd622630b044cd5";
const ADMIN_PRIVATE_KEY = "0xd1e6dfc7911dbf5ed105c34567808b4648847f3f1f533160c8d1c907f5efe457";


// =====================================================
// 🎨 CAPAS NFT
// =====================================================

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
  }
];


// =====================================================
// 🎲 SELECCIÓN POR PESO
// =====================================================

const chooseElement = (layer) => {
  const totalWeight = layer.elements.reduce((sum, el) => sum + el.weight, 0);
  let random = Math.floor(Math.random() * totalWeight);

  for (let element of layer.elements) {
    random -= element.weight;
    if (random < 0) return element;
  }

  return layer.elements[0];
};


// =====================================================
// 🎨 GENERAR ATRIBUTOS
// =====================================================

export const generateNFTAttributes = () => {
  let attributes = [];

  layersSetup.forEach((layer) => {
    const selected = chooseElement(layer);

    attributes.push({
      trait_type: layer.name,
      value: selected.name
    });
  });

  return {
    attributes,
    description: `Un guardián equipado con ${attributes.find(a => a.trait_type === 'Herramienta')?.value
      } salvando el océano de ${attributes.find(a => a.trait_type === 'Residuo Recolectado')?.value
      }.`
  };
};


// =====================================================
// 🚀 HANDLE CLAIM: EL ADMIN PAGA EL GAS
// =====================================================

export const handleClaim = async (missionId = 1, walletType = 'pali') => {
  try {
    let ethProvider = window.pali || window.ethereum;

    if (window.ethereum?.providers) {
      ethProvider = window.ethereum.providers.find(p => p.isPali || p.isPaliWallet) || window.ethereum;
    }

    if (!ethProvider) throw new Error("Pali Wallet no detectada.");

    // 0️⃣ ASEGURAR RED zkSYS
    const currentChainId = await ethProvider.request({ method: "eth_chainId" });
    const isCorrectChain =
      currentChainId?.toString().toLowerCase() === NETWORK_CONFIG.chainIdHex.toLowerCase() ||
      parseInt(currentChainId, 16) === NETWORK_CONFIG.chainId;

    if (!isCorrectChain) {
      await ethProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK_CONFIG.chainIdHex }]
      });
    }

    // 1️⃣ OBTENER DIRECCIÓN ACTIVA (Forzando sincronización)
    const accounts = await ethProvider.request({ method: "eth_requestAccounts" });
    const recipient = accounts[0];

    if (!recipient) throw new Error("No hay ninguna cuenta conectada en la Wallet.");
    console.log("📍 Cuenta activa detectada por Pali:", recipient);

    // ✍️ PASO DE INTERACCIÓN (Firma Gratuita)
    const userProvider = new ethers.providers.Web3Provider(ethProvider);
    const userSigner = userProvider.getSigner();

    const message = `Tu Playa Limpia: Acepto reclamar el NFT de la misión #${missionId}`;

    try {
      console.log("✍️ Pidiendo firma de aceptación...");
      await userSigner.signMessage(message);
    } catch (signErr) {
      if (signErr.code === 4100) {
        throw new Error("Pali indica un desajuste de cuenta. Por favor, abre la extensión, haz clic en el icono de 'Sitios Conectados' (globo terráqueo) y asegúrate de que la cuenta de 99 TSYS sea la activa para este sitio.");
      }
      throw signErr;
    }

    console.log("✅ Aceptación firmada.");

    // 2️⃣ CONFIGURAR EL ADMIN (El que paga el gas)
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, userProvider);

    // 3️⃣ METADATA
    const nftData = generateNFTAttributes();
    const metadata = {
      name: "Ocean Guardian NFT",
      description: nftData.description,
      attributes: nftData.attributes
    };

    const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

    // 4️⃣ CONTRATO
    const abi = MissionNFT.abi || MissionNFT;
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, adminWallet);

    // 5️⃣ MINT
    console.log("⏳ Enviando minteo desde Admin...");
    const tx = await contract.adminMint(recipient, missionId, tokenURI);
    const receipt = await tx.wait();

    return { success: true, txHash: tx.hash, receipt };

  } catch (error) {
    console.error("Error al mintear:", error);
    return { success: false, error };
  }
};
