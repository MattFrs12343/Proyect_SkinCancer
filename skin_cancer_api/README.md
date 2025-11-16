# Skin Cancer Multimodal API

API en FastAPI para clasificar cáncer de piel usando imagen + metadatos.

## Cómo ejecutar
1. Instalar dependencias:
   pip install -r requirements.txt

2. Ejecutar servidor:
   uvicorn main:app --reload

3. Endpoint principal:
   POST /predict

Campos:
- file: imagen
- age: edad
- sex: MALE/FEMALE
- anatom_site_general: zona anatómica
