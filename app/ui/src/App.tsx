// app/ui/src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import { SyncProvider } from "./contexts/SyncContext";
import { FeedbackProvider } from "./contexts/FeedbackContext";
import { GoogleMapsProvider } from "./contexts/GoogleMapsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import InstallPrompt from "./components/InstallPrompt";
import ErrorBoundary from "./components/ErrorBoundary";
import LoginPage from "./pages/LoginPage";
import StatementPage from "./pages/StatementPage";
import CriarLotePage from "./pages/CriarLotePage";
import ListarLotesPage from "./pages/ListarLotesPage";
import DetalhesLotePage from "./pages/DetalhesLotePage";
import TransacaoPage from "./pages/TransacaoPage";
import OnboardingActivationPage from "./pages/OnboardingActivationPage";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleMapsProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <AuthProvider>
          <SyncProvider>
            <FeedbackProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/ativacao"
                  element={<OnboardingActivationPage />}
                />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <StatementPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route
                  path="/offers"
                  element={
                    <ProtectedRoute>
                      <ListarLotesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/offers/novo"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <CriarLotePage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/offers/:id"
                  element={
                    <ProtectedRoute>
                      <DetalhesLotePage />
                    </ProtectedRoute>
                  }
                />
                {/* Rotas legacy para compatibilidade */}
                <Route
                  path="/lotes"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/offers" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lotes/novo"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/offers/novo" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lotes/:id"
                  element={
                    <ProtectedRoute>
                      <DetalhesLotePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transacoes/:id"
                  element={
                    <ProtectedRoute>
                      <TransacaoPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <InstallPrompt />
            </FeedbackProvider>
          </SyncProvider>
        </AuthProvider>
      </GoogleMapsProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
