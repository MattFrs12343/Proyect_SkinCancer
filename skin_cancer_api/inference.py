"""
Módulo de inferencia usando el modelo de fastapi_skin_demo
Mantiene compatibilidad con la API existente
"""
from pathlib import Path
import tensorflow as tf
import numpy as np
import json
import io
from PIL import Image

# Configuración del nuevo modelo
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "fastapi_skin_demo" / "model"
ARTIFACTS_PATH = MODEL_DIR / "preprocess_artifacts.json"

# Intentar cargar el mejor modelo disponible
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
            print(f"✅ Modelo cargado correctamente: {model_path.name}")
            break
        except Exception as e:
            print(f"⚠️ Error cargando {model_path.name}: {e}")
            continue

if MODEL is None:
    raise RuntimeError("❌ No se pudo cargar ningún modelo")

# Cargar artifacts
try:
    with open(ARTIFACTS_PATH, "r", encoding="utf-8") as f:
        ARTIFACTS = json.load(f)
    print(f"✅ Artifacts cargados desde {ARTIFACTS_PATH}")
except Exception as e:
    print(f"⚠️ Error cargando artifacts: {e}")
    ARTIFACTS = {}

# Configuración
IMG_SIZE = tuple(ARTIFACTS.get("img_size", [224, 224]))
CLASS_NAMES = ["MEL", "NV", "BCC", "BKL"]
IDX2CLASS = ARTIFACTS.get("class2idx", {})
# Invertir el mapeo para obtener idx -> class
IDX2CLASS_INV = {v: k for k, v in IDX2CLASS.items()} if IDX2CLASS else {i: CLASS_NAMES[i] for i in range(len(CLASS_NAMES))}


def preprocess_image_bytes(contents: bytes, img_size=IMG_SIZE):
    """
    Preprocesa bytes de imagen usando EfficientNet preprocessing
    """
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = img.resize((img_size[0], img_size[1]), Image.BILINEAR)
    arr = np.array(img).astype("float32")
    return tf.keras.applications.efficientnet.preprocess_input(arr)


def load_image_for_inference(image_path: str):
    """
    Carga y preprocesa una imagen desde un path
    Compatible con la interfaz antigua
    """
    with open(image_path, "rb") as f:
        contents = f.read()
    
    img_arr = preprocess_image_bytes(contents, IMG_SIZE)
    return np.expand_dims(img_arr, 0)


def encode_metadata(age_input, sex_input, site_input):
    """
    Codifica metadatos usando los artifacts del nuevo modelo
    """
    sex2idx = ARTIFACTS.get("sex2idx", {"female": 0, "male": 1, "unknown": 2})
    site2idx = ARTIFACTS.get("site2idx", {"other": 0})
    age_mean = float(ARTIFACTS.get("age_mean", 60))
    age_std = float(ARTIFACTS.get("age_std", 16))

    # Normalizar edad
    try:
        age = float(age_input)
    except:
        age = age_mean
    age_norm = (age - age_mean) / (age_std if age_std != 0 else 1)

    # Codificar sexo
    sex_str = str(sex_input).upper()
    if sex_str in ["F", "FEMALE", "MUJER"]:
        sex_key = "female"
    elif sex_str in ["M", "MALE", "HOMBRE"]:
        sex_key = "male"
    else:
        sex_key = "unknown"
    
    sex_idx = sex2idx.get(sex_key, sex2idx.get("unknown", 0))
    sex_ohe = [0.0] * len(sex2idx)
    sex_ohe[int(sex_idx)] = 1.0

    # Codificar sitio anatómico
    site_str = str(site_input).lower()
    site_idx = site2idx.get(site_str, site2idx.get("other", 0))

    return age_norm, sex_ohe, int(site_idx)


def predict_top3(image_path: str, age_value: float, sex_str: str, anatom_site_str: str):
    """
    Función principal de predicción - Compatible con la interfaz antigua
    Retorna Top 3 predicciones en el formato esperado por el frontend
    
    Args:
        image_path: Path a la imagen
        age_value: Edad del paciente
        sex_str: Sexo del paciente (MALE/FEMALE)
        anatom_site_str: Sitio anatómico
    
    Returns:
        Lista de diccionarios con formato: [{"class": "MEL", "prob": 0.85}, ...]
    """
    # Cargar y preprocesar imagen
    img_arr = load_image_for_inference(image_path)
    
    # Codificar metadatos
    age_norm, sex_ohe, site_idx = encode_metadata(age_value, sex_str, anatom_site_str)
    
    # Preparar batch para el modelo
    batch = {
        "image": img_arr,
        "age": np.array([age_norm]),
        "sex_ohe": np.expand_dims(np.array(sex_ohe), 0),
        "site_idx": np.array([site_idx])
    }
    
    # Realizar predicción
    try:
        probs = MODEL.predict(batch, verbose=0)[0]
    except Exception as e:
        print(f"❌ Error en predicción: {e}")
        # Fallback: retornar probabilidades uniformes
        probs = np.ones(len(CLASS_NAMES)) / len(CLASS_NAMES)
    
    # Obtener Top 3
    top3_idx = np.argsort(probs)[-3:][::-1]
    
    results = []
    for idx in top3_idx:
        class_name = IDX2CLASS_INV.get(idx, CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else f"CLASS_{idx}")
        results.append({
            "class": class_name,
            "prob": float(probs[idx]),
        })
    
    return results


# Información del modelo para debugging
def get_model_info():
    """
    Retorna información sobre el modelo cargado
    """
    return {
        "model_loaded": MODEL is not None,
        "artifacts_loaded": ARTIFACTS is not None,
        "img_size": IMG_SIZE,
        "classes": CLASS_NAMES,
        "sex_categories": ARTIFACTS.get("SEX_CATEGORIES", []),
        "site_categories": ARTIFACTS.get("SITE_CATEGORIES", []),
    }


if __name__ == "__main__":
    # Test básico
    print("\n📊 Información del modelo:")
    info = get_model_info()
    for key, value in info.items():
        print(f"  {key}: {value}")
