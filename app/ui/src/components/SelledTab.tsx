// app/uisrc/components/SelledTab.tsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Offer } from '../types';
import OfferCard from './OfferCard';
import LoteCardSkeleton from './LoteCardSkeleton';
import EmptyState from './EmptyState';
import { ICON_MAP, ICON_SOLID_MAP } from '../utils/icons';

const EMPTY_TITLE = 'Nenhum produto encontrado';
const EMPTY_DESCRIPTION = 'Você ainda não possui produtos vendidos.';
const ERROR_TITLE = 'Erro ao carregar produtos';
const ERROR_DESCRIPTION = 'Não foi possível carregar seus produtos. Verifique sua conexão e tente novamente.';
const ERROR_BUTTON_TEXT = 'Tentar novamente';

interface MeusOffersResponse {
  offersVendidos: Offer[];
  offersComprados: Offer[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export default function SelledTab() {
  const [offersVendidos, setOffersVendidos] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeusOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Compatibilidade: tentar /offers/meus primeiro, fallback para /lotes/meus
      try {
        const response = await api.get<MeusOffersResponse>('/app/api/offers/meus');
        setOffersVendidos(response.data.offersVendidos || []);
      } catch {
        const response = await api.get<any>('/app/api/lotes/meus');
        // Mapear resposta legacy para novo formato
        setOffersVendidos(response.data.lotesVendidos || []);
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError(ERROR_DESCRIPTION);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeusOffers();
  }, []);

  const isEmpty = !loading && offersVendidos.length === 0;

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
            onClick: loadMeusOffers,
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

      {!loading && !error && offersVendidos.length > 0 && (
        <div className="flex flex-col gap-4 pb-6 pt-4" role="list">
          {offersVendidos.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </>
  );
}
