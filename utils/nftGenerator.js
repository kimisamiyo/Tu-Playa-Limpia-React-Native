import { ethers } from 'ethers';
import MissionNFT from "./blockchain/MissionNFT.json";
import { NETWORK_CONFIG } from './blockchain/networkConfig';


// =====================================================
// 📍 CONTRACT ADDRESS (YA ES VÁLIDO)
// =====================================================

const CONTRACT_ADDRESS = "0x12539926A3E4331B411b9d1bFC66fddeD008b72E";


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
    description: `Un guardián equipado con ${
      attributes.find(a => a.trait_type === 'Herramienta')?.value
    } salvando el océano de ${
      attributes.find(a => a.trait_type === 'Residuo Recolectado')?.value
    }.`
  };
};


// =====================================================
// 🚀 HANDLE CLAIM ESTABLE PARA PALI + zkSYS
// =====================================================

export const handleClaim = async (missionId = 1) => {
  try {
    if (!window.ethereum) throw new Error("Wallet no detectada");

    if (!ethers.isAddress(CONTRACT_ADDRESS)) {
      throw new Error("Dirección del contrato inválida");
    }

    // 1️⃣ CAMBIAR A zkSYS
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId"
    });

    if (currentChainId !== NETWORK_CONFIG.chainIdHex) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK_CONFIG.chainIdHex }]
      });
    }

    // 2️⃣ PEDIR CUENTAS
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    const account = accounts[0];

    // 3️⃣ PROVIDER
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // 4️⃣ VERIFICAR RED
    const network = await provider.getNetwork();

    if (Number(network.chainId) !== Number(NETWORK_CONFIG.chainId)) {
      throw new Error("Red incorrecta después del cambio");
    }

    // 5️⃣ METADATA
    const nftData = generateNFTAttributes();

    const metadata = {
      name: "Ocean Guardian NFT",
      description: nftData.description,
      attributes: nftData.attributes
    };

    const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

    // 6️⃣ CONTRATO
    const abi = MissionNFT.abi || MissionNFT;

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      abi,
      signer
    );

    // 7️⃣ MINT REAL SEGÚN TU CONTRATO
    const tx = await contract.completeMission(missionId, tokenURI);

    console.log("Tx enviada:", tx.hash);

    const receipt = await tx.wait();

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

