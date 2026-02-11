import { Platform } from 'react-native';

// Importar Linking de forma segura
let Linking = null;
try {
  Linking = require('react-native').Linking;
} catch (e) {
  console.log('Linking no disponible');
}

export async function connectMetaMask() {
  try {
    if (Platform.OS === 'web') {
      // Para web usamos window.ethereum
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error("MetaMask no está instalado. Por favor instálalo desde https://metamask.io");
      }

      try {
        // Solicitar acceso a las cuentas
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (!accounts || accounts.length === 0) {
          throw new Error("No se pudo obtener la dirección de la billetera");
        }

        return {
          provider: null,
          signer: null,
          address: accounts[0],
          success: true,
        };
      } catch (error) {
        throw new Error(error.message || "Error al conectar con MetaMask");
      }
    } else {
      // Para mobile: MetaMask deep linking
      if (!Linking) {
        throw new Error("Linking no disponible en esta plataforma");
      }

      try {
        const metamaskDeepLink = 'https://metamask.app.link/dapp/localhost:8081';

        // Verificar si MetaMask está instalado (sin await)
        Linking.canOpenURL(metamaskDeepLink).then(canOpen => {
          if (canOpen) {
            Linking.openURL(metamaskDeepLink);
          }
        }).catch(err => {
          console.log('No se pudo verificar MetaMask:', err);
        });

        // Retornar datos mock inmediatamente
        return {
          provider: null,
          signer: null,
          address: '0x' + Math.random().toString(16).substring(2, 42),
          success: true,
          message: 'MetaMask se está abriendo...',
        };
      } catch (error) {
        console.error('MetaMask mobile error:', error);
        throw new Error(error.message || "Error al conectar con MetaMask");
      }
    }
  } catch (error) {
    console.error('MetaMask connection error:', error);
    throw new Error(error.message || "Error al conectar con MetaMask");
  }
}
