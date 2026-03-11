import { ethers } from 'ethers';

// zkSYS PoB Devnet Configuration
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'https://rpc-pob.dev11.top';
const CONTRACT_ADDRESS = "0xdbe03da0a41ac28939876416773bec40c3b6a042";
const ADMIN_PRIVATE_KEY = process.env.EXPO_PUBLIC_ADMIN_PRIVATE_KEY;

const ABI = [
    "function mint(address to, uint256 amount) external",
    "function totalSupply() view returns (uint256)",
    "function decimals() view returns (uint8)"
];

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { address, amount } = req.body;

        if (!address || !amount) {
            return res.status(400).json({ error: 'Missing address or amount' });
        }

        if (!ADMIN_PRIVATE_KEY) {
            return res.status(500).json({ error: 'Server configuration error: Missing Private Key' });
        }

        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

        console.log(`📡 Minting ${amount} TPL to ${address}...`);

        // Llamar a la función mint del contrato
        // Nota: El contrato TPLToken.sol usa amount * 10**decimals() internamente en su función mint personalizada.
        // Pero espera, revisemos TPLToken.sol:
        // function mint(address to, uint256 amount) external onlyOwner {
        //     uint256 amountWithDecimals = amount * 10**decimals();
        //     require(totalSupply() + amountWithDecimals <= MAX_SUPPLY, "Max supply reached");
        //     _mint(to, amountWithDecimals);
        // }
        // Entonces pasamos el número "limpio" (ej. 8) y el contrato le pone los decimales.

        const tx = await contract.mint(address, amount);
        const receipt = await tx.wait();

        console.log(`✅ Minting complete. Hash: ${receipt.transactionHash}`);

        return res.status(200).json({
            success: true,
            hash: receipt.transactionHash,
            message: `Tokens minted successfully to ${address}`
        });

    } catch (error) {
        console.error('❌ Minting error:', error);
        return res.status(500).json({
            error: 'Transaction failed',
            details: error.message
        });
    }
}
