// Servicio para manejar todas las peticiones a la API
class ApiService {
  constructor() {
    // URL base de la API - cambiar según el entorno
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    this.timeout = 30000 // 30 segundos
  }

  /**
   * Método genérico para hacer peticiones con timeout
   */
  async makeRequest(url, options = {}) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Timeout: La solicitud tardó demasiado')
      }
      throw error
    }
  }

  /**
   * Login de usuario
   */
  async login(username, password) {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return {
          success: true,
          token: data.token,
          user: data.user,
        }
      }

      return {
        success: false,
        message: data.message || 'Credenciales inválidas',
      }
    } catch (error) {
      console.error('Error en login:', error)
      return {
        success: false,
        message: error.message || 'Error de conexión con el servidor',
      }
    }
  }

  /**
   * Analizar imagen de piel
   */
  async analyzeImage(formData, token) {
    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // FormData con file, age, sex, anatom_site_general
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Error del servidor: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data,
      }
    } catch (error) {
      console.error('Error al analizar imagen:', error)
      return {
        success: false,
        message: error.message || 'Error al procesar la imagen',
      }
    }
  }

  /**
   * Enviar mensaje de contacto
   */
  async sendContactMessage(messageData, token) {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || 'Mensaje enviado correctamente',
        }
      }

      return {
        success: false,
        message: data.message || 'Error al enviar el mensaje',
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      return {
        success: false,
        message: error.message || 'Error de conexión',
      }
    }
  }
}

export const apiService = new ApiService()
