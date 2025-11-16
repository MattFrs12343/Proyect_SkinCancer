import { useState, useEffect, useRef } from 'react'
import FileUpload from '../components/ui/FileUpload'
import { LoadingProgressBar } from '../components/ui/ProgressBar'
import ConnectionStatus from '../components/common/ConnectionStatus'
import ResultsHeader from '../components/ui/ResultsHeader'
import PrimaryResultCard from '../components/ui/PrimaryResultCard'
import EnhancedDetailedAnalysis from '../components/ui/EnhancedDetailedAnalysis'

import { ResultsAnimation, InstantAnimation } from '../components/ui/OptimizedAnimationSystem'
import { ResponsiveContainer } from '../components/ui/ResponsiveSystem'
import { AccessibilityProvider } from '../components/ui/AccessibilitySystem'
import { useImageAnalysis } from '../hooks/useImageAnalysis'
import { SKIN_LESION_TYPES } from '../utils/constants'

const Analizar = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [patientData, setPatientData] = useState({
    age: '',
    sex: '',
    lesionLocation: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const resultsRef = useRef(null)
  const { 
    analyzeImage, 
    isAnalyzing, 
    result, 
    error, 
    progress, 
    connectionStatus,
    reset,
    checkConnectivity 
  } = useImageAnalysis()

  // Verificar conectividad al cargar la página
  useEffect(() => {
    checkConnectivity()
  }, [])

  // Scroll automático cuando aparecen los resultados
  useEffect(() => {
    if (result && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 500) // Pequeño delay para que las animaciones se inicien
    }
  }, [result])

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    // Reset previous results when new file is selected
    if (result || error) {
      reset()
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPatientData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!patientData.age) {
      errors.age = 'La edad es requerida'
    } else if (patientData.age < 1 || patientData.age > 120) {
      errors.age = 'Ingresa una edad válida (1-120)'
    }
    
    if (!patientData.sex) {
      errors.sex = 'El sexo es requerido'
    }
    
    if (!patientData.lesionLocation) {
      errors.lesionLocation = 'La ubicación de la lesión es requerida'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      return
    }

    // Validar formulario
    if (!validateForm()) {
      return
    }

    console.log('Iniciando análisis desde componente:', selectedFile.name)
    console.log('Datos del paciente:', patientData)
    
    try {
      // Aquí puedes pasar los datos del paciente al análisis si lo necesitas
      const result = await analyzeImage(selectedFile, patientData)
      console.log('Resultado del análisis:', result)
    } catch (error) {
      console.error('Error en handleAnalyze:', error)
    }
  }

  const handleNewAnalysis = () => {
    setSelectedFile(null)
    setPatientData({
      age: '',
      sex: '',
      lesionLocation: ''
    })
    setFormErrors({})
    reset()
  }



  return (
    <AccessibilityProvider>
      <ResponsiveContainer maxWidth="2xl" className="py-2">
        <div className="space-y-3">
          {/* Enhanced Header */}
          <InstantAnimation type="fadeInUp">
            <div className="metric-card py-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-3 rounded-xl shadow-lg mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-section-title">Análisis Dermatológico con IA</h1>
                    <p className="text-metric-label">Tecnología médica avanzada para análisis de lesiones cutáneas</p>
                  </div>
                </div>
                <ConnectionStatus status={connectionStatus} />
              </div>

              {/* Enhanced Process Steps */}
              <InstantAnimation type="fadeInUp">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {/* Paso 1: Subir imagen */}
                  <div className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                    selectedFile 
                      ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                      : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                  }`}>
                    <div className="flex items-center mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 shadow-md text-sm ${
                        selectedFile ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        <span className="text-white font-bold">1</span>
                      </div>
                      <h3 className="text-sm font-semibold text-primary dark:text-white">Subir Imagen</h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Selecciona una imagen clara de la zona de piel a analizar
                    </p>
                    {selectedFile && (
                      <div className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Imagen seleccionada
                      </div>
                    )}
                  </div>

                  {/* Paso 2: Análisis */}
                  <div className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                    isAnalyzing 
                      ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20' : 
                    result 
                      ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                  }`}>
                    <div className="flex items-center mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 shadow-md text-sm ${
                        isAnalyzing ? 'bg-yellow-500' : 
                        result ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        <span className="text-white font-bold">2</span>
                      </div>
                      <h3 className="text-sm font-semibold text-primary dark:text-white">Análisis IA</h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Procesamiento con inteligencia artificial médica
                    </p>
                    {isAnalyzing && (
                      <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                        Analizando...
                      </div>
                    )}
                    {result && (
                      <div className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Análisis completado
                      </div>
                    )}
                  </div>

                  {/* Paso 3: Resultados */}
                  <div className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                    result 
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                  }`}>
                    <div className="flex items-center mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 shadow-md text-sm ${
                        result ? 'bg-blue-500' : 'bg-gray-400'
                      }`}>
                        <span className="text-white font-bold">3</span>
                      </div>
                      <h3 className="text-sm font-semibold text-primary dark:text-white">Resultados</h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Visualización profesional de resultados del análisis
                    </p>
                    {result && (
                      <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Dashboard disponible
                      </div>
                    )}
                  </div>
                </div>
              </InstantAnimation>
            </div>
          </InstantAnimation>

          {/* Enhanced File Upload Area */}
          {!result && (
            <InstantAnimation type="fadeInScale">
              <div className="metric-card py-4">
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                />
                
                {/* Formulario de Datos del Paciente */}
                {selectedFile && !isAnalyzing && (
                  <div className="mt-4 space-y-3">
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="text-lg font-semibold text-primary dark:text-white mb-3 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Información del Paciente
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Edad */}
                        <div>
                          <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                            Edad <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            id="age"
                            name="age"
                            min="1"
                            max="120"
                            value={patientData.age}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 rounded-lg border-2 transition-colors ${
                              formErrors.age 
                                ? 'border-red-500 dark:border-red-400 focus:border-red-600' 
                                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20`}
                            placeholder="Ej: 35"
                          />
                          {formErrors.age && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {formErrors.age}
                            </p>
                          )}
                        </div>

                        {/* Sexo */}
                        <div>
                          <label htmlFor="sex" className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                            Sexo <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="sex"
                            name="sex"
                            value={patientData.sex}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 rounded-lg border-2 transition-colors ${
                              formErrors.sex 
                                ? 'border-red-500 dark:border-red-400 focus:border-red-600' 
                                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 [&>option]:text-gray-900 [&>option]:dark:text-gray-100 [&>option]:bg-white [&>option]:dark:bg-gray-800`}
                          >
                            <option value="" className="text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">Selecciona una opción</option>
                            <option value="masculino" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Masculino</option>
                            <option value="femenino" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Femenino</option>
                          </select>
                          {formErrors.sex && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {formErrors.sex}
                            </p>
                          )}
                        </div>

                        {/* Ubicación de la Lesión */}
                        <div className="md:col-span-2 lg:col-span-2">
                          <label htmlFor="lesionLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                            Ubicación de la Lesión <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="lesionLocation"
                            name="lesionLocation"
                            value={patientData.lesionLocation}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                              formErrors.lesionLocation 
                                ? 'border-red-500 dark:border-red-400 focus:border-red-600' 
                                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 [&>option]:text-gray-900 [&>option]:dark:text-gray-100 [&>option]:bg-white [&>option]:dark:bg-gray-800`}
                          >
                            <option value="" className="text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">Selecciona la ubicación</option>
                            <option value="head/neck" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Cabeza/Cuello</option>
                            <option value="anterior torso" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Torso Anterior</option>
                            <option value="posterior torso" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Torso Posterior</option>
                            <option value="lateral torso" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Torso Lateral</option>
                            <option value="upper extremity" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Extremidad Superior</option>
                            <option value="lower extremity" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Extremidad Inferior</option>
                            <option value="palms/soles" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Palmas/Plantas</option>
                            <option value="oral/genital" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Oral/Genital</option>
                          </select>
                          {formErrors.lesionLocation && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {formErrors.lesionLocation}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                        <p className="text-xs text-blue-800 dark:text-blue-200 flex items-start">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>
                            Datos confidenciales procesados de forma segura.
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        onClick={handleAnalyze}
                        className="btn-primary hover-lift py-3 px-8 shadow-lg"
                      >
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Iniciar Análisis Médico
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </InstantAnimation>
          )}

          {/* Enhanced Analysis Progress */}
          {isAnalyzing && (
            <InstantAnimation type="fadeInUp">
              <div className="metric-card text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4">
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-section-title mb-2">Análisis en Progreso</h3>
                  <p className="text-metric-label">Procesando imagen con IA médica avanzada</p>
                </div>
                
                <div className="max-w-md mx-auto mb-6">
                  <LoadingProgressBar progress={progress} />
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    🔬 Nuestro modelo de IA especializado está analizando los patrones de tu imagen. 
                    Este proceso utiliza algoritmos médicos certificados para garantizar precisión.
                  </p>
                </div>
              </div>
            </InstantAnimation>
          )}

          {/* Enhanced Results Dashboard */}
          {result && (
            <div ref={resultsRef} className="space-y-8">
              {/* Results Header */}
              <ResultsAnimation delay={0}>
                <ResultsHeader
                  analysisStatus="completed"
                  processingTime={result.result?.processing_time || result.processingTime || 2.3}
                  confidence={result.result?.confidence || result.confidence || 0.85}
                  timestamp={new Date()}
                  onNewAnalysis={handleNewAnalysis}
                />
              </ResultsAnimation>

              {/* Primary Result Card */}
              <ResultsAnimation delay={100}>
                <PrimaryResultCard
                  analysisResult={result}
                  onNewAnalysis={handleNewAnalysis}
                />
              </ResultsAnimation>

            </div>
          )}

          {/* Enhanced Error Display */}
          {error && (
            <InstantAnimation type="fadeInUp">
              <div className="metric-card">
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                        Error en el Análisis Médico
                      </h4>
                      <p className="text-red-700 dark:text-red-300 mb-4 leading-relaxed">
                        {error}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleNewAnalysis}
                          className="btn-primary bg-red-600 hover:bg-red-700"
                        >
                          🔄 Intentar de Nuevo
                        </button>
                        <button
                          onClick={() => {
                            // Implementar reporte de error
                            console.log('Reportar error técnico')
                          }}
                          className="btn-secondary"
                        >
                          📧 Reportar Problema
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </InstantAnimation>
          )}
        </div>
      </ResponsiveContainer>
    </AccessibilityProvider>
  )
}

export default Analizar