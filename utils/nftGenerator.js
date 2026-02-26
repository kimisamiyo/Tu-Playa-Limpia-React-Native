import { ethers } from 'ethers';
import MissionNFT from "./blockchain/MissionNFT.json";
import { NETWORK_CONFIG } from './blockchain/networkConfig';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

const CONTRACT_ADDRESS = "0x8d4c2a3d11b94874f362453d1bd622630b044cd5";
const ADMIN_PRIVATE_KEY = "0xd1e6dfc7911dbf5ed105c34567808b4648847f3f1f533160c8d1c907f5efe457";

/* ---------------- NFT ATTRIBUTES ---------------- */

const layersSetup = [/* ⬅️ TU CONFIG ORIGINAL SIN CAMBIOS */];

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

/* ---------------- WALLET CONNECTION ---------------- */

const isMobile = () =>
  typeof navigator !== "undefined" &&
  /android|iphone|ipad|ipod/i.test(navigator.userAgent);

const getInjectedProvider = () => {
  if (typeof window === "undefined") return null;

  if (window.ethereum?.providers) {
    return window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum;
  }

  return window.ethereum;
};

/* ---------------- MAIN CLAIM ---------------- */

export const handleClaim = async (
  missionId = 1,
  walletType = 'pali',
  externalSigner = null
) => {
  try {

    let provider;
    let userSigner;
    let recipient;

    /* ---------------- EXTERNAL SIGNER ---------------- */

    if (externalSigner) {
      recipient = await externalSigner.getAddress();
      userSigner = externalSigner;
      provider = externalSigner.provider;
    }

    /* ---------------- METAMASK ---------------- */

    else if (walletType === 'metamask') {

      const injected = getInjectedProvider();

      /* 👉 Si estás dentro del navegador de MetaMask mobile */
      if (injected?.isMetaMask) {

        provider = new ethers.providers.Web3Provider(injected);
        await provider.send("eth_requestAccounts", []);

        userSigner = provider.getSigner();
        recipient = await userSigner.getAddress();
      }

      /* 👉 WalletConnect (mobile + desktop) */
      else {

        const wcProvider = await EthereumProvider.init({
          projectId:
            process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID ||
            "5c7937e314de0f188fccc2d1f9927e11",
          chains: [NETWORK_CONFIG.chainId],
          showQrModal: true,
        });

        await wcProvider.connect();

        provider = new ethers.providers.Web3Provider(wcProvider);

        await provider.send("eth_requestAccounts", []);

        userSigner = provider.getSigner();
        recipient = await userSigner.getAddress();
      }
    }

    /* ---------------- PALI ---------------- */

    else {

      let ethProvider = window.pali || getInjectedProvider();

      if (!ethProvider) throw new Error("Pali Wallet no detectada.");

      provider = new ethers.providers.Web3Provider(ethProvider);

      await ethProvider.request({ method: 'eth_requestAccounts' });

      const currentChainId = await ethProvider.request({ method: "eth_chainId" });

      const isCorrectChain =
        currentChainId.toLowerCase() === NETWORK_CONFIG.chainIdHex.toLowerCase();

      if (!isCorrectChain) {
        await ethProvider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: NETWORK_CONFIG.chainIdHex }]
        });
      }

      const accounts = await ethProvider.request({ method: "eth_requestAccounts" });

      recipient = accounts[0];
      userSigner = provider.getSigner();
    }

    if (!recipient) throw new Error("No hay cuenta conectada.");

    console.log("📍 Cuenta activa:", recipient);

    /* ---------------- SIGNATURE ---------------- */

    const message = `Tu Playa Limpia: Acepto reclamar el NFT de la misión #${missionId}`;

    console.log("✍️ Solicitando firma...");
    await userSigner.signMessage(message);
    console.log("✅ Firma realizada");

    /* ---------------- ADMIN MINT ---------------- */

    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

    const nftData = generateNFTAttributes();

    const metadata = {
      name: "Ocean Guardian NFT",
      description: nftData.description,
      attributes: nftData.attributes
    };

    const tokenURI =
      `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

    const abi = MissionNFT.abi || MissionNFT;

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      abi,
      adminWallet
    );

    console.log("⏳ Enviando minteo...");

    const tx = await contract.adminMint(recipient, missionId, tokenURI);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: tx.hash,
      receipt
    };

  } catch (error) {

    console.error("❌ Error en claim:", error);

    return {
      success: false,
      error
    };
  }
};