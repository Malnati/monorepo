// app/uisrc/services/auth.service.ts
import axios from "axios";

// VITE_API_BASE_URL é obrigatória em produção, mas pode ter fallback em desenvolvimento
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : "");
if (!API_BASE_URL && !import.meta.env.DEV) {
  throw new Error(
    "VITE_API_BASE_URL não está configurada. Configure no docker-compose.yml ou .env",
  );
}

// Remove /api do final da API_BASE_URL se existir para evitar duplicação
// A API_BASE_URL já contém /api quando configurada para produção
let baseUrl = API_BASE_URL;
if (baseUrl.endsWith("/api")) {
  baseUrl = baseUrl.slice(0, -4);
} else if (baseUrl.endsWith("/app/api")) {
  baseUrl = baseUrl.slice(0, -5);
}
baseUrl = baseUrl.replace(/\/$/, "");

const AUTH_ENDPOINT = `${baseUrl}/app/api/auth`;

export interface GoogleLoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    fornecedores: Array<{ id: number; nome: string }>;
    compradores: Array<{ id: number; nome: string }>;
  };
}

export async function googleLogin(
  idToken: string,
): Promise<GoogleLoginResponse> {
  const response = await axios.post<GoogleLoginResponse>(
    `${AUTH_ENDPOINT}/google`,
    {
      idToken,
    },
  );
  return response.data;
}

export async function getMe(
  accessToken: string,
): Promise<GoogleLoginResponse["user"]> {
  try {
    const response = await axios.get<GoogleLoginResponse["user"]>(
      `${AUTH_ENDPOINT}/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    // Se o erro for 401, significa que o token é inválido ou o usuário não existe
    if (error.response?.status === 401) {
      throw new Error("Token inválido ou usuário não autorizado");
    }
    throw error;
  }
}
