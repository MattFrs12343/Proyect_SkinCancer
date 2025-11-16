/**
 * Configuración dinámica de API
 * Detecta automáticamente el protocolo y host correcto
 */

// Variable para mostrar advertencia solo una vez
let mixedContentWarningShown = false

/**
 * Obtener la URL base del API de forma inteligente
 * - Si frontend y backend están en el mismo dominio, usar rutas relativas
 * - Si están separados, usar URL completa
 */
export const getApiBaseUrl = () => {
  // Obtener URL del .env si existe
  const envUrl = import.meta.env.VITE_API_BASE_URL
  
  // Si estamos en producción (mismo dominio que el backend), usar ruta vacía
  // Esto permite que las peticiones vayan al mismo servidor
  if (import.meta.env.PROD) {
    // En producción, el backend sirve el frontend
    // Usar el mismo protocolo y host
    return ''  // Rutas relativas: /health, /predict, etc.
  }
  
  // En desarrollo, verificar si estamos usando Vite dev server
  if (import.meta.env.DEV) {
    // Si estamos en localhost, usar localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return envUrl || 'http://localhost:8000'
    }
    
    // Si estamos en HTTPS (Cloudflare) en desarrollo
    if (window.location.protocol === 'https:') {
      if (!mixedContentWarningShown) {
        console.warn('⚠️ MIXED CONTENT: Usa el backend unificado')
        console.warn('💡 Solución: Accede desde http://localhost:8000 (backend sirve todo)')
        mixedContentWarningShown = true
      }
      
      // Usar el mismo protocolo y host
      return `${window.location.protocol}//${window.location.hostname}:8000`
    }
  }
  
  // Fallback: usar la URL del .env
  return envUrl || 'http://localhost:8000'
}

/**
 * Verificar si hay problemas de Mixed Content
 */
export const checkMixedContentIssues = () => {
  const pageProtocol = window.location.protocol
  const apiUrl = getApiBaseUrl()
  const apiProtocol = apiUrl.startsWith('https') ? 'https:' : 'http:'
  
  if (pageProtocol === 'https:' && apiProtocol === 'http:') {
    return {
      hasProblem: true,
      message: 'Mixed Content: La página está en HTTPS pero el API está en HTTP',
      solution: 'Necesitas un túnel HTTPS para el backend o acceder desde HTTP'
    }
  }
  
  return {
    hasProblem: false,
    message: 'No hay problemas de Mixed Content'
  }
}

/**
 * Obtener configuración completa del API
 */
export const getApiConfig = () => {
  const baseUrl = getApiBaseUrl()
  const mixedContentCheck = checkMixedContentIssues()
  
  return {
    baseUrl,
    timeout: 30000,
    mixedContentIssue: mixedContentCheck.hasProblem,
    mixedContentMessage: mixedContentCheck.message,
    mixedContentSolution: mixedContentCheck.solution
  }
}

// Exportar la URL base por defecto
export const API_BASE_URL = getApiBaseUrl()

// Log de configuración en desarrollo (DESHABILITADO - ya se muestra en getApiBaseUrl)
// if (import.meta.env.DEV) {
//   const config = getApiConfig()
//   console.log('🔧 API Configuration:', {
//     baseUrl: config.baseUrl,
//     pageProtocol: window.location.protocol,
//     pageHost: window.location.host
//   })
//   
//   if (config.mixedContentIssue) {
//     console.error('❌ Mixed Content Issue Detected!')
//     console.error('📝 Message:', config.mixedContentMessage)
//     console.error('💡 Solution:', config.mixedContentSolution)
//   }
// }
