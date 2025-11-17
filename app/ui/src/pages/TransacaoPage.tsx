// app/uisrc/pages/TransacaoPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../hooks/useFeedback';
import api from '../services/api';
import { Transacao, LoteResiduo } from '../types';
import { formatCurrencyValue, formatNumber } from '../utils/format';
import { useAuthenticatedImage } from '../hooks/useAuthenticatedImage';
import { ICON_MAP } from '../utils/icons';
import StaticMap from '../components/StaticMap';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';
import OfferCard from '../components/OfferCard';

const LOGOUT_TEXT = 'Sair';

// Componente auxiliar para avatar autenticado
function AuthenticatedAvatar({ url, alt, className }: { url?: string; alt: string; className?: string }) {
  const avatarUrl = useAuthenticatedImage(url);
  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt={alt}
      className={className || "aspect-square rounded-full h-10 w-10 object-cover"}
      onError={(e) => {
        (e.target as HTMLImageElement).src = '';
        (e.target as HTMLImageElement).className += ' bg-gray-300';
      }}
    />
  ) : (
    <div className={className || "aspect-square rounded-full h-10 w-10 object-cover bg-gray-300"}></div>
  );
}

export default function TransacaoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useFeedback();
  const { isLoaded: mapsLoaded } = useGoogleMaps();
  const [transacao, setTransacao] = useState<Transacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [realAddress, setRealAddress] = useState<string | null>(null);
  const [geocodingAddress, setGeocodingAddress] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const hasShownEmailNotification = useRef(false);

  useEffect(() => {
    if (id) {
      const parsedId = parseInt(id, 10);
      if (!isNaN(parsedId) && parsedId > 0) {
        loadTransacao(parsedId);
      } else {
        setLoading(false);
        console.error('ID de transação inválido:', id);
      }
    }
  }, [id]);

  const loadTransacao = async (transacaoId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/app/api/transacoes/${transacaoId}`);
      setTransacao(response.data);
      
      // Mostrar notificação sobre e-mail apenas uma vez
      if (!hasShownEmailNotification.current) {
        hasShownEmailNotification.current = true;
        showToast({
          variant: 'info',
          title: 'Dados enviados por e-mail',
          description: 'Os dados da transação foram encaminhados para o seu e-mail.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar transação:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer reverse geocoding e obter endereço real
  useEffect(() => {
    if (!mapsLoaded || !transacao || geocodingAddress) return;
    
    const realLocation = transacao.lote_residuo.locationLayers?.real;
    const hasFormattedAddress = !!transacao.lote_residuo.formatted_address;
    
    // Se já tem endereço formatado ou não tem localização real, não precisa geocodificar
    if (hasFormattedAddress || !realLocation) {
      return;
    }

    // Se já temos o endereço em cache, não precisa geocodificar novamente
    if (realAddress) {
      return;
    }

    setGeocodingAddress(true);

    const geocoder = new google.maps.Geocoder();
    const location = {
      lat: realLocation.latitude,
      lng: realLocation.longitude,
    };

    geocoder.geocode({ location }, (results, status) => {
      setGeocodingAddress(false);
      
      if (status === 'OK' && results && results.length > 0) {
        // Usar o primeiro resultado que geralmente é o mais preciso
        setRealAddress(results[0].formatted_address);
      } else {
        console.warn('Erro ao geocodificar localização:', status);
        // Em caso de erro, manter null para exibir coordenadas como fallback
      }
    });
  }, [mapsLoaded, transacao, realAddress, geocodingAddress]);

  // Função para formatar número do WhatsApp para o link
  const formatWhatsAppNumber = (whatsapp: string): string => {
    // Remove todos os caracteres não numéricos
    const cleaned = whatsapp.replace(/\D/g, '');
    
    // Se não começar com código do país, adiciona 55 (Brasil)
    if (cleaned.length === 10 || cleaned.length === 11) {
      return `55${cleaned}`;
    }
    
    return cleaned;
  };

  // Função para gerar link do WhatsApp
  const getWhatsAppLink = (whatsapp: string, text: string = ''): string => {
    const formattedNumber = formatWhatsAppNumber(whatsapp);
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${formattedNumber}${encodedText ? `?text=${encodedText}` : ''}`;
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  if (!transacao) {
    return <div className="p-4 text-center">Transação não encontrada</div>;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark">
      <div className="relative flex min-h-screen w-full flex-col font-display group/design-root overflow-x-hidden">
        <header className="sticky top-0 z-10 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between">
          <button onClick={() => navigate('/home')} className="flex size-12 shrink-0 items-center justify-start text-text-light-primary dark:text-text-dark-primary">
            <ICON_MAP.back className="h-6 w-6" aria-hidden="true" />
          </button>
          <h1 className="text-text-light-primary dark:text-text-dark-primary text-sm font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Transação concluída</h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary hover:bg-chip-light dark:hover:bg-chip-dark transition-colors"
            aria-label={LOGOUT_TEXT}
          >
            <ICON_MAP.logout className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs">{LOGOUT_TEXT}</span>
          </button>
        </header>
        <main className="flex-grow px-4 pb-24">
          <div className="flex flex-col items-stretch justify-start rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] bg-card-light dark:bg-card-dark p-4 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <AuthenticatedAvatar 
                      url={transacao.fornecedor.avatar_url} 
                      alt={transacao.fornecedor.nome}
                      className="aspect-square rounded-full h-10 w-10 object-cover shrink-0"
                    />
                    <p className="text-text-light-primary dark:text-text-dark-primary text-sm font-normal leading-normal flex-1 truncate min-w-0">{transacao.fornecedor.nome}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                      {transacao.fornecedor.whatsapp && (
                        <a
                          href={getWhatsAppLink(transacao.fornecedor.whatsapp, `Olá ${transacao.fornecedor.nome}, gostaria de entrar em contato sobre a transação de ${transacao.lote_residuo.nome}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors shrink-0"
                          aria-label={`Contatar ${transacao.fornecedor.nome} via WhatsApp`}
                        >
                          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          <span className="hidden sm:inline">Entre em contato por WhatsApp</span>
                        </a>
                      )}
                      <p className="text-text-light-secondary dark:text-text-dark-secondary text-xs sm:text-sm font-normal leading-normal shrink-0">Fornecedor</p>
                    </div>
                    {/* Exibir endereço real do fornecedor */}
                    {(transacao.lote_residuo.formatted_address || realAddress) && (
                      <div className="flex flex-col gap-1">
                        <p className="text-xs sm:text-sm text-text-light-secondary dark:text-text-dark-secondary">
                          {transacao.lote_residuo.formatted_address || realAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {transacao.lote_residuo.locationLayers && (
                  <div className="flex flex-col gap-2 pl-14 sm:pl-14">
                    {transacao.lote_residuo.locationLayers.city?.label && (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-text-light-primary dark:text-text-dark-primary">
                          {transacao.lote_residuo.locationLayers.city.label}
                        </p>
                        {/* Exibir endereço real (formatted_address ou obtido via geocoding) */}
                        {(transacao.lote_residuo.formatted_address || realAddress) ? (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-2 flex-wrap">
                              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary flex-1 min-w-0">
                                {transacao.lote_residuo.formatted_address || realAddress}
                              </p>
                              {transacao.lote_residuo.locationLayers.real && (
                                <button
                                  onClick={() => {
                                    const coords = `${transacao.lote_residuo.locationLayers.real!.latitude},${transacao.lote_residuo.locationLayers.real!.longitude}`;
                                    navigator.clipboard.writeText(coords).then(() => {
                                      showToast({
                                        variant: 'success',
                                        title: 'Coordenadas copiadas',
                                        description: 'As coordenadas foram copiadas para a área de transferência.',
                                        duration: 2000,
                                      });
                                    });
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-primary font-medium hover:bg-chip-light dark:hover:bg-chip-dark transition-colors shrink-0"
                                  aria-label="Copiar coordenadas"
                                >
                                  <ICON_MAP.copy className="h-4 w-4" aria-hidden="true" />
                                  Copiar
                                </button>
                              )}
                            </div>
                            {/* Exibir mapa com localização real */}
                            {transacao.lote_residuo.locationLayers.real && (
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => setIsMapExpanded(!isMapExpanded)}
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-light-primary dark:text-text-dark-primary bg-chip-light dark:bg-chip-dark hover:bg-chip-light/80 dark:hover:bg-chip-dark/80 transition-colors"
                                  aria-label={isMapExpanded ? 'Recolher mapa' : 'Ver mapa'}
                                >
                                  {isMapExpanded ? (
                                    <>
                                      <ICON_MAP.chevronUp className="h-5 w-5" aria-hidden="true" />
                                      <span>Recolher mapa</span>
                                    </>
                                  ) : (
                                    <>
                                      <ICON_MAP.chevronDown className="h-5 w-5" aria-hidden="true" />
                                      <span>Ver mapa</span>
                                    </>
                                  )}
                                </button>
                                {isMapExpanded && (
                                  <StaticMap
                                    latitude={transacao.lote_residuo.locationLayers.real.latitude}
                                    longitude={transacao.lote_residuo.locationLayers.real.longitude}
                                    label={transacao.lote_residuo.titulo || transacao.lote_residuo.nome || 'Localização'}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        ) : transacao.lote_residuo.locationLayers.real ? (
                          <div className="flex flex-col gap-3">
                            {geocodingAddress ? (
                              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                                Obtendo endereço...
                              </p>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                                  Coordenadas: {formatNumber(transacao.lote_residuo.locationLayers.real.latitude, 6)}, {formatNumber(transacao.lote_residuo.locationLayers.real.longitude, 6)}
                                </p>
                                <button
                                  onClick={() => {
                                    const coords = `${transacao.lote_residuo.locationLayers.real!.latitude},${transacao.lote_residuo.locationLayers.real!.longitude}`;
                                    navigator.clipboard.writeText(coords).then(() => {
                                      showToast({
                                        variant: 'success',
                                        title: 'Coordenadas copiadas',
                                        description: 'As coordenadas foram copiadas para a área de transferência.',
                                        duration: 2000,
                                      });
                                    });
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-primary font-medium hover:bg-chip-light dark:hover:bg-chip-dark transition-colors shrink-0"
                                  aria-label="Copiar coordenadas"
                                >
                                  <ICON_MAP.copy className="h-4 w-4" aria-hidden="true" />
                                  Copiar
                                </button>
                              </div>
                            )}
                            {/* Exibir mapa com localização real mesmo quando não há endereço */}
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => setIsMapExpanded(!isMapExpanded)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-light-primary dark:text-text-dark-primary bg-chip-light dark:bg-chip-dark hover:bg-chip-light/80 dark:hover:bg-chip-dark/80 transition-colors"
                                aria-label={isMapExpanded ? 'Recolher mapa' : 'Ver mapa'}
                              >
                                {isMapExpanded ? (
                                  <>
                                    <ICON_MAP.chevronUp className="h-5 w-5" aria-hidden="true" />
                                    <span>Recolher mapa</span>
                                  </>
                                ) : (
                                  <>
                                    <ICON_MAP.chevronDown className="h-5 w-5" aria-hidden="true" />
                                    <span>Ver mapa</span>
                                  </>
                                )}
                              </button>
                              {isMapExpanded && (
                                <StaticMap
                                  latitude={transacao.lote_residuo.locationLayers.real.latitude}
                                  longitude={transacao.lote_residuo.locationLayers.real.longitude}
                                  label={transacao.lote_residuo.titulo || transacao.lote_residuo.nome || 'Localização'}
                                />
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <AuthenticatedAvatar 
                    url={transacao.comprador.avatar_url} 
                    alt={transacao.comprador.nome}
                    className="aspect-square rounded-full h-10 w-10 object-cover shrink-0"
                  />
                  <p className="text-text-light-primary dark:text-text-dark-primary text-sm font-normal leading-normal flex-1 truncate min-w-0">{transacao.comprador.nome}</p>
                </div>
                <div className="shrink-0">
                  <p className="text-text-light-secondary dark:text-text-dark-secondary text-xs sm:text-sm font-normal leading-normal">Comprador</p>
                </div>
              </div>
            </div>
            <hr className="my-4 border-background-light dark:border-background-dark"/>
            <div className="mb-4">
              <OfferCard 
                lote={{
                  id: transacao.lote_residuo.id,
                  titulo: transacao.lote_residuo.titulo || transacao.lote_residuo.nome || '',
                  descricao: transacao.lote_residuo.descricao || '',
                  preco: transacao.lote_residuo.preco,
                  quantidade: transacao.quantidade,
                  quantidade_vendida: 0,
                  created_at: transacao.created_at,
                  unidade: transacao.lote_residuo.unidade,
                  locationLayers: transacao.lote_residuo.locationLayers,
                  formatted_address: transacao.lote_residuo.formatted_address,
                } as LoteResiduo}
                showLink={false}
                showPhoto={false}
              />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="flex flex-col">
                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Data</p>
                <p className="text-sm font-bold text-text-light-primary dark:text-text-dark-primary">
                  {new Date(transacao.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex flex-col col-span-2">
                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Preco Total</p>
                <p className="text-sm font-bold text-text-light-primary dark:text-text-dark-primary">R$ {formatCurrencyValue(transacao.preco_total)}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
