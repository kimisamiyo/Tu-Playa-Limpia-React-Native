import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

export default defineConfig({
  solidity: "0.8.20",
  defaultNetwork: "zkSYS_PoB_Devnet",
  networks: {
    zkSYS_PoB_Devnet: {
      type: "http",
      url: "https://rpc-pob.dev11.top",
      chainId: 57042,
      accounts: [privateKey],
    },
  },
});
