// app/api/src/modules/agents/sensitive-data-patterns.ts

/**
 * Padrões e palavras-chave para detecção de dados sensíveis
 * Conforme plano: docs/rup/99-anexos/MVP/plano-revisao-prompts-dados-sensiveis.md
 * 
 * Referências normativas:
 * - REQ-031 a REQ-035: Validação de conteúdo e tratamento de dados pessoais
 * - REQ-200: Proteção de dados sensíveis (PII)
 */

export const SENSITIVE_DATA_PATTERNS = {
  // CHECK_01: Senhas e credenciais
  PASSWORDS: {
    keywords: [
      'senha',
      'password',
      'pwd',
      'pass',
      'pin',
      'código',
      'codigo',
      'chave',
      'credencial',
      'autenticação',
      'autenticacao',
      'login',
      'acesso',
    ],
    description: 'Senhas, PINs ou credenciais de acesso',
    policyReference: 'REQ-200',
  },

  // CHECK_02: Telefones com DDD
  PHONES: {
    // Padrões regex para telefones brasileiros
    patterns: [
      /\(\d{2}\)\s*\d{4,5}-?\d{4}/g, // (11) 99999-9999 ou (11) 9999-9999
      /\d{2}\s*\d{4,5}-?\d{4}/g, // 11 99999-9999
      /\+55\s*\d{2}\s*\d{4,5}-?\d{4}/g, // +55 11 99999-9999
      /whatsapp:?\s*\d/gi,
      /telefone:?\s*\d/gi,
      /celular:?\s*\d/gi,
      /contato:?\s*\d{2}/gi,
    ],
    keywords: [
      'telefone',
      'celular',
      'whatsapp',
      'fone',
      'tel',
      'contato:',
      'ligue',
      'ligar',
    ],
    description: 'Telefones com DDD ou números de contato',
    policyReference: 'REQ-031',
  },

  // CHECK_03: Endereços completos
  ADDRESSES: {
    keywords: [
      'rua ',
      'avenida ',
      'av. ',
      'alameda ',
      'travessa ',
      'praça ',
      'número',
      'numero',
      'nº ',
      'n° ',
      'complemento',
      'apartamento',
      'apto',
      'casa ',
      'bloco ',
      'cep',
      'bairro ',
    ],
    // Padrões que indicam endereço completo (não apenas cidade/estado)
    patterns: [
      /rua\s+[a-záàâãéèêíïóôõöúçñ\s]+,?\s*\d+/gi,
      /avenida\s+[a-záàâãéèêíïóôõöúçñ\s]+,?\s*\d+/gi,
      /av\.\s+[a-záàâãéèêíïóôõöúçñ\s]+,?\s*\d+/gi,
      /\d{5}-?\d{3}/g, // CEP
    ],
    description: 'Endereços completos com rua e número',
    policyReference: 'REQ-031',
  },

  // CHECK_04: Coordenadas geográficas precisas em texto
  GEOLOCATION: {
    patterns: [
      /-?\d+\.\d+,\s*-?\d+\.\d+/g, // Coordenadas lat,lng
      /latitude:?\s*-?\d+\.\d+/gi,
      /longitude:?\s*-?\d+\.\d+/gi,
      /coords?:?\s*-?\d+\.\d+/gi,
    ],
    keywords: ['latitude', 'longitude', 'coordenada', 'coords', 'gps', 'localização exata'],
    description: 'Coordenadas geográficas precisas em formato de texto',
    policyReference: 'REQ-031',
  },

  // CHECK_05: Nomes completos de pessoas
  PERSONAL_NAMES: {
    keywords: [
      'meu nome é',
      'me chamo',
      'sou o',
      'sou a',
      'nome:',
      'responsável:',
      'contato com',
      'falar com',
      'procurar por',
      'sr.',
      'sra.',
      'dr.',
      'dra.',
    ],
    // Padrão que sugere nome completo (duas ou mais palavras capitalizadas)
    patterns: [
      /\b[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ]+\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ]+)*/g,
    ],
    description: 'Nomes completos de pessoas identificáveis',
    policyReference: 'REQ-031',
  },

  // CHECK_06: Documentos oficiais (CPF, CNPJ, RG)
  OFFICIAL_DOCUMENTS: {
    patterns: [
      /\d{3}\.\d{3}\.\d{3}-\d{2}/g, // CPF formatado
      /\d{11}/g, // CPF sem formatação (11 dígitos seguidos)
      /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, // CNPJ formatado
      /\d{14}/g, // CNPJ sem formatação (14 dígitos seguidos)
      /rg:?\s*\d/gi,
    ],
    keywords: [
      'cpf',
      'cnpj',
      'rg',
      'identidade',
      'documento',
      'registro geral',
      'cnh',
      'carteira',
    ],
    description: 'CPF, CNPJ, RG ou outros documentos oficiais',
    policyReference: 'REQ-200',
  },

  // CHECK_07: E-mails em campos não apropriados
  EMAILS: {
    patterns: [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g],
    keywords: ['@', 'email', 'e-mail', 'contato@'],
    description: 'Endereços de e-mail em campos inadequados',
    policyReference: 'REQ-031',
  },
};

/**
 * Palavras-chave que NÃO são consideradas sensíveis
 * (falsos positivos comuns)
 */
export const NON_SENSITIVE_KEYWORDS = [
  // Termos comerciais/técnicos comuns
  'preço',
  'preco',
  'valor',
  'custo',
  'tonelada',
  'kg',
  'quilos',
  'quantidade',
  'disponível',
  'disponivel',
  'material',
  'reciclável',
  'reciclavel',
  'coleta',
  'entrega',
  'retirada',
  
  // Localizações genéricas (permitidas)
  'são paulo',
  'rio de janeiro',
  'cidade',
  'estado',
  'região',
  'regiao',
  'zona',
  'centro',
  
  // Termos de negociação
  'negociar',
  'negociável',
  'negociavel',
  'aceito',
  'pagamento',
  'forma de pagamento',
  'pix',
  'boleto',
  'transferência',
  'transferencia',
];

/**
 * Versão do prompt de detecção de dados sensíveis
 * Atualizar quando modificar a lógica de detecção
 */
export const PROMPT_VERSION = '2025-01-13-v1';
