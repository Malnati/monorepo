// app/uisrc/components/PurchasedTab.tsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import { LoteResiduo } from '../types';
import OfferCard from './OfferCard';
import LoteCardSkeleton from './LoteCardSkeleton';
import EmptyState from './EmptyState';
import { ICON_MAP, ICON_SOLID_MAP } from '../utils/icons';

const EMPTY_TITLE = 'Nenhum lote encontrado';
const EMPTY_DESCRIPTION = 'Você ainda não possui lotes comprados.';
const ERROR_TITLE = 'Erro ao carregar lotes';
const ERROR_DESCRIPTION = 'Não foi possível carregar seus lotes. Verifique sua conexão e tente novamente.';
const ERROR_BUTTON_TEXT = 'Tentar novamente';

interface MeusLotesResponse {
  lotesVendidos: LoteResiduo[];
  lotesComprados: LoteResiduo[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export default function PurchasedTab() {
  const [lotesComprados, setLotesComprados] = useState<LoteResiduo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeusLotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<MeusLotesResponse>('/app/api/lotes/meus');
      setLotesComprados(response.data.lotesComprados || []);
    } catch (err) {
      console.error('Erro ao carregar lotes:', err);
      setError(ERROR_DESCRIPTION);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeusLotes();
  }, []);

  const isEmpty = !loading && lotesComprados.length === 0;

  return (
    <>
      {loading && (
        <div className="flex flex-col gap-4 pb-6 pt-4">
          <LoteCardSkeleton />
          <LoteCardSkeleton />
          <LoteCardSkeleton />
        </div>
      )}

      {error && !loading && (
        <EmptyState
          icon={<ICON_SOLID_MAP.error />}
          title={ERROR_TITLE}
          description={error}
          action={{
            label: ERROR_BUTTON_TEXT,
            onClick: loadMeusLotes,
          }}
        />
      )}

      {isEmpty && !error && (
        <EmptyState
          icon={<ICON_MAP.inventory />}
          title={EMPTY_TITLE}
          description={EMPTY_DESCRIPTION}
        />
      )}

      {!loading && !error && lotesComprados.length > 0 && (
        <div className="flex flex-col gap-4 pb-6 pt-4" role="list">
          {lotesComprados.map((lote) => (
            <OfferCard key={lote.id} lote={lote} />
          ))}
        </div>
      )}
    </>
  );
}
