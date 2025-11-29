import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { startVersionCheck } from './utils/versionCheck.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Start version checking in production
if (import.meta.env.PROD) {
  startVersionCheck();
}

