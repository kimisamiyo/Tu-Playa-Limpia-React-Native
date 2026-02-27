import { createContext, useContext, useState } from "react"
import { ethers } from "ethers"
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

  const connectWallet = async () => {
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

      // 🔹 cambiar / agregar red automáticamente
      await switchNetwork(wcProvider)

      const ethersProvider = new ethers.BrowserProvider(wcProvider)
      const signer = await ethersProvider.getSigner()
      const address = await signer.getAddress()

      setProvider(ethersProvider)
      setSigner(signer)
      setAddress(address)

    } catch (err) {
      console.log("Wallet connection error:", err)
    }
  }

  const switchNetwork = async (wcProvider) => {
    try {

      await wcProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainIdHex }]
      })

    } catch (switchError) {

      if (switchError.code === 4902) {

        await wcProvider.request({
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

      }
    }
  }

  return (
    <WalletContext.Provider
      value={{
        connectWallet,
        provider,
        signer,
        address
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}