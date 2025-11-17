// app/ui/src/pages/LoginPage.tsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CredentialResponse } from '@react-oauth/google';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { googleLogin } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';

const LOGO_PATH = '/assets/dominio-logo-transparencia-colors.png';
const ERROR_MSG_LOGIN_FAILED = 'Falha no login. Verifique suas credenciais.';
const ERROR_MSG_EMAIL_NOT_AUTHORIZED = 'Email não autorizado. Entre em contato com o administrador.';
const ERROR_MSG_GENERIC = 'Erro ao processar login. Tente novamente.';
const LOADING_TEXT = 'Processando login...';
const OLIVE_GREEN_COLOR = '#6B8E23';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirecionar para /offers se já estiver autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/offers', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError(ERROR_MSG_LOGIN_FAILED);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await googleLogin(credentialResponse.credential);
      login(response.accessToken, response.user);
      navigate('/offers', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        setError(ERROR_MSG_EMAIL_NOT_AUTHORIZED);
      } else {
        setError(ERROR_MSG_GENERIC);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setError(ERROR_MSG_LOGIN_FAILED);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-4 relative">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="flex justify-center mb-8">
            <img
              src={LOGO_PATH}
              alt="APP"
              className="h-32 w-auto cursor-pointer"
              onClick={() => window.location.reload()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  window.location.reload();
                }
              }}
            />
          </div>

          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6"
              role="alert"
              aria-live="polite"
            >
              <p className="text-sm">{error}</p>
            </div>
          )}

          {(isLoading || isSubmitting) && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">{LOADING_TEXT}</span>
            </div>
          )}
        </div>
      </div>

      <footer className="py-6 relative z-10">
        <div className="max-w-md w-full mx-auto space-y-4">
          <div className="flex justify-center">
            {!isLoading && !isSubmitting && (
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            )}
          </div>
        </div>
      </footer>

      <div
        className="fixed bottom-0 left-0 right-0 h-[30vh] max-h-[30vh] pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${OLIVE_GREEN_COLOR} 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}
