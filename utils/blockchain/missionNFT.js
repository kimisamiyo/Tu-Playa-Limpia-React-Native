import { ethers } from "ethers";
import MissionNFTABI from "./MissionNFT.json";

const CONTRACT_ADDRESS = "0x12539926A3E4331B411b9d1bFC66fddeD008b72E";

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error("No hay wallet instalada");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    MissionNFTABI,
    signer
  );
};

export const mintNFT = async (missionId, tokenURI) => {
  const contract = await getContract();

  const tx = await contract.completeMission(
    missionId,
    tokenURI
  );

  await tx.wait();

  return tx.hash;
};
