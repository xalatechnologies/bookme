import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { reportWebVitals } from './lib/monitoring/webVitals'
import './index.css'
import './styles/theme.css'

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