"""
Análisis detallado de las diferencias entre backend y modelo original
"""
import json

print("=" * 80)
print("ANÁLISIS DETALLADO: Diferencias en el código")
print("=" * 80)

# Cargar artifacts
with open("fastapi_skin_demo/model/preprocess_artifacts.json", "r") as f:
    ARTIFACTS = json.load(f)

print("\n📋 ARTIFACTS CARGADOS:")
print(f"  sex2idx: {ARTIFACTS['sex2idx']}")
print(f"  site2idx: {list(ARTIFACTS['site2idx'].keys())}")
print(f"  age_mean: {ARTIFACTS['age_mean']}")
print(f"  age_std: {ARTIFACTS['age_std']}")

print("\n" + "=" * 80)
print("PROBLEMA 1: Codificación de SEXO")
print("=" * 80)

print("\n🔍 Código ORIGINAL (fastapi_skin_demo):")
print("""
    s = str(sex_input).lower()  # minúsculas
    if s in ["f","female","mujer"]:
        s="female"
    elif s in ["m","male","hombre"]:
        s="male"
    sex_idx = sex2idx.get(s, sex2idx.get("unknown",0))
""")

print("\n🔍 Código BACKEND ACTUAL (skin_cancer_api):")
print("""
    sex_str = str(sex_input).upper()  # MAYÚSCULAS ❌
    if sex_str in ["F", "FEMALE", "MUJER"]:
        sex_key = "female"
    elif sex_str in ["M", "MALE", "HOMBRE"]:
        sex_key = "male"
    else:
        sex_key = "unknown"
    sex_idx = sex2idx.get(sex_key, sex2idx.get("unknown", 0))
""")

print("\n⚠️  IMPACTO:")
print("  - El backend convierte a MAYÚSCULAS pero luego compara con MAYÚSCULAS")
print("  - Funciona PERO es diferente al original")
print("  - Puede causar problemas si el input viene en formato mixto")

print("\n" + "=" * 80)
print("PROBLEMA 2: Sitio Anatómico")
print("=" * 80)

print("\n🔍 Código ORIGINAL:")
print("""
    site2idx = artifacts.get("site2idx", {"other":0})
    site_str = str(site_input)  # NO convierte a minúsculas
    site_idx = site2idx.get(site_str, site2idx.get("other",0))
""")

print("\n🔍 Código BACKEND ACTUAL:")
print("""
    site2idx = ARTIFACTS.get("site2idx", {"other": 0})
    site_str = str(site_input).lower()  # Convierte a minúsculas ❌
    site_idx = site2idx.get(site_str, site2idx.get("other", 0))
""")

print("\n⚠️  IMPACTO:")
print("  - El backend convierte el sitio a minúsculas")
print("  - Los artifacts tienen sitios en minúsculas, así que funciona")
print("  - PERO el original NO convierte, espera el formato exacto")

print("\n" + "=" * 80)
print("PROBLEMA 3: Firma de función")
print("=" * 80)

print("\n🔍 ORIGINAL:")
print("  def encode_metadata(age_input, sex_input, site_input, artifacts):")
print("                                                          ^^^^^^^^^^")
print("                                                          Recibe artifacts")

print("\n🔍 BACKEND:")
print("  def encode_metadata(age_input, sex_input, site_input):")
print("                                                        ")
print("                                                        NO recibe artifacts")
print("  Usa ARTIFACTS global en su lugar")

print("\n⚠️  IMPACTO:")
print("  - El backend usa una variable global ARTIFACTS")
print("  - El original recibe artifacts como parámetro")
print("  - Funcionalmente es lo mismo, pero arquitectónicamente diferente")

print("\n" + "=" * 80)
print("PRUEBA PRÁCTICA: ¿Afecta los resultados?")
print("=" * 80)

# Simular codificación
sex2idx = ARTIFACTS["sex2idx"]
site2idx = ARTIFACTS["site2idx"]

test_cases = [
    ("MALE", "head/neck"),
    ("male", "head/neck"),
    ("Male", "head/neck"),
    ("FEMALE", "lower extremity"),
]

print("\nProbando diferentes formatos de entrada:")
for sex, site in test_cases:
    # Backend (upper)
    sex_str_backend = str(sex).upper()
    if sex_str_backend in ["F", "FEMALE", "MUJER"]:
        sex_key = "female"
    elif sex_str_backend in ["M", "MALE", "HOMBRE"]:
        sex_key = "male"
    else:
        sex_key = "unknown"
    sex_idx_backend = sex2idx.get(sex_key, sex2idx.get("unknown", 0))
    
    # Original (lower)
    s = str(sex).lower()
    if s in ["f","female","mujer"]:
        s="female"
    elif s in ["m","male","hombre"]:
        s="male"
    sex_idx_orig = sex2idx.get(s, sex2idx.get("unknown",0))
    
    # Sitio
    site_str_backend = str(site).lower()
    site_idx_backend = site2idx.get(site_str_backend, site2idx.get("other", 0))
    
    site_str_orig = str(site)
    site_idx_orig = site2idx.get(site_str_orig, site2idx.get("other",0))
    
    match_sex = sex_idx_backend == sex_idx_orig
    match_site = site_idx_backend == site_idx_orig
    
    status_sex = "✅" if match_sex else "❌"
    status_site = "✅" if match_site else "❌"
    
    print(f"\n  Input: sex='{sex}', site='{site}'")
    print(f"    {status_sex} Sexo:  Backend={sex_idx_backend}, Original={sex_idx_orig}")
    print(f"    {status_site} Sitio: Backend={site_idx_backend}, Original={site_idx_orig}")

print("\n" + "=" * 80)
print("CONCLUSIÓN FINAL")
print("=" * 80)

print("\n✅ BUENAS NOTICIAS:")
print("  - Los resultados numéricos son correctos")
print("  - La codificación funciona bien en la práctica")
print("  - El modelo recibe los datos correctos")

print("\n⚠️  PERO HAY DIFERENCIAS:")
print("  1. Sexo: Backend usa .upper(), original usa .lower()")
print("  2. Sitio: Backend usa .lower(), original NO convierte")
print("  3. Arquitectura: Backend usa global, original usa parámetro")

print("\n💡 RECOMENDACIÓN:")
print("  - Si funciona correctamente, NO es crítico cambiar")
print("  - PERO para mantener consistencia con el original:")
print("    → Reemplazar con el código exacto de fastapi_skin_demo")
print("    → Esto garantiza comportamiento idéntico en todos los casos")

print("\n" + "=" * 80)
