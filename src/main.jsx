import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import netlifyIdentity from 'netlify-identity-widget'

// Initialize Netlify Identity and expose on window for API utils
netlifyIdentity.init()
// Optional: make available for api.js to read currentUser token
if (typeof window !== 'undefined') {
  window.netlifyIdentity = netlifyIdentity
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
