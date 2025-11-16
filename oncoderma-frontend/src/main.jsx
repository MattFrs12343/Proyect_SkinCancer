import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Sin optimizaciones que causen lag

// Configurar error boundary global
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

// Forzar redirección al HOME al cargar la aplicación
window.addEventListener('load', () => {
  const currentPath = window.location.pathname
  // Si no está en login y no está ya en home, redirigir
  if (currentPath !== '/login' && currentPath !== '/' && currentPath !== '/home') {
    window.history.replaceState(null, '', '/')
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)