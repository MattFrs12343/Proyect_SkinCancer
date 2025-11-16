# Implementation Plan - Theme Toggle Performance Optimization

- [x] 1. Consolidate theme implementations into single optimized context


  - Remove duplicate theme context files (`hooks/useTheme.jsx` and `hooks/useOptimizedTheme.jsx`)
  - Update `contexts/ThemeContext.jsx` with all optimizations (debouncing, transition locking, async persistence)
  - Implement refs for transient state (isTransitioning) to prevent unnecessary re-renders
  - Add memoization for context value and callback functions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_



- [ ] 2. Optimize CSS for instant theme switching
  - Add `.theme-switching` class to disable all transitions during theme change
  - Remove or optimize the global `*` selector transitions to specific components only
  - Add `will-change` hints for theme-dependent properties (background-color, color, border-color)

  - Implement CSS containment for isolated components (cards, buttons)
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [ ] 3. Implement optimized DOM update strategy
  - Create batched DOM update function using requestAnimationFrame
  - Add transition disabling before theme attribute change
  - Force reflow after theme application

  - Re-enable transitions in next animation frame
  - Update meta theme-color tag for mobile browsers
  - _Requirements: 1.1, 1.2, 2.4_

- [ ] 4. Add debouncing and transition locking
  - Implement 100ms debounce for toggleTheme function

  - Add transition lock flag to prevent concurrent toggles
  - Clear pending timeouts on component unmount
  - Ignore toggle attempts during active transitions
  - _Requirements: 1.4, 4.5_



- [ ] 5. Implement async localStorage persistence
  - Move localStorage writes to queueMicrotask for non-blocking execution
  - Add error handling for quota exceeded and private browsing scenarios
  - Ensure theme state updates immediately while persistence happens async
  - _Requirements: 1.5_



- [ ] 6. Update Navbar component with optimized theme toggle
  - Update import to use consolidated ThemeContext
  - Add disabled state to toggle button during transitions


  - Ensure touch target is minimum 44x44px for mobile
  - Add touch-action: manipulation to prevent double-tap zoom
  - Update button styling for instant visual feedback
  - _Requirements: 4.1, 4.2, 4.3, 4.4_




- [ ] 7. Update App.jsx to use consolidated theme context
  - Change ThemeProvider import from `hooks/useTheme.jsx` to `contexts/ThemeContext.jsx`
  - Verify theme application on root element
  - _Requirements: 3.1, 3.4_

- [ ] 8. Add mobile-specific CSS optimizations
  - Reduce transition durations for mobile devices (0.2s instead of 0.3s)
  - Add `-webkit-tap-highlight-color: transparent` to interactive elements
  - Optimize transform properties for GPU acceleration


  - _Requirements: 2.2, 4.3_

- [ ] 9. Verify and test theme switching performance
  - Test theme toggle responds within 16ms
  - Verify no layout thrashing during theme switch
  - Test rapid clicking doesn't cause race conditions
  - Verify theme persists across page reloads
  - Test on mobile devices (iOS Safari, Chrome Android)
  - Verify 44x44px touch targets on mobile
  - Test keyboard navigation (Enter/Space keys)
  - _Requirements: 1.1, 1.4, 4.1, 4.2, 4.5_

- [ ] 10. Clean up and remove unused code
  - Delete `src/hooks/useTheme.jsx` file
  - Delete `src/hooks/useOptimizedTheme.jsx` file
  - Search for any remaining imports of deleted files
  - Remove any unused theme-related utilities
  - _Requirements: 3.2_
