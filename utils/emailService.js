// ═══════════════════════════════════════════════════════════════════════════
// EMAIL SERVICE - Servicio de Envío de Correos
// ═══════════════════════════════════════════════════════════════════════════
// Este servicio maneja el envío de correos electrónicos de verificación
// usando EmailJS (compatible con React Native)
// ═══════════════════════════════════════════════════════════════════════════

import ENV from "../constants/env";

/**
 * Envía un correo de verificación al usuario
 *
 * CONFIGURACIÓN PREVIA NECESARIA:
 * 1. Crea cuenta en https://www.emailjs.com/
 * 2. Configura un servicio (Gmail, Outlook, etc.)
 * 3. Crea una plantilla con estas variables:
 *    - {{to_email}}: Email del destinatario
 *    - {{to_name}}: Nombre del usuario
 *    - {{verification_code}}: Código de verificación
 *    - {{app_name}}: Nombre de la app
 * 4. Copia las credenciales al archivo .env
 *
 * @param {Object} params - Parámetros del email
 * @param {string} params.toEmail - Email del destinatario
 * @param {string} params.toName - Nombre del usuario
 * @param {string} params.verificationCode - Código de verificación
 * @returns {Promise<Object>} Resultado del envío
 */
export const sendVerificationEmail = async ({
  toEmail,
  toName,
  verificationCode,
}) => {
  try {
    // Validar que EmailJS esté configurado
    if (
      !ENV.EMAILJS_SERVICE_ID ||
      !ENV.EMAILJS_PUBLIC_KEY ||
      !ENV.EMAILJS_TEMPLATE_ID_VERIFICATION
    ) {
      throw new Error("EmailJS no está configurado. Revisa el archivo .env");
    }

    // Preparar parámetros del template
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      verification_code: verificationCode,
      app_name: ENV.APP_NAME,
      app_url: ENV.APP_URL,
      app_email: ENV.APP_EMAIL,
    };

    // En React Native, necesitamos usar la API de EmailJS directamente
    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: ENV.EMAILJS_SERVICE_ID,
          template_id: ENV.EMAILJS_TEMPLATE_ID_VERIFICATION,
          user_id: ENV.EMAILJS_PUBLIC_KEY,
          template_params: templateParams,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`EmailJS error: ${errorData}`);
    }

    console.log("✅ Email de verificación enviado exitosamente a:", toEmail);

    return {
      success: true,
      message: "Correo enviado exitosamente",
      data: {
        email: toEmail,
        code: verificationCode,
      },
    };
  } catch (error) {
    console.error("❌ Error al enviar email de verificación:", error);

    return {
      success: false,
      message: error.message || "Error al enviar el correo",
      error: error,
    };
  }
};

/**
 * Genera un código de verificación de 6 dígitos
 * @returns {string} Código de verificación
 */
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Envía un correo de bienvenida
 * @param {Object} params - Parámetros del email
 * @param {string} params.toEmail - Email del destinatario
 * @param {string} params.toName - Nombre del usuario
 * @returns {Promise<Object>} Resultado del envío
 */
export const sendWelcomeEmail = async ({ toEmail, toName }) => {
  try {
    if (!ENV.EMAILJS_SERVICE_ID || !ENV.EMAILJS_PUBLIC_KEY) {
      throw new Error("EmailJS no está configurado");
    }

    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      app_name: ENV.APP_NAME,
      app_url: ENV.APP_URL,
    };

    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: ENV.EMAILJS_SERVICE_ID,
          template_id:
            process.env.EMAILJS_TEMPLATE_ID_WELCOME ||
            ENV.EMAILJS_TEMPLATE_ID_VERIFICATION,
          user_id: ENV.EMAILJS_PUBLIC_KEY,
          template_params: templateParams,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Error al enviar email de bienvenida");
    }

    return {
      success: true,
      message: "Email de bienvenida enviado",
    };
  } catch (error) {
    console.error("Error al enviar email de bienvenida:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  generateVerificationCode,
  validateEmail,
};
