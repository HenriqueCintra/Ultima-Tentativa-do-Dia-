import { StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/Home/HomePage";
import { VehicleSelectionPage } from './pages/escolherVeiculo';
import { Login } from "./pages/auth/Login/Login";
import { Cadastro } from "./pages/auth/Cadastro/Cadastro";
import { ForgotPassword } from "./pages/auth/ForgotPassword/ForgotPassword"; 
import { ChooseTeam } from "./pages/ChooseTeam/ChooseTeam";
import { TutorialPage } from "./pages/Tutorial/TutorialPage";
import { PerfilPage } from "./pages/Perfil/PerfilPage";
import { AuthProvider } from "./contexts/AuthContext";
import { EditarPerfilPage } from "./pages/Perfil/EditarPerfil";
import { ExcluirEquipePage } from "./pages/Perfil/ExcluirEquipe";
import { EditarEquipePage } from "./pages/Perfil/EditarEquipe";
import RankingPage from "./pages/Ranking/RankingPage";
import { MapComponent } from "./pages/mapaRota/MapComponent";
import { createRoot } from "react-dom/client";
import GameSelectionPage from "./pages/GameSelection/GameSelectionPage";

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
          <Route path="/perfil/excluir-equipe" element={<ExcluirEquipePage />} />
          <Route path="/game-selection" element={<GameSelectionPage />} />
          <Route path="/perfil/editar-equipe" element={<EditarEquipePage />} />
          <Route path="/mudar-senha" element={<ForgotPassword />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/game" element={<HomePage />} />
          <Route path="/games" element={<HomePage />} />
          <Route path="/select-vehicle" element={<VehicleSelectionPage />} />
          <Route path="/mapa-rota" element={<MapComponent />} />
          <Route path="/mapa" element={<MapComponent />} />
          <Route path="/choose-team" element={<ChooseTeam/>}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);