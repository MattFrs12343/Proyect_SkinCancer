"""
Módulo de inferencia - COPIA EXACTA del código de fastapi_skin_demo
SIN MODIFICACIONES para garantizar cero interferencias
"""
from pathlib import Path
import tensorflow as tf
import numpy as np
import json
import io
from PIL import Image

# Configuración
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "fastapi_skin_demo" / "model"
ARTIFACTS_PATH = MODEL_DIR / "preprocess_artifacts.json"

MODEL_PATHS = [
    MODEL_DIR / "best_model_checkpoint.keras",
    MODEL_DIR / "model_multimodal.keras",
]

print(f"🔍 Buscando modelo en: {MODEL_DIR}")

MODEL = None
ARTIFACTS = None

# Cargar modelo
for model_path in MODEL_PATHS:
    if model_path.exists():
        try:
            print(f"📦 Cargando modelo desde {model_path}...")
            MODEL = tf.keras.models.load_model(str(model_path))
            print(f"✅ Modelo cargado: {model_path.name}")
            break
        except Exception as e:
            print(f"⚠️ Error cargando {model_path.name}: {e}")

if MODEL is None:
    raise RuntimeError("❌ No se pudo cargar ningún modelo")

# Cargar artifacts
try:
    with open(ARTIFACTS_PATH, "r", encoding="utf-8") as f:
        ARTIFACTS = json.load(f)
    print(f"✅ Artifacts cargados")
except Exception as e:
    print(f"⚠️ Error cargando artifacts: {e}")
    ARTIFACTS = {}


# ============================================================================
# FUNCIONES COPIADAS EXACTAMENTE DE fastapi_skin_demo/app/utils/preprocessing.py
# LÍNEA POR LÍNEA, SIN CAMBIOS
# ============================================================================

def preprocess_image_bytes(contents, img_size=(224,224)):
    """COPIA EXACTA - NO MODIFICAR"""
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = img.resize((img_size[0], img_size[1]), Image.BILINEAR)
    arr = np.array(img).astype("float32")
    return tf.keras.applications.efficientnet.preprocess_input(arr)


def encode_metadata(age_input, sex_input, site_input, artifacts):
    """COPIA EXACTA - NO MODIFICAR"""
    sex2idx = artifacts.get("sex2idx", {"male":0,"female":1,"unknown":2})
    site2idx = artifacts.get("site2idx", {"other":0})
    age_mean = float(artifacts.get("age_mean",60))
    age_std = float(artifacts.get("age_std",16))

    try:
        age = float(age_input)
    except:
        age = age_mean
    age_norm = (age - age_mean) / (age_std if age_std!=0 else 1)

    s = str(sex_input).lower()
    if s in ["f","female","mujer"]:
        s="female"
    elif s in ["m","male","hombre"]:
        s="male"
    sex_idx = sex2idx.get(s, sex2idx.get("unknown",0))
    sex_ohe = [0.0]*len(sex2idx)
    sex_ohe[int(sex_idx)] = 1.0

    site_str = str(site_input)
    site_idx = site2idx.get(site_str, site2idx.get("other",0))

    return age_norm, sex_ohe, int(site_idx)


# ============================================================================
# FUNCIÓN DE PREDICCIÓN - USA LA MISMA LÓGICA QUE fastapi_skin_demo/app/main.py
# ADAPTADA SOLO PARA RETORNAR TOP 3 EN LUGAR DE TOP 2
# ============================================================================

def predict_top3(image_path: str, age_value: float, sex_str: str, anatom_site_str: str):
    """
    Predicción usando LA MISMA LÓGICA que fastapi_skin_demo
    Única diferencia: retorna Top 3 en lugar de Top 2
    """
    # Leer imagen
    with open(image_path, "rb") as f:
        contents = f.read()
    
    # Preprocesar imagen (EXACTAMENTE como fastapi_skin_demo)
    img_arr = preprocess_image_bytes(contents, tuple(ARTIFACTS.get("img_size",[224,224])))
    
    # Codificar metadatos (EXACTAMENTE como fastapi_skin_demo)
    age_norm, sex_ohe, site_idx = encode_metadata(age_value, sex_str, anatom_site_str, ARTIFACTS)
    
    # Preparar batch (EXACTAMENTE como fastapi_skin_demo)
    batch = {
        "image": np.expand_dims(img_arr,0),
        "age": np.array([age_norm]),
        "sex_ohe": np.expand_dims(np.array(sex_ohe),0),
        "site_idx": np.array([site_idx])
    }
    
    # Predicción (EXACTAMENTE como fastapi_skin_demo)
    preds = MODEL.predict(batch, verbose=0)[0]
    
    # Ordenar predicciones (EXACTAMENTE como fastapi_skin_demo)
    order = np.argsort(preds)[::-1]
    
    # Obtener Top 3 (en lugar de Top 2 del original)
    top3_indices = order[:3]
    
    # Formatear resultados usando idx2class (EXACTAMENTE como fastapi_skin_demo)
    # Crear idx2class invirtiendo class2idx
    class2idx = ARTIFACTS.get("class2idx", {"MEL": 0, "NV": 1, "BCC": 2, "BKL": 3})
    idx2class = {str(v): k for k, v in class2idx.items()}
    
    results = []
    for idx in top3_indices:
        class_name = idx2class.get(str(idx), str(idx))
        results.append({
            "class": class_name,
            "prob": float(preds[idx])
        })
    
    return results
