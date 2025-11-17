// app/uisrc/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const TOKEN_KEY = 'accessToken';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || '';
      // Se o erro 400 for sobre fornecedor não associado, tratar como erro de autenticação
      if (typeof errorMessage === 'string' && (errorMessage.includes('fornecedor associado') || errorMessage.includes('Faça login novamente'))) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Converte uma URL relativa da API para URL absoluta
 * Necessário porque o vite preview não suporta proxy
 */
export function getAbsoluteApiUrl(url: string): string {
  // Se já é uma URL absoluta, retorna como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Normaliza a URL relativa para sempre começar com /
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  
  // Remove /api do final da API_BASE_URL se existir para evitar duplicação
  // A URL relativa já contém /app/api/fotos/...
  let baseUrl = API_BASE_URL;
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
  } else if (baseUrl.endsWith('/app/api')) {
    baseUrl = baseUrl.slice(0, -5);
  }
  
  // Remove barra final da baseUrl se existir
  baseUrl = baseUrl.replace(/\/$/, '');
  
  return `${baseUrl}${cleanUrl}`;
}

export default api;
