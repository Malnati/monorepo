// app/ui/src/types/index.ts

export interface Tipo {
  id: number;
  nome: string;
}

export interface Unidade {
  id: number;
  nome: string;
}

export interface Localizacao {
  latitude: number;
  longitude: number;
}

export interface Foto {
  id: number;
  url: string;
  alt?: string;
}

export interface Fornecedor {
  id: number;
  nome: string;
  whatsapp?: string;
  avatar_url?: string;
}

// Camada de localização individual
export interface LocationLayer {
  latitude: number;
  longitude: number;
  label: string;
}

// Camadas de localização completas (real, bairro, cidade)
export interface LocationLayers {
  real?: LocationLayer;
  neighborhood?: LocationLayer;
  city?: LocationLayer;
}

export interface FormaPagamento {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  location?: string; // Coordenadas no formato "lat,lng"
  neighborhood?: string;
  address?: string;
  preco: number;
  quantidade: number;
  quantidade_vendida: number;
  quantidade_disponivel?: number;
  localizacao?: Localizacao; // Legacy: objeto com latitude/longitude
  fullAddress?: Address; // Endereço completo estruturado
  locationLayers?: LocationLayers;
  approxLocationLayers?: LocationLayers; // Localização aproximada para privacidade (ponto de referência)
  approx_formatted_address?: string | null; // Endereço formatado da localização sugerida
  tipo?: Tipo;
  unidade?: Unidade;
  fornecedor?: Fornecedor;
  foto_principal?: Foto;
  fotos?: Foto[];
  payment_methods?: FormaPagamento[];
  created_at: string;
  updated_at?: string;
  // Informações adicionais do backend
  is_user_fornecedor?: boolean;
  has_transacao?: boolean;
}

// Legacy alias for backward compatibility
export interface LoteResiduo extends Offer {
  titulo: string; // Alias for title
  descricao: string; // Alias for description
  nome?: string; // Deprecated
}

export interface Transacao {
  id: number;
  fornecedor: Fornecedor;
  comprador: Fornecedor;
  offer: {
    id: number;
    title: string;
    description?: string;
    preco: number;
    formatted_address?: string | null;
    unidade?: Unidade;
    locationLayers?: {
      real?: LocationLayer;
      city?: LocationLayer;
    };
  };
  // Legacy alias for backward compatibility
  lote_residuo?: {
    id: number;
    titulo: string;
    nome?: string; // Deprecated
    descricao?: string;
    preco: number;
    formatted_address?: string | null;
    unidade?: Unidade;
    locationLayers?: {
      real?: LocationLayer;
      city?: LocationLayer;
    };
  };
  quantidade: number;
  preco_total: number;
  created_at: string;
  updated_at?: string;
}

export interface Address {
  formattedAddress: string;
  placeId: string;
  latitude: number;
  longitude: number;
  geocodingAccuracy?: 'ROOFTOP' | 'RANGE_INTERPOLATED' | 'GEOMETRIC_CENTER' | 'APPROXIMATE';
}

export interface CreateOfferDto {
  title: string;
  description: string;
  preco: number;
  quantidade: number;
  location?: string; // Coordenadas no formato "lat,lng"
  neighborhood?: string;
  address?: string;
  localizacao?: Localizacao; // Legacy
  fullAddress?: Address;
  tipo_id: number;
  unidade_id: number;
  fotos?: string[];
  payment_method_ids?: number[];
}

// Legacy alias for backward compatibility
export interface CreateLoteResiduoDto extends CreateOfferDto {
  titulo: string; // Alias for title
  descricao: string; // Alias for description
}

export interface OfferWithAddress extends Offer {
  fullAddress?: Address;
}

// Legacy alias
export interface LoteResiduoWithAddress extends OfferWithAddress {
  address?: Address;
}

export interface CreateTransacaoDto {
  fornecedor_id: number;
  comprador_id: number;
  offer_id: number;
  // Legacy alias for backward compatibility
  lote_residuo_id?: number;
  quantidade: number;
}
