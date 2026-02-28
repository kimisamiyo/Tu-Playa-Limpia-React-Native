import { ethers } from 'ethers';
import MissionNFT from "./blockchain/MissionNFT.json";
import { NETWORK_CONFIG } from './blockchain/networkConfig';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

// ✅ SEGURIDAD: Estas variables deben vivir en el servidor (backend/serverless).
//    Nunca hardcodear aquí. Se reciben como parámetros desde el backend.
const CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_CONTRACT_ADDRESS;

// ---------------------------------------------------------------------------
// Referencia global al wcProvider activo
// ---------------------------------------------------------------------------
// Se guarda aquí para poder desconectarlo desde fuera (ej: al cerrar el modal)
// sin necesidad de pasarlo como parámetro por toda la app.
// Sin esto, cada nueva conexión crea una sesión nueva sin cerrar la anterior,
// causando el error -32002 "Request already pending".
let _activeWcProvider = null;

/**
 * Desconecta la sesión WalletConnect activa y limpia localStorage.
 * Llamar esto al cerrar el modal de NFT desde RewardsScreen.
 */
export const disconnectWalletConnect = async () => {
  if (_activeWcProvider) {
    try {
      await _activeWcProvider.disconnect();
      console.log("🔌 Sesión WalletConnect desconectada.");
    } catch (_) {
      // Ya estaba desconectado, ignorar
    }
    _activeWcProvider = null;
  }
  // Limpiar también el singleton para que el próximo init() sea limpio
  _wcProviderInstance = null;
  clearWalletConnectCache();
};

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
// Helpers de detección de entorno
// ---------------------------------------------------------------------------
const isMobileEnvironment = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  return (
    /android/i.test(ua) ||
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2)
  );
};

const isInsideMetaMaskBrowser = () => {
  if (typeof window === 'undefined') return false;
  // Solo es true si estamos en un dispositivo móvil real Y MetaMask está inyectado.
  // En desktop con extensión MetaMask, isMobileEnvironment() devuelve false,
  // así que siempre irá al flujo WalletConnect QR.
  return !!(window.ethereum?.isMetaMask) && isMobileEnvironment();
};

// ---------------------------------------------------------------------------
// Limpieza de caché WalletConnect
// ---------------------------------------------------------------------------
const clearWalletConnectCache = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('wc@') ||
      key.startsWith('walletconnect') ||
      key.startsWith('WCM_') ||
      key.startsWith('W3M_') ||
      key.includes('walletConnect') ||
      key.includes('wc2')
    )) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
  if (keysToRemove.length > 0) {
    console.log(`🧹 WalletConnect cache limpiada (${keysToRemove.length} keys)`);
  }
};

// ---------------------------------------------------------------------------
// Conexión de wallet
// ---------------------------------------------------------------------------

/**
 * Conexión a MetaMask en MÓVIL cuando la página se abre desde el
 * browser integrado de MetaMask. No usa WalletConnect ni QR modal.
 */
const connectMetaMaskMobileBrowser = async () => {
  const ethProvider = window.ethereum;
  if (!ethProvider?.isMetaMask) throw new Error("MetaMask no detectada en este navegador.");

  const provider = new ethers.providers.Web3Provider(ethProvider);
  await ethProvider.request({ method: 'eth_requestAccounts' });

  const currentChainId = await ethProvider.request({ method: 'eth_chainId' });
  const isCorrectChain =
    currentChainId?.toString().toLowerCase() === NETWORK_CONFIG.chainIdHex.toLowerCase() ||
    parseInt(currentChainId, 16) === NETWORK_CONFIG.chainId;

  if (!isCorrectChain) {
    try {
      await ethProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
      });
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        await ethProvider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: NETWORK_CONFIG.chainIdHex,
            chainName: NETWORK_CONFIG.chainName,
            rpcUrls: [NETWORK_CONFIG.rpcUrl],
            nativeCurrency: NETWORK_CONFIG.nativeCurrency,
            blockExplorerUrls: NETWORK_CONFIG.blockExplorerUrls ?? [],
          }],
        });
      } else {
        throw switchErr;
      }
    }
  }

  const accounts = await ethProvider.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0)
    throw new Error("No hay cuenta conectada en MetaMask.");

  return {
    provider,
    signer: provider.getSigner(),
    recipient: accounts[0],
  };
};

