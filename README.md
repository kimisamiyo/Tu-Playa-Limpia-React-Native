# Tu Playa Limpia - React Native App

Este proyecto es una aplicación móvil construida con **React Native** y **Expo**.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu computadora:

1.  **Node.js**: (Versión LTS recomendada).
2.  **Git**: Para control de versiones.
3.  **Expo Go**: Descarga la app "Expo Go" en tu celular (iOS o Android) desde la App Store o Play Store.

## Instalación Paso a Paso

1.  **Clonar o Descargar el proyecto**:
    Si no lo has hecho, clona este repositorio o descomprime los archivos en tu carpeta de trabajo.

2.  **Abrir la terminal**:
    Abre una terminal (PowerShell, CMD o Terminal) en la carpeta del proyecto (`c:/Users/mayro/OneDrive/Escritorio/Tu Playa Limpia React Native`).

3.  **Instalar dependencias**:
    Ejecuta el siguiente comando para instalar todas las librerías necesarias:
    ```bash
    npm install
    # O si usas yarn:
    # yarn install
    ```

4.  **Instalar dependencias para Web (Opcional)**:
    Si deseas ver la app en el navegador y no lo has hecho aún:
    ```bash
    npx expo install react-dom react-native-web @expo/metro-runtime
    ```

## Cómo Correr la Aplicación

### En el Celular (Físico)
1.  Asegúrate de que tu celular y tu computadora estén conectados a la **misma red Wi-Fi**.
2.  Ejecuta:
    ```bash
    npx expo start
    ```
3.  Aparecerá un código QR en la terminal.
4.  Abre la app **Expo Go** en tu celular y escanea el código QR (en Android usa la app, en iOS usa la Cámara si no aparece el botón de escanear en la app).

### En el Navegador (Web)
1.  Ejecuta:
    ```bash
    npx expo start --web
    ```
2.  Presiona `w` en la terminal para abrirlo en el navegador si no se abre automáticamente.

### En un Emulador (Android Studio / Xcode)
-   Para **Android**: Presiona `a` en la terminal (requiere Android Studio y un dispositivo virtual corriendo).
-   Para **iOS** (Solo Mac): Presiona `i` en la terminal (requiere Xcode).

## Generar APK (Para Android)

Para generar el archivo instalable (.apk) usaremos **EAS Build**.

1.  Instala la CLI de EAS:
    ```bash
    npm install -g eas-cli
    ```
2.  Inicia sesión en tu cuenta de Expo (crea una en expo.dev si no tienes):
    ```bash
    eas login
    ```
3.  Configura el proyecto:
    ```bash
    eas build:configure
    ```
4.  Genera el APK (Perfil preview):
    Edita el archivo `eas.json` para asegurarte de tener un perfil de 'preview' o 'production' configurado para APK. Luego ejecuta:
    ```bash
    eas build -p android --profile preview
    ```
    Esto generará un link de descarga para tu APK.
