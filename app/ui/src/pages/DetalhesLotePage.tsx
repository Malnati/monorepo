// app/uisrc/pages/DetalhesLotePage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LoteResiduo, CreateTransacaoDto } from '../types';
import StaticMap from '../components/StaticMap';
import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../hooks/useFeedback';
import { useAuthenticatedImage } from '../hooks/useAuthenticatedImage';
import FeedbackBanner from '../components/FeedbackBanner';
import ContainedButton from '../components/ContainedButton';
import TextButton from '../components/TextButton';
import FakePaymentOptions from '../components/FakePaymentOptions';
import OfferCard from '../components/OfferCard';
import { formatNumber, formatCurrency } from '../utils/format';
import { ICON_MAP } from '../utils/icons';

const LOGOUT_TEXT = 'Sair';
const FORMAS_PAGAMENTO_PERMITIDAS = ['PIX', 'Boleto', 'Cartão de crédito'];

// Componente auxiliar para foto autenticada
function AuthenticatedPhoto({ url }: { url: string }) {
  const imageUrl = useAuthenticatedImage(url);
  return (
    <div 
      className="w-full aspect-[4/3] rounded-xl bg-cover bg-center bg-no-repeat bg-gray-200 dark:bg-gray-700" 
      style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }} 
    />
  );
}

// Componente auxiliar para avatar autenticado
function AuthenticatedAvatar({ url, alt, className }: { url?: string; alt: string; className?: string }) {
  const avatarUrl = useAuthenticatedImage(url);
  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt={alt}
      className={className || "h-12 w-12 rounded-full object-cover"}
      onError={(e) => {
        (e.target as HTMLImageElement).src = '';
        (e.target as HTMLImageElement).className += ' bg-gray-300';
      }}
    />
  ) : (
    <div className={className || "h-12 w-12 rounded-full bg-gray-300"}></div>
  );
}

