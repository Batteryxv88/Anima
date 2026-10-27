import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import { getFirebaseApp } from './shared/firebase'
import './app/styles.css'
import './shared/i18n'

getFirebaseApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
