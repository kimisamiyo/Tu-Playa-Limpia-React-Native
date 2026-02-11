import { ethers } from "ethers";
import MissionNFTABI from "./MissionNFT.json";

const CONTRACT_ADDRESS = "0x0D0dfA1dE746B6eF0685e40bB48AFCb471b7a64c";

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