export default function DetalhesLotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast, showDialog } = useFeedback();
  const [lote, setLote] = useState<LoteResiduo | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadLote(parseInt(id, 10));
    }
  }, [id, user?.id]); // Recarregar quando o ID mudar ou quando o usuário mudar

  const loadLote = async (loteId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/app/api/lotes/${loteId}`);
      setLote(response.data);
    } catch (error) {
      console.error('Erro ao carregar lote:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComprar = async () => {
    if (!lote || !lote.fornecedor) {
      setError('Dados do lote incompletos');
      return;
    }

    setError(null);
    try {
      setCreating(true);

      // Calcular quantidade disponível
      const quantidadeDisponivel = Number(lote.quantidade) - Number(lote.quantidade_vendida || 0);
      
      if (quantidadeDisponivel <= 0) {
        showDialog({
          title: 'Quantidade indisponível',
          description: 'Não há quantidade disponível para este lote',
          primaryAction: {
            label: 'Voltar para lotes',
            onClick: () => navigate('/lotes'),
          },
        });
        setCreating(false);
        return;
      }

      // Usar o primeiro comprador do usuário logado
      if (!user || !user.compradores || user.compradores.length === 0) {
        showDialog({
          title: 'Comprador não encontrado',
          description: 'Faça login novamente para continuar',
          primaryAction: {
            label: 'Fazer login',
            onClick: () => navigate('/login'),
          },
        });
        setCreating(false);
        return;
      }

      const compradorId = user.compradores[0].id;

      const createTransacaoDto: CreateTransacaoDto = {
        fornecedor_id: lote.fornecedor.id,
        comprador_id: compradorId,
        lote_residuo_id: lote.id,
        quantidade: quantidadeDisponivel, // Usar toda a quantidade disponível
      };

      const response = await api.post('/app/api/transacoes', createTransacaoDto);
      // A API pode retornar { data: { ... } } ou diretamente { ... }
      const transacao = response.data?.data || response.data;

      if (!transacao || !transacao.id) {
        throw new Error('Resposta da API inválida: ID da transação não encontrado');
      }

      // Navegar para a página de transação com o ID da transação criada
      showToast({
        variant: 'success',
        title: 'Transação criada',
        description: 'Redirecionando para detalhes',
      });
      setTimeout(() => navigate(`/transacoes/${transacao.id}`), 1000);
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      
      // Extrair código e mensagem de erro da API
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao criar transação';
      
      // Mensagens amigáveis baseadas nos códigos de erro
      let friendlyMessage = errorMessage;
      
      if (errorCode === 'OWN_LOT_PURCHASE') {
        friendlyMessage = 'Você não pode comprar seu próprio lote. Este lote foi cadastrado por você como fornecedor.';
      } else if (errorCode === 'LOT_ALREADY_SOLD') {
        friendlyMessage = 'Este lote já foi vendido para outro comprador e não está mais disponível.';
      } else if (errorCode === 'INSUFFICIENT_QUANTITY') {
        friendlyMessage = 'A quantidade solicitada não está mais disponível. Tente novamente com uma quantidade menor.';
      }
      
      showDialog({
        title: 'Não foi possível completar a compra',
        description: friendlyMessage,
        primaryAction: {
          label: 'Voltar para lotes',
          onClick: () => navigate('/lotes'),
        },
      });
      
      setError(friendlyMessage);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  if (!lote) {
    return <div className="p-4 text-center">Lote não encontrado</div>;
  }

  // Usar informações do backend (mais confiáveis e atualizadas)
  // O backend verifica diretamente no banco de dados se o usuário é fornecedor do lote
  // e se o lote já tem transações
  const isUserFornecedor = lote.is_user_fornecedor ?? false;
  const isLoteVendido = lote.has_transacao ?? false;
  
  // O botão deve estar habilitado apenas quando:
  // - O lote está disponível (sem transação: !isLoteVendido)
  // - E o usuário logado é diferente do fornecedor que cadastrou o lote (!isUserFornecedor)
  // O botão está desabilitado quando: creating || !lote || !lote.fornecedor || isUserFornecedor || isLoteVendido

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light/80 p-4 pb-2 backdrop-blur-sm dark:bg-background-dark/80">
        <button onClick={() => navigate(-1)} className="flex h-12 w-12 shrink-0 items-center justify-start text-text-light-primary dark:text-text-dark-primary">
          <ICON_MAP.back className="h-6 w-6" aria-hidden="true" />
        </button>
        <h1 className="flex-1 text-center text-sm font-bold leading-tight tracking-[-0.015em] text-text-light-primary dark:text-text-dark-primary">{lote.titulo}</h1>
        <TextButton
          onClick={logout}
          icon={<ICON_MAP.logout className="h-5 w-5" aria-hidden="true" />}
          size="small"
          variant="secondary"
          aria-label={LOGOUT_TEXT}
        >
          {LOGOUT_TEXT}
        </TextButton>
      </header>
      <main className="flex-grow pb-28">
        {error && (
          <div className="px-4 pt-4">
            <FeedbackBanner
              variant="error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}
        {lote.fotos && lote.fotos.length > 0 && (
          <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-stretch gap-3 p-4">
              {lote.fotos.map((foto) => (
                <div key={foto.id} className="flex h-full min-w-[80vw] flex-1 flex-col gap-4 rounded-xl">
                  <AuthenticatedPhoto url={foto.url} />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="px-4">
          <OfferCard lote={lote} showLink={false} showPhoto={false} />
        </div>
        <div className="space-y-4 px-4 py-4">
          <h3 className="text-sm font-bold text-text-light-primary dark:text-text-dark-primary">Detalhes principais</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-light-secondary dark:text-text-dark-secondary">Listado em</span>
              <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                {new Date(lote.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
        {(() => {
          // Na tela de detalhamento: usar localização sugerida (ponto de referência)
          // Priorizar approxLocationLayers, depois locationLayers (neighborhood/city), depois fallback
          const suggestedLocation = lote.approxLocationLayers?.neighborhood || lote.approxLocationLayers?.city;
          const fallbackLocation = lote.locationLayers?.neighborhood || lote.locationLayers?.city;
          const mapLocation = suggestedLocation || fallbackLocation;
          const mapLat = mapLocation?.latitude || 0;
          const mapLng = mapLocation?.longitude || 0;
          const hasLocation = mapLat !== 0 && mapLng !== 0;

          if (!hasLocation && !lote.approx_formatted_address && !lote.address?.formattedAddress && !lote.localizacao) {
            return null;
          }

          return (
            <div className="px-4 py-4">
              <h3 className="mb-4 text-sm font-bold text-text-light-primary dark:text-text-dark-primary">Localização</h3>
              {hasLocation && (
                <StaticMap
                  latitude={mapLat}
                  longitude={mapLng}
                  label={lote.titulo}
                />
              )}
              <div className="mt-4">
                {/* Exibir endereço da localização sugerida (ponto de referência) */}
                {lote.approx_formatted_address ? (
                  <>
                    <p className="text-sm font-semibold text-text-light-primary dark:text-text-dark-primary mb-2">
                      {lote.approx_formatted_address}
                    </p>
                    {lote.approxLocationLayers?.city?.label && (
                      <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-2">
                        {lote.approxLocationLayers.city.label}
                      </p>
                    )}
                    {hasLocation && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${mapLat},${mapLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary font-medium"
                      >
                        <ICON_MAP.directions className="h-5 w-5" aria-hidden="true" />
                        Ver rota no Google Maps
                      </a>
                    )}
                  </>
                ) : suggestedLocation ? (
                  <>
                    {suggestedLocation.label && (
                      <p className="text-sm font-semibold text-text-light-primary dark:text-text-dark-primary mb-2">
                        {suggestedLocation.label}
                      </p>
                    )}
                    {lote.approxLocationLayers?.city?.label && suggestedLocation.label !== lote.approxLocationLayers.city.label && (
                      <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-2">
                        {lote.approxLocationLayers.city.label}
                      </p>
                    )}
                    {hasLocation && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${mapLat},${mapLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary font-medium"
                      >
                        <ICON_MAP.directions className="h-5 w-5" aria-hidden="true" />
                        Ver rota no Google Maps
                      </a>
                    )}
                  </>
                ) : fallbackLocation ? (
                  <>
                    {fallbackLocation.label && (
                      <p className="text-sm font-semibold text-text-light-primary dark:text-text-dark-primary mb-2">
                        {fallbackLocation.label}
                      </p>
                    )}
                    {lote.locationLayers?.city?.label && fallbackLocation.label !== lote.locationLayers.city.label && (
                      <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-2">
                        {lote.locationLayers.city.label}
                      </p>
                    )}
                    {hasLocation && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${mapLat},${mapLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary font-medium"
                      >
                        <ICON_MAP.directions className="h-5 w-5" aria-hidden="true" />
                        Ver rota no Google Maps
                      </a>
                    )}
                  </>
                ) : lote.address?.formattedAddress ? (
                  <>
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-2">
                      {lote.address.formattedAddress}
                    </p>
                    {hasLocation && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${mapLat},${mapLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary font-medium"
                      >
                        <ICON_MAP.directions className="h-5 w-5" aria-hidden="true" />
                        Ver rota no Google Maps
                      </a>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          );
        })()}
        {lote.fornecedor && (
          <div className="px-4 py-2">
            <h3 className="mb-4 text-sm font-bold text-text-light-primary dark:text-text-dark-primary">Fornecedor</h3>
            <div className="flex items-center justify-between rounded-xl border border-background-light p-4 dark:border-background-dark">
              <div className="flex items-center gap-4">
                <AuthenticatedAvatar 
                  url={lote.fornecedor.avatar_url} 
                  alt={lote.fornecedor.nome}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-text-light-primary dark:text-text-dark-primary">{lote.fornecedor.nome}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Formas de pagamento aceitas */}
        {lote.payment_methods && lote.payment_methods.filter(forma => FORMAS_PAGAMENTO_PERMITIDAS.includes(forma.nome)).length > 0 && (
          <div className="px-4 py-4">
            <h3 className="mb-4 text-sm font-bold text-text-light-primary dark:text-text-dark-primary">Formas de pagamento aceitas</h3>
            <div className="space-y-2">
              {lote.payment_methods
                .filter(forma => FORMAS_PAGAMENTO_PERMITIDAS.includes(forma.nome))
                .map((forma) => (
                <div
                  key={forma.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-chip-light dark:bg-card-dark"
                >
                  <ICON_MAP.checkCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
                  <span className="text-sm text-text-light-primary dark:text-text-dark-primary">
                    {forma.nome}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Componente de pagamento demonstrativo */}
        <div className="px-4 py-4">
          <FakePaymentOptions
            total={Number(lote.preco)}
            quantidade={Number(lote.quantidade) - Number(lote.quantidade_vendida || 0)}
            disabled={isUserFornecedor || isLoteVendido}
            onConfirm={() => {
              showToast({
                variant: 'success',
                title: 'Pagamento demonstrativo registrado',
                description: 'Este é um fluxo simulado — nenhum valor foi cobrado',
              });
            }}
          />
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 z-10 w-full bg-background-light/80 p-4 backdrop-blur-sm dark:bg-background-dark/80">
        <ContainedButton
          onClick={handleComprar}
          disabled={creating || !lote || !lote.fornecedor || isUserFornecedor || isLoteVendido}
          fullWidth
          size="large"
          variant="primary"
          icon={creating ? undefined : <ICON_MAP.shopping className="h-5 w-5" aria-hidden="true" />}
        >
          {creating ? (
            <>
              <ICON_MAP.sync className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span>Criando transação...</span>
            </>
          ) : (
            'Comprar'
          )}
        </ContainedButton>
      </footer>
    </div>
  );
}
