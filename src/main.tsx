import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { reportWebVitals } from './lib/monitoring/webVitals'
import './index.css'
import './styles/theme.css'

// Ensure dark mode is never enabled (dark mode removed)
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