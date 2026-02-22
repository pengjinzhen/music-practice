import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './app/App.tsx'

const root = document.getElementById('root')!

try {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  root.innerHTML = `<pre style="color:red;padding:2rem">${e}</pre>`
}

// Catch async errors too
window.addEventListener('error', (e) => {
  root.innerHTML += `<pre style="color:red;padding:2rem">Uncaught: ${e.message}</pre>`
})
window.addEventListener('unhandledrejection', (e) => {
  root.innerHTML += `<pre style="color:red;padding:2rem">Unhandled rejection: ${e.reason}</pre>`
})
