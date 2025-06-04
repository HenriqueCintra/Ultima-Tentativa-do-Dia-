import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Da sua versão (HEAD)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Da sua versão (HEAD)
import { HomePage } from "./pages/Home/HomePage";
import { VehicleSelectionPage } from './pages/escolherVeiculo';
import { Login } from "./pages/auth/Login/Login";
import { Cadastro } from "./pages/auth/Cadastro/Cadastro";
import { ForgotPassword } from "./pages/auth/ForgotPassword/ForgotPassword";
import { TutorialPage } from "./pages/Tutorial/TutorialPage";
import { PerfilPage } from "./pages/Perfil/PerfilPage";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute"; // Da sua versão (HEAD)
import { EditarPerfilPage } from "./pages/Perfil/EditarPerfil";
import { ExcluirEquipePage } from "./pages/Perfil/ExcluirEquipe";
import { MapComponent } from "./pages/mapaRota/MapComponent";
import { EditarEquipePage } from "./pages/Perfil/EditarEquipePage";
import { RankingPage } from "./pages/Ranking/RankingPage";
import { ChooseTeam } from "./pages/Team/ChooseTeam";

// Criar instância do QueryClient (da sua versão HEAD)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}> {/* Da sua versão (HEAD) */}
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas públicas (combinadas de ambas) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uidb64/:token" element={<ForgotPassword />} />
            <Route path="/tutorial" element={<TutorialPage />} />

            {/* Rotas protegidas (combinadas e usando seu ProtectedRoute) */}
            <Route path="/perfil" element={
              <ProtectedRoute>
                <PerfilPage />
              </ProtectedRoute>
            } />
            <Route path="/perfil/editar" element={
              <ProtectedRoute>
                <EditarPerfilPage />
              </ProtectedRoute>
            } />
            <Route path="/perfil/excluir-equipe" element={
              <ProtectedRoute>
                <ExcluirEquipePage />
              </ProtectedRoute>
            } />
            {/* Nova rota da DEV, protegida */}
            <Route path="/perfil/editar-equipe" element={
              <ProtectedRoute>
                <EditarEquipePage />
              </ProtectedRoute>
            } />
            <Route path="/mudar-senha" element={ // Já estava na sua versão e na dev, mantendo protegida
              <ProtectedRoute>
                <ForgotPassword />
              </ProtectedRoute>
            } />
            {/* Rota /ranking atualizada para RankingPage da DEV, protegida */}
            <Route path="/ranking" element={
              <ProtectedRoute>
                <RankingPage />
              </ProtectedRoute>
            } />
            {/* Rota /game da DEV (e sua), mantendo protegida */}
            <Route path="/game" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            {/* Nova rota /games da DEV, protegida */}
            <Route path="/games" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/select-vehicle" element={ // Já estava em ambas, mantendo protegida
              <ProtectedRoute>
                <VehicleSelectionPage />
              </ProtectedRoute>
            } />
            <Route path="/mapa-rota" element={ // Já estava em ambas, mantendo protegida
              <ProtectedRoute>
                <MapComponent />
              </ProtectedRoute>
            } />
            <Route path="/mapa" element={ // Já estava na sua versão (duplicata de mapa-rota?), mantendo protegida
              <ProtectedRoute>
                <MapComponent />
              </ProtectedRoute>
            } />
            {/* Nova rota /choose-team da DEV, protegida */}
            <Route path="/choose-team" element={
              <ProtectedRoute>
                <ChooseTeam />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      {/* DevTools apenas em desenvolvimento (da sua versão HEAD) */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>
);