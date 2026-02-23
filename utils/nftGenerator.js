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

export const handleClaim = async (missionId = 1, walletType = 'any') => {
  try {
    let ethProvider = window.ethereum;

    console.log(`🔍 Conectando usuario para obtener dirección destino...`);

    if (walletType === 'metamask') {
      const providers = window.ethereum?.providers || [];

      // 1. Estrategia Pro: Buscar por propiedad interna _metamask que Pali no suele clonar
      let realMM = providers.find(p => p.isMetaMask && p._metamask);

      // 2. Estrategia Secundaria: Buscar por exclusión
      if (!realMM) {
        realMM = providers.find(p => p.isMetaMask && !p.isPali && !p.isPaliWallet);
      }

      // 3. Estrategia Terciaria: Si solo hay uno y dice ser MetaMask
      if (!realMM && window.ethereum?.isMetaMask && !window.ethereum?.isPali) {
        realMM = window.ethereum;
      }

      if (realMM) {
        ethProvider = realMM;
      } else {
        // Si no encontramos nada seguro, usamos el principal pero avisamos
        ethProvider = window.ethereum;
        console.warn("⚠️ No se pudo verificar un MetaMask auténtico entre los proveedores.");
      }
    } else if (walletType === 'pali') {
      // Intentar encontrar Pali específicamente
      if (window.pali) {
        ethProvider = window.pali;
      } else if (window.ethereum?.providers?.length) {
        ethProvider = window.ethereum.providers.find(p => p.isPali || p.isPaliWallet) || window.ethereum;
      } else if (window.ethereum?.isPali || window.ethereum?.isPaliWallet) {
        ethProvider = window.ethereum;
      }
    }

    if (!ethProvider) throw new Error(`Wallet ${walletType} no detectada. Asegúrate de tener la extensión instalada.`);

    // Log detallado para que el usuario nos diga qué ve
    console.log("✅ Selección de Proveedor:", {
      walletType,
      isRealMetaMask: !!ethProvider._metamask,
      isPali: !!(ethProvider.isPali || ethProvider.isPaliWallet),
      hasProvidersArray: !!window.ethereum?.providers
    });

    // 1️⃣ OBTENER DIRECCIÓN DEL USUARIO Y PEDIR FIRMA DE ACEPTACIÓN
    const accounts = await ethProvider.request({
      method: "eth_requestAccounts"
    });
    const recipient = accounts[0];

    console.log("📍 Dirección destino (Usuario):", recipient);

    // ✍️ PASO DE INTERACCIÓN: Pedir al usuario que firme la aceptación (GRATIS)
    const userProvider = new ethers.providers.Web3Provider(ethProvider);
    const userSigner = userProvider.getSigner();

    const message = `Tu Playa Limpia: Acepto reclamar el NFT de la misión #${missionId}`;
    console.log("✍️ Pidiendo firma de aceptación al usuario...");

    // Esto abrirá la Wallet para que el usuario "acepte"
    await userSigner.signMessage(message);

    console.log("✅ Aceptación firmada por el usuario.");

    // 2️⃣ CONFIGURAR EL ADMIN (Usamos el provider de la wallet para evitar CORS)
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, userProvider);

    console.log("💳 Pagando gas desde Admin (vía provider de wallet):", adminWallet.address);

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
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      abi,
      adminWallet
    );

    // 5️⃣ MINT POR ADMIN PARA EL USUARIO
    console.log("⏳ Enviando transacción de minteo...");
    const tx = await contract.adminMint(recipient, missionId, tokenURI);

    console.log("✅ Tx enviada:", tx.hash);

    const receipt = await tx.wait();
    console.log("🎉 Documento de confirmación recibido!");

    return {
      success: true,
      txHash: tx.hash,
      receipt
    };

  } catch (error) {
    console.error("Error al mintear:", error);
    return {
      success: false,
      error
    };
  }
};
