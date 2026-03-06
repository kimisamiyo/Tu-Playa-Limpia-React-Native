import { createContext, useContext, useState, useEffect } from "react"
import { ethers } from "ethers"
import EthereumProvider from "@walletconnect/ethereum-provider"
import AsyncStorage from '@react-native-async-storage/async-storage'

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
  const [hasSeenWalletScreen, setHasSeenWalletScreen] = useState(true)

  // Cargar estado inicial (pantalla vista y última dirección conexa)
  useEffect(() => {
    (async () => {
      try {
        const [seen, lastAddress] = await Promise.all([
          AsyncStorage.getItem('@tpl_wallet_screen_seen'),
          AsyncStorage.getItem('@tpl_last_wallet_address')
        ]);
        setHasSeenWalletScreen(seen === 'true');
        if (lastAddress) setAddress(lastAddress);
      } catch (e) {
        console.error("Error loading wallet state", e);
      }
    })();
  }, []);

  const markWalletScreenSeen = async () => {
    try {
      await AsyncStorage.setItem('@tpl_wallet_screen_seen', 'true');
      setHasSeenWalletScreen(true);
    } catch (e) {
      console.error("Error setting wallet screen state", e);
    }
  };

  // Guardar address cuando cambie
  useEffect(() => {
    if (address) {
      AsyncStorage.setItem('@tpl_last_wallet_address', address).catch(() => { });
    }
  }, [address]);

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
  // 🦊 METAMASK (EXTENSIÓN DESKTOP)
  // --------------------------------------------------
  const connectMetaMask = async (providerName = "MetaMask") => {
    try {

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

      console.log(`🦊 ${providerName} conectado:`, address)

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

      console.log("📱 WalletConnect conectado:", address)

    } catch (err) {
      console.log("WalletConnect error:", err)
    }
  }

  // --------------------------------------------------
  // DISCONNECT
  // --------------------------------------------------
  const disconnectWallet = () => {
    setProvider(null)
    setSigner(null)
    setAddress(null)
  }

  return (
    <WalletContext.Provider
      value={{
        connectMetaMask,
        connectWalletConnect,
        disconnectWallet,
        provider,
        signer,
        address,
        hasSeenWalletScreen,
        markWalletScreenSeen
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}