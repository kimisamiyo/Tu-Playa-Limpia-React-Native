import hre from "hardhat";

async function main() {
  console.log("🚀 Desplegando MissionNFT...");

  // Ignition inyecta deploy a través de hre
  const missionNFT = await (hre as any).deploy("MissionNFT", {
    from: process.env.OWNER_PRIVATE_KEY,
    args: [], // constructor args
  });

  console.log("✅ MissionNFT desplegado en:", missionNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});