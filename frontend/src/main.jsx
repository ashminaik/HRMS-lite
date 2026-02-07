import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Statistics from './pages/Statistics.jsx'
import Reports from './pages/Reports.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
