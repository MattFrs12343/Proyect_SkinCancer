from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import tempfile
import os
from pathlib import Path

from inference import predict_top3

app = FastAPI(title="Skin Cancer Multimodal API")

# Configuración de CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes
    allow_credentials=False,  # Cambiar a False cuando se usa "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ruta al directorio dist del frontend
FRONTEND_DIST = Path(__file__).parent.parent / "oncoderma-frontend" / "dist"

# ============================================
# RUTAS DE API (deben ir primero)
# ============================================

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/auth/login")
async def login(credentials: dict = Body(...)):
    """
    Endpoint de autenticación simple para el frontend.
    Credenciales de prueba:
    - Usuario: Matias
    - Contraseña: 1234
    """
    username = credentials.get("username", "")
    password = credentials.get("password", "")
    
    # Validar credenciales (hardcodeadas para desarrollo)
    if username == "Matias" and password == "1234":
        return {
            "success": True,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiTWF0aWFzIn0.fake-token",
            "user": {
                "username": "Matias",
                "name": "Matias"
            }
        }
    
    return {
        "success": False,
        "message": "Usuario o contraseña incorrectos"
    }

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    age: float = Form(...),
    sex: str = Form(...),
    anatom_site_general: str = Form(...),
):
    suffix = os.path.splitext(file.filename)[-1] or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        preds = predict_top3(tmp_path, age, sex, anatom_site_general)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    return JSONResponse(content={"top3": preds})

# ============================================
# SERVIR FRONTEND
# ============================================

# Montar archivos estáticos PRIMERO (antes de cualquier ruta catch-all)
if FRONTEND_DIST.exists():
    # Montar assets y img como archivos estáticos
    if (FRONTEND_DIST / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")
    
    if (FRONTEND_DIST / "img").exists():
        app.mount("/img", StaticFiles(directory=str(FRONTEND_DIST / "img")), name="img")
    
    print("✅ Frontend encontrado en:", FRONTEND_DIST)
    print(f"✅ Assets: {(FRONTEND_DIST / 'assets').exists()}")
    print(f"✅ Images: {(FRONTEND_DIST / 'img').exists()}")
else:
    print("⚠️ Frontend no encontrado. Ejecuta 'npm run build' en oncoderma-frontend/")
    print(f"⚠️ Buscando en: {FRONTEND_DIST}")

# Ruta catch-all para servir index.html (React Router)
# DEBE ir después de app.mount() y después de todas las rutas API
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """
    Sirve el SPA de React para todas las rutas no-API.
    """
    # Verificar si el archivo existe en dist
    file_path = FRONTEND_DIST / full_path
    if file_path.is_file():
        return FileResponse(file_path)
    
    # Si no existe, servir index.html (para React Router)
    index_path = FRONTEND_DIST / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    
    return JSONResponse({"error": "Not found"}, status_code=404)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
