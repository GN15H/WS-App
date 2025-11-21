import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './views/Login.tsx'
import { RequireAuth } from './guards/RequiredAuth.tsx'
import { RequireUnauth } from './guards/RequiredUnauth.tsx'
import ChatApp from './views/rooms/Rooms.tsx'
import { WebSocketProvider } from './context/WSContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<RequireUnauth />}>
              <Route path='/' element={<Login />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path='/rooms' element={<ChatApp />} />
            </Route>
            {/* <App /> */}
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </AuthProvider>
  </StrictMode>,
)
