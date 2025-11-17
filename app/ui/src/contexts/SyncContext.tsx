// app/ui/src/contexts/SyncContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  data: unknown;
  timestamp: number;
}

interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: PendingOperation[];
  addPendingOperation: (operation: Omit<PendingOperation, 'id' | 'timestamp'>) => void;
  removePendingOperation: (id: string) => void;
  syncPendingOperations: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

const PENDING_OPS_KEY = 'dominio_pending_operations';

export function SyncProvider({ children }: { children: ReactNode }) {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);

  // Carregar operações pendentes do localStorage ao inicializar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PENDING_OPS_KEY);
      if (stored) {
        setPendingOperations(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar operações pendentes:', error);
    }
  }, []);

  // Salvar operações pendentes no localStorage quando mudarem
  useEffect(() => {
    try {
      localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(pendingOperations));
    } catch (error) {
      console.error('Erro ao salvar operações pendentes:', error);
    }
  }, [pendingOperations]);

  // Sincronizar automaticamente quando ficar online
  useEffect(() => {
    if (isOnline && pendingOperations.length > 0 && !isSyncing) {
      syncPendingOperations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const addPendingOperation = (operation: Omit<PendingOperation, 'id' | 'timestamp'>) => {
    const newOperation: PendingOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: Date.now(),
    };
    setPendingOperations((prev) => [...prev, newOperation]);
  };

  const removePendingOperation = (id: string) => {
    setPendingOperations((prev) => prev.filter((op) => op.id !== id));
  };

  const syncPendingOperations = async () => {
    if (!isOnline || pendingOperations.length === 0 || isSyncing) {
      return;
    }

    setIsSyncing(true);
    
    try {
      // Aqui seria implementada a lógica real de sincronização
      // Por enquanto, simula o processo
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Remove as operações que foram sincronizadas com sucesso
      // Em uma implementação real, isso seria feito após cada operação ser confirmada
      setPendingOperations([]);
    } catch (error) {
      console.error('Erro ao sincronizar operações:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingOperations,
        addPendingOperation,
        removePendingOperation,
        syncPendingOperations,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
