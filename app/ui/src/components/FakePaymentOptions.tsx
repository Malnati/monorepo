// app/ui/src/components/FakePaymentOptions.tsx
import { useState } from 'react';
import { ICON_MAP } from '../utils/icons';
import ContainedButton from './ContainedButton';
import { formatCurrency, formatNumber } from '../utils/format';

const DEMO_MESSAGE = 'Demonstração — nenhum valor será processado';
const DEMO_NOTICE = 'Este é um fluxo demonstrativo. Nenhum pagamento real será realizado.';

type PaymentMethod = 'crypto' | 'pix' | 'boleto' | 'card';

interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  demoNotice: string;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'crypto',
    label: 'Criptomoedas',
    description: 'Envie via carteira digital',
    icon: ICON_MAP.coin,
    demoNotice: 'Use qualquer endereço — nada será enviado',
  },
  {
    id: 'pix',
    label: 'Pix',
    description: 'Pagamento instantâneo',
    icon: ICON_MAP.qrCode,
    demoNotice: 'Use qualquer chave — nada será cobrado',
  },
  {
    id: 'boleto',
    label: 'Boleto',
    description: 'Código de barras bancário',
    icon: ICON_MAP.document,
    demoNotice: 'Código de exemplo — não realize pagamento',
  },
  {
    id: 'card',
    label: 'Cartão de Crédito',
    description: 'Débito ou crédito',
    icon: ICON_MAP.creditCard,
    demoNotice: 'Use dados fictícios — nenhuma transação será criada',
  },
];

interface FakePaymentOptionsProps {
  total: number;
  quantidade: number;
  disabled?: boolean;
  onConfirm?: () => void;
}

export default function FakePaymentOptions({
  total,
  quantidade,
  disabled = false,
  onConfirm,
}: FakePaymentOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handleConfirm = () => {
    if (selectedMethod && !disabled && onConfirm) {
      onConfirm();
    }
  };

  const selectedMethodData = PAYMENT_METHODS.find((m) => m.id === selectedMethod);

  return (
    <div className="rounded-xl border border-background-light dark:border-background-dark bg-card-light dark:bg-card-dark overflow-hidden">
      {/* Cabeçalho expansível */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-controls="payment-content"
        className="w-full flex items-center justify-between p-4 text-left transition-colors duration-150 hover:bg-background-light/50 dark:hover:bg-background-dark/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div className="flex-1">
          <h3 className="text-sm font-bold text-text-light-primary dark:text-text-dark-primary">
            Pagamento
          </h3>
          <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mt-1">
            {DEMO_MESSAGE}
          </p>
        </div>
        <div className="ml-4">
          {isOpen ? (
            <ICON_MAP.chevronUp className="h-6 w-6 text-text-light-secondary dark:text-text-dark-secondary" aria-hidden="true" />
          ) : (
            <ICON_MAP.chevronDown className="h-6 w-6 text-text-light-secondary dark:text-text-dark-secondary" aria-hidden="true" />
          )}
        </div>
      </button>

      {/* Conteúdo expansível */}
      {isOpen && (
        <div id="payment-content" className="p-4 pt-0 space-y-4">
          {/* Resumo */}
          <div className="rounded-lg bg-background-light dark:bg-background-dark p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-light-secondary dark:text-text-dark-secondary">Quantidade</span>
              <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                {formatNumber(quantidade)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary">Total</span>
              <span className="text-sm font-bold text-text-light-primary dark:text-text-dark-primary">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Aviso de demonstração */}
          <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
            <p className="text-sm text-text-light-primary dark:text-text-dark-primary">
              {DEMO_NOTICE}
            </p>
          </div>

          {/* Lista de métodos */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary">
              Selecione um método
            </p>
            <div className="grid grid-cols-1 gap-3">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedMethod === method.id;
                const Icon = method.icon;
                
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    disabled={disabled}
                    className={`
                      flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-150
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-background-light dark:border-background-dark hover:border-primary/50 hover:bg-background-light/50 dark:hover:bg-background-dark/50'
                      }
                    `.trim().replace(/\s+/g, ' ')}
                    aria-pressed={isSelected}
                  >
                    <div className={`
                      flex items-center justify-center h-12 w-12 rounded-full
                      ${isSelected ? 'bg-primary text-white' : 'bg-background-light dark:bg-background-dark text-text-light-secondary dark:text-text-dark-secondary'}
                    `.trim().replace(/\s+/g, ' ')}>
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">
                        {method.label}
                      </p>
                      <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                        {method.description}
                      </p>
                    </div>
                    {isSelected && (
                      <ICON_MAP.creditCard className="h-5 w-5 text-primary" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conteúdo do método selecionado */}
          {selectedMethod && selectedMethodData && (
            <div className="rounded-lg bg-background-light dark:bg-background-dark p-4 space-y-3">
              <p className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
                {selectedMethodData.label}
              </p>
              
              {/* Conteúdo específico por método */}
              {selectedMethod === 'crypto' && (
                <div className="space-y-2">
                  <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
                    Endereço da carteira (exemplo)
                  </p>
                  <div className="p-3 rounded bg-card-light dark:bg-card-dark font-mono text-xs text-text-light-primary dark:text-text-dark-primary break-all">
                    1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
                  </div>
                </div>
              )}
              
              {selectedMethod === 'pix' && (
                <div className="space-y-2">
                  <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
                    Chave Pix (exemplo)
                  </p>
                  <div className="p-3 rounded bg-card-light dark:bg-card-dark font-mono text-xs text-text-light-primary dark:text-text-dark-primary">
                    pagamento@dominio.com.br
                  </div>
                  <div className="flex justify-center p-4 bg-white rounded">
                    <div className="h-32 w-32 bg-gray-200 rounded flex items-center justify-center">
                      <ICON_MAP.qrCode className="h-16 w-16 text-gray-400" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              )}
              
              {selectedMethod === 'boleto' && (
                <div className="space-y-2">
                  <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
                    Código de barras (exemplo)
                  </p>
                  <div className="p-3 rounded bg-card-light dark:bg-card-dark font-mono text-xs text-text-light-primary dark:text-text-dark-primary">
                    00190.00009 02801.001070 34301.147189 1 99380000012345
                  </div>
                </div>
              )}
              
              {selectedMethod === 'card' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
                      Número do cartão
                    </label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      disabled
                      className="w-full p-2 rounded bg-card-light dark:bg-card-dark border border-background-light dark:border-background-dark text-text-light-primary dark:text-text-dark-primary text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
                        Validade
                      </label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        disabled
                        className="w-full p-2 rounded bg-card-light dark:bg-card-dark border border-background-light dark:border-background-dark text-text-light-primary dark:text-text-dark-primary text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="000"
                        disabled
                        className="w-full p-2 rounded bg-card-light dark:bg-card-dark border border-background-light dark:border-background-dark text-text-light-primary dark:text-text-dark-primary text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Aviso específico do método */}
              <div className="pt-2">
                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary italic">
                  {selectedMethodData.demoNotice}
                </p>
              </div>
            </div>
          )}

          {/* Botão de confirmação */}
          <ContainedButton
            onClick={handleConfirm}
            disabled={!selectedMethod || disabled}
            fullWidth
            size="large"
            variant="primary"
            icon={<ICON_MAP.creditCard className="h-5 w-5" aria-hidden="true" />}
          >
            Confirmar pagamento
          </ContainedButton>
        </div>
      )}
    </div>
  );
}

// Exportar tipos e constantes para testes futuros
export type { PaymentMethod, PaymentMethodOption };
export { PAYMENT_METHODS };
