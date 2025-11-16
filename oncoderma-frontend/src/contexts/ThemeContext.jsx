import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('oncoderma-theme')
      if (savedTheme) {
        return savedTheme
      }
      // Detect system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  // Use refs for transient state to prevent unnecessary re-renders
  const isTransitioningRef = useRef(false)
  const debounceTimeoutRef = useRef(null)

  // Async localStorage persistence to avoid blocking UI thread
  const persistTheme = useCallback((newTheme) => {
    queueMicrotask(() => {
      try {
        localStorage.setItem('oncoderma-theme', newTheme)
      } catch (error) {
        console.warn('Failed to persist theme:', error)
      }
    })
  }, [])

  // Optimized DOM update with batched operations
  const applyTheme = useCallback((newTheme) => {
    const root = document.documentElement
    
    // Step 1: Disable transitions for instant change
    root.classList.add('theme-switching')
    
    // Step 2: Apply theme in next frame (batched)
    requestAnimationFrame(() => {
      root.setAttribute('data-theme', newTheme)
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          newTheme === 'dark' ? '#0c1220' : '#f1f5f9'
        )
      }
      
      // Step 3: Force reflow to apply changes immediately
      root.offsetHeight
      
      // Step 4: Re-enable transitions in next frame
      requestAnimationFrame(() => {
        root.classList.remove('theme-switching')
        isTransitioningRef.current = false
      })
    })
    
    // Persist theme asynchronously
    persistTheme(newTheme)
  }, [persistTheme])

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // Only auto-change if no saved preference
      const savedTheme = localStorage.getItem('oncoderma-theme')
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // Debounced toggle with transition lock
  const toggleTheme = useCallback(() => {
    // Prevent clicks during transition
    if (isTransitioningRef.current) return
    
    // Clear any pending toggle
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    // Debounce the actual toggle (100ms)
    debounceTimeoutRef.current = setTimeout(() => {
      isTransitioningRef.current = true
      setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
    }, 100)
  }, [])

  const setLightTheme = useCallback(() => {
    if (theme !== 'light' && !isTransitioningRef.current) {
      isTransitioningRef.current = true
      setTheme('light')
    }
  }, [theme])
  
  const setDarkTheme = useCallback(() => {
    if (theme !== 'dark' && !isTransitioningRef.current) {
      isTransitioningRef.current = true
      setTheme('dark')
    }
  }, [theme])

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isTransitioning: isTransitioningRef.current
  }), [theme, toggleTheme, setLightTheme, setDarkTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
