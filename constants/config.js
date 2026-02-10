/**
 * Configuración global de la aplicación
 */

// URL del backend API
// En desarrollo: usar la IP de tu computadora o localhost
// En producción: usar la URL del servidor desplegado
export const API_BASE_URL = __DEV__ 
    ? 'http://localhost:8000'  // Cambiar por tu IP local si usas dispositivo físico: 'http://192.168.x.x:8000'
    : 'https://tu-api-produccion.com';

export const API_ENDPOINTS = {
    HEALTH: '/health',
    SCAN: '/scan',
    SEND_CODE: '/send-code',
    VERIFY_CODE: '/verify-code',
};

// Configuraciones de email
export const EMAIL_CONFIG = {
    CODE_LENGTH: 6,
    CODE_EXPIRY_MINUTES: 10,
    MAX_ATTEMPTS: 5,
};
