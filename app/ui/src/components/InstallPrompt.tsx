// app/ui/src/components/InstallPrompt.tsx
import { useState, useEffect } from "react";
import { ICON_MAP } from "../utils/icons";

const PROMPT_TITLE = "Instalar aplicativo";
const PROMPT_DESCRIPTION =
  "Adicione APP à sua tela inicial para acesso rápido e experiência completa.";
const INSTALL_BUTTON_TEXT = "Instalar";
const DISMISS_BUTTON_TEXT = "Agora não";
const DISMISSED_KEY = "dominio_install_prompt_dismissed";
const PROMPT_DELAY_MS = 5000;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já dispensou o prompt
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      return;
    }

    // Verificar se já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Aguardar um pouco antes de mostrar para não ser intrusivo
      setTimeout(() => setShowPrompt(true), PROMPT_DELAY_MS);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA instalado com sucesso");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div
      className="
        fixed bottom-20 left-4 right-4 z-40
        bg-white dark:bg-gray-800
        rounded-2xl shadow-2xl
        p-4
        animate-in slide-in-from-bottom duration-300
      "
      role="dialog"
      aria-labelledby="install-prompt-title"
      aria-describedby="install-prompt-description"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <ICON_MAP.download
            className="h-6 w-6 text-white"
            aria-hidden="true"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            id="install-prompt-title"
            className="text-sm font-semibold text-text-light-primary dark:text-text-dark-primary mb-1"
          >
            {PROMPT_TITLE}
          </h3>
          <p
            id="install-prompt-description"
            className="text-sm text-text-light-secondary dark:text-text-dark-secondary"
          >
            {PROMPT_DESCRIPTION}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleDismiss}
          className="
            flex-1 px-4 py-2 rounded-lg
            text-sm font-medium
            text-text-light-secondary dark:text-text-dark-secondary
            hover:bg-gray-100 dark:hover:bg-gray-700
            transition-colors
          "
        >
          {DISMISS_BUTTON_TEXT}
        </button>
        <button
          onClick={handleInstall}
          className="
            flex-1 px-4 py-2 rounded-lg
            text-sm font-semibold
            bg-primary text-white
            hover:bg-opacity-90
            active:scale-95
            transition-all
          "
        >
          {INSTALL_BUTTON_TEXT}
        </button>
      </div>
    </div>
  );
}
