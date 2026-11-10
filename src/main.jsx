import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App'

// só no modo de desenvolvimento: facilita inspecionar animações pelo console
if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger })
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
