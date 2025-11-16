# 🌐 INSTRUCCIONES PARA ACCESO EN RED

## ⚠️ PROBLEMA ACTUAL

Otros dispositivos no pueden conectarse al backend porque:
1. El firewall de Windows está bloqueando las conexiones
2. Necesitas ejecutar un script como administrador

## ✅ SOLUCIÓN RÁPIDA (3 pasos)

### Paso 1: Configurar Firewall

1. Haz **clic derecho** en el archivo `configurar-firewall.ps1`
2. Selecciona **"Ejecutar con PowerShell como administrador"**
3. Si aparece una advertencia de seguridad, presiona **"S"** (Sí)
4. Espera a que termine y presiona cualquier tecla

### Paso 2: Verificar que todo esté corriendo

Verifica que ambos servicios estén activos:

**Backend:**
```bash
# Debería estar corriendo en otra terminal
cd skin_cancer_api
python main.py
```

**Frontend:**
```bash
# Ya está corriendo (lo inicié automáticamente)
# Si no, ejecuta:
cd oncoderma-frontend
npm run dev
```

### Paso 3: Compartir la URL

Comparte esta URL con la otra persona:
```
http://192.168.0.16:3001
```

**Credenciales:**
- Usuario: `Matias`
- Contraseña: `1234`

## 🔍 Verificación

### Desde TU computadora:

Abre el navegador y verifica:
- Frontend: `http://localhost:3001` ✅
- Backend: `http://localhost:8000/health` ✅

### Desde OTRO dispositivo en la red:

Abre el navegador y verifica:
- Frontend: `http://192.168.0.16:3001` ✅
- Backend: `http://192.168.0.16:8000/health` ✅

Si el health check funciona, el backend está accesible.

## 🛡️ Alternativa Manual (si el script no funciona)

Abre PowerShell como **Administrador** y ejecuta estos comandos uno por uno:

```powershell
# Permitir Frontend (puerto 3001)
netsh advfirewall firewall add rule name="OncoDerma Frontend" dir=in action=allow protocol=TCP localport=3001

# Permitir Backend (puerto 8000)
netsh advfirewall firewall add rule name="OncoDerma Backend" dir=in action=allow protocol=TCP localport=8000
```

## 📱 Acceso desde Móvil

1. Conecta el móvil a la **misma red WiFi**
2. Abre el navegador (Chrome, Safari, etc.)
3. Ingresa: `http://192.168.0.16:3001`
4. Inicia sesión y usa la aplicación normalmente

## 🔧 Solución de Problemas

### "No se puede conectar al servidor"

**Desde otro dispositivo, prueba esto:**

1. **Ping a tu computadora:**
   ```bash
   ping 192.168.0.16
   ```
   Si no responde, hay un problema de red.

2. **Verificar el backend:**
   Abre en el navegador del otro dispositivo:
   ```
   http://192.168.0.16:8000/health
   ```
   Debería mostrar: `{"status":"ok"}`

3. **Verificar el frontend:**
   ```
   http://192.168.0.16:3001
   ```
   Debería cargar la página de login.

### El frontend carga pero no puede subir imágenes

**Causa:** El frontend está usando `localhost:8000` en lugar de tu IP.

**Solución:**
1. Verifica que el archivo `.env` tenga:
   ```
   VITE_API_BASE_URL=http://192.168.0.16:8000
   ```
2. Reinicia el frontend (ya lo hice por ti)
3. Recarga la página en el navegador

### Firewall sigue bloqueando

**Opción 1: Desactivar temporalmente el firewall**
(Solo para pruebas, NO recomendado para uso prolongado)

1. Abre "Windows Defender Firewall"
2. Click en "Activar o desactivar Firewall de Windows"
3. Desactiva para "Red privada"
4. Prueba la conexión
5. Vuelve a activarlo después

**Opción 2: Crear reglas manualmente**

1. Abre "Windows Defender Firewall con seguridad avanzada"
2. Click en "Reglas de entrada"
3. Click en "Nueva regla..."
4. Selecciona "Puerto" → Siguiente
5. TCP → Puertos locales específicos: `3001,8000`
6. Permitir la conexión → Siguiente
7. Marca todas las opciones → Siguiente
8. Nombre: "OncoDerma" → Finalizar

## 📊 Estado Actual

- ✅ Frontend configurado con `host: '0.0.0.0'`
- ✅ Backend configurado con `host: '0.0.0.0'`
- ✅ CORS configurado para aceptar todas las conexiones
- ✅ Archivo `.env` con tu IP de red
- ✅ Frontend reiniciado con la nueva configuración
- ⚠️ Firewall necesita ser configurado (requiere permisos de administrador)

## 🎯 Próximo Paso

**Ejecuta el script de firewall como administrador:**

1. Haz clic derecho en `configurar-firewall.ps1`
2. Selecciona "Ejecutar con PowerShell como administrador"
3. Presiona "S" si pregunta
4. Espera a que termine

Después de esto, la otra persona podrá acceder sin problemas.

---

**¿Necesitas más ayuda?** Dime qué error específico ves cuando intentas acceder desde el otro dispositivo.
