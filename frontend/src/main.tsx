import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { StacksProvider } from '@/lib/stacks.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StacksProvider>
      <App />
    </StacksProvider>
  </StrictMode>,
)
