// Logic adapted from user script
// Fixed ReferenceError in chooseElement
import { LAYER_IMAGES } from '../constants/nftAssets'; // Import to ensure keys match

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

// 1. Elegir un elemento basado en su rareza (peso)
const chooseElement = (layer) => {
    let totalWeight = 0;
    layer.elements.forEach(element => totalWeight += element.weight);

    let random = Math.floor(Math.random() * totalWeight);

    for (let i = 0; i < layer.elements.length; i++) {
        random -= layer.elements[i].weight;
        if (random < 0) {
            return layer.elements[i];
        }
    }
    return layer.elements[0]; // Fallback
};

// 2. Generar un ADN único y atributos
export const generateNFTAttributes = () => {
    let dna = [];
    let attributes = [];

    layersSetup.forEach((layer) => {
        let selectedElement = chooseElement(layer);

        // DNA String part
        dna.push(`${layer.name}:${selectedElement.id}:${selectedElement.name}:${selectedElement.path}`);

        // Attributes object for component
        attributes.push({
            trait_type: layer.name,
            value: selectedElement.name,
            path: selectedElement.path // Helpful debug or mapping
        });
    });

    return {
        dna: dna.join('-'),
        attributes: attributes,
        description: `Un guardián equipado con ${attributes.find(a => a.trait_type === 'Herramienta')?.value} salvando el océano de ${attributes.find(a => a.trait_type === 'Residuo Recolectado')?.value}.`
    };
};

export const rarityScore = (attributes) => {
    // Simple rarity calculator placeholder
    // In a real app we'd calculate based on global weights
    return "Common";
}
