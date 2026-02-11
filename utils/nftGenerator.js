import { ethers } from 'ethers';
// El ABI del contrato está dentro de utils/blockchain/MissionNFT.json
// antes la ruta apuntaba a ../contracts que no existe en este proyecto
import MissionNFT from "./blockchain/MissionNFT.json";
import { mintNFT } from './blockchain/missionNFT';
import { LAYER_IMAGES } from '../constants/nftAssets';

const CONTRACT_ADDRESS = "0x12539926A3E4331B411b9d1bFC66fddeD008b72E"; // <-- cambia esto

// --- DEFINICIÓN DE CAPAS Y RAREZAS ---
const layersSetup = [
    {
        name: "Fondo",
        elements: [
            { id: 1, name: "Amanecer Costero", path: "amanecer.png", weight: 30 },
            { id: 2, name: "Mediodía Soleado", path: "dia.png", weight: 50 },
            { id: 3, name: "Atardecer Violeta", path: "atardecer.png", weight: 15 },
            { id: 4, name: "Noche Estrellada", path: "noche.png", weight: 5 },
        ],
    },
    {
        name: "Personaje",
        elements: [
            { id: 1, name: "Voluntario", path: "humano.png", weight: 50 },
            { id: 2, name: "Voluntaria", path: "humana.png", weight: 50 },
            { id: 3, name: "Eco-Bot v1", path: "robot.png", weight: 10 },
        ],
    },
    {
        name: "Vestimenta",
        elements: [
            { id: 1, name: "Camiseta Blanca", path: "tshirt_white.png", weight: 40 },
            { id: 2, name: "Chaleco de Seguridad", path: "vest_orange.png", weight: 30 },
            { id: 3, name: "Traje de Buzo", path: "scuba.png", weight: 20 },
            { id: 4, name: "Capa de Héroe", path: "cape.png", weight: 5 },
        ],
    },
    {
        name: "Herramienta",
        elements: [
            { id: 1, name: "Manos", path: "hands.png", weight: 40 },
            { id: 2, name: "Pinza Recolectora", path: "grabber.png", weight: 30 },
            { id: 3, name: "Red de Pesca", path: "net.png", weight: 20 },
            { id: 4, name: "Aspiradora Futurista", path: "vacuum.png", weight: 5 },
        ],
    },
    {
        name: "Residuo Recolectado",
        elements: [
            { id: 1, name: "Botella Plástica", path: "bottle.png", weight: 40 },
            { id: 2, name: "Lata de Refresco", path: "can.png", weight: 30 },
            { id: 3, name: "Bota Vieja", path: "boot.png", weight: 15 },
            { id: 4, name: "Red Fantasma", path: "ghost_net.png", weight: 10 },
            { id: 5, name: "Mensaje en Botella", path: "msg_bottle.png", weight: 1 },
        ],
    },
    {
        name: "Accesorio Cabeza",
        elements: [
            { id: 0, name: "Ninguno", path: "none.png", weight: 20 },
            { id: 1, name: "Gorra Reciclada", path: "cap.png", weight: 40 },
            { id: 2, name: "Sombrero de Paja", path: "hat.png", weight: 30 },
            { id: 3, name: "Gafas de Buceo", path: "goggles.png", weight: 10 },
        ],
    }
];

// Elegir elemento por peso
const chooseElement = (layer) => {
    let totalWeight = layer.elements.reduce((sum, el) => sum + el.weight, 0);
    let random = Math.floor(Math.random() * totalWeight);

    for (let element of layer.elements) {
        random -= element.weight;
        if (random < 0) return element;
    }
    return layer.elements[0];
};

// Generar atributos
export const generateNFTAttributes = () => {
    let dna = [];
    let attributes = [];

    layersSetup.forEach((layer) => {
        const selected = chooseElement(layer);

        dna.push(`${layer.name}:${selected.id}`);

        attributes.push({
            trait_type: layer.name,
            value: selected.name,
            path: selected.path
        });
    });

    return {
        dna: dna.join('-'),
        attributes,
        description: `Un guardián equipado con ${attributes.find(a => a.trait_type === 'Herramienta')?.value
            } salvando el océano de ${attributes.find(a => a.trait_type === 'Residuo Recolectado')?.value
            }.`
    };
};



// =============================
// 🔥 HANDLE CLAIM + MINTEO
// =============================

