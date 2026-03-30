import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { MarketProvider } from './context/MarketContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MarketProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#161b28',
                color: '#e8eaf0',
                border: '1px solid #ffffff20',
                fontFamily: 'Sora, sans-serif',
                fontSize: '13px',
              },
              success: { iconTheme: { primary: '#00c896', secondary: '#0a0d14' } },
              error:   { iconTheme: { primary: '#ff4d6a', secondary: '#0a0d14' } },
            }}
          />
        </MarketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
