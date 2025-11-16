# Implementation Plan - Sistema Robusto de Hash de Archivos

- [x] 1. Crear FileHashService con métodos de hash


  - Crear archivo `oncoderma-frontend/src/utils/fileHashService.js`
  - Implementar método `isWebCryptoAvailable()` para detectar disponibilidad de Web Crypto API
  - Implementar método `generateCryptoHash(file)` usando SHA-256 con Web Crypto API
  - Implementar método `generateSimpleHash(file)` basado en propiedades del archivo y muestras de bytes
  - Implementar método `generateMetadataHash(file)` como último fallback usando solo metadatos
  - Implementar método principal `generateHash(file)` con lógica de fallback automático
  - Agregar logging detallado para debugging de cada método
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_



- [ ] 2. Integrar FileHashService en useImageAnalysis hook
  - Importar FileHashService en `oncoderma-frontend/src/hooks/useImageAnalysis.js`
  - Reemplazar llamada directa a `crypto.subtle.digest()` con `fileHashService.generateHash()`
  - Actualizar manejo de errores para capturar fallos de hash sin interrumpir análisis
  - Agregar logging del método de hash utilizado
  - Mantener funcionalidad de caché con hash generado


  - Implementar lógica para continuar sin caché si hash falla completamente
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Actualizar AnalysisService para remover código duplicado
  - Abrir archivo `oncoderma-frontend/src/services/analysisService.js`


  - Remover método `generateFileHash()` que usa crypto.subtle directamente
  - Verificar que no hay otras referencias a generación de hash en el servicio
  - Limpiar imports innecesarios relacionados con crypto
  - _Requirements: 1.1, 1.2, 1.3_




- [ ] 4. Mejorar mensajes de error para usuarios
  - Actualizar mensajes de error en useImageAnalysis para ser más descriptivos
  - Agregar mensaje específico cuando falla por problemas de red vs problemas de hash
  - Asegurar que errores técnicos se registran en consola pero no se muestran al usuario
  - Mantener mensajes de error user-friendly en la UI
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Validar compatibilidad y funcionalidad
  - Probar análisis de imagen en localhost (HTTPS) - debe usar Web Crypto API
  - Probar análisis de imagen desde otro dispositivo vía HTTP (192.168.0.16:3000) - debe usar Simple Hash
  - Verificar que el caché funciona correctamente con ambos métodos de hash
  - Verificar que análisis múltiples del mismo archivo usan caché
  - Verificar que el análisis continúa correctamente incluso si hash falla
  - Revisar logs de consola para confirmar método de hash usado
  - Verificar que no hay errores de `Cannot read properties of undefined`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5_
