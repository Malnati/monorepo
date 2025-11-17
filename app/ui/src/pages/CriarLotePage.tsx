// app/uisrc/pages/CriarLotePage.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../hooks/useFeedback';
import api from '../services/api';
import { Tipo, Unidade, CreateLoteResiduoDto, Address, FormaPagamento } from '../types';
import MapWithAutocomplete from '../components/MapWithAutocomplete';
import FeedbackBanner from '../components/FeedbackBanner';
import FilledTextField from '../components/FilledTextField';
import FilledSelectField from '../components/FilledSelectField';
import ContainedButton from '../components/ContainedButton';
import TextButton from '../components/TextButton';
import { formatCurrencyValue } from '../utils/format';
import { ICON_MAP, ICON_SOLID_MAP } from '../utils/icons';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';

const MAX_FOTOS_PER_LOTE = 5;
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const LOGOUT_TEXT = 'Sair';
const FORMAS_PAGAMENTO_PERMITIDAS = ['PIX', 'Boleto', 'Cartão de crédito', 'Criptomoedas'];

export default function CriarLotePage() {
  // Capturar contexto completo antes de qualquer execução
  const componentContext = {
    timestamp: new Date().toISOString(),
    stackTrace: new Error().stack,
    callStack: (() => {
      const stack: string[] = [];
      const current = new Error().stack;
      if (current) {
        stack.push(...current.split('\n').slice(2));
      }
      return stack;
    })(),
  };
  
  console.log('[CriarLotePage] ===== INÍCIO DO COMPONENTE =====');
  console.log('[CriarLotePage] Contexto completo:', componentContext);
  console.log('[CriarLotePage] Stack trace completo:', new Error().stack);
  console.trace('[CriarLotePage] Call stack trace');
  
  // Verificar todas as variáveis e imports antes de usar
  const importsCheck = {
    formatCurrencyValue: typeof formatCurrencyValue,
    ICON_MAP: typeof ICON_MAP,
    useState: typeof useState,
    useEffect: typeof useEffect,
    useRef: typeof useRef,
    useCallback: typeof useCallback,
    useNavigate: typeof useNavigate,
    useAuth: typeof useAuth,
    useFeedback: typeof useFeedback,
    api: typeof api,
  };
  console.log('[CriarLotePage] Verificando imports disponíveis:', importsCheck);
  
  // Verificar se alguma variável está undefined
  const undefinedImports = Object.entries(importsCheck)
    .filter(([_, type]) => type === 'undefined')
    .map(([name]) => name);
  if (undefinedImports.length > 0) {
    console.error('[CriarLotePage] ❌ IMPORTS UNDEFINED:', undefinedImports);
  }
  
  console.log('[CriarLotePage] Chamando useNavigate...');
  console.log('[CriarLotePage] useNavigate antes:', { 
    useNavigateType: typeof useNavigate,
    useNavigateValue: useNavigate,
    isFunction: typeof useNavigate === 'function',
    useNavigateToString: String(useNavigate),
  });
  
  // Capturar contexto antes de chamar useNavigate
  const beforeUseNavigateContext = {
    timestamp: new Date().toISOString(),
    stackTrace: new Error().stack,
    useNavigateAvailable: typeof useNavigate !== 'undefined',
    useNavigateType: typeof useNavigate,
    allImports: importsCheck,
  };
  console.log('[CriarLotePage] Contexto antes de useNavigate:', beforeUseNavigateContext);
  console.trace('[CriarLotePage] Stack trace antes de useNavigate');
  
  const navigate = useNavigate();
  console.log('[CriarLotePage] ✓ useNavigate OK', { 
    navigate: typeof navigate,
    navigateValue: navigate,
    isFunction: typeof navigate === 'function',
    navigateToString: String(navigate),
  });
  
  console.log('[CriarLotePage] Chamando useAuth...');
  console.log('[CriarLotePage] useAuth antes:', { 
    useAuthType: typeof useAuth,
    useAuthValue: useAuth,
    isFunction: typeof useAuth === 'function',
  });
  const authResult = useAuth();
  console.log('[CriarLotePage] useAuth resultado:', {
    authResultType: typeof authResult,
    authResultKeys: authResult ? Object.keys(authResult) : [],
    hasLogout: authResult ? 'logout' in authResult : false,
    authResultValue: authResult,
  });
  const { logout } = authResult;
  console.log('[CriarLotePage] ✓ useAuth OK', { 
    logout: typeof logout,
    logoutValue: logout,
    isFunction: typeof logout === 'function',
  });
  
  console.log('[CriarLotePage] Chamando useFeedback...');
  console.log('[CriarLotePage] useFeedback antes:', { 
    useFeedbackType: typeof useFeedback,
    useFeedbackValue: useFeedback,
    isFunction: typeof useFeedback === 'function',
  });
  const feedbackResult = useFeedback();
  console.log('[CriarLotePage] useFeedback resultado:', {
    feedbackResultType: typeof feedbackResult,
    feedbackResultKeys: feedbackResult ? Object.keys(feedbackResult) : [],
    hasShowToast: feedbackResult ? 'showToast' in feedbackResult : false,
    hasShowDialog: feedbackResult ? 'showDialog' in feedbackResult : false,
    feedbackResultValue: feedbackResult,
  });
  const { showToast, showDialog } = feedbackResult;
  console.log('[CriarLotePage] ✓ useFeedback OK', { 
    showToast: typeof showToast, 
    showDialog: typeof showDialog,
    showToastIsFunction: typeof showToast === 'function',
    showDialogIsFunction: typeof showDialog === 'function',
    showToastValue: showToast,
    showDialogValue: showDialog,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [formData, setFormData] = useState<CreateLoteResiduoDto>({
    titulo: '',
    descricao: '',
    preco: 0,
    quantidade: 0,
    tipo_id: 0,
    unidade_id: 0,
    payment_method_ids: [],
  });
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [precoInput, setPrecoInput] = useState<string>('');
  const [fotoFiles, setFotoFiles] = useState<File[]>([]);
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { isLoaded: mapsLoaded } = useGoogleMaps();
  const [address, setAddress] = useState<Address | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Funções auxiliares definidas dentro do componente para evitar problemas de inicialização
  console.log('[CriarLotePage] Definindo funções auxiliares');
  console.log('[CriarLotePage] formatCurrencyValue disponível?', typeof formatCurrencyValue);
  
  const formatCurrencyLocal = useCallback((value: number | string): string => {
    console.log('[CriarLotePage] formatCurrencyLocal chamada', { value, formatCurrencyValueType: typeof formatCurrencyValue });
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0 : value;
  return formatCurrencyValue(numValue, 2);
  }, []);

  const parseCurrencyLocal = useCallback((value: string): number => {
  return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  }, []);
  
  console.log('[CriarLotePage] Funções auxiliares definidas', {
    formatCurrencyLocal: typeof formatCurrencyLocal,
    parseCurrencyLocal: typeof parseCurrencyLocal
  });

  const isLargeError = useCallback((errorMessage: string): boolean => {
  const largeErrorIndicators = [
    'Publicação bloqueada',
    'Publicação precisa de revisão',
    'Sugestões:',
    'issues',
    'suggestions',
  ];
  return largeErrorIndicators.some(indicator => 
    errorMessage.toLowerCase().includes(indicator.toLowerCase())
  ) || errorMessage.length > 100;
  }, []);

  const extractFieldErrors = useCallback((errorMessage: string): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Erros simples de validação de campo
  if (errorMessage.toLowerCase().includes('tipo')) {
    errors.tipo_id = 'Selecione um tipo';
  }
  if (errorMessage.toLowerCase().includes('unidade')) {
    errors.unidade_id = 'Selecione uma unidade';
  }
  if (errorMessage.toLowerCase().includes('título') || errorMessage.toLowerCase().includes('titulo')) {
    errors.titulo = 'Verifique o título';
  }
  if (errorMessage.toLowerCase().includes('descrição') || errorMessage.toLowerCase().includes('descricao')) {
    errors.descricao = 'Verifique a descrição';
  }
  if (errorMessage.toLowerCase().includes('preço') || errorMessage.toLowerCase().includes('preco')) {
    errors.preco = 'Verifique o preço';
  }
  if (errorMessage.toLowerCase().includes('quantidade')) {
    errors.quantidade = 'Verifique a quantidade';
  }
  if (errorMessage.toLowerCase().includes('localização') || errorMessage.toLowerCase().includes('localizacao')) {
    errors.localizacao = 'Selecione uma localização';
  }
  
  return errors;
  }, []);

  const loadTiposUnidades = useCallback(async () => {
    try {
      const [tiposRes, unidadesRes, formasPagamentoRes] = await Promise.all([
        api.get('/app/api/tipos'),
        api.get('/app/api/unidades'),
        api.get('/app/api/formas-pagamento'),
      ]);
      setTipos(tiposRes.data.data || []);
      setUnidades(unidadesRes.data.data || []);
      const todasFormasPagamento = formasPagamentoRes.data.data || [];
      console.log('[CriarLotePage] Todas as formas de pagamento recebidas:', todasFormasPagamento.map(f => ({ id: f.id, nome: f.nome, ativo: f.ativo })));
      
      // Criar um Set com os nomes permitidos normalizados para comparação rápida
      const permitidasNormalizadas = new Set(
        FORMAS_PAGAMENTO_PERMITIDAS.map(p => p.toLowerCase().trim())
      );
      console.log('[CriarLotePage] Formas permitidas normalizadas:', Array.from(permitidasNormalizadas));
      
      const formasFiltradas = todasFormasPagamento.filter(forma => {
        const nomeNormalizado = forma.nome.toLowerCase().trim();
        console.log('[CriarLotePage] Verificando forma:', { nome: forma.nome, normalizado: nomeNormalizado });
        
        // Verificar correspondência exata primeiro
        if (permitidasNormalizadas.has(nomeNormalizado)) {
          console.log('[CriarLotePage] ✓ Forma permitida (exata):', forma.nome);
          return true;
        }
        
        // Verificar correspondência parcial (caso o nome tenha variações)
        for (const permitida of permitidasNormalizadas) {
          if (nomeNormalizado.includes(permitida) || permitida.includes(nomeNormalizado)) {
            console.log('[CriarLotePage] ✓ Forma permitida (parcial):', forma.nome, 'match com', permitida);
            return true;
          }
        }
        
        console.log('[CriarLotePage] ✗ Forma de pagamento filtrada:', forma.nome);
        return false;
      });
      
      console.log('[CriarLotePage] Formas de pagamento filtradas:', formasFiltradas.map(f => ({ id: f.id, nome: f.nome })));
      setFormasPagamento(formasFiltradas);
    } catch (error) {
      console.error('Erro ao carregar tipos/unidades/formas de pagamento:', error);
    }
  }, []);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocalização não suportada pelo navegador');
      setLocationLoading(false);
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { latitude, longitude };
        setUserLocation(location);
        // O endereço será obtido automaticamente quando o MapWithAutocomplete carregar
        // e chamar onLocationSelect com a localização inicial
        setLocationLoading(false);
      },
      (error) => {
        console.warn('Erro ao obter localização:', error.message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    console.log('[CriarLotePage] useEffect inicial executado');
    try {
      console.log('[CriarLotePage] Chamando loadTiposUnidades...');
      loadTiposUnidades();
      console.log('[CriarLotePage] ✓ loadTiposUnidades chamado');
    } catch (error) {
      console.error('[CriarLotePage] Erro em loadTiposUnidades:', error);
    }
    
    try {
      console.log('[CriarLotePage] Chamando getUserLocation...');
      getUserLocation();
      console.log('[CriarLotePage] ✓ getUserLocation chamado');
    } catch (error) {
      console.error('[CriarLotePage] Erro em getUserLocation:', error);
    }
  }, [loadTiposUnidades, getUserLocation]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Erro ao converter arquivo para base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[CriarLotePage] handleFileSelect chamada', {
      showToastType: typeof showToast,
      showToastValue: showToast,
      fotoFilesType: typeof fotoFiles,
      fotoFilesLength: fotoFiles?.length,
      MAX_FOTOS_PER_LOTE,
      ACCEPTED_IMAGE_TYPES,
      MAX_FILE_SIZE_MB,
    });
    
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (fotoFiles.length + newFiles.length >= MAX_FOTOS_PER_LOTE) {
        console.log('[CriarLotePage] Chamando showToast (limite)', {
          showToastType: typeof showToast,
          showToastValue: showToast,
        });
        showToast({
          variant: 'warning',
          title: 'Fotos no limite',
          description: `Máximo de ${MAX_FOTOS_PER_LOTE} fotos por lote`,
        });
        break;
      }

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        console.log('[CriarLotePage] Chamando showToast (tipo inválido)', {
          showToastType: typeof showToast,
          showToastValue: showToast,
        });
        showToast({
          variant: 'error',
          title: 'Tipo de arquivo não suportado',
          description: `Use JPEG, PNG ou WebP`,
        });
        continue;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        console.log('[CriarLotePage] Chamando showToast (arquivo grande)', {
          showToastType: typeof showToast,
          showToastValue: showToast,
        });
        showToast({
          variant: 'error',
          title: 'Arquivo muito grande',
          description: `Tamanho máximo: ${MAX_FILE_SIZE_MB}MB`,
        });
        continue;
      }

      newFiles.push(file);
      const preview = URL.createObjectURL(file);
      newPreviews.push(preview);
    }

    setFotoFiles((prev: File[]) => [...prev, ...newFiles]);
    setFotoPreviews((prev: string[]) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [fotoFiles.length, showToast]);

  const handleRemoveFoto = (index: number) => {
    URL.revokeObjectURL(fotoPreviews[index]);
    setFotoFiles(fotoFiles.filter((_: File, i: number) => i !== index));
    setFotoPreviews(fotoPreviews.filter((_: string, i: number) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    console.log('[CriarLotePage] handleDrop chamada', {
      showToastType: typeof showToast,
      showToastValue: showToast,
      fotoFilesType: typeof fotoFiles,
      fotoFilesLength: fotoFiles?.length,
      MAX_FOTOS_PER_LOTE,
    });
    
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const imageFiles = files.filter((file): file is File => file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type));
    
    if (imageFiles.length !== files.length) {
      console.log('[CriarLotePage] Chamando showToast (arquivos inválidos)', {
        showToastType: typeof showToast,
        showToastValue: showToast,
      });
      showToast({
        variant: 'warning',
        title: 'Arquivos inválidos',
        description: 'Alguns arquivos não são imagens válidas',
      });
    }

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of imageFiles) {
      if (fotoFiles.length + newFiles.length >= MAX_FOTOS_PER_LOTE) {
        showToast({
          variant: 'warning',
          title: 'Fotos no limite',
          description: `Máximo de ${MAX_FOTOS_PER_LOTE} fotos por lote`,
        });
        break;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        showToast({
          variant: 'error',
          title: 'Arquivo muito grande',
          description: `Tamanho máximo: ${MAX_FILE_SIZE_MB}MB`,
        });
        continue;
      }

      newFiles.push(file);
      const preview = URL.createObjectURL(file);
      newPreviews.push(preview);
    }

    setFotoFiles((prev: File[]) => [...prev, ...newFiles]);
    setFotoPreviews((prev: string[]) => [...prev, ...newPreviews]);
  }, [fotoFiles.length, showToast]);

  // Função para calcular uma localização aleatória num raio de 15km
  const calculateSuggestedLocation = useCallback((centerLat: number, centerLng: number, maxRadiusKm: number = 15) => {
    // Converter raio de km para graus (aproximação)
    // 1 grau de latitude ≈ 111 km
    const radiusInDegrees = maxRadiusKm / 111;
    
    // Gerar ângulo aleatório (0 a 2π)
    const angle = Math.random() * 2 * Math.PI;
    
    // Gerar distância aleatória (0 a maxRadiusKm)
    const distance = Math.random() * maxRadiusKm;
    const distanceInDegrees = distance / 111;
    
    // Calcular nova latitude e longitude
    const newLat = centerLat + (distanceInDegrees * Math.cos(angle));
    // Ajustar longitude considerando a latitude (circunferência menor perto dos polos)
    const latAdjustment = Math.cos(centerLat * Math.PI / 180);
    const newLng = centerLng + (distanceInDegrees * Math.sin(angle) / latAdjustment);
    
    return {
      latitude: newLat,
      longitude: newLng,
    };
  }, []);

  // Função para buscar estabelecimento próximo usando Google Places API
  // Objetivo: encontrar um ponto de referência próximo à localização sugerida
  const findNearbyPlace = useCallback(async (latitude: number, longitude: number): Promise<{
    formattedAddress: string;
    placeId: string;
    latitude: number;
    longitude: number;
    name: string;
  } | null> => {
    if (!mapsLoaded || !window.google?.maps?.places) {
      console.warn('Google Maps Places API não está disponível');
      return null;
    }

    // Validar coordenadas antes de prosseguir
    if (isNaN(latitude) || isNaN(longitude) || latitude === 0 || longitude === 0) {
      console.warn('Coordenadas inválidas para busca de ponto de referência');
      return {
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        placeId: '',
        latitude,
        longitude,
        name: 'Localização próxima',
      };
    }

    return new Promise((resolve, reject) => {
      // Timeout de segurança para garantir que a Promise sempre resolve
      const timeoutId = setTimeout(() => {
        console.warn('Timeout na busca de ponto de referência, usando fallback');
        resolve({
          formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          placeId: '',
          latitude,
          longitude,
          name: 'Localização próxima',
        });
      }, 10000); // 10 segundos de timeout

      let resolved = false;
      const safeResolve = (value: {
        formattedAddress: string;
        placeId: string;
        latitude: number;
        longitude: number;
        name: string;
      }) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve(value);
        }
      };

      try {
        // Criar elemento DOM para o PlacesService
        const div = document.createElement('div');
        const service = new google.maps.places.PlacesService(div);
        
        // Criar localização
        const location = new google.maps.LatLng(latitude, longitude);

        // Buscar estabelecimentos próximos em um raio de 2km
        // IMPORTANTE: radius e rankBy são mutuamente exclusivos
        // Usamos apenas radius e ordenamos manualmente os resultados por distância
        // Usar apenas um tipo por vez para evitar problemas de validação
        const request: google.maps.places.PlaceSearchRequest = {
          location: location,
          radius: 2000, // 2km de raio para encontrar ponto de referência próximo
          // Não usar type array para evitar problemas de validação
        };

        // Envolver em try/catch para capturar erros síncronos
        try {
          service.nearbySearch(request, (results, status) => {
            try {
              // Tratar diferentes status da API
              if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                // Filtrar e ordenar resultados manualmente por distância (mais próximo primeiro)
                const validResults = results.filter((place) => place.geometry?.location && place.place_id);
                
                if (validResults.length > 0) {
                  const sortedResults = validResults
                    .map((place) => {
                      const placeLocation = place.geometry!.location!;
                      const placeLat = typeof placeLocation.lat === 'function' ? placeLocation.lat() : placeLocation.lat;
                      const placeLng = typeof placeLocation.lng === 'function' ? placeLocation.lng() : placeLocation.lng;
                      
                      // Calcular distância usando fórmula de Haversine
                      const R = 6371; // Raio da Terra em km
                      const dLat = ((placeLat - latitude) * Math.PI) / 180;
                      const dLng = ((placeLng - longitude) * Math.PI) / 180;
                      const a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos((latitude * Math.PI) / 180) *
                          Math.cos((placeLat * Math.PI) / 180) *
                          Math.sin(dLng / 2) *
                          Math.sin(dLng / 2);
                      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                      const distance = R * c;
                      
                      return { place, distance };
                    })
                    .sort((a, b) => a.distance - b.distance);
                  
                  // Pegar o resultado mais próximo
                  const nearestPlace = sortedResults[0].place;
                  const placeLocation = nearestPlace.geometry!.location!;
                  const placeLat = typeof placeLocation.lat === 'function' ? placeLocation.lat() : placeLocation.lat;
                  const placeLng = typeof placeLocation.lng === 'function' ? placeLocation.lng() : placeLocation.lng;
                  
                  safeResolve({
                    formattedAddress: nearestPlace.vicinity || nearestPlace.formatted_address || '',
                    placeId: nearestPlace.place_id!,
                    latitude: placeLat,
                    longitude: placeLng,
                    name: nearestPlace.name || '',
                  });
                  return;
                }
              }
              
              // Se não encontrou estabelecimento ou status não é OK, fazer geocoding reverso
              console.warn('Places API status:', status, 'results:', results?.length || 0);
              
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ location }, (geocodeResults, geocodeStatus) => {
                try {
                  if (geocodeStatus === google.maps.GeocoderStatus.OK && geocodeResults && geocodeResults.length > 0) {
                    const result = geocodeResults[0];
                    const resultLocation = result.geometry.location;
                    const resultLat = typeof resultLocation.lat === 'function' ? resultLocation.lat() : resultLocation.lat;
                    const resultLng = typeof resultLocation.lng === 'function' ? resultLocation.lng() : resultLocation.lng;
                    
                    safeResolve({
                      formattedAddress: result.formatted_address || '',
                      placeId: result.place_id || '',
                      latitude: resultLat,
                      longitude: resultLng,
                      name: result.formatted_address || 'Localização próxima',
                    });
                  } else {
                    // Fallback: retornar a própria localização sugerida
                    console.warn('Geocoding falhou, usando localização sugerida como fallback');
                    safeResolve({
                      formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                      placeId: '',
                      latitude,
                      longitude,
                      name: 'Localização próxima',
                    });
                  }
                } catch (geocodeError) {
                  console.error('Erro no geocoding:', geocodeError);
                  // Fallback seguro
                  safeResolve({
                    formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                    placeId: '',
                    latitude,
                    longitude,
                    name: 'Localização próxima',
                  });
                }
              });
            } catch (callbackError) {
              console.error('Erro no callback do nearbySearch:', callbackError);
              // Fallback seguro em caso de erro
              safeResolve({
                formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                placeId: '',
                latitude,
                longitude,
                name: 'Localização próxima',
              });
            }
          });
        } catch (searchError) {
          console.error('Erro ao executar nearbySearch:', searchError);
          // Fallback seguro em caso de erro na requisição
          safeResolve({
            formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            placeId: '',
            latitude,
            longitude,
            name: 'Localização próxima',
          });
        }
      } catch (initError) {
        console.error('Erro ao inicializar PlacesService:', initError);
        // Fallback seguro em caso de erro na inicialização
        clearTimeout(timeoutId);
        resolve({
          formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          placeId: '',
          latitude,
          longitude,
          name: 'Localização próxima',
        });
      }
    });
  }, [mapsLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('[CriarLotePage] handleSubmit chamada', {
      navigateType: typeof navigate,
      navigateValue: navigate,
      showToastType: typeof showToast,
      showToastValue: showToast,
      showDialogType: typeof showDialog,
      showDialogValue: showDialog,
      fotoFilesType: typeof fotoFiles,
      fotoFilesLength: fotoFiles?.length,
    });
    
    e.preventDefault();
    setValidationError(null);
    setFieldErrors({});
    
    try {
      setLoading(true);

      const fotosBase64: string[] = [];
      for (const file of fotoFiles) {
        const base64 = await fileToBase64(file);
        fotosBase64.push(base64);
      }

      if (!formData.tipo_id || formData.tipo_id === 0) {
        setFieldErrors({ tipo_id: 'Selecione um tipo' });
        setLoading(false);
        return;
      }

      if (!formData.unidade_id || formData.unidade_id === 0) {
        setFieldErrors({ unidade_id: 'Selecione uma unidade' });
        setLoading(false);
        return;
      }

      if (!formData.payment_method_ids || formData.payment_method_ids.length === 0) {
        setValidationError('Selecione pelo menos uma forma de pagamento');
        setLoading(false);
        return;
      }

      const payload: any = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        preco: Number(formData.preco),
        quantidade: Number(formData.quantidade),
        tipo_id: Number(formData.tipo_id),
        unidade_id: Number(formData.unidade_id),
        payment_method_ids: formData.payment_method_ids,
      };

      if (address) {
        // Endereço real (localização atual no mapa)
        payload.localizacao = {
          latitude: Number(address.latitude),
          longitude: Number(address.longitude),
        };
        payload.address = {
          formattedAddress: address.formattedAddress,
          placeId: address.placeId,
          latitude: Number(address.latitude),
          longitude: Number(address.longitude),
        };
        if (address.geocodingAccuracy) {
          payload.address.geocodingAccuracy = address.geocodingAccuracy;
        }

        // Calcular localização sugerida num raio de 15km
        const suggestedLocation = calculateSuggestedLocation(
          Number(address.latitude),
          Number(address.longitude),
          15
        );

        // Buscar estabelecimento/localidade próxima da posição sugerida
        if (mapsLoaded) {
          try {
            const nearbyPlace = await findNearbyPlace(
              suggestedLocation.latitude,
              suggestedLocation.longitude
            );

            if (nearbyPlace) {
              // Adicionar localização sugerida ao payload
              payload.suggestedLocation = {
                latitude: nearbyPlace.latitude,
                longitude: nearbyPlace.longitude,
                label: nearbyPlace.name,
              };
              payload.suggestedAddress = {
                formattedAddress: nearbyPlace.formattedAddress,
                placeId: nearbyPlace.placeId,
                latitude: nearbyPlace.latitude,
                longitude: nearbyPlace.longitude,
              };
            }
          } catch (error) {
            console.warn('Erro ao buscar localização sugerida:', error);
            // Continuar sem localização sugerida se houver erro
          }
        }
      }

      if (fotosBase64.length > 0) {
        payload.fotos = fotosBase64;
      }

        console.log('Payload enviado:', JSON.stringify(payload, null, 2));
        // Compatibilidade: tentar /offers primeiro, fallback para /lotes
        try {
          await api.post('/app/api/offers', payload);
        } catch {
          await api.post('/app/api/lotes', payload);
        }
        console.log('[CriarLotePage] Chamando showToast (sucesso)', {
          showToastType: typeof showToast,
          showToastValue: showToast,
        });
        showToast({
          variant: 'success',
          title: 'Lote publicado',
          description: 'Revisado por Inteligência Artificial',
        });
        console.log('[CriarLotePage] Chamando navigate (/home)', {
          navigateType: typeof navigate,
          navigateValue: navigate,
        });
        setTimeout(() => navigate('/home'), 1000);
    } catch (error: any) {
      console.error('Erro completo ao criar lote:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      let errorMessage = 'Erro ao criar lote. Tente novamente.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join('\n');
        } else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
          
          // Se o erro for sobre fornecedor não associado, redirecionar para login
            if (errorData.message.includes('fornecedor associado') || errorData.message.includes('Faça login novamente')) {
              console.log('[CriarLotePage] Chamando showDialog (sessão expirada)', {
                showDialogType: typeof showDialog,
                showDialogValue: showDialog,
                navigateType: typeof navigate,
                navigateValue: navigate,
              });
              showDialog({
                title: 'Sessão expirada',
                description: 'Entre novamente para continuar',
                primaryAction: {
                  label: 'Fazer login',
                  onClick: () => {
                    console.log('[CriarLotePage] onClick do dialog - chamando navigate(/login)', {
                      navigateType: typeof navigate,
                      navigateValue: navigate,
                    });
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    navigate('/login');
                  },
                },
              });
            setLoading(false);
            return;
          }
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        }
        
        if (errorData.message && Array.isArray(errorData.message)) {
          const validationErrors = errorData.message.map((msg: string) => msg).join('\n');
          errorMessage = validationErrors;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
        // Separar erros grandes (IA) de erros simples de validação
        if (isLargeError(errorMessage)) {
          // Validação de IA: exibir como aviso (não erro)
          console.log('[CriarLotePage] Chamando showDialog (validação IA)', {
            showDialogType: typeof showDialog,
            showDialogValue: showDialog,
          });
          // Substituir mensagem específica de dados sensíveis
          let displayMessage = errorMessage;
          if (errorMessage.includes('Publicação bloqueada') && errorMessage.includes('campo limpo') && errorMessage.includes('dados sensíveis')) {
            displayMessage = 'Revisão por Inteligência Artificial: Dados sensíveis encontrados no formulário. Por favor, descreva apenas sobre o material e como coletar.';
          }
          showDialog({
            title: 'Atenção - Publicação bloqueada!',
            description: displayMessage,
            primaryAction: {
              label: 'Entendi',
              onClick: () => {},
            },
          });
        // Extrair mensagens minimalistas para campos se aplicável
        const fieldErrs = extractFieldErrors(errorMessage);
        if (Object.keys(fieldErrs).length > 0) {
          setFieldErrors(fieldErrs);
        }
      } else {
        // Erro simples: exibir no banner e nos campos
        setValidationError(errorMessage);
        const fieldErrs = extractFieldErrors(errorMessage);
        setFieldErrors(fieldErrs);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      fotoPreviews.forEach((preview: string) => URL.revokeObjectURL(preview));
    };
  }, [fotoPreviews]);

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen">
      <header className="sticky top-0 z-10 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-background-light dark:border-background-dark">
        <button onClick={() => {
          console.log('[CriarLotePage] Botão voltar clicado - chamando navigate(-1)', {
            navigateType: typeof navigate,
            navigateValue: navigate,
          });
          navigate(-1);
        }} className="text-text-light-primary dark:text-text-dark-primary flex size-10 items-center justify-center rounded-full hover:bg-chip-light/40 dark:hover:bg-card-dark/60 transition-colors" aria-label="Voltar">
          <ICON_MAP.back className="h-6 w-6" aria-hidden="true" />
        </button>
        <h1 className="text-text-light-primary dark:text-text-dark-primary text-sm font-bold leading-tight tracking-tight flex-1 text-center">Publicação</h1>
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
      <main className="flex-1 pb-28">
        <form onSubmit={handleSubmit} className="px-4 pt-6 space-y-4">
          {validationError && !isLargeError(validationError) && (
            <FeedbackBanner
              variant="error"
              message={validationError}
              onClose={() => setValidationError(null)}
            />
          )}
          <section>
            <h2 className="text-text-light-primary dark:text-text-dark-primary text-sm font-bold leading-tight tracking-tight pb-2">O que você está vendendo?</h2>
            <div className="py-3">
              <FilledSelectField
                label="Tipo"
                value={formData.tipo_id}
                onChange={(value) => setFormData({ ...formData, tipo_id: parseInt(value) })}
                options={tipos.map((tipo) => ({ value: tipo.id, label: tipo.nome }))}
                placeholder="Selecione o tipo"
                required
                error={!!fieldErrors.tipo_id}
                errorMessage={fieldErrors.tipo_id}
              />
            </div>
            <div className="flex w-full flex-wrap items-end gap-4 py-3">
              <div className="min-w-0 flex-1">
                <FilledTextField
                  label="Quantidade"
                  type="number"
                  value={formData.quantidade || ''}
                  onChange={(value) => setFormData({ ...formData, quantidade: parseFloat(value) || 0 })}
                  placeholder="Informe a quantidade"
                  required
                  inputMode="numeric"
                />
              </div>
              <div className="basis-[100px]">
                <FilledSelectField
                  label="Unidade"
                  value={formData.unidade_id}
                  onChange={(value) => setFormData({ ...formData, unidade_id: parseInt(value) })}
                  options={unidades.map((unidade) => ({ value: unidade.id, label: unidade.nome }))}
                  placeholder="Selecione"
                  required
                  error={!!fieldErrors.unidade_id}
                  errorMessage={fieldErrors.unidade_id}
                />
              </div>
            </div>
            <div className="py-3">
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Preço<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-300 text-sm font-normal pointer-events-none z-10">R$</span>
                  <FilledTextField
                    label=""
                    type="text"
                    value={precoInput}
                    onChange={(value) => {
                      setPrecoInput(value);
                      const parsedValue = parseCurrencyLocal(value);
                      setFormData({ ...formData, preco: parsedValue });
                    }}
                    onBlur={() => {
                      const parsedValue = parseCurrencyLocal(precoInput);
                      if (parsedValue > 0) {
                        setPrecoInput(formatCurrencyLocal(parsedValue));
                      } else {
                        setPrecoInput('');
                      }
                    }}
                    placeholder="0,00"
                    required
                    inputMode="decimal"
                    className="[&_input]:pl-10 [&_label]:hidden"
                  />
                </div>
              </div>
            </div>
          </section>
          <section className="pt-4">
            <h2 className="text-text-light-primary dark:text-text-dark-primary text-sm font-bold leading-tight tracking-tight pb-2">Descreva o material</h2>
            <div className="flex w-full flex-wrap items-end gap-4 py-3">
              <div className="min-w-0 flex-1">
                <FilledTextField
                  label="Título"
                  type="text"
                  value={formData.titulo}
                  onChange={(value) => setFormData({ ...formData, titulo: value })}
                  placeholder="Ex: Garrafas PET Incolor"
                  required
                  maxLength={100}
                  error={!!fieldErrors.titulo}
                  errorMessage={fieldErrors.titulo}
                />
              </div>
            </div>
            <div className="py-3">
              <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 block">
                Descrição<span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o material, condições de armazenamento e cuidados especiais"
                required
                rows={4}
                maxLength={255}
                className={`w-full px-4 py-3 rounded-lg bg-chip-light dark:bg-card-dark text-text-light-primary dark:text-text-dark-primary resize-none focus:outline-none focus:ring-2 ${
                  fieldErrors.descricao ? 'border-2 border-red-500 focus:ring-red-500' : 'border-0 focus:ring-primary'
                }`}
              />
              {fieldErrors.descricao && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.descricao}</p>
              )}
            </div>
          </section>
          <section className="pt-4">
            <h2 className="text-text-light-primary dark:text-text-dark-primary text-sm font-bold leading-tight tracking-tight pb-2">Fotos do material</h2>
            <div className="py-3">
              {fotoPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {fotoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${preview})` }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveFoto(index)}
                        className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remover foto"
                      >
                        <ICON_MAP.close className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-background-light dark:border-background-dark rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={fotoFiles.length >= MAX_FOTOS_PER_LOTE}
                />
                <ICON_MAP.camera className="h-12 w-12 text-text-light-secondary dark:text-text-dark-secondary mb-2" aria-hidden="true" />
                <p className="text-text-light-primary dark:text-text-dark-primary text-sm font-medium leading-normal">
                  {fotoFiles.length >= MAX_FOTOS_PER_LOTE
                    ? `Máximo de ${MAX_FOTOS_PER_LOTE} fotos atingido`
                    : fotoFiles.length === 0
                    ? 'Clique ou arraste fotos aqui'
                    : `${fotoFiles.length}/${MAX_FOTOS_PER_LOTE} fotos adicionadas`}
                </p>
                <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm mt-1">
                  JPEG, PNG ou WebP (máx. {MAX_FILE_SIZE_MB}MB cada)
                </p>
              </div>
            </div>
          </section>
          <section className="pt-4">
            <h2 className="text-text-light-primary dark:text-text-dark-primary text-sm font-bold leading-tight tracking-tight pb-2">Localização</h2>
            <div className="py-3">
              {locationLoading && (
                <div className="mb-4 flex items-center gap-2 text-sm text-text-light-secondary dark:text-text-dark-secondary">
                  <ICON_MAP.sync className="h-5 w-5 animate-spin" aria-hidden="true" />
                  <span>Obtendo sua localização...</span>
                </div>
              )}
              <MapWithAutocomplete
                initialLocation={userLocation || undefined}
                onLocationSelect={(selectedAddress) => {
                  setAddress(selectedAddress);
                  setLocationLoading(false);
                }}
              />
              {address && (
                <p className="mt-2 text-sm text-text-light-secondary dark:text-text-dark-secondary">
                  {address.formattedAddress}
                </p>
              )}
            </div>
          </section>
          <section className="pt-4 pb-24">
            <h2 className="text-text-light-primary dark:text-text-dark-primary text-sm font-bold leading-tight tracking-tight pb-2">Formas de pagamento aceitas</h2>
            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary pb-3">Selecione pelo menos uma</p>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary">
                Selecione um método
              </p>
              <div className="grid grid-cols-1 gap-3">
                {formasPagamento.map((forma) => {
                  const isSelected = formData.payment_method_ids?.includes(forma.id) || false;
                  let Icon = ICON_MAP.creditCard;
                  let label = forma.nome;
                  let description = '';
                  
                  // Mapear para ícones e descrições baseados no nome
                  if (forma.nome.toLowerCase().includes('pix')) {
                    Icon = ICON_MAP.qrCode;
                    label = 'Pix';
                    description = 'Pagamento instantâneo';
                  } else if (forma.nome.toLowerCase().includes('boleto')) {
                    Icon = ICON_MAP.document;
                    label = 'Boleto';
                    description = 'Código de barras bancário';
                  } else if (forma.nome.toLowerCase().includes('cartão') || forma.nome.toLowerCase().includes('credito')) {
                    Icon = ICON_MAP.creditCard;
                    label = 'Cartão de Crédito';
                    description = 'Débito ou crédito';
                  } else if (forma.nome.toLowerCase().includes('cripto')) {
                    Icon = ICON_MAP.coin;
                    label = 'Criptomoedas';
                    description = 'Envie via carteira digital';
                  }
                  
                  return (
                    <label
                      key={forma.id}
                      className={`
                        flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-150 cursor-pointer
                        focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2
                        ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-background-light dark:border-background-dark hover:border-primary/50 hover:bg-background-light/50 dark:hover:bg-background-dark/50'
                        }
                      `.trim().replace(/\s+/g, ' ')}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentIds = formData.payment_method_ids || [];
                          const newIds = e.target.checked
                            ? [...currentIds, forma.id]
                            : currentIds.filter(id => id !== forma.id);
                          setFormData({ ...formData, payment_method_ids: newIds });
                        }}
                        className="sr-only"
                      />
                      <div className={`
                        flex items-center justify-center h-12 w-12 rounded-full
                        ${isSelected ? 'bg-primary text-white' : 'bg-background-light dark:bg-background-dark text-text-light-secondary dark:text-text-dark-secondary'}
                      `.trim().replace(/\s+/g, ' ')}>
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                          {label}
                        </p>
                        {description && (
                          <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                            {description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <ICON_SOLID_MAP.success className="h-5 w-5 text-primary" aria-hidden="true" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          </section>
          <footer className="fixed bottom-0 left-0 right-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm p-4 border-t border-background-light dark:border-background-dark">
            <ContainedButton
              type="submit"
              disabled={loading}
              fullWidth
              size="large"
              variant="primary"
              icon={loading ? undefined : <ICON_MAP.create className="h-5 w-5" aria-hidden="true" />}
            >
              {loading ? 'Publicando...' : 'Publicar lote'}
            </ContainedButton>
          </footer>
        </form>
      </main>
    </div>
  );
}
