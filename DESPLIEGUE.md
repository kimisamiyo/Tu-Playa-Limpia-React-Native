# Guía de Despliegue Rápido (Solo Frontend / Demo)

Esta guía es para desplegar tu proyecto rápidamente para una demostración.
**Nota:** Al no usar backend propio, la App se conectará directo a Roboflow. Esto es perfecto para demos, pero ten en cuenta que tu API Key es visible en el código.

---

## 1. Conseguir un Dominio (Versión Web)

La forma más rápida de tener un enlace `tu-proyecto.vercel.app` para mostrar tu App en un navegador.

### Paso A: Generar la versión Web
1.  Abre tu terminal en la carpeta del proyecto.
2.  Instala las dependencias web (por si acaso):
    `npx expo install react-dom react-native-web @expo/metro-runtime`
3.  Crea la carpeta de distribución web:
    `npx expo export --platform web`
    *   Esto creará una carpeta `dist` con tu página web lista.

### Paso B: Subir a Vercel (Gratis y con HTTPS)
1.  Ve a [Vercel.com](https://vercel.com) y crea una cuenta.
2.  Instala Vercel CLI en tu terminal:
    `npm install -g vercel`
3.  Ejecuta el comando para desplegar:
    `vercel`
4.  Responde a las preguntas:
    *   *Set up and deploy?* **Y**
    *   *Which scope?* **Enter** (tu usuario)
    *   *Link to existing project?* **N**
    *   *Project name?* **tu-playa-limpia** (o el nombre que quieras)
    *   *In which directory is your code located?* **dist** (¡IMPORTANTE! Escribe `dist` aquí)
    *   *Want to modify these settings?* **N**

¡Listo! Vercel te dará un enlace tipo `https://tu-playa-limpia.vercel.app`. Ese es tu dominio.

---

## 2. Crear la App Móvil (APK para Android)

Para instalar la app real en un teléfono Android sin cables.

1.  Instala EAS CLI (si no lo tienes):
    `npm install -g eas-cli`
2.  Loguéate:
    `eas login`
3.  Configura el proyecto:
    `eas build:configure` (Elige **Android**)
4.  Genera el APK (archivo instalable):
    `eas build -p android --profile preview`
    *   *Nota: Si te pide generar una "keystore", di que sí (Y).*
5.  Espera unos minutos. Expo te dará un **Código QR** y un enlace para descargar el archivo `.apk`.

---

## 3. (Opcional) Dominio Personalizado `.com`

Si quieres cambiar `vercel.app` por `tuempresa.com`:

1.  Compra el dominio en Namecheap/GoDaddy.
2.  En **Vercel**, ve a tu proyecto > **Settings** > **Domains**.
3.  Escribe tu dominio `tuempresa.com`.
4.  Vercel te dirá exactamente qué "Registros DNS" (A o CNAME) debes poner en la página donde compraste el dominio.
