import React, { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { apiService } from '../services/apiService'
import { imageProcessor } from '../utils/imageProcessor'
import Alert from '../components/Alert'

const AnalizarPage = () => {
  const { token } = useAuth()
  const { theme } = useTheme()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    file: null,
    age: '',
    sex: '',
    anatom_site_general: '',
  })

  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [imageMetadata, setImageMetadata] = useState(null)

  // Opciones para los selects
  const sexOptions = [
    { value: 'MALE', label: 'Masculino' },
    { value: 'FEMALE', label: 'Femenino' },
  ]

  const anatomSiteOptions = [
    { value: 'anterior torso', label: 'Torso anterior' },
    { value: 'posterior torso', label: 'Torso posterior' },
    { value: 'head/neck', label: 'Cabeza/Cuello' },
    { value: 'upper extremity', label: 'Extremidad superior' },
    { value: 'lower extremity', label: 'Extremidad inferior' },
    { value: 'palms/soles', label: 'Palmas/Plantas' },
    { value: 'oral/genital', label: 'Oral/Genital' },
  ]

  // Mapeo de clases a nombres legibles
  const classNames = {
    'MEL': 'Melanoma',
    'NV': 'Nevus (lunar benigno)',
    'BCC': 'Carcinoma basocelular',
    'BKL': 'Queratosis benigna',
  }

  // Colores para cada clase
  const classColors = {
    'MEL': 'border-red-300 bg-red-50',
    'NV': 'border-green-300 bg-green-50',
    'BCC': 'border-orange-300 bg-orange-50',
    'BKL': 'border-blue-300 bg-blue-50',
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar imagen
    const validation = imageProcessor.validateImage(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    setError('')
    setFormData({ ...formData, file })

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Analizar metadatos
    try {
      const metadata = await imageProcessor.analyzeMetadata(file)
      setImageMetadata(metadata)
    } catch (err) {
      console.error('Error al analizar metadatos:', err)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResults(null)
    setLoading(true)

    try {
      // Crear FormData para enviar al backend
      const data = new FormData()
      data.append('file', formData.file)
      data.append('age', formData.age)
      data.append('sex', formData.sex)
      data.append('anatom_site_general', formData.anatom_site_general)

      // Enviar a la API
      const response = await apiService.analyzeImage(data, token)

      if (response.success) {
        setResults(response.data)
      } else {
        setError(response.message || 'Error al analizar la imagen')
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      file: null,
      age: '',
      sex: '',
      anatom_site_general: '',
    })
    setPreview(null)
    setResults(null)
    setError('')
    setImageMetadata(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`min-h-screen py-12 ${theme === 'dark' ? 'bg-[#0f1419]' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Análisis de Imagen
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Sube una imagen de la lesión cutánea y completa los datos del paciente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div>
            <div className={`rounded-xl p-8 h-full ${theme === 'dark' ? 'bg-[#1a2332]' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Datos del Análisis
              </h2>

              {error && (
                <Alert
                  type="error"
                  message={error}
                  onClose={() => setError('')}
                  className="mb-4"
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Upload de imagen */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Imagen de la lesión *
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    theme === 'dark' 
                      ? 'border-gray-600 hover:border-cyan-500' 
                      : 'border-gray-300 hover:border-cyan-500'
                  }`}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      required
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {preview ? (
                        <div>
                          <img
                            src={preview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg mb-2"
                          />
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Click para cambiar imagen
                          </p>
                        </div>
                      ) : (
                        <div>
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Click para subir imagen
                          </p>
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            JPEG o PNG (máx. 10MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                  {imageMetadata && (
                    <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {imageMetadata.width}x{imageMetadata.height}px • {imageMetadata.megapixels}MP
                    </div>
                  )}
                </div>

                {/* Edad */}
                <div>
                  <label htmlFor="age" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Edad del paciente *
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="0"
                    max="120"
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-[#0f1419] border-gray-700 text-gray-200 placeholder-gray-500 focus:border-cyan-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-cyan-500'
                    } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                    placeholder="Ej: 45"
                    required
                  />
                </div>

                {/* Sexo */}
                <div>
                  <label htmlFor="sex" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sexo *
                  </label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-[#0f1419] border-gray-700 text-gray-200 focus:border-cyan-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-cyan-500'
                    } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                    required
                  >
                    <option value="">-- Seleccione --</option>
                    {sexOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zona anatómica */}
                <div>
                  <label htmlFor="anatom_site_general" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Zona anatómica *
                  </label>
                  <select
                    id="anatom_site_general"
                    name="anatom_site_general"
                    value={formData.anatom_site_general}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-[#0f1419] border-gray-700 text-gray-200 focus:border-cyan-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-cyan-500'
                    } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                    required
                  >
                    <option value="">-- Seleccione --</option>
                    {anatomSiteOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botones */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading || !formData.file}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Analizando...' : 'Analizar Imagen'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg border font-medium transition-colors ${
                      theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Resultados */}
          <div>
            {loading && (
              <div className={`rounded-xl p-8 ${theme === 'dark' ? 'bg-[#1a2332]' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Analizando imagen...
                  </p>
                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Esto puede tomar unos segundos
                  </p>
                </div>
              </div>
            )}

            {results && !loading && (
              <div className={`rounded-xl p-8 ${theme === 'dark' ? 'bg-[#1a2332]' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  📊 Resultados del Análisis
                </h2>

                <div className="space-y-4">
                  {results.top3.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        theme === 'dark'
                          ? 'bg-[#0f1419] border-gray-700'
                          : classColors[result.class] || 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-cyan-500' : 'text-gray-900'}`}>
                            #{index + 1}
                          </span>
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {classNames[result.class] || result.class}
                            </h3>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Código: {result.class}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-cyan-500' : 'text-gray-900'}`}>
                            {(result.prob * 100).toFixed(1)}%
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Probabilidad
                          </p>
                        </div>
                      </div>
                      <div className={`w-full rounded-full h-2 mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${result.prob * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Disclaimer */}
                <div className={`mt-6 p-4 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-amber-900/20 border-amber-700'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <p className={`text-xs ${theme === 'dark' ? 'text-amber-300' : 'text-amber-800'}`}>
                    ⚠️ <strong>Importante:</strong> Estos resultados son orientativos y NO constituyen un diagnóstico médico. 
                    Consulte siempre a un dermatólogo certificado.
                  </p>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200"
                >
                  Realizar Nuevo Análisis
                </button>
              </div>
            )}

            {!loading && !results && (
              <div className={`rounded-xl p-8 ${theme === 'dark' ? 'bg-[#1a2332]' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-center py-12">
                  <svg
                    className={`mx-auto h-24 w-24 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className={`mt-4 text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Los resultados aparecerán aquí
                  </p>
                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Completa el formulario y haz click en "Analizar Imagen"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalizarPage
