import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/Home/HomePage";
import { Login } from "./pages/auth/Login/Login";
import { Cadastro } from "./pages/auth/Cadastro/Cadastro";
import { ForgotPassword } from "./pages/auth/ForgotPassword/ForgotPassword"; 
import { MapComponent } from "./pages/mapaRota/MapComponent";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        <Route path="/" element={<MapComponent />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);