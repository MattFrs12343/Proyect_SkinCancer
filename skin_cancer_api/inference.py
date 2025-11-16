from pathlib import Path
import tensorflow as tf
from tensorflow import keras
import numpy as np

IMG_SIZE = (224, 224)
CLASS_NAMES = ["MEL", "NV", "BCC", "BKL"]

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "skin_cancer_multimodal_grouped_equilibrado.keras"

print(f"Cargando modelo desde {MODEL_PATH}...")
MODEL = keras.models.load_model(MODEL_PATH)
print("Modelo cargado correctamente.")

def load_image_for_inference(image_path: str):
    img = tf.io.read_file(image_path)
    img = tf.image.decode_jpeg(img, channels=3)
    img = tf.image.resize(img, IMG_SIZE)
    img = tf.cast(img, tf.float32) / 255.0
    img = tf.expand_dims(img, axis=0)
    return img

def predict_top3(image_path: str, age_value: float, sex_str: str, anatom_site_str: str):
    img = load_image_for_inference(image_path)

    age_norm = float(age_value) / 100.0
    age_tensor  = tf.constant([[age_norm]], dtype=tf.float32)
    sex_tensor  = tf.constant([[sex_str]], dtype=tf.string)
    site_tensor = tf.constant([[anatom_site_str]], dtype=tf.string)

    inputs = {
        "image": img,
        "age": age_tensor,
        "sex": sex_tensor,
        "anatom_site_general": site_tensor,
    }

    probs = MODEL.predict(inputs)[0]
    top3_idx = np.argsort(probs)[-3:][::-1]

    results = []
    for idx in top3_idx:
        results.append({
            "class": CLASS_NAMES[idx],
            "prob": float(probs[idx]),
        })
    return results
