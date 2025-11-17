// app/ui/src/services/onboarding.service.ts
import api from './api';

const REGISTER_ENDPOINT = '/onboarding/register';
const ACTIVATE_ENDPOINT = '/onboarding/activate';
const RESEND_ENDPOINT = '/onboarding/resend';

interface RegisterData {
  nome: string;
  email: string;
  senha: string;
}

interface ActivateData {
  email: string;
  token: string;
}

interface ResendData {
  email: string;
}

interface RegisterResponse {
  message: string;
}

interface ActivateResponse {
  message: string;
  user: {
    id: number;
    email: string;
    status: string;
  };
}

interface ResendResponse {
  message: string;
}

/**
 * Registra novo usuário e envia e-mail de ativação
 */
export const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>(REGISTER_ENDPOINT, data);
  return response.data;
};

/**
 * Ativa conta de usuário com token
 */
export const activateAccount = async (data: ActivateData): Promise<ActivateResponse> => {
  const response = await api.post<ActivateResponse>(ACTIVATE_ENDPOINT, data);
  return response.data;
};

/**
 * Reenvia e-mail de ativação
 */
export const resendActivationEmail = async (data: ResendData): Promise<ResendResponse> => {
  const response = await api.post<ResendResponse>(RESEND_ENDPOINT, data);
  return response.data;
};
