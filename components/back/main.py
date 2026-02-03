import os, hashlib, requests
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging

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

API_KEY = os.environ.get("ROBOFLOW_API_KEY", "")

MODEL_ID = "ocean-waste/2"
CONF = int(os.getenv("CONF", "40"))   # 0-100 (bajamos a 40 para más detecciones)
OVER = int(os.getenv("OVER", "50"))   # 0-100

@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL_ID}

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
