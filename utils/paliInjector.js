// =====================================================
// 🔌 INYECTOR DE PALI WALLET PARA WEB
// =====================================================

export function injectPaliWallet() {
  if (typeof window === 'undefined') {
    return console.log("No window object available");
  }

  // Si Pali ya está inyectado, no hagas nada
  if (window.ethereum?.isPaliWallet || window.ethereum?.isSyscoin) {
    console.log("✅ Pali Wallet ya está inyectado");
    return;
  }

  console.log("⚠️ Pali Wallet no detectado, intentando inyectar...");

  // Crear un evento para que Pali sepa que debe inyectarse
  const event = new Event('web3-request', { bubbles: true });
  window.dispatchEvent(event);

  // Esperar a que Pali se inyecte
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 30; // 3 segundos máximo

    const checkPali = setInterval(() => {
      attempts++;
      
      if (window.ethereum?.isPaliWallet || window.ethereum?.isSyscoin) {
        console.log("✅ Pali Wallet inyectado correctamente");
        clearInterval(checkPali);
        resolve(true);
      } else if (attempts >= maxAttempts) {
        console.error("❌ Pali Wallet no se pudo inyectar. ¿Está instalado?");
        clearInterval(checkPali);
        resolve(false);
      }
    }, 100);
  });
}

// Inyectar Pali al cargar
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    injectPaliWallet();
  });
  
  // Tambien intentar inmediatamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectPaliWallet();
    });
  } else {
    injectPaliWallet();
  }
}
