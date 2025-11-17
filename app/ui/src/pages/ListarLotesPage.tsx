// app/uisrc/pages/ListarLotesPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Offer } from '../types';
import MapWithMarkers from '../components/MapWithMarkers';
import { MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE } from '../constants/coordinates';
import BottomNavigation from '../components/BottomNavigation';
import OfflineBanner from '../components/OfflineBanner';
import OfferCard from '../components/OfferCard';
import { ICON_MAP } from '../utils/icons';

const TITLE_TEXT = 'Ofertas';
const LOGOUT_TEXT = 'Sair';

export default function ListarLotesPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [mapBounds, setMapBounds] = useState<string | null>(null);

  const validateCoordinates = (latitude: number, longitude: number): boolean => {
    return (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= MIN_LATITUDE &&
      latitude <= MAX_LATITUDE &&
      longitude >= MIN_LONGITUDE &&
      longitude <= MAX_LONGITUDE &&
      latitude !== 0 &&
      longitude !== 0
    );
  };

  const loadLotes = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = search ? { search } : {};
      if (mapBounds) {
        params.bounds = mapBounds;
      }
      const response = await api.get('/app/api/offers', { params });
      // A API já retorna apenas ofertas sem transação (disponíveis para venda)
      setOffers(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar ofertas:', error);
    } finally {
      setLoading(false);
    }
  }, [search, mapBounds]);

  useEffect(() => {
    loadLotes();
  }, [loadLotes]);

  const handleMapIdle = useCallback(() => {
    if (showMap) {
      // O bounds será atualizado quando o mapa estiver pronto
      // Por enquanto, carregamos sem bounds para obter todos os resultados
    }
  }, [showMap]);

  const handleMarkerClick = useCallback((markerId: number) => {
    navigate(`/offers/${markerId}`);
  }, [navigate]);

  const validMarkers = offers
    .filter((offer) => {
      // Exibir apenas localização aproximada (neighborhood ou city, NUNCA real)
      const locationLayer = offer.locationLayers?.neighborhood || offer.locationLayers?.city;
      const hasLocationLayer = locationLayer?.latitude && locationLayer?.longitude;
      
      if (hasLocationLayer) {
        return validateCoordinates(locationLayer.latitude, locationLayer.longitude);
      }

      return false;
    })
    .map((offer) => {
      // Exibir apenas localização aproximada (neighborhood ou city, NUNCA real)
      const locationLayer = offer.locationLayers?.neighborhood || offer.locationLayers?.city;
      const latitude = locationLayer?.latitude;
      const longitude = locationLayer?.longitude;
      
      // Construir label com bairro e cidade quando disponível
      const title = offer.title || (offer as any).titulo || '';
      let label = title;
      if (offer.locationLayers?.neighborhood?.label && offer.locationLayers?.city?.label) {
        label = `${offer.locationLayers.neighborhood.label}, ${offer.locationLayers.city.label}`;
      } else if (offer.locationLayers?.city?.label) {
        label = `${offer.locationLayers.city.label}`;
      }
      
      return {
        id: offer.id,
        latitude: latitude!,
        longitude: longitude!,
        nome: title,
        label,
        preco: offer.preco,
        quantidade: offer.quantidade,
      };
    });

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark/80 backdrop-blur-sm">
        <div className="flex items-center p-4 pb-2 justify-between">
          <h1 className="text-sm font-bold leading-tight tracking-[-0.015em] flex-1 text-center text-text-light-primary dark:text-text-dark-primary">{TITLE_TEXT}</h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary hover:bg-chip-light dark:hover:bg-chip-dark transition-colors"
            aria-label={LOGOUT_TEXT}
          >
            <ICON_MAP.logout className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs">{LOGOUT_TEXT}</span>
          </button>
        </div>
        <div className="px-4 py-3">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-12">
            <div className="text-text-light-secondary dark:text-text-dark-secondary flex border-none bg-chip-light dark:bg-chip-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
              <ICON_MAP.search className="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light-primary dark:text-text-dark-primary focus:outline-0 focus:ring-0 border-none bg-chip-light dark:bg-chip-dark focus:border-none h-full placeholder:text-text-light-secondary dark:placeholder:text-text-dark-secondary px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
              placeholder="Busque por produto ou palavra-chave"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>
      <main className="flex-1 pb-20">
        {showMap && (
          <div className="h-64 mb-4">
            <MapWithMarkers
              markers={validMarkers}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        )}
        <div className="px-4">
          <div className="flex justify-between items-center py-2">
            <p className="text-sm font-semibold text-text-light-primary dark:text-text-dark-primary">
              Mostrando {offers.length} resultados
            </p>
            <button
              onClick={() => setShowMap(!showMap)}
              className="text-sm text-text-light-secondary dark:text-text-dark-secondary px-3 py-1 rounded-lg bg-chip-light dark:bg-chip-dark"
            >
              {showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
            </button>
          </div>
          {loading ? (
            <p className="text-center py-8 text-text-light-secondary">Carregando...</p>
          ) : (
            <div className="flex flex-col gap-4 pb-6">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNavigation />
      <OfflineBanner />
    </div>
  );
}
