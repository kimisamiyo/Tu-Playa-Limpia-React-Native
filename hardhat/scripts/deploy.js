async function main(hre) {
  const MissionNFT = await hre.ethers.getContractFactory("MissionNFT");

  const missionNFT = await MissionNFT.deploy();

  await missionNFT.waitForDeployment();

  console.log("✅ Deploy en:", await missionNFT.getAddress());
}

export default main;