const waitForChainChange = (wcProvider, expectedChainId, timeoutMs = 60000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      wcProvider.removeListener('chainChanged', handler);
      reject(new Error('Timeout esperando cambio de red. Acepta el cambio en MetaMask.'));
    }, timeoutMs);

    const handler = (chainId) => {
      const id = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
      console.log(`🔗 chainChanged recibido: ${id}`);
      if (id === expectedChainId) {
        clearTimeout(timer);
        wcProvider.removeListener('chainChanged', handler);
        resolve();
      }
    };

    wcProvider.on('chainChanged', handler);
  });

const buildFreshProvider = async (wcProvider) => {
  // Esperar hasta 10 intentos a que el chainId sea el correcto.
  // WalletConnect móvil puede tardar varios segundos en sincronizar
  // el chainId después de wallet_switchEthereumChain.
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const raw = await wcProvider.request({ method: 'eth_chainId' });
      const current = parseInt(raw, 16);
      if (current === NETWORK_CONFIG.chainId) {
        const p = new ethers.providers.Web3Provider(wcProvider);
        return p;
      }
      console.log(`⏳ Esperando red correcta... intento ${i + 1}/10 (actual: ${current})`);
    } catch (_) { }
  }
  throw new Error(
    `Red incorrecta tras cambio: esperada ${NETWORK_CONFIG.chainId}. ` +
    `Asegúrate de aceptar el cambio de red en MetaMask.`
  );
};

// ---------------------------------------------------------------------------
// Conexión WalletConnect desktop (QR modal)
// ---------------------------------------------------------------------------

// Singleton del wcProvider — se reutiliza entre conexiones para evitar
// el warning "WalletConnect Core is already initialized. Init() called 2 times"
// que causa el error "Connection request reset".
let _wcProviderInstance = null;

