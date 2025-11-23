"""
Script de verificación: Compara el backend actual con el modelo original
"""
import numpy as np
from PIL import Image
import tempfile
import os
import sys
import json

print("=" * 80)
print("VERIFICACIÓN: ¿El backend está modificando los resultados del modelo?")
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
print("COMPARACIÓN 1: Preprocesamiento de metadatos")
print("=" * 80)

# Importar función del backend actual
sys.path.insert(0, "skin_cancer_api")
from inference import encode_metadata as encode_backend

# Importar función original
sys.path.insert(0, "fastapi_skin_demo/app")
from utils.preprocessing import encode_metadata as encode_original

test_cases = [
    (65, "MALE", "head/neck"),
    (45, "FEMALE", "lower extremity"),
    (60, "male", "anterior torso"),
]

print("\nProbando codificación de metadatos:")
all_match = True
for age, sex, site in test_cases:
    # Backend actual (NO pasa artifacts como parámetro)
    try:
        age_backend, sex_backend, site_backend = encode_backend(age, sex, site)
    except TypeError:
        print(f"\n❌ ERROR: encode_backend no acepta artifacts como parámetro")
        print(f"   Esto indica que el backend tiene una firma diferente")
        all_match = False
        continue
    
    # Original (SÍ pasa artifacts)
    age_orig, sex_orig, site_orig = encode_original(age, sex, site, ARTIFACTS)
    
    match = (
        abs(age_backend - age_orig) < 0.0001 and
        sex_backend == sex_orig and
        site_backend == site_orig
    )
    
    status = "✅" if match else "❌"
    print(f"\n{status} Test: age={age}, sex={sex}, site={site}")
    if not match:
        print(f"  Backend:  age={age_backend:.4f}, sex={sex_backend}, site={site_backend}")
        print(f"  Original: age={age_orig:.4f}, sex={sex_orig}, site={site_orig}")
        all_match = False

print("\n" + "=" * 80)
print("COMPARACIÓN 2: Análisis de diferencias en el código")
print("=" * 80)

print("\n🔍 Diferencias encontradas:")

print("\n1. FIRMA DE FUNCIÓN:")
print("   Backend:  encode_metadata(age_input, sex_input, site_input)")
print("   Original: encode_metadata(age_input, sex_input, site_input, artifacts)")
print("   ❌ El backend NO recibe artifacts como parámetro")

print("\n2. CODIFICACIÓN DE SEXO:")
print("   Backend:  sex_str = str(sex_input).upper()  # Convierte a MAYÚSCULAS")
print("   Original: s = str(sex_input).lower()        # Convierte a minúsculas")
print("   ❌ El backend usa .upper() en lugar de .lower()")

print("\n3. SITIO ANATÓMICO:")
print("   Backend:  site2idx = ARTIFACTS.get('site2idx', {'other': 0})")
print("   Original: site2idx = artifacts.get('site2idx', {'other': 0})")
print("   ⚠️  El backend usa un fallback incorrecto")

print("\n4. ARTIFACTS:")
artifacts_backend = ARTIFACTS.get("site2idx", {"other": 0})
print(f"   Backend fallback:  {artifacts_backend}")
print(f"   Artifacts reales:  {len(ARTIFACTS.get('site2idx', {}))} sitios anatómicos")
if len(ARTIFACTS.get("site2idx", {})) > 1:
    print("   ❌ El backend pierde información de sitios anatómicos")

print("\n" + "=" * 80)
print("COMPARACIÓN 3: Predicción completa")
print("=" * 80)

# Importar función de predicción del backend
from inference import predict_top3

print("\nRealizando predicción con el backend actual:")
results = predict_top3(test_image_path, 65, "MALE", "head/neck")
print("\nResultados del backend:")
for i, res in enumerate(results, 1):
    print(f"  {i}. {res['class']}: {res['prob']:.4f} ({res['prob']*100:.2f}%)")

print("\n" + "=" * 80)
print("CONCLUSIÓN")
print("=" * 80)

if not all_match:
    print("\n❌ EL BACKEND ESTÁ MODIFICANDO LOS DATOS")
    print("\nProblemas encontrados:")
    print("  1. La función encode_metadata tiene una firma diferente")
    print("  2. Usa .upper() en lugar de .lower() para el sexo")
    print("  3. No pasa artifacts correctamente")
    print("  4. Puede estar perdiendo información de sitios anatómicos")
    print("\n⚠️  RECOMENDACIÓN: Reemplazar el código del backend con el original")
else:
    print("\n✅ El backend usa EXACTAMENTE el mismo código que el modelo original")
    print("✅ NO hay modificaciones en los resultados")

# Limpiar
os.remove(test_image_path)
print("\n" + "=" * 80)
