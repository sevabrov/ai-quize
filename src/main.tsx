import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { queryClient } from './lib/queryClient'
import { initPixel } from './lib/pixel'
import './index.css'

// До рендеру: PageView має піти навіть якщо застосунок впаде в ErrorBoundary
initPixel()

const container = document.getElementById('root')
if (!container) throw new Error('Не знайдено #root у index.html')

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
