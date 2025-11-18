// app/ui/src/hooks/useAuthenticatedImage.ts
import { useState, useEffect } from "react";
import { getAbsoluteApiUrl } from "../services/api";

/**
 * Hook para carregar imagens autenticadas
 * Converte URLs de imagens protegidas em object URLs que podem ser usadas em <img> ou backgroundImage
 */
export function useAuthenticatedImage(
  url: string | null | undefined,
): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url || url.trim() === "") {
      setObjectUrl(null);
      return;
    }

    // Se já é uma URL absoluta externa ou data URL, usar diretamente
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:")
    ) {
      setObjectUrl(url);
      return;
    }

    // Carregar imagem autenticada via fetch
    const loadImage = async () => {
      try {
        const absoluteUrl = getAbsoluteApiUrl(url);

        // Validar URL antes de fazer a requisição
        if (!absoluteUrl || absoluteUrl.trim() === "") {
          setObjectUrl(null);
          return;
        }

        const token = localStorage.getItem("accessToken");

        const response = await fetch(absoluteUrl, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          // 404 significa que a imagem não existe (avatar não cadastrado, por exemplo)
          // Isso é esperado e não deve ser tratado como erro crítico
          // O navegador vai mostrar um erro no console, mas isso é normal
          if (response.status === 404) {
            // Silenciosamente retornar null - o componente vai mostrar o fallback
            setObjectUrl(null);
            return;
          } else {
            console.error(
              `Erro ao carregar imagem: ${response.status} ${response.statusText} - URL: ${absoluteUrl}`,
            );
          }
          setObjectUrl(null);
          return;
        }

        const blob = await response.blob();
        const urlObject = URL.createObjectURL(blob);
        setObjectUrl(urlObject);
      } catch (error) {
        // Erros de rede (CORS, timeout, etc.) são logados
        // Mas 404 não é um erro de rede, é uma resposta válida do servidor
        if (
          error instanceof TypeError &&
          error.message.includes("Failed to fetch")
        ) {
          console.error("Erro de rede ao carregar imagem autenticada:", error);
        }
        setObjectUrl(null);
      }
    };

    loadImage();

    // Cleanup: revogar object URL quando o componente desmontar ou a URL mudar
    return () => {
      if (objectUrl && objectUrl.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  return objectUrl;
}
