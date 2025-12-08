import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { reportWebVitals } from './lib/monitoring/webVitals'
import './index.css'
import './styles/theme.css'

/**
 * Light Mode Only Configuration
 * 
 * BookMe currently operates in light mode only for production.
 * Dark mode infrastructure exists in theme.css but is disabled.
 * 
 * To enable dark mode in future:
 * 1. Remove the lines below that disable dark mode
 * 2. Uncomment dark mode styles in theme.css
 * 3. Implement useTheme hook for theme management
 * 4. Add ThemeToggle component to UI
 * 5. See docs/ui/DESIGN_SYSTEM.md for full implementation guide
 */
document.documentElement.classList.remove('dark');
localStorage.removeItem('theme');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Initialize Web Vitals monitoring
reportWebVitals();