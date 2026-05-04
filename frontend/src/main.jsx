import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: '14px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>
)
