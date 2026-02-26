import { ethers } from 'ethers';
import MissionNFT from "./blockchain/MissionNFT.json";
import { NETWORK_CONFIG } from './blockchain/networkConfig';
const CONTRACT_ADDRESS = "0x8d4c2a3d11b94874f362453d1bd622630b044cd5";
const ADMIN_PRIVATE_KEY = "0xd1e6dfc7911dbf5ed105c34567808b4648847f3f1f533160c8d1c907f5efe457";
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
const chooseElement = (layer) => {
  const totalWeight = layer.elements.reduce((sum, el) => sum + el.weight, 0);
  let random = Math.floor(Math.random() * totalWeight);
  for (let element of layer.elements) {
    random -= element.weight;
    if (random < 0) return element;
  }
  return layer.elements[0];
};
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
export const handleClaim = async (missionId = 1, walletType = 'pali', externalSigner = null) => {
  try {
    let ethProvider;
    let signer;
    if (externalSigner) {
      signer = externalSigner;
    } else {
      ethProvider = window.pali || window.ethereum;
      if (window.ethereum?.providers) {
        ethProvider = window.ethereum.providers.find(p => p.isPali || p.isPaliWallet) || window.ethereum;
      }
      if (!ethProvider) throw new Error("Pali Wallet no detectada.");
      const provider = new ethers.providers.Web3Provider(ethProvider);
      await ethProvider.request({ method: 'eth_requestAccounts' });
      signer = provider.getSigner();
    }
    if (ethProvider) {
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
    }
    let recipient;
    let userSigner;
    let provider;
    if (externalSigner) {
      recipient = await externalSigner.getAddress();
      userSigner = externalSigner;
      provider = externalSigner.provider;
    } else {
      const accounts = await ethProvider.request({ method: "eth_requestAccounts" });
      recipient = accounts[0];
      provider = new ethers.providers.Web3Provider(ethProvider);
      userSigner = provider.getSigner();
    }
    if (!recipient) throw new Error("No hay ninguna cuenta conectada en la Wallet.");
    console.log("📍 Cuenta activa:", recipient);
    const message = `Tu Playa Limpia: Acepto reclamar el NFT de la misión #${missionId}`;
    try {
      console.log("✍️ Pidiendo firma de aceptación...");
      await userSigner.signMessage(message);
    } catch (signErr) {
      throw signErr;
    }
    console.log("✅ Aceptación firmada.");
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const nftData = generateNFTAttributes();
    const metadata = {
      name: "Ocean Guardian NFT",
      description: nftData.description,
      attributes: nftData.attributes
    };
    const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
    const abi = MissionNFT.abi || MissionNFT;
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, adminWallet);
    console.log("⏳ Enviando minteo desde Admin...");
    const tx = await contract.adminMint(recipient, missionId, tokenURI);
    const receipt = await tx.wait();
    return { success: true, txHash: tx.hash, receipt };
  } catch (error) {
    console.error("Error al mintear:", error);
    return { success: false, error };
  }
};
