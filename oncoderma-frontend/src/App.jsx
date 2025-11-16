import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { AuthProvider } from './hooks/useAuth.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ResourcePreloader from './components/common/ResourcePreloader'
import MobileOptimizer from './components/common/MobileOptimizer'

// Lazy loading de componentes para code splitting
const Login = lazy(() => import('./components/auth/Login'))
const Layout = lazy(() => import('./components/layout/Layout'))
const Home = lazy(() => import('./pages/Home'))
const Analizar = lazy(() => import('./pages/Analizar'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Contacto = lazy(() => import('./pages/Contacto'))

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-background transition-colors duration-300">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Ruta de login */}
                <Route path="/login" element={<Login />} />
                
                {/* Rutas protegidas */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Home />} />
                  <Route path="analizar" element={<Analizar />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="contacto" element={<Contacto />} />
                </Route>
                
                {/* Ruta catch-all - redirigir a home */}
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