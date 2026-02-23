import { config as dotenvConfig } from "dotenv";
dotenvConfig();

// ✅ Importamos solo el plugin de Ignition para deploys
import "@nomicfoundation/hardhat-ignition";
import { defineConfig } from "hardhat/config";

const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;

export default defineConfig({
  // Ya no necesitamos hardhat-toolbox-mocha-ethers
  plugins: [],

  solidity: {
    profiles: {
      default: { version: "0.8.28" },
      production: {
        version: "0.8.28",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    },
  },

  networks: {
    // Redes simuladas de Hardhat
    hardhatMainnet: { type: "edr-simulated", chainType: "l1" },
    hardhatOp: { type: "edr-simulated", chainType: "op" },

    // zkSYS PoB Devnet
    zkSYS_PoB_Devnet: {
      type: "http",
      chainId: 57042,
      url: "https://rpc-pob.dev11.top",
      accounts: OWNER_PRIVATE_KEY ? [OWNER_PRIVATE_KEY] : [],
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
});