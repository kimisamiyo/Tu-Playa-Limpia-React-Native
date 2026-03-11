import { createContext, useContext, useState } from "react"
import { ethers } from "ethers"
import { Platform, DeviceEventEmitter } from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage';
import EthereumProvider from "@walletconnect/ethereum-provider"

const WalletContext = createContext()

const NETWORK = {
  chainId: 57042,
  chainIdHex: "0xded2",
  chainName: "zkSYS PoB Devnet",
  rpcUrl: "https://rpc-pob.dev11.top",
  blockExplorerUrl: "https://explorer-pob.dev11.top",
  nativeCurrency: {
    name: "TSYS",
    symbol: "TSYS",
    decimals: 18
  }
}

export function WalletProvider({ children }) {

  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [address, setAddress] = useState(null)
  const [connectedWalletType, setConnectedWalletType] = useState(null)
  const [hasSkippedConnection, setHasSkippedConnection] = useState(false)

  // Sync wallet address with app metadata and notify observers
  const syncWalletWithApp = async (walletAddress) => {
    try {
      const storedUser = await AsyncStorage.getItem('@tpl_game_user_meta');
      const userData = storedUser ? JSON.parse(storedUser) : {};

      const updatedUser = { ...userData, walletAddress: walletAddress };
      await AsyncStorage.setItem('@tpl_game_user_meta', JSON.stringify(updatedUser));

      // Global event to trigger reload in GameContext, etc.
      DeviceEventEmitter.emit('TPL_ACCOUNT_IMPORTED');
      console.log("📡 App state synced with wallet address:", walletAddress);
    } catch (e) {
      console.warn("Error syncing wallet with storage:", e);
    }
  }

  // --------------------------------------------------
  // SWITCH / ADD NETWORK
  // --------------------------------------------------
  const switchNetwork = async (externalProvider) => {
    try {
      await externalProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainIdHex }]
      })
    } catch (switchError) {

      if (switchError.code === 4902) {
        await externalProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: NETWORK.chainIdHex,
              chainName: NETWORK.chainName,
              nativeCurrency: NETWORK.nativeCurrency,
              rpcUrls: [NETWORK.rpcUrl],
              blockExplorerUrls: [NETWORK.blockExplorerUrl]
            }
          ]
        })
      } else {
        throw switchError
      }
    }
  }

  // --------------------------------------------------
  // 🦊 METAMASK (EXTENSIÓN DESKTOP / MOBILE FALLBACK)
  // --------------------------------------------------
  const connectMetaMask = async () => {
    try {
      // 📱 En móvil (fuera de in-app browser de MetaMask), usamos WalletConnect como puente
      if (Platform.OS !== 'web' || !window.ethereum) {
        console.log("📱 Mobile detection or missing window.ethereum: triggering WalletConnect fallback");
        return await connectWalletConnect();
      }

      // 🖥️ Lógica de Desktop (cuando existe window.ethereum)
      if (!window.ethereum) {
        alert("MetaMask no está instalado")
        return
      }

      // 🔥 detecta MetaMask cuando hay múltiples wallets
      let mmProvider = window.ethereum

      if (Array.isArray(window.ethereum.providers)) {
        mmProvider = window.ethereum.providers.find(p => p.isMetaMask)
      }

      if (!mmProvider) {
        alert("MetaMask no disponible")
        return
      }
      const ethersProvider = new ethers.providers.Web3Provider(mmProvider)

      // ✅ ESTO ABRE LA EXTENSIÓN
      await ethersProvider.send("eth_requestAccounts", [])

      await switchNetwork(mmProvider)

      const signer = await ethersProvider.getSigner()
      const address = await signer.getAddress()

      setProvider(ethersProvider)
      setSigner(signer)
      setAddress(address)
      setConnectedWalletType('metamask')

      await syncWalletWithApp(address)
      console.log("🦊 MetaMask conectado:", address)

    } catch (err) {
      console.log("MetaMask connection error:", err)
    }
  }

  // --------------------------------------------------
  // 📱 WALLETCONNECT (MÓVIL / QR)
  // --------------------------------------------------
  const connectWalletConnect = async () => {
    try {

      const wcProvider = await EthereumProvider.init({
        projectId: "5c7937e314de0f188fccc2d1f9927e11",
        chains: [NETWORK.chainId],
        optionalChains: [NETWORK.chainId],
        rpcMap: {
          [NETWORK.chainId]: NETWORK.rpcUrl
        },
        showQrModal: true
      })

      await wcProvider.enable()

      await switchNetwork(wcProvider)

      const ethersProvider = new ethers.providers.Web3Provider(wcProvider)

      const signer = await ethersProvider.getSigner()
      const address = await signer.getAddress()

      setProvider(ethersProvider)
      setSigner(signer)
      setAddress(address)
      setConnectedWalletType('metamask')

      await syncWalletWithApp(address)
      console.log("📱 WalletConnect conectado:", address)

    } catch (err) {
      console.log("WalletConnect error:", err)
    }
  }

  // --------------------------------------------------
  // 🟢 PALI WALLET
  // --------------------------------------------------
  const connectPali = async () => {
    try {
      let ethProvider = window.pali || window.ethereum;

      if (window.ethereum?.providers) {
        ethProvider =
          window.ethereum.providers.find((p) => p.isPali || p.isPaliWallet) ||
          window.ethereum;
      }

      if (!ethProvider) {
        alert("Pali Wallet no detectada.");
        return;
      }

      const ethersProvider = new ethers.providers.Web3Provider(ethProvider);
      await ethProvider.request({ method: "eth_requestAccounts" });

      await switchNetwork(ethProvider);

      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();

      setProvider(ethersProvider);
      setSigner(signer);
      setAddress(address);
      setConnectedWalletType('pali');

      await syncWalletWithApp(address);
      console.log("🟢 Pali Wallet conectado:", address);

    } catch (err) {
      console.log("Pali connection error:", err);
    }
  }

  // --------------------------------------------------
  // DISCONNECT
  // --------------------------------------------------
  const disconnectWallet = () => {
    setProvider(null)
    setSigner(null)
    setAddress(null)
    setConnectedWalletType(null)
    setHasSkippedConnection(false)
  }

  return (
    <WalletContext.Provider
      value={{
        connectMetaMask,
        connectWalletConnect,
        connectPali,
        disconnectWallet,
        provider,
        signer,
        address,
        connectedWalletType,
        hasSkippedConnection,
        setHasSkippedConnection
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}