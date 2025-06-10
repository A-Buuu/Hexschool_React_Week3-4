import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 引入 css
import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
