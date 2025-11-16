import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './hooks/useAuth.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute'

// ✅ OPTIMIZACIÓN CRÍTICA: Componentes mínimos cargados inicialmente
// Solo LoadingSpinner se carga de inmediato (es pequeño y necesario)
import LoadingSpinner from './components/ui/LoadingSpinner'

// ✅ LAZY LOADING AGRESIVO: Todo se carga bajo demanda
// Login se carga primero (ruta inicial)
const Login = lazy(() => import('./components/auth/Login'))

// Layout y páginas se cargan SOLO después del login exitoso
const Layout = lazy(() => import('./components/layout/Layout'))
const Home = lazy(() => import('./pages/Home'))
const Analizar = lazy(() => import('./pages/Analizar'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Contacto = lazy(() => import('./pages/Contacto'))

// ✅ Componentes pesados se cargan SOLO cuando se necesitan
// ResourcePreloader y MobileOptimizer NO se cargan en login
// Se cargarán automáticamente cuando se importen en otras páginas

// ✅ Componente de Loading optimizado para móvil
const OptimizedLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <LoadingSpinner />
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Cargando...</p>
    </div>
  </div>
)

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-background">
            <Suspense fallback={<OptimizedLoadingFallback />}>
              <Routes>
                {/* ✅ Ruta de login - Primera carga (más ligera) */}
                <Route path="/login" element={<Login />} />
                
                {/* ✅ Rutas protegidas - Se cargan DESPUÉS del login */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Suspense fallback={<OptimizedLoadingFallback />}>
                      <Layout />
                    </Suspense>
                  </ProtectedRoute>
                }>
                  <Route index element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Home />
                    </Suspense>
                  } />
                  <Route path="analizar" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Analizar />
                    </Suspense>
                  } />
                  <Route path="faq" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <FAQ />
                    </Suspense>
                  } />
                  <Route path="contacto" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Contacto />
                    </Suspense>
                  } />
                </Route>
                
                {/* Ruta catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App