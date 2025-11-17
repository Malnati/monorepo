// app/ui/src/pages/OnboardingActivationPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { activateAccount, resendActivationEmail } from '../services/onboarding.service';
import { useFeedback } from '../hooks/useFeedback';
import { brandTokens } from '../constants/brand';

const LOGO_PATH = brandTokens.logo;

type ActivationState = 'loading' | 'success' | 'expired' | 'error' | 'invalid';

const STATE_MESSAGES = {
  loading: 'Ativando sua conta...',
  success: 'Conta ativada com sucesso!',
  expired: 'Link expirado',
  error: 'Erro na ativação',
  invalid: 'Link inválido',
};

const STATE_DESCRIPTIONS = {
  loading: 'Por favor, aguarde enquanto processamos sua ativação.',
  success: 'Sua conta foi ativada. Você já pode fazer login.',
  expired: 'Este link de ativação expirou após 24 horas.',
  error: 'Não foi possível ativar sua conta no momento.',
  invalid: 'Este link de ativação é inválido ou já foi utilizado.',
};

export default function OnboardingActivationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useFeedback();
  
  const [state, setState] = useState<ActivationState>('loading');
  const [email, setEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [resendEmail, setResendEmail] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (!token || !emailParam) {
      setState('invalid');
      return;
    }

    setEmail(emailParam);
    handleActivation(emailParam, token);
  }, [searchParams]);

  const handleActivation = async (emailParam: string, token: string) => {
    try {
      setState('loading');
      await activateAccount({ email: emailParam, token });
      setState('success');
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Activation error:', error);
      
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage.includes('expirado') || errorMessage.includes('expired')) {
        setState('expired');
      } else if (errorMessage.includes('já ativada') || errorMessage.includes('already activated')) {
        setState('success');
        setTimeout(() => navigate('/login'), 3000);
      } else if (errorMessage.includes('inválido') || errorMessage.includes('invalid')) {
        setState('invalid');
      } else {
        setState('error');
      }
    }
  };

  const handleResend = async () => {
    if (!resendEmail) {
      showToast({
        variant: 'error',
        title: 'E-mail obrigatório',
        description: 'Informe seu e-mail para reenviar o link.',
      });
      return;
    }

    setIsResending(true);

    try {
      await resendActivationEmail({ email: resendEmail });
      showToast({
        variant: 'success',
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada.',
      });
      setResendEmail('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao reenviar e-mail';
      showToast({
        variant: 'error',
        title: 'Falha no reenvio',
        description: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'loading':
        return (
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        );
      case 'success':
        return (
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <span className="material-symbols-rounded text-sm text-primary dark:text-green-400" style={{ fontSize: '3rem' }}>check_circle</span>
          </div>
        );
      case 'expired':
      case 'error':
      case 'invalid':
        return (
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <span className="material-symbols-rounded text-sm text-red-700 dark:text-red-400" style={{ fontSize: '3rem' }}>error</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <img
          src={LOGO_PATH}
          alt={`${brandTokens.name} Logo`}
          className="h-12 w-auto"
        />
      </div>

      {/* Card principal */}
      <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-lg shadow-lg p-8 space-y-6">
        {/* Ícone de estado */}
        <div className="flex justify-center">
          {getStateIcon()}
        </div>

        {/* Título e descrição */}
        <div className="text-center space-y-2">
          <h1 className="text-sm font-bold text-dark-gray dark:text-gray-100">
            {STATE_MESSAGES[state]}
          </h1>
          <p className="text-sm text-medium-gray dark:text-gray-400">
            {STATE_DESCRIPTIONS[state]}
          </p>
        </div>

        {/* Ações baseadas no estado */}
        {state === 'success' && (
          <div className="space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Ir para login
            </button>
          </div>
        )}

        {(state === 'expired' || state === 'error' || state === 'invalid') && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="resend-email" className="block text-sm font-medium text-dark-gray dark:text-gray-200">
                E-mail
              </label>
              <input
                id="resend-email"
                type="email"
                value={resendEmail || email}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-dark-surface dark:text-gray-100"
              />
            </div>
            
            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Reenviando...' : 'Reenviar link de ativação'}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 border border-dark-gray dark:border-gray-600 text-dark-gray dark:text-gray-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
            >
              Voltar ao login
            </button>
          </div>
        )}

        {state === 'loading' && (
          <div className="text-center">
            <p className="text-sm text-medium-gray dark:text-gray-400">
              Este processo pode levar alguns segundos...
            </p>
          </div>
        )}
      </div>

      {/* Texto legal */}
      <div className="mt-8 max-w-md text-center">
        <p className="text-xs text-medium-gray dark:text-gray-500">
          Ao ativar sua conta, você concorda com nossos Termos de Uso e Política de Privacidade.
          Seus dados são protegidos conforme a LGPD.
        </p>
      </div>
    </div>
  );
}
