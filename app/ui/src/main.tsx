// app/ui/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { reportWebVitals } from "./utils/webVitals";
import ErrorBoundary from "./components/ErrorBoundary";

// Handler global de erros para capturar erros não tratados
window.addEventListener("error", (event) => {
  console.error("[GlobalErrorHandler] ===== ERRO GLOBAL CAPTURADO =====");
  console.error("[GlobalErrorHandler] Mensagem:", event.message);
  console.error("[GlobalErrorHandler] Arquivo:", event.filename);
  console.error("[GlobalErrorHandler] Linha:", event.lineno);
  console.error("[GlobalErrorHandler] Coluna:", event.colno);
  console.error("[GlobalErrorHandler] Erro:", event.error);
  console.error("[GlobalErrorHandler] Stack:", event.error?.stack);
  console.error("[GlobalErrorHandler] Tipo:", event.error?.name);

  // Se for erro de variável não inicializada, tentar identificar
  if (event.message?.includes("Cannot access uninitialized variable")) {
    console.error(
      "[GlobalErrorHandler] ❌ VARIÁVEL NÃO INICIALIZADA DETECTADA",
    );
    console.error("[GlobalErrorHandler] Contexto do erro:", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      stack: event.error?.stack,
    });

    // Capturar stack trace completo
    console.error(
      "[GlobalErrorHandler] Stack trace completo:",
      new Error().stack,
    );
  }
});

// Handler para promessas rejeitadas
window.addEventListener("unhandledrejection", (event) => {
  console.error("[GlobalErrorHandler] ===== PROMISE REJEITADA =====");
  console.error("[GlobalErrorHandler] Razão:", event.reason);
  console.error("[GlobalErrorHandler] Stack:", event.reason?.stack);
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);

// Registrar service worker do PWA
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration failed
    });
  });
}

// Reportar métricas de performance
reportWebVitals();
