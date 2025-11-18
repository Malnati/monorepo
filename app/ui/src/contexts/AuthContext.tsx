// app/ui/src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { getMe } from "../services/auth.service";

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

interface User {
  id: number;
  email: string;
  fornecedores: Array<{ id: number; nome: string }>;
  compradores: Array<{ id: number; nome: string }>;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const decoded: any = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp <= currentTime) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setIsLoading(false);
          return;
        }

        // Validar token com backend para garantir que usuário ainda existe no banco
        try {
          const userData = await getMe(storedToken);
          setAccessToken(storedToken);
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } catch (error) {
          // Token inválido ou usuário não encontrado no banco
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setAccessToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setAccessToken(token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, accessToken, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
