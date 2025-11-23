
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse, HTMLResponse
import numpy as np
import json
import io
from PIL import Image
import tensorflow as tf
from .utils.preprocessing import preprocess_image_bytes, encode_metadata

app = FastAPI(title="Skin Classifier API")

MODEL_PATHS = [
    "model/best_model_checkpoint.keras",
    "model/model_multimodal_improved.keras",
    "model/model_multimodal.keras"
]

_model = None
_artifacts = None

def load_model_and_artifacts():
    global _model, _artifacts
    for p in MODEL_PATHS:
        try:
            _model = tf.keras.models.load_model(p)
            break
        except:
            pass
    try:
        with open("model/preprocess_artifacts.json","r",encoding="utf-8") as f:
            _artifacts = json.load(f)
    except:
        pass

load_model_and_artifacts()

@app.get("/", response_class=HTMLResponse)
async def home():
    try:
        with open("frontend/index.html","r",encoding="utf-8") as f:
            return HTMLResponse(f.read())
    except:
        return "<h3>Frontend no disponible</h3>"

@app.post("/predict")
async def predict(file: UploadFile = File(...),
                  age: int = Form(None),
                  sex: str = Form(None),
                  site: str = Form(None)):

    if _model is None or _artifacts is None:
        return JSONResponse({"error": "Modelo o artifacts no encontrados"}, status_code=500)

    contents = await file.read()
    img_arr = preprocess_image_bytes(contents, tuple(_artifacts.get("img_size",[224,224])))

    age_norm, sex_ohe, site_idx = encode_metadata(age, sex, site, _artifacts)

    batch = {
        "image": np.expand_dims(img_arr,0),
        "age": np.array([age_norm]),
        "sex_ohe": np.expand_dims(np.array(sex_ohe),0),
        "site_idx": np.array([site_idx])
    }

    preds = _model.predict(batch)[0]
    order = np.argsort(preds)[::-1]
    top1, top2 = order[0], order[1]

    idx2class = _artifacts.get("idx2class", {})
    res = {
        "top1": {"class": idx2class.get(str(top1), str(top1)), "prob": float(preds[top1])},
        "top2": {"class": idx2class.get(str(top2), str(top2)), "prob": float(preds[top2])},
        "all_probs": { idx2class.get(str(i),str(i)): float(preds[i]) for i in range(len(preds)) }
    }
    res["uncertain"] = (res["top1"]["prob"]<0.60) or ((res["top1"]["prob"]-res["top2"]["prob"])<0.10)

    return JSONResponse(res)
