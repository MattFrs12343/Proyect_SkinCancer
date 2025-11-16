# 📱 Guía de Testing Móvil - OncoDerma

## 🚀 Inicio Rápido

### 1. Iniciar el Servidor
```bash
cd skin_cancer_api
python main.py
```

El servidor estará disponible en: `http://192.168.0.16:8000`

### 2. Acceder desde tu Móvil

**Opción A: Escanear QR** (recomendado)
- Genera un QR con: https://www.qr-code-generator.com/
- URL: `http://192.168.0.16:8000`
- Escanea con la cámara de tu móvil

**Opción B: Escribir URL manualmente**
- Abre el navegador en tu móvil
- Escribe: `http://192.168.0.16:8000`

## ✅ Checklist de Testing

### Navegación General
- [ ] La página carga correctamente
- [ ] No hay scroll horizontal no deseado
- [ ] El logo se ve correctamente
- [ ] El menú hamburguesa funciona
- [ ] Los botones son fáciles de presionar (44px mínimo)
- [ ] Las animaciones son suaves

### Página Home
- [ ] El hero section se ve bien
- [ ] Los títulos son legibles
- [ ] Las cards se apilan verticalmente
- [ ] Los iconos tienen buen tamaño
- [ ] El botón "Comenzar Análisis" es fácil de presionar
- [ ] Las secciones tienen buen espaciado

### Página Analizar
- [ ] El área de subida de imagen es clara
- [ ] El botón de selección es grande y fácil de usar
- [ ] El formulario de datos del paciente es fácil de llenar
- [ ] Los inputs NO hacen zoom al enfocar (iOS)
- [ ] Los selects funcionan correctamente
- [ ] Los mensajes de error son visibles
- [ ] El botón "Iniciar Análisis" es prominente

### Resultados
- [ ] Los resultados se muestran correctamente
- [ ] El gráfico circular es visible y legible
- [ ] Las tabs se pueden deslizar horizontalmente
- [ ] La tabla de probabilidades es legible
- [ ] Los botones de acción son accesibles

### Formularios
- [ ] Los inputs tienen font-size 16px (no zoom en iOS)
- [ ] Los labels son legibles
- [ ] Los mensajes de error son claros
- [ ] La validación funciona correctamente
- [ ] El teclado no oculta campos importantes

### Modo Oscuro
- [ ] El toggle de tema funciona
- [ ] Los colores tienen buen contraste
- [ ] Los textos son legibles
- [ ] Las cards se ven bien
- [ ] Los iconos son visibles

### Performance
- [ ] La página carga rápido
- [ ] El scroll es fluido
- [ ] Las animaciones no causan lag
- [ ] Las transiciones son suaves
- [ ] No hay parpadeos o saltos

### Orientación
- [ ] Portrait: Todo se ve bien
- [ ] Landscape: Los elementos se adaptan
- [ ] Rotación: No hay problemas al rotar

### Touch Interactions
- [ ] Los botones responden al primer toque
- [ ] No hay doble-tap accidental
- [ ] El scroll funciona suavemente
- [ ] Los gestos son naturales
- [ ] No hay lag en las interacciones

## 🐛 Problemas Comunes y Soluciones

### Problema: No puedo acceder desde el móvil
**Solución**: 
- Verifica que estés en la misma red WiFi
- Verifica la IP con: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
- Desactiva el firewall temporalmente

### Problema: Los inputs hacen zoom en iOS
**Solución**: 
- Ya está solucionado con font-size: 16px
- Si persiste, verifica que el CSS se haya aplicado

### Problema: El scroll no es suave
**Solución**:
- Ya está optimizado con `-webkit-overflow-scrolling: touch`
- Prueba en un navegador actualizado

### Problema: Los botones son difíciles de presionar
**Solución**:
- Ya están optimizados a 44x44px mínimo
- Si persiste, reporta qué botón específico

### Problema: Hay scroll horizontal
**Solución**:
- Ya está prevenido con `overflow-x: hidden`
- Si persiste, identifica qué elemento lo causa

## 📊 Métricas a Observar

### Rendimiento
- **Tiempo de carga inicial**: < 3 segundos
- **First Contentful Paint**: < 1.5 segundos
- **Time to Interactive**: < 3.5 segundos
- **Scroll FPS**: 60 fps constante

### Usabilidad
- **Touch target size**: Mínimo 44x44px
- **Font size mínimo**: 14px (16px en inputs)
- **Contraste de texto**: Mínimo 4.5:1
- **Espaciado entre elementos**: Mínimo 8px

## 🎯 Escenarios de Prueba

### Escenario 1: Usuario Nuevo
1. Abrir la app por primera vez
2. Navegar por el Home
3. Leer la información
4. Ir a "Analizar"
5. Subir una imagen
6. Llenar el formulario
7. Ver resultados

### Escenario 2: Análisis Rápido
1. Ir directamente a "Analizar"
2. Subir imagen
3. Llenar formulario rápidamente
4. Iniciar análisis
5. Ver resultados

### Escenario 3: Exploración
1. Navegar por todas las páginas
2. Probar el modo oscuro
3. Leer FAQ
4. Ver Contacto
5. Volver al Home

### Escenario 4: Diferentes Orientaciones
1. Usar en portrait
2. Rotar a landscape
3. Verificar que todo funciona
4. Volver a portrait

### Escenario 5: Con Teclado
1. Ir a formulario
2. Enfocar un input
3. Verificar que el campo es visible
4. Llenar todos los campos
5. Enviar formulario

## 📱 Dispositivos Recomendados para Testing

### iOS
- iPhone SE (pantalla pequeña)
- iPhone 12/13/14 (estándar)
- iPhone 14 Pro Max (grande)
- iPad (tablet)

### Android
- Samsung Galaxy S21 (estándar)
- Google Pixel 6 (estándar)
- Xiaomi Redmi Note (económico)
- Samsung Galaxy Tab (tablet)

## 🔍 Herramientas de Testing

### Chrome DevTools (Desktop)
1. Abrir DevTools (F12)
2. Click en "Toggle device toolbar" (Ctrl+Shift+M)
3. Seleccionar dispositivo
4. Probar diferentes tamaños

### Safari Web Inspector (iOS)
1. Conectar iPhone a Mac
2. Abrir Safari en Mac
3. Develop > [Tu iPhone] > [Página]
4. Inspeccionar elementos

### Lighthouse (Performance)
1. Abrir DevTools
2. Tab "Lighthouse"
3. Seleccionar "Mobile"
4. Run audit

## 📝 Reporte de Bugs

Si encuentras algún problema, reporta:
1. **Dispositivo**: Modelo y versión de OS
2. **Navegador**: Nombre y versión
3. **Problema**: Descripción detallada
4. **Pasos**: Cómo reproducir
5. **Screenshot**: Si es posible

## ✨ Mejoras Futuras Sugeridas

- [ ] Agregar gestos de swipe
- [ ] Implementar PWA completo
- [ ] Agregar modo offline
- [ ] Optimizar imágenes con WebP
- [ ] Agregar haptic feedback
- [ ] Implementar pull-to-refresh útil
- [ ] Agregar shortcuts de teclado
- [ ] Mejorar accesibilidad con ARIA

---

**¡Feliz Testing! 🎉**
