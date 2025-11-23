import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./views/Login.tsx";
import { RequireAuth } from "./guards/RequiredAuth.tsx";
import { RequireUnauth } from "./guards/RequiredUnauth.tsx";
import ChatApp from "./views/rooms/Rooms.tsx";
import { WebSocketProvider } from "./context/WSContext.tsx";
import { Register } from "./views/Register.tsx";
import { ThemeProvider } from "./context/ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <div style={{ width: "100vw", height: "100vh" }}>
    <StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <WebSocketProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<RequireUnauth />}>
                  <Route path="/" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>
                <Route element={<RequireAuth />}>
                  <Route path="/rooms" element={<ChatApp />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>
  </div>,
);