export const handleClaim = async (externalSigner) => {
    try {
        // Preferir helper específico si existe (usa completeMission internamente)
        const useExternalMint = typeof mintNFT === 'function';

        console.log('[nftGenerator] handleClaim start');
        const { BrowserProvider, Contract } = ethers;

        // Determinar signer: preferir el pasado por parámetro (útil para pruebas)
        let signer = externalSigner;
        if (!signer) {
            // Priorizar window.pali si existe (Pali Wallet injects itself there sometimes) o usar window.ethereum
            const ethereum = window.pali || window.ethereum;

            if (typeof window !== 'undefined' && ethereum) {
                console.log('[nftGenerator] wallet provider detected:', window.pali ? 'Pali' : 'Ethereum');
                const provider = new BrowserProvider(ethereum);

                // 1. Solicitar acceso a cuentas con TIMEOUT (para evitar que se congele)
                try {
                    console.log('[nftGenerator] requesting accounts...');

                    const requestPromise = provider.send("eth_requestAccounts", []);
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('TIMEOUT_CONNECTION')), 15000)
                    );

                    await Promise.race([requestPromise, timeoutPromise]);

                } catch (e) {
                    console.warn('Connection/Auth error:', e);
                    if (e.message === 'TIMEOUT_CONNECTION') {
                        return { success: false, error: new Error('La conexión tardó demasiado. Por favor, abre tu wallet manualmente y vuelve a intentar.') };
                    }
                    if (e.message && e.message.includes("open window")) {
                        return { success: false, error: new Error('Ya hay una solicitud de wallet abierta. Por favor revisa tu extensión de Pali/MetaMask.') };
                    }
                }

                // 2. Intentar cambiar a Syscoin NEVM (Chain ID 57)
                const SYSCOIN_CHAIN_ID = '0x39'; // 57 en hex
                try {
                    console.log('[nftGenerator] switching chain to Syscoin NEVM...');
                    await provider.send('wallet_switchEthereumChain', [{ chainId: SYSCOIN_CHAIN_ID }]);
                } catch (switchError) {
                    // Este error 4902 indica que la cadena no ha sido agregada a la wallet.
                    if (switchError.code === 4902 || switchError?.error?.code === 4902) {
                        try {
                            console.log('[nftGenerator] adding Syscoin NEVM chain...');
                            await provider.send('wallet_addEthereumChain', [{
                                chainId: SYSCOIN_CHAIN_ID,
                                chainName: 'Syscoin Mainnet',
                                nativeCurrency: {
                                    name: 'Syscoin',
                                    symbol: 'SYS',
                                    decimals: 18
                                },
                                rpcUrls: ['https://rpc.syscoin.org'],
                                blockExplorerUrls: ['https://explorer.syscoin.org/']
                            }]);
                        } catch (addError) {
                            console.error('Failed to add Syscoin chain:', addError);
                            if (addError.message && addError.message.includes("open window")) {
                                return { success: false, error: new Error('Ya hay una solicitud de wallet abierta. Por favor revisa tu extensión.') };
                            }
                            throw new Error('Por favor, agrega la red Syscoin a tu wallet.');
                        }
                    } else {
                        console.warn('Failed to switch chain:', switchError);
                        if (switchError.message && switchError.message.includes("open window")) {
                            return { success: false, error: new Error('Ya hay una solicitud de wallet abierta. Por favor revisa tu extensión.') };
                        }
                    }
                }

                // Obtener signer DESPUÉS de asegurar la red
                try {
                    signer = await provider.getSigner();
                    console.log('[nftGenerator] signer acquired');
                } catch (signerError) {
                    console.error('Failed to get signer:', signerError);
                    return { success: false, error: new Error('No se pudo obtener la cuenta. Revisa si tu wallet está desbloqueada.') };
                }
            } else {
                console.log('[nftGenerator] no provider available');
                return { success: false, error: new Error('No hay un proveedor web3 disponible. Conecta una wallet (Pali o MetaMask).') };
            }
        }

        const abi = MissionNFT?.abi || MissionNFT;
        if (!abi) throw new Error('ABI del contrato MissionNFT no encontrada');

        const nftData = generateNFTAttributes();
        const metadata = {
            name: 'Ocean Guardian NFT',
            description: nftData.description,
            attributes: nftData.attributes,
        };

        // Base64-safe
        let metadataBase64;
        if (typeof btoa !== 'undefined') {
            metadataBase64 = btoa(JSON.stringify(metadata));
        } else if (typeof Buffer !== 'undefined') {
            metadataBase64 = Buffer.from(JSON.stringify(metadata), 'utf8').toString('base64');
        } else if (globalThis?.Buffer) {
            metadataBase64 = globalThis.Buffer.from(JSON.stringify(metadata), 'utf8').toString('base64');
        } else {
            metadataBase64 = encodeURIComponent(JSON.stringify(metadata));
        }

        const tokenURI = metadataBase64.startsWith('data:') ? metadataBase64 : `data:application/json;base64,${metadataBase64}`;

        if (useExternalMint) {
            console.log('[nftGenerator] using external mint helper (completeMission)');
            // missionId por defecto 1; si necesitas otro, modifica la llamada
            const txHash = await mintNFT(1, tokenURI);
            console.log('[nftGenerator] external mint txHash', txHash);
            return { success: true, metadata, txHash };
        }

        const contractAddress = CONTRACT_ADDRESS;
        const recipientAddress = await signer.getAddress();

        console.log('--------------------------------------------------');
        console.log('[nftGenerator] Contract Address:', contractAddress);
        console.log('[nftGenerator] Recipient Address:', recipientAddress);
        console.log('[nftGenerator] Token URI Length:', tokenURI.length);
        console.log('--------------------------------------------------');

        if (!contractAddress || contractAddress.length !== 42) {
            throw new Error(`Dirección de contrato inválida: ${contractAddress}`);
        }
        if (!recipientAddress || recipientAddress.length !== 42) {
            throw new Error(`Dirección de usuario inválida: ${recipientAddress}`);
        }

        const contract = new Contract(contractAddress, abi, signer);

        console.log('[nftGenerator] calling safeMint...');
        const tx = await contract.safeMint(recipientAddress, tokenURI);
        console.log('[nftGenerator] tx sent', tx);
        await tx.wait();
        console.log('[nftGenerator] tx confirmed - NFT minteado correctamente 🎉');
        return { success: true, metadata };

    } catch (error) {
        console.error('Error al mintear:', error);
        return { success: false, error };
    }
};
