import os, hashlib, requests, random, string, smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import logging
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todos los orígenes (para desarrollo)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los headers
)

# Modelos Pydantic
class EmailRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

# Almacenamiento temporal de códigos (en producción usar Redis)
verification_codes = {}

# Configuración de email
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_EMAIL = os.environ.get("SMTP_EMAIL", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

API_KEY = os.environ.get("ROBOFLOW_API_KEY", "")

MODEL_ID = "ocean-waste/2"
CONF = int(os.getenv("CONF", "40"))   # 0-100 (bajamos a 40 para más detecciones)
OVER = int(os.getenv("OVER", "50"))   # 0-100

def generate_code(length=6):
    """Genera un código numérico aleatorio"""
    return ''.join(random.choices(string.digits, k=length))

def send_email(to_email: str, code: str):
    """Envía el código de verificación por correo"""
    try:
        # Crear mensaje
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Tu Playa Limpia - Código de Verificación'
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        
        # Cuerpo del email en HTML
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f8ff;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="color: #0077be; text-align: center;">🏖️ Tu Playa Limpia</h1>
                <p style="font-size: 16px; color: #333;">Hola,</p>
                <p style="font-size: 16px; color: #333;">Has solicitado acceder a tu cuenta. Usa el siguiente código:</p>
                <div style="background-color: #e6f3ff; padding: 20px; margin: 20px 0; text-align: center; border-radius: 5px;">
                    <h2 style="color: #0077be; font-size: 32px; letter-spacing: 8px; margin: 0;">{code}</h2>
                </div>
                <p style="font-size: 14px; color: #666;">Este código expirará en 10 minutos.</p>                
                <p style="font-size: 14px; color: #666;">Si no solicitaste este código, ignora este correo.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">Tu Playa Limpia - Cuidando nuestras playas 🌊</p>
            </div>
        </body>
        </html>
        """
        
        # Adjuntar HTML
        html_part = MIMEText(html, 'html')
        msg.attach(html_part)
        
        # Si no hay configuración de SMTP, simular envío en desarrollo
        if not SMTP_EMAIL or not SMTP_PASSWORD:
            logger.warning(f"SMTP not configured. Would send code {code} to {to_email}")
            logger.info(f"DEV MODE: Code for {to_email} is: {code}")
            return True
        
        # Enviar correo
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        # En desarrollo, permitir que continúe (solo log)
        if not SMTP_EMAIL or not SMTP_PASSWORD:
            logger.info(f"DEV MODE: Code for {to_email} is: {code}")
            return True
        raise HTTPException(500, f"Error al enviar correo: {str(e)}")

@app.post("/send-code")
async def send_verification_code(request: EmailRequest):
    """Genera y envía un código de verificación al correo"""
    try:
        email = request.email.lower()
        code = generate_code(6)
        
        # Guardar código con timestamp
        verification_codes[email] = {
            'code': code,
            'expires_at': datetime.now() + timedelta(minutes=10),
            'attempts': 0
        }
        
        # Enviar email
        send_email(email, code)
        
        logger.info(f"Verification code generated for {email}")
        return {
            "success": True,
            "message": "Código enviado correctamente",
            "dev_code": code if not SMTP_EMAIL else None  # Solo en desarrollo
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in send_verification_code: {str(e)}")
        raise HTTPException(500, f"Error: {str(e)}")

@app.post("/verify-code")
async def verify_code(request: VerifyCodeRequest):
    """Verifica el código ingresado por el usuario"""
    try:
        email = request.email.lower()
        code = request.code.strip()
        
        # Verificar si existe el código
        if email not in verification_codes:
            raise HTTPException(400, "No se encontró código para este correo")
        
        stored = verification_codes[email]
        
        # Verificar expiración
        if datetime.now() > stored['expires_at']:
            del verification_codes[email]
            raise HTTPException(400, "El código ha expirado")
        
        # Incrementar intentos
        stored['attempts'] += 1
        
        # Limitar intentos
        if stored['attempts'] > 5:
            del verification_codes[email]
            raise HTTPException(400, "Demasiados intentos. Solicita un nuevo código")
        
        # Verificar código
        if stored['code'] != code:
            raise HTTPException(400, "Código incorrecto")
        
        # Código correcto - eliminar de memoria
        del verification_codes[email]
        
        logger.info(f"Code verified successfully for {email}")
        return {
            "success": True,
            "message": "Código verificado correctamente"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in verify_code: {str(e)}")
        raise HTTPException(500, f"Error: {str(e)}")

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model": MODEL_ID,
        "smtp_configured": bool(SMTP_EMAIL and SMTP_PASSWORD)
    }

@app.post("/scan")
async def scan(file: UploadFile = File(...)):
    logger.info(f"Received file: {file.filename}, content_type: {file.content_type}")
    
    img = await file.read()
    if not img:
        logger.error("Empty image received")
        raise HTTPException(400, "Imagen vacía")
    
    logger.info(f"Image size: {len(img)} bytes")
    
    # Detectar el tipo de contenido
    content_type = file.content_type or "image/jpeg"
    if "png" in content_type.lower():
        mime_type = "image/png"
        filename = "image.png"
    else:
        mime_type = "image/jpeg"
        filename = "image.jpg"
    
    logger.info(f"Sending to Roboflow with mime: {mime_type}")
    
    try:
        url = f"https://serverless.roboflow.com/{MODEL_ID}"
        r = requests.post(
            url,
            params={"api_key": API_KEY, "confidence": CONF, "overlap": OVER},
            files={"file": (filename, img, mime_type)},
            timeout=30,
        )
        
        logger.info(f"Roboflow response status: {r.status_code}")
        logger.info(f"Roboflow response: {r.text[:500] if r.text else 'empty'}")
        
        if r.status_code != 200:
            raise HTTPException(502, f"Roboflow {r.status_code}: {r.text}")
        
        data = r.json()
        preds = data.get("predictions", []) or []
        
        logger.info(f"Found {len(preds)} predictions")
        
        counts = {}
        for p in preds:
            cls = p.get("class")
            if cls:
                counts[cls] = counts.get(cls, 0) + 1
        
        return {
            "image_sha256": hashlib.sha256(img).hexdigest(),
            "counts": counts,
            "predictions": preds,
        }
    except requests.exceptions.Timeout:
        logger.error("Roboflow request timed out")
        raise HTTPException(504, "Timeout al conectar con Roboflow")
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(500, f"Error interno: {str(e)}")
