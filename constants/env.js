// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ═══════════════════════════════════════════════════════════════════════════
// Este archivo centraliza el acceso a todas las variables de entorno
// ═══════════════════════════════════════════════════════════════════════════

// En Expo, las variables de entorno se acceden desde process.env en web
// y desde expo-constants en mobile

const ENV = {
  // ─────────────────────────────────────────────────────────────────────────
  // EMAIL SERVICE
  // ─────────────────────────────────────────────────────────────────────────
  EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID || "",
  EMAILJS_TEMPLATE_ID_VERIFICATION:
    process.env.EMAILJS_TEMPLATE_ID_VERIFICATION || "",
  EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || "",

  // ─────────────────────────────────────────────────────────────────────────
  // SENDGRID (ALTERNATIVA)
  // ─────────────────────────────────────────────────────────────────────────
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "",
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || "",
  SENDGRID_FROM_NAME: process.env.SENDGRID_FROM_NAME || "Tu Playa Limpia",

  // ─────────────────────────────────────────────────────────────────────────
  // APP CONFIG
  // ─────────────────────────────────────────────────────────────────────────
  APP_NAME: process.env.APP_NAME || "Tu Playa Limpia",
  APP_EMAIL: process.env.APP_EMAIL || "contacto@tuplayalimpia.com",
  APP_URL: process.env.APP_URL || "https://tuplayalimpia.com",

  // ─────────────────────────────────────────────────────────────────────────
  // ROBOFLOW API - Ocean Waste Detection
  // ─────────────────────────────────────────────────────────────────────────
  ROBOFLOW_API_KEY: process.env.ROBOFLOW_API_KEY || "",
  ROBOFLOW_MODEL: process.env.ROBOFLOW_MODEL || "ocean-waste/2",

  // ─────────────────────────────────────────────────────────────────────────
  // BACKEND API
  // ─────────────────────────────────────────────────────────────────────────
  API_BASE_URL: process.env.API_BASE_URL || "",
  API_KEY: process.env.API_KEY || "",
};

// Validar variables críticas
const validateEnv = () => {
  const missingVars = [];

  if (!ENV.EMAILJS_SERVICE_ID && !ENV.SENDGRID_API_KEY) {
    console.warn(
      "⚠️  No email service configured. Set EMAILJS_SERVICE_ID or SENDGRID_API_KEY",
    );
  }

  if (ENV.EMAILJS_SERVICE_ID && !ENV.EMAILJS_PUBLIC_KEY) {
    missingVars.push("EMAILJS_PUBLIC_KEY");
  }

  if (!ENV.ROBOFLOW_API_KEY) {
    console.warn("⚠️  ROBOFLOW_API_KEY not configured. Scanner will not work.");
    missingVars.push("ROBOFLOW_API_KEY");
  }

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missingVars.join(", ")}`,
    );
  }
};

// Ejecutar validación en desarrollo
if (__DEV__) {
  validateEnv();
}

export default ENV;