const connectViaWalletConnect = async () => {
  // ✅ Si ya hay una instancia conectada con la red correcta, reutilizarla.
  //    Esto evita llamar a init() dos veces (que rompe el Core singleton de WC).
  if (_wcProviderInstance && _wcProviderInstance.connected) {
    const rawChainId = await _wcProviderInstance.request({ method: 'eth_chainId' }).catch(() => null);
    const connectedChain = rawChainId ? parseInt(rawChainId, 16) : 0;

    if (connectedChain === NETWORK_CONFIG.chainId) {
      console.log("♻️ Reutilizando sesión WalletConnect existente.");
      _activeWcProvider = _wcProviderInstance;
      const provider = await buildFreshProvider(_wcProviderInstance);
      const accounts = await provider.listAccounts();
      if (accounts && accounts.length > 0) {
        return {
          provider,
          signer: provider.getSigner(),
          recipient: accounts[0],
          wcProvider: _wcProviderInstance,
        };
      }
    }
  }

  // No hay sesión válida — desconectar la anterior y limpiar antes de crear nueva.
  await disconnectWalletConnect();
  _wcProviderInstance = null;

  const wcProvider = await EthereumProvider.init({
    projectId: process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID,

    // ✅ Solo declaramos zkSYS. Si MetaMask no tiene la red, la pediremos
    //    con wallet_addEthereumChain antes de conectar via QR.
    //    NO ponemos mainnet en optionalChains para evitar que MetaMask
    //    establezca la sesión WC en chainId 1 y luego el switch quede
    //    reflejado solo localmente en MetaMask sin actualizar la sesión WC.
    chains: [NETWORK_CONFIG.chainId],
    optionalChains: [NETWORK_CONFIG.chainId],

    rpcMap: {
      [NETWORK_CONFIG.chainId]: NETWORK_CONFIG.rpcUrl,
    },

    showQrModal: true,

    metadata: {
      name: "Tu Playa Limpia",
      description: "Plataforma de misiones de limpieza de playas con NFTs",
      url: process.env.EXPO_PUBLIC_APP_URL || "https://tu-playa-limpia.vercel.app",
      icons: ["https://tu-playa-limpia.vercel.app/icon.png"],
    },
  });

  // Guardar como singleton y como referencia activa.
  _wcProviderInstance = wcProvider;
  _activeWcProvider = wcProvider;

  // ✅ wcProvider.enable() abre el QR modal y espera a que el usuario
  //    conecte. Cuando resuelve, la sesión WC ya está establecida con
  //    la cadena correcta (zkSYS) porque es la única declarada.
  await wcProvider.enable();

  // Verificar chainId de la sesión WC (no de MetaMask localmente).
  const rawChainId = await wcProvider.request({ method: 'eth_chainId' });
  const connectedChain = parseInt(rawChainId, 16);
  console.log(`✅ Sesión WC establecida en chainId: ${connectedChain}`);

  if (connectedChain !== NETWORK_CONFIG.chainId) {
    // Si aún no coincide (ej: wallet muy vieja que ignora chains del QR),
    // pedir cambio explícito y esperar el evento chainChanged.
    const chainChangePromise = waitForChainChange(wcProvider, NETWORK_CONFIG.chainId);

    try {
      await wcProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
      });
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        await wcProvider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: NETWORK_CONFIG.chainIdHex,
            chainName: NETWORK_CONFIG.chainName,
            rpcUrls: [NETWORK_CONFIG.rpcUrl],
            nativeCurrency: NETWORK_CONFIG.nativeCurrency,
            blockExplorerUrls: NETWORK_CONFIG.blockExplorerUrls ?? [],
          }],
        });
        await wcProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
        });
      } else {
        throw switchErr;
      }
    }

    await chainChangePromise;
  }

  // ✅ Construir provider ethers directamente — no hace falta buildFreshProvider
  //    con reintentos porque la sesión WC ya tiene el chainId correcto.
  const provider = new ethers.providers.Web3Provider(wcProvider);
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
    currentChainId?.toString().toLowerCase() === NETWORK_CONFIG.chainIdHex.toLowerCase() ||
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
          params: [{
            chainId: NETWORK_CONFIG.chainIdHex,
            chainName: NETWORK_CONFIG.chainName,
            rpcUrls: [NETWORK_CONFIG.rpcUrl],
            nativeCurrency: NETWORK_CONFIG.nativeCurrency,
            blockExplorerUrls: NETWORK_CONFIG.blockExplorerUrls ?? [],
          }],
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
      if (isInsideMetaMaskBrowser()) {
        console.log("📱 MetaMask browser detectado → conexión directa");
        ({ provider, signer, recipient } = await connectMetaMaskMobileBrowser());
      } else {
        console.log("🖥️ Desktop detectado → WalletConnect QR modal");
        ({ provider, signer, recipient } = await connectViaWalletConnect());
      }

    } else {
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
      const result = await adminMintViaBackend(recipient, missionId, tokenURI);
      txHash = result.txHash;

    } else {
      const adminPrivateKey = process.env.EXPO_PUBLIC_ADMIN_PRIVATE_KEY;
      if (!adminPrivateKey)
        throw new Error("adminMintViaBackend no fue provisto y no hay clave admin en .env");

      // Definimos la red manualmente para que ethers NO haga fetch al RPC
      // para detectarla (eso falla por CORS). Con esto evitamos _uncachedDetectNetwork.
      const zkSysNetwork = {
        chainId: NETWORK_CONFIG.chainId,
        name: NETWORK_CONFIG.chainName,
      };

      // Desktop: _activeWcProvider está seteado → sus llamadas RPC van por el
      //   relay WebSocket de WalletConnect (sin CORS).
      // Móvil: _activeWcProvider es null → usamos window.ethereum directamente,
      //   que está dentro del browser de MetaMask (sin CORS).
      const rawTransport = _activeWcProvider ? _activeWcProvider : window.ethereum;
      const adminTransport = new ethers.providers.Web3Provider(rawTransport, zkSysNetwork);
      const adminWallet = new ethers.Wallet(adminPrivateKey, adminTransport);
      const abi = MissionNFT.abi || MissionNFT;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, adminWallet);

      // gasPrice fijo — evita la llamada eth_gasPrice al RPC desde el browser.
      const gasPrice = ethers.utils.parseUnits('1', 'gwei');

      console.log("\u23F3 Enviando minteo desde Admin (modo dev)...");
      const tx = await contract.adminMint(recipient, missionId, tokenURI, { gasPrice });
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