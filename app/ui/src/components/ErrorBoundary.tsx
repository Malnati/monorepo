// app/ui/src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorStack: string | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorStack: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorStack: error.stack || null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] ===== ERRO CAPTURADO =====");
    console.error("[ErrorBoundary] Erro:", error);
    console.error("[ErrorBoundary] Mensagem:", error.message);
    console.error("[ErrorBoundary] Nome:", error.name);
    console.error("[ErrorBoundary] Stack:", error.stack);
    console.error("[ErrorBoundary] ErrorInfo:", errorInfo);
    console.error("[ErrorBoundary] ComponentStack:", errorInfo.componentStack);

    // Tentar identificar a variável quebrada
    const errorMessage = error.message || "";
    if (errorMessage.includes("Cannot access uninitialized variable")) {
      console.error(
        "[ErrorBoundary] ❌ ERRO: Variável não inicializada detectada",
      );
      console.error("[ErrorBoundary] Stack trace completo:", new Error().stack);

      // Capturar todas as variáveis do escopo global
      console.error("[ErrorBoundary] Variáveis do escopo:", {
        window: typeof window,
        document: typeof document,
        navigator: typeof navigator,
        React: typeof React,
      });
    }

    this.setState({
      error,
      errorInfo,
      errorStack: error.stack || null,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-sm font-bold text-red-600 mb-4">
              Erro na aplicação
            </h1>
            <p className="text-gray-700 mb-4">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-600 mb-2">
                  Detalhes do erro
                </summary>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {this.state.error.message}
                  {this.state.errorStack && `\n\n${this.state.errorStack}`}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
