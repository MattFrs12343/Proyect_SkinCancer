"""
Script de prueba para verificar que el nuevo modelo funciona correctamente
"""
import sys
sys.path.insert(0, 'skin_cancer_api')

from inference import predict_top3, get_model_info

# Mostrar información del modelo
print("=" * 60)
print("INFORMACIÓN DEL MODELO")
print("=" * 60)
info = get_model_info()
for key, value in info.items():
    print(f"{key}: {value}")

print("\n" + "=" * 60)
print("PRUEBA DE PREDICCIÓN")
print("=" * 60)

# Verificar si existe una imagen de prueba
import os
test_images = ["test_lesion.jpg", "Img/test.jpg"]
test_image = None

for img in test_images:
    if os.path.exists(img):
        test_image = img
        break

if test_image:
    print(f"\n✅ Usando imagen de prueba: {test_image}")
    
    # Hacer predicción
    try:
        results = predict_top3(
            image_path=test_image,
            age_value=55.0,
            sex_str="male",
            anatom_site_str="lower extremity"
        )
        
        print("\n📊 Resultados de predicción:")
        for i, result in enumerate(results, 1):
            print(f"  {i}. {result['class']}: {result['prob']:.4f} ({result['prob']*100:.2f}%)")
        
        print("\n✅ ¡Modelo funcionando correctamente!")
        
    except Exception as e:
        print(f"\n❌ Error en predicción: {e}")
        import traceback
        traceback.print_exc()
else:
    print("\n⚠️ No se encontró imagen de prueba")
    print("Coloca una imagen en 'test_lesion.jpg' para probar el modelo")

print("\n" + "=" * 60)
