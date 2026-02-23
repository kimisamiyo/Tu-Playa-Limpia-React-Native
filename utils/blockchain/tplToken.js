import { ethers } from 'ethers';
import { NETWORK_CONFIG } from './networkConfig';

// 📍 DIRECCIÓN DEL CONTRATO DESPLEGADO
export const TPL_TOKEN_ADDRESS = "0xd4ef83786d4004c3a33ed30bacf3b8dfb7e37aa2";

// 📝 ABI SIMPLIFICADA (Para lo que necesitamos)
export const TPL_TOKEN_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function getTitle(address user) view returns (string)",
    "function mint(address to, uint256 amount) external",
    "function symbol() view returns (string)"
];

/**
 * Obtiene el título actual del usuario desde la blockchain
 */
export const fetchUserTitle = async (address) => {
    try {
        if (!window.ethereum) return "Cleanup Rookie";

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(TPL_TOKEN_ADDRESS, TPL_TOKEN_ABI, provider);

        const title = await contract.getTitle(address);
        return title;
    } catch (error) {
        console.error("Error fetching title from contract:", error);
        return "Cleanup Rookie";
    }
};

/**
 * Obtiene el balance de TPL del usuario
 */
export const fetchTPLBalance = async (address) => {
    try {
        if (!window.ethereum) return "0";

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(TPL_TOKEN_ADDRESS, TPL_TOKEN_ABI, provider);

        const balance = await contract.balanceOf(address);
        const decimals = await contract.decimals();

        return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
        console.error("Error fetching TPL balance:", error);
        return "0";
    }
};
