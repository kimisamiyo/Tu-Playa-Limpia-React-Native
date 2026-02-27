
const ENV = {
  APP_NAME: process.env.APP_NAME || "Tu Playa Limpia",
  APP_VERSION: process.env.APP_VERSION || "1.0.1",
  APP_URL: process.env.APP_URL || "https://tuplayalimpia.com",
  ROBOFLOW_API_KEY: process.env.EXPO_PUBLIC_ROBOFLOW_API_KEY || "",
  ROBOFLOW_MODEL: process.env.EXPO_PUBLIC_ROBOFLOW_MODEL || "ocean-waste/2",
  API_BASE_URL: process.env.API_BASE_URL || "",

  // zkSYS PoB Devnet Configuration
  BLOCKCHAIN_CHAIN_ID: 57042,
  BLOCKCHAIN_CHAIN_ID_HEX: '0xDED2',
  BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL || 'https://rpc-pob.dev11.top',
  BLOCKCHAIN_CHAIN_NAME: 'zkSYS PoB Devnet',
  BLOCKCHAIN_NATIVE_CURRENCY_NAME: 'Testnet Syscoin',
  BLOCKCHAIN_NATIVE_CURRENCY_SYMBOL: 'TSYS',
  BLOCKCHAIN_NATIVE_CURRENCY_DECIMALS: 18,
  BLOCKCHAIN_BLOCK_EXPLORER_URL: process.env.BLOCKCHAIN_BLOCK_EXPLORER_URL || 'https://explorer-pob.dev11.top',
};
// Validar variables críticas
const validateEnv = () => {
  const missingVars = [];
  if (!ENV.ROBOFLOW_API_KEY) {
    console.warn("ROBOFLOW_API_KEY not configured. Scanner will not work.");
    missingVars.push("EXPO_PUBLIC_ROBOFLOW_API_KEY");
  }
  if (missingVars.length > 0) {
    console.warn(
      `Missing environment variables: ${missingVars.join(", ")}`,
    );
  }
};
if (__DEV__) {
  validateEnv();
}
export default ENV;
