import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/Home/HomePage";
import { Login } from "./pages/auth/Login/Login";
import { Cadastro } from "./pages/auth/Cadastro/Cadastro";
import { ForgotPassword } from "./pages/auth/ForgotPassword/ForgotPassword"; 
import { TutorialPage } from "./pages/Tutorial/TutorialPage";
import { PerfilPage } from "./pages/Perfil/PerfilPage";
import { AuthProvider } from "./contexts/AuthContext";
import { EditarPerfilPage } from "./pages/Perfil/EditarPerfil";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uidb64/:token" element={<ForgotPassword />} />
          <Route path="/tutorial" element={<TutorialPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/perfil/editar" element={<EditarPerfilPage />} />
          <Route path="/mudar-senha" element={<ForgotPassword />} /> {}
          <Route path="/ranking" element={<HomePage />} /> {}
          <Route path="/game" element={<HomePage />} /> {}
          <Route path="/games" element={<HomePage />} /> {}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);