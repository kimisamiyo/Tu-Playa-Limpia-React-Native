# Backend - Tu Playa Limpia

## Descripción
API backend en FastAPI para la aplicación Tu Playa Limpia. Incluye funcionalidades de:
- Escaneo de imágenes con detección de objetos (Roboflow)
- Envío de códigos de verificación por correo electrónico
- Verificación de códigos

## Instalación

### 1. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en el directorio `back/` con las siguientes variables:

```env
# Roboflow API
ROBOFLOW_API_KEY=tu_api_key_de_roboflow

# Configuración SMTP para envío de correos
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=tu_correo@gmail.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion

# Opcional: Ajustar confianza del modelo
CONF=40
OVER=50
```

### 3. Configuración de Gmail para envío de correos

Si usas Gmail:

1. Habilita la **verificación en dos pasos** en tu cuenta de Google
2. Genera una **contraseña de aplicación**:
   - Ve a https://myaccount.google.com/security
   - En "Verificación en dos pasos" → "Contraseñas de aplicaciones"
   - Selecciona "Otro" y pon "Tu Playa Limpia"
   - Copia la contraseña generada y úsala en `SMTP_PASSWORD`

**Nota:** No uses tu contraseña normal de Gmail, usa la contraseña de aplicación.

### 4. Otros proveedores de correo

#### Outlook/Hotmail
```env
SMTP_SERVER=smtp.office365.com
SMTP_PORT=587
SMTP_EMAIL=tu_correo@outlook.com
SMTP_PASSWORD=tu_contraseña
```

#### Yahoo
```env
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_EMAIL=tu_correo@yahoo.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion
```

#### Servicios dedicados (Recomendado para producción)
- **SendGrid**: Hasta 100 emails/día gratis
- **Resend**: Hasta 3,000 emails/mes gratis
- **Mailgun**: Hasta 5,000 emails/mes gratis

## Ejecutar el servidor

### Modo desarrollo
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Modo producción
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Testing sin configurar SMTP

El backend funciona en **modo desarrollo** sin configurar SMTP:
- Los códigos se mostrarán en los logs del servidor
- Los códigos también se retornan en el campo `dev_code` de la respuesta
- El frontend mostrará el código automáticamente en modo desarrollo

## Endpoints

### Health Check
```http
GET /health
```
Respuesta:
```json
{
  "status": "ok",
  "model": "ocean-waste/2",
  "smtp_configured": true
}
```

### Escanear imagen
```http
POST /scan
Content-Type: multipart/form-data

file: [imagen]
```

### Enviar código de verificación
```http
POST /send-code
Content-Type: application/json

{
  "email": "usuario@ejemplo.com"
}
```
Respuesta:
```json
{
  "success": true,
  "message": "Código enviado correctamente",
  "dev_code": "123456"  // Solo en desarrollo
}
```

### Verificar código
```http
POST /verify-code
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "code": "123456"
}
```
Respuesta:
```json
{
  "success": true,
  "message": "Código verificado correctamente"
}
```

## Seguridad

- Los códigos expiran en 10 minutos
- Máximo 5 intentos por código
- Los códigos se eliminan después de ser usados
- En producción, considera usar Redis para almacenamiento de códigos

## Troubleshooting

### Error "Could not connect to SMTP server"
- Verifica que las credenciales sean correctas
- Asegúrate de usar contraseña de aplicación (no la contraseña normal)
- Revisa la configuración de firewall

### Los correos no llegan
- Revisa la carpeta de spam
- Verifica que el correo de origen esté verificado
- Considera usar un servicio dedicado como SendGrid

### Modo desarrollo
Si no configuras SMTP, el servidor funcionará en modo desarrollo:
- Los códigos se imprimen en la consola
- Los códigos se retornan en la respuesta API
- Útil para testing local
