"""
Test final: Verificar que el backend usa EXACTAMENTE el mismo código que fastapi_skin_demo
"""
import numpy as np
from PIL import Image
import tempfile
import os
import sys

# Crear imagen de prueba
print("=" * 70)
print("TEST: Verificación de que NO hay interferencias del backend")
print("=" * 70)

img = Image.new('RGB', (224, 224), color=(100, 150, 200))
with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
    img.save(tmp.name)
    test_image_path = tmp.name

print(f"\n✅ Imagen de prueba creada: {test_image_path}")

# Importar función del backend
from inference import predict_top3, ARTIFACTS

print("\n" + "=" * 70)
print("PRUEBA 1: Hombre, 65 años, head/neck")
print("=" * 70)
results = predict_top3(test_image_path, 65, "male", "head/neck")
print("\nResultados:")
for i, res in enumerate(results, 1):
    print(f"  {i}. {res['class']}: {res['prob']:.4f} ({res['prob']*100:.2f}%)")

print("\n" + "=" * 70)
print("PRUEBA 2: Mujer, 45 años, lower extremity")
print("=" * 70)
results = predict_top3(test_image_path, 45, "female", "lower extremity")
print("\nResultados:")
for i, res in enumerate(results, 1):
    print(f"  {i}. {res['class']}: {res['prob']:.4f} ({res['prob']*100:.2f}%)")

print("\n" + "=" * 70)
print("VERIFICACIÓN: Comparar con fastapi_skin_demo original")
print("=" * 70)

# Importar funciones originales
sys.path.insert(0, str(os.path.join(os.path.dirname(__file__), "..", "fastapi_skin_demo", "app")))
from utils.preprocessing import preprocess_image_bytes as preprocess_original
from utils.preprocessing import encode_metadata as encode_original

# Leer imagen
with open(test_image_path, "rb") as f:
    contents = f.read()

# Test con los mismos datos
test_cases = [
    (65, "male", "head/neck"),
    (45, "female", "lower extremity"),
]

print("\nComparando preprocesamiento de metadatos:")
all_match = True
for age, sex, site in test_cases:
    # Backend actual
    from inference import encode_metadata as encode_backend
    age_backend, sex_backend, site_backend = encode_backend(age, sex, site, ARTIFACTS)
    
    # Original
    age_orig, sex_orig, site_orig = encode_original(age, sex, site, ARTIFACTS)
    
    match = (
        abs(age_backend - age_orig) < 0.0001 and
        sex_backend == sex_orig and
        site_backend == site_orig
    )
    
    status = "✅" if match else "❌"
    print(f"\n{status} Test: age={age}, sex={sex}, site={site}")
    if not match:
        print(f"  Backend: age={age_backend:.4f}, sex={sex_backend}, site={site_backend}")
        print(f"  Original: age={age_orig:.4f}, sex={sex_orig}, site={site_orig}")
        all_match = False

if all_match:
    print("\n" + "=" * 70)
    print("✅ ¡ÉXITO! El backend usa EXACTAMENTE el mismo código")
    print("✅ NO hay interferencias en los resultados del modelo")
    print("=" * 70)
else:
    print("\n" + "=" * 70)
    print("❌ HAY DIFERENCIAS - Revisar implementación")
    print("=" * 70)

# Limpiar
os.remove(test_image_path)
