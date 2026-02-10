# Guía de Verificación por Email - Tu Playa Limpia

## 📧 Funcionalidad Implementada

Se ha agregado la capacidad de verificar tu identidad mediante un código enviado a tu correo electrónico. Esta funcionalidad está disponible en la pantalla de autenticación de la aplicación.

## 🚀 Cómo usar

### Paso 1: Acceder a la verificación por email

1. Abre la aplicación Tu Playa Limpia
2. En la pantalla de autenticación (donde ingresas tu PIN), busca el botón "📧 Verificar con Email" en la parte inferior
3. Toca el botón para abrir el modal de verificación

### Paso 2: Ingresar tu correo electrónico

1. Ingresa tu dirección de correo electrónico en el campo correspondiente
2. Asegúrate de que sea un correo válido y que tengas acceso a él
3. Toca el botón "Enviar Código"

### Paso 3: Revisar tu correo

1. Abre tu aplicación de correo electrónico
2. Busca un correo de "Tu Playa Limpia" con el asunto "Código de Verificación"
3. Si no lo ves en la bandeja de entrada, revisa la carpeta de spam
4. Encuentra el código de 6 dígitos en el correo

### Paso 4: Ingresar el código

1. Vuelve a la aplicación
2. Ingresa el código de 6 dígitos que recibiste
3. Toca el botón "Verificar"
4. Si el código es correcto, serás autenticado automáticamente

## ⚠️ Consideraciones importantes

### Expiración del código

- El código es válido por **10 minutos**
- Después de ese tiempo, deberás solicitar un nuevo código

### Intentos limitados

- Tienes un máximo de **5 intentos** para ingresar el código correcto
- Si superas este límite, deberás solicitar un nuevo código

### Cambiar correo electrónico

- Si ingresaste un correo incorrecto, puedes tocarlo en el texto "Enviado a: [tu correo]"
- Esto te permitirá volver a ingresar un nuevo correo

## 🔧 Modo Desarrollo

Si el backend no tiene configurado el servicio SMTP (correo), verás:

- Una caja amarilla con el código en la aplicación
- El código también aparecerá en los logs del servidor
- Esto es útil para probar la funcionalidad sin configurar un servidor de correo real

## 🐛 Solución de problemas

### "No se encontró código para este correo"

- Asegúrate de haber solicitado el código primero
- Verifica que estás usando el mismo correo que ingresaste

### "El código ha expirado"

- Han pasado más de 10 minutos desde que solicitaste el código
- Solicita un nuevo código tocando "← Cambiar correo" y vuelve a enviar

### "Código incorrecto"

- Verifica que ingresaste el código correctamente
- Los códigos son sensibles a espacios y caracteres no numéricos
- Copia y pega el código desde el correo si es posible

### "Demasiados intentos"

- Has intentado verificar el código más de 5 veces
- Solicita un nuevo código

### "Error al enviar código"

- Verifica tu conexión a internet
- Asegúrate de que el backend esté ejecutándose
- Si el problema persiste, contacta al administrador

## 🎨 Interfaz de usuario

### Pantalla de Email

- **Campo de entrada**: Para tu correo electrónico
- **Botón "Enviar Código"**: Solicita el código de verificación
- **Botón "Cancelar"**: Cierra el modal sin hacer cambios

### Pantalla de Código

- **Correo mostrado**: Confirma el correo al que se envió el código
- **Campo de código**: Ingresa el código de 6 dígitos
- **Botón "← Cambiar correo"**: Vuelve a la pantalla anterior
- **Botón "Verificar"**: Valida el código ingresado
- **Botón "Cancelar"**: Cierra el modal

## 📱 Configuración para desarrolladores

Si necesitas modificar la URL del backend:

1. Abre el archivo `constants/config.js`
2. Modifica la constante `API_BASE_URL`:
   ```javascript
   export const API_BASE_URL = __DEV__
     ? "http://192.168.x.x:8000" // Tu IP local
     : "https://tu-api-produccion.com";
   ```
3. Si usas un dispositivo físico (no emulador), usa la IP local de tu computadora
4. Para encontrar tu IP:
   - Windows: `ipconfig` en CMD
   - Mac/Linux: `ifconfig` en Terminal
   - Busca la dirección IPv4 (ej: 192.168.1.100)

## ✨ Características

- ✅ Diseño glassmorphism premium
- ✅ Animaciones suaves y feedback háptico
- ✅ Validación de email en tiempo real
- ✅ Interfaz adaptativa (modo claro/oscuro)
- ✅ Mensajes de error claros y útiles
- ✅ Modo desarrollo para testing sin configurar correo
- ✅ Código HTML con diseño atractivo y profesional

## 🔐 Seguridad

- Los códigos son únicos y de un solo uso
- Expiran automáticamente después de 10 minutos
- Se limitan los intentos para prevenir ataques de fuerza bruta
- Los códigos se eliminan inmediatamente después de ser usados con éxito
