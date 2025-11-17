// app/ui/src/components/OfflineBanner.tsx
import { useState, useEffect } from 'react';
import { ICON_MAP } from '../utils/icons';

const BANNER_TEXT = 'Sem conexão';
const BANNER_DESCRIPTION = 'Você está offline. Algumas funcionalidades podem estar limitadas.';
const RETRY_TEXT = 'Tentar novamente';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isVisible, setIsVisible] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Manter banner visível por 2s para confirmar reconexão
      setTimeout(() => setIsVisible(false), 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50 px-4 py-3
        ${isOnline 
          ? 'bg-green-500' 
          : 'bg-orange-500'
        }
        text-white shadow-lg
        animate-in slide-in-from-top duration-300
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-between gap-4 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          {isOnline ? (
            <ICON_MAP.wifi className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
          ) : (
            <ICON_MAP.wifiOff className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              {isOnline ? 'Conectado' : BANNER_TEXT}
            </p>
            {!isOnline && (
              <p className="text-xs opacity-90 line-clamp-1">
                {BANNER_DESCRIPTION}
              </p>
            )}
          </div>
        </div>
        {!isOnline && (
          <button
            onClick={handleRetry}
            className="
              px-3 py-1.5 rounded-lg text-xs font-medium
              bg-white/20 hover:bg-white/30
              active:scale-95 transition-all
              flex-shrink-0
            "
            aria-label={RETRY_TEXT}
          >
            {RETRY_TEXT}
          </button>
        )}
      </div>
    </div>
  );
}
