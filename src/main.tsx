import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { App } from './app'
import { getFirebaseApp } from './shared/firebase'
import './app/styles.css'
import './shared/i18n'

registerSW({ immediate: true })
getFirebaseApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
