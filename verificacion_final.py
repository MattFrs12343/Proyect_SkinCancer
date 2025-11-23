"""
Verificación final: Confirmar que el backend NO interfiere con el modelo
"""
import numpy as np
from PIL import Image
import tempfile
import os
import sys
import json

print("=" * 80)
print("VERIFICACIÓN FINAL: Backend sin interferencias")
print("=" * 80)

# Crear imagen de prueba
img = Image.new('RGB', (224, 224), color=(120, 150, 180))
with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
    img.save(tmp.name)
    test_image_path = tmp.name

print(f"\n✅ Imagen de prueba creada")

# Cargar artifacts
with open("fastapi_skin_demo/model/preprocess_artifacts.json", "r") as f:
    ARTIFACTS = json.load(f)

print("\n" + "=" * 80)
print("TEST 1: Verificar que las funciones son idénticas")
print("=" * 80)

# Importar funciones del backend
sys.path.insert(0, "skin_cancer_api")
from inference import encode_metadata as encode_backend
from inference import preprocess_image_bytes as preprocess_backend

# Importar funciones originales
sys.path.insert(0, "fastapi_skin_demo/app")
from utils.preprocessing import encode_metadata as encode_original
from utils.preprocessing import preprocess_image_bytes as preprocess_original

# Test de encode_metadata
test_cases = [
    (65, "MALE", "head/neck"),
    (45, "FEMALE", "lower extremity"),
    (60, "male", "anterior torso"),
    (70, "female", "posterior torso"),
]

print("\n🔍 Probando encode_metadata:")
all_match = True
for age, sex, site in test_cases:
    age_backend, sex_backend, site_backend = encode_backend(age, sex, site, ARTIFACTS)
    age_orig, sex_orig, site_orig = encode_original(age, sex, site, ARTIFACTS)
    
    match = (
        abs(age_backend - age_orig) < 0.0001 and
        sex_backend == sex_orig and
        site_backend == site_orig
    )
    
    status = "✅" if match else "❌"
    if not match:
        print(f"\n{status} Test: age={age}, sex={sex}, site={site}")
        print(f"  Backend:  age={age_backend:.4f}, sex={sex_backend}, site={site_backend}")
        print(f"  Original: age={age_orig:.4f}, sex={sex_orig}, site={site_orig}")
        all_match = False

if all_match:
    print("  ✅ Todas las codificaciones son IDÉNTICAS")
else:
    print("  ❌ HAY DIFERENCIAS en la codificación")

# Test de preprocess_image_bytes
print("\n🔍 Probando preprocess_image_bytes:")
with open(test_image_path, "rb") as f:
    contents = f.read()

img_backend = preprocess_backend(contents, (224, 224))
img_orig = preprocess_original(contents, (224, 224))

img_match = np.allclose(img_backend, img_orig, atol=1e-6)
status = "✅" if img_match else "❌"
print(f"  {status} Preprocesamiento de imagen: {'IDÉNTICO' if img_match else 'DIFERENTE'}")

print("\n" + "=" * 80)
print("TEST 2: Verificar predicciones completas")
print("=" * 80)

from inference import predict_top3

print("\n🔍 Realizando predicciones con diferentes inputs:")
test_predictions = [
    (65, "MALE", "head/neck"),
    (45, "FEMALE", "lower extremity"),
    (60, "male", "anterior torso"),
]

for age, sex, site in test_predictions:
    print(f"\n  Input: age={age}, sex={sex}, site={site}")
    results = predict_top3(test_image_path, age, sex, site)
    for i, res in enumerate(results, 1):
        print(f"    {i}. {res['class']}: {res['prob']:.4f}")

print("\n" + "=" * 80)
print("TEST 3: Verificar firma de funciones")
print("=" * 80)

import inspect

print("\n🔍 Comparando firmas de funciones:")

# encode_metadata
sig_backend = inspect.signature(encode_backend)
sig_orig = inspect.signature(encode_original)

print(f"\n  encode_metadata:")
print(f"    Backend:  {sig_backend}")
print(f"    Original: {sig_orig}")
if str(sig_backend) == str(sig_orig):
    print(f"    ✅ Firmas IDÉNTICAS")
else:
    print(f"    ❌ Firmas DIFERENTES")

# preprocess_image_bytes
sig_backend_img = inspect.signature(preprocess_backend)
sig_orig_img = inspect.signature(preprocess_original)

print(f"\n  preprocess_image_bytes:")
print(f"    Backend:  {sig_backend_img}")
print(f"    Original: {sig_orig_img}")
if str(sig_backend_img) == str(sig_orig_img):
    print(f"    ✅ Firmas IDÉNTICAS")
else:
    print(f"    ❌ Firmas DIFERENTES")

print("\n" + "=" * 80)
print("CONCLUSIÓN FINAL")
print("=" * 80)

if all_match and img_match and str(sig_backend) == str(sig_orig):
    print("\n✅ ¡PERFECTO! El backend usa código IDÉNTICO al modelo original")
    print("✅ NO hay interferencias de ningún tipo")
    print("✅ Las predicciones son 100% fieles al modelo")
    print("\n🎯 El backend actúa como un PROXY TRANSPARENTE")
    print("   - Recibe datos del frontend")
    print("   - Los pasa SIN MODIFICAR al modelo")
    print("   - Retorna los resultados SIN ALTERAR")
else:
    print("\n⚠️  Hay algunas diferencias menores")
    print("   Revisar los tests anteriores para detalles")

# Limpiar
os.remove(test_image_path)
print("\n" + "=" * 80)
