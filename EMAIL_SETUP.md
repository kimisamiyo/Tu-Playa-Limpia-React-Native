# 📧 Configuración del Servicio de Email

## 🚀 Inicio Rápido

Este proyecto usa **EmailJS** para enviar correos de verificación directamente desde React Native sin necesidad de backend.

### 1️⃣ Crear Cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita (100 emails/mes gratis)
3. Confirma tu email

### 2️⃣ Configurar Servicio de Email

1. En el dashboard, ve a **"Email Services"**
2. Haz clic en **"Add New Service"**
3. Selecciona tu proveedor (Gmail, Outlook, etc.)
4. Conecta tu cuenta y autoriza
5. Copia el **Service ID** (ejemplo: `service_abc123`)

### 3️⃣ Crear Plantilla de Email

1. Ve a **"Email Templates"**
2. Haz clic en **"Create New Template"**
3. Usa esta plantilla HTML:

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        padding: 30px;
        border-radius: 10px;
      }
      .header {
        text-align: center;
        color: #0ea5e9;
      }
      .code {
        font-size: 32px;
        font-weight: bold;
        color: #0ea5e9;
        text-align: center;
        padding: 20px;
        background: #f0f9ff;
        border-radius: 8px;
        margin: 20px 0;
        letter-spacing: 5px;
      }
      .footer {
        text-align: center;
        color: #666;
        font-size: 12px;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 class="header">🌊 {{app_name}}</h1>
      <h2>¡Hola {{to_name}}!</h2>
      <p>Gracias por unirte a nuestra comunidad de guardianes del océano.</p>
      <p>Tu código de verificación es:</p>
      <div class="code">{{verification_code}}</div>
      <p>Este código expirará en 10 minutos.</p>
      <p>Si no solicitaste este código, ignora este mensaje.</p>
      <div class="footer">
        <p>{{app_name}} • {{app_email}}</p>
        <p><a href="{{app_url}}">Visitar sitio web</a></p>
      </div>
    </div>
  </body>
</html>
```

4. Asegúrate de que estos campos estén en la plantilla:
   - `{{to_name}}` - Nombre del usuario
   - `{{to_email}}` - Email del destinatario
   - `{{verification_code}}` - Código de verificación
   - `{{app_name}}` - Nombre de la app
   - `{{app_email}}` - Email de contacto
   - `{{app_url}}` - URL de la app

5. Guarda y copia el **Template ID** (ejemplo: `template_xyz789`)

### 4️⃣ Obtener Public Key

1. Ve a **"Account"** → **"General"**
2. Copia tu **Public Key** (ejemplo: `user_abc123xyz`)

### 5️⃣ Configurar Variables de Entorno

1. Abre el archivo `.env` en la raíz del proyecto
2. Completa con tus credenciales:

```env
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_TEMPLATE_ID_VERIFICATION=template_xyz789
EMAILJS_PUBLIC_KEY=user_abc123xyz

APP_NAME="Tu Playa Limpia"
APP_EMAIL=contacto@tuplayalimpia.com
APP_URL=https://tuplayalimpia.com
```

3. Guarda el archivo

### 6️⃣ Reiniciar la App

```bash
# Detener el servidor de Expo (Ctrl+C)
# Reiniciar
npm start
```

---

## 💻 Uso en el Código

### Ejemplo Básico

```javascript
import {
  sendVerificationEmail,
  generateVerificationCode,
  validateEmail,
} from "./utils/emailService";

// Generar código
const code = generateVerificationCode(); // "123456"

// Validar email
if (!validateEmail(userEmail)) {
  alert("Email inválido");
  return;
}

// Enviar correo
const result = await sendVerificationEmail({
  toEmail: "usuario@ejemplo.com",
  toName: "Juan Pérez",
  verificationCode: code,
});

if (result.success) {
  console.log("✅ Correo enviado");
} else {
  console.error("❌ Error:", result.message);
}
```

### Ejemplo Completo

```javascript
import { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import {
  sendVerificationEmail,
  generateVerificationCode,
  validateEmail,
} from "./utils/emailService";

export default function VerificationScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Error", "Email inválido");
      return;
    }

    setLoading(true);
    const verificationCode = generateVerificationCode();

    const result = await sendVerificationEmail({
      toEmail: email,
      toName: email.split("@")[0],
      verificationCode: verificationCode,
    });

    setLoading(false);

    if (result.success) {
      setSentCode(verificationCode);
      Alert.alert("Éxito", "Código enviado a tu correo");
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const handleVerify = () => {
    if (code === sentCode) {
      Alert.alert("✅ Verificado", "¡Correo verificado exitosamente!");
    } else {
      Alert.alert("❌ Error", "Código incorrecto");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Ingresa tu email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button
        title={loading ? "Enviando..." : "Enviar Código"}
        onPress={handleSendCode}
        disabled={loading}
      />

      {sentCode && (
        <>
          <TextInput
            placeholder="Código de verificación"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            style={{ borderWidth: 1, padding: 10, marginTop: 20 }}
          />
          <Button title="Verificar" onPress={handleVerify} />
        </>
      )}
    </View>
  );
}
```

---

## 🔧 Funciones Disponibles

### `sendVerificationEmail(params)`

Envía un correo con código de verificación.

**Parámetros:**

- `toEmail` (string): Email del destinatario
- `toName` (string): Nombre del usuario
- `verificationCode` (string): Código de verificación

**Retorna:** `Promise<{ success: boolean, message: string, data?: object }>`

### `generateVerificationCode()`

Genera un código aleatorio de 6 dígitos.

**Retorna:** `string` - Código de 6 dígitos

### `validateEmail(email)`

Valida formato de email.

**Parámetros:**

- `email` (string): Email a validar

**Retorna:** `boolean` - True si es válido

### `sendWelcomeEmail(params)`

Envía un correo de bienvenida.

**Parámetros:**

- `toEmail` (string): Email del destinatario
- `toName` (string): Nombre del usuario

**Retorna:** `Promise<{ success: boolean, message: string }>`

---

## 🐛 Solución de Problemas

### ❌ "EmailJS no está configurado"

- Verifica que las variables estén en `.env`
- Reinicia el servidor de Expo
- Asegúrate de no tener espacios extra en los valores

### ❌ "Error 403 - Forbidden"

- Tu Public Key es incorrecta
- Verifica en EmailJS → Account → General

### ❌ "Error 400 - Bad Request"

- El Service ID o Template ID son incorrectos
- Verifica que estén correctos en `.env`

### ❌ Correo no llega

- Revisa la carpeta de SPAM
- Verifica que el servicio esté activo en EmailJS
- Chequea los logs en el dashboard de EmailJS

### ⚠️ Límite de 100 emails/mes

- El plan gratuito tiene límite
- Para más, considera actualizar o usar otra solución

---

## 🔐 Seguridad

✅ **Buenas prácticas:**

- Nunca subas `.env` al repositorio
- Usa `.env.example` como plantilla
- Rota tus credenciales regularmente
- Limita el rate de envío (1 email por minuto por usuario)

⚠️ **Importante:**

- EmailJS ejecuta desde el cliente (menos seguro que backend)
- Para producción, considera un backend propio
- Implementa rate limiting y CAPTCHA

---

## 🚀 Alternativas

Si necesitas más control, considera:

1. **Backend propio con Nodemailer**
   - Mayor seguridad
   - Sin límites de envío
   - Control total

2. **SendGrid**
   - 100 emails/día gratis
   - APIs robustas
   - Mejor para producción

3. **AWS SES**
   - Muy económico
   - Alta escalabilidad
   - Requiere configuración AWS

---

## 📚 Recursos

- [EmailJS Docs](https://www.emailjs.com/docs/)
- [React Native + EmailJS](https://www.emailjs.com/docs/examples/reactnative/)
- [Plantillas HTML](https://www.emailjs.com/docs/tutorial/creating-email-template/)

---

¿Preguntas? Abre un issue en el repositorio. 🙌
