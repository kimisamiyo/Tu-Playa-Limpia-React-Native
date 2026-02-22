import { ethers } from 'ethers';
import EthereumProvider from "@walletconnect/ethereum-provider";

export async function connectWalletConnect() {
  try {
    const provider = await EthereumProvider.init({
      projectId: "5c7937e314de0f188fccc2d1f9927e11",
      chains: [57042],
      rpcMap: {
        57042: "https://rpc-pob.dev11.top"
      },
      showQrModal: true,
    });

    await provider.connect();

    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();

    return {
      provider: ethersProvider,
      signer,
      address,
      success: true,
    };

  } catch (error) {
    console.error("WalletConnect error:", error);
    throw new Error("Error al conectar con WalletConnect");
  }
}
