
export function injectPaliWallet() {
  if (typeof window === 'undefined') {
    return console.log("No window object available");
  }
  if (window.ethereum?.isPaliWallet || window.ethereum?.isSyscoin) {
    console.log("✅ Pali Wallet ya está inyectado");
    return;
  }
  console.log("⚠️ Pali Wallet no detectado, intentando inyectar...");
  const event = new Event('web3-request', { bubbles: true });
  window.dispatchEvent(event);
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 30; 
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
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    injectPaliWallet();
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectPaliWallet();
    });
  } else {
    injectPaliWallet();
  }
}
