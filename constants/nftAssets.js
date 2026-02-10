// This file maps the logical Names to required Image assets.
// IMPORTANT: You must create the folder structure in 'assets/layers' and add the PNGs.
// Currently using a placeholder to avoid crashes.

// Placeholder image (using existing icon or splash)
const PLACEHOLDER = require('../assets/icon.png');

// When you have the files, replace PLACEHOLDER with: require('../assets/layers/Folder/file.png')

export const LAYER_IMAGES = {
    "Fondo": {
        "Amanecer Costero": PLACEHOLDER, // require('../assets/layers/1-Fondo/amanecer.png'),
        "Mediodía Soleado": PLACEHOLDER, // require('../assets/layers/1-Fondo/dia.png'),
        "Atardecer Violeta": PLACEHOLDER, // require('../assets/layers/1-Fondo/atardecer.png'),
        "Noche Estrellada": PLACEHOLDER, // require('../assets/layers/1-Fondo/noche.png'),
    },
    "Personaje": {
        "Voluntario": PLACEHOLDER, // require('../assets/layers/2-Personaje/humano.png'),
        "Voluntaria": PLACEHOLDER, // require('../assets/layers/2-Personaje/humana.png'),
        "Eco-Bot v1": PLACEHOLDER, // require('../assets/layers/2-Personaje/robot.png'),
    },
    "Vestimenta": {
        "Camiseta Blanca": PLACEHOLDER, // require('../assets/layers/3-Vestimenta/tshirt_white.png'),
        "Chaleco de Seguridad": PLACEHOLDER, // require('../assets/layers/3-Vestimenta/vest_orange.png'),
        "Traje de Buzo": PLACEHOLDER, // require('../assets/layers/3-Vestimenta/scuba.png'),
        "Capa de Héroe": PLACEHOLDER, // require('../assets/layers/3-Vestimenta/cape.png'),
    },
    "Herramienta": {
        "Manos": PLACEHOLDER, // require('../assets/layers/4-Herramienta/hands.png'),
        "Pinza Recolectora": PLACEHOLDER, // require('../assets/layers/4-Herramienta/grabber.png'),
        "Red de Pesca": PLACEHOLDER, // require('../assets/layers/4-Herramienta/net.png'),
        "Aspiradora Futurista": PLACEHOLDER, // require('../assets/layers/4-Herramienta/vacuum.png'),
    },
    "Residuo Recolectado": {
        "Botella Plástica": PLACEHOLDER, // require('../assets/layers/5-Residuo Recolectado/bottle.png'),
        "Lata de Refresco": PLACEHOLDER, // require('../assets/layers/5-Residuo Recolectado/can.png'),
        "Bota Vieja": PLACEHOLDER, // require('../assets/layers/5-Residuo Recolectado/boot.png'),
        "Red Fantasma": PLACEHOLDER, // require('../assets/layers/5-Residuo Recolectado/ghost_net.png'),
        "Mensaje en Botella": PLACEHOLDER, // require('../assets/layers/5-Residuo Recolectado/msg_bottle.png'),
    },
    "Accesorio Cabeza": {
        "Ninguno": null, // Special case
        "Gorra Reciclada": PLACEHOLDER, // require('../assets/layers/6-Accesorio Cabeza/cap.png'),
        "Sombrero de Paja": PLACEHOLDER, // require('../assets/layers/6-Accesorio Cabeza/hat.png'),
        "Gafas de Buceo": PLACEHOLDER, // require('../assets/layers/6-Accesorio Cabeza/goggles.png'),
    }
};
