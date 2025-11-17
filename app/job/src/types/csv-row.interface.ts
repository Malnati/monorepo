// app/job/src/types/csv-row.interface.ts

export interface CsvRow {
  'E-mail': string;
  'Nome': string;
  'Sobrenome': string;
  'IP da inscrição': string;
  'Tempo de assinatura': string;
  'Tempo de confirmação': string;
  'IP da confirmação': string;
  'Status da lista': string;
  'Status global': string;
  'Nome completo': string;
  'CPF': string;
  'Data de nascimento': string;
  'Telefone': string;
  'CEP': string;
  'Cidade': string;
  'Estado': string;
  'Lgpd_termos': string;
  'Lgpd_autorizacao': string;
  'Lista': string;
}

export interface NormalizedUser {
  email: string;
  fullName: string;
  document: string;
  birthDate: string;
  phone: string;
  address: {
    cep: string;
    city: string;
    state: string;
  };
  userType: 'PF' | 'PJ';
  consent: {
    terms: boolean;
    authorization: boolean;
  };
}

export interface ValidationError {
  line: number;
  field: string;
  value: string;
  error: string;
}

export interface ImportResult {
  filename: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  created: number;
  updated: number;
  skipped: number;
  errors: ValidationError[];
  processingTimeMs: number;
}
