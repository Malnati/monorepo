// app/uisrc/components/StatementTab.tsx
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Transacao } from '../types';
import { formatCurrencyValue, formatDate } from '../utils/format';
import { ICON_MAP, ICON_SOLID_MAP } from '../utils/icons';
import LoteCardSkeleton from './LoteCardSkeleton';
import EmptyState from './EmptyState';

const EMPTY_EXTRATO_TITLE = 'Nenhuma transação encontrada';
const EMPTY_EXTRATO_DESCRIPTION = 'Você ainda não possui transações registradas.';
const ERROR_EXTRATO_TITLE = 'Erro ao carregar transações';
const ERROR_EXTRATO_DESCRIPTION = 'Não foi possível carregar suas transações. Verifique sua conexão e tente novamente.';
const ERROR_BUTTON_TEXT = 'Tentar novamente';

export default function StatementTab() {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Transacao[]>('/app/api/transacoes');
      setTransacoes(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar transações:', err);
      setError(ERROR_EXTRATO_DESCRIPTION);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransacoes();
  }, []);

  const groupedTransactions = useMemo(() => {
    if (!transacoes.length) return [];

    const grouped: Record<string, Transacao[]> = {};
    
    transacoes.forEach((transacao) => {
      const dateKey = formatDate(transacao.created_at);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transacao);
    });

    return Object.entries(grouped)
      .map(([date, transactions]) => ({
        date,
        transactions: transactions.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      }))
      .sort((a, b) => 
        new Date(b.transactions[0].created_at).getTime() - 
        new Date(a.transactions[0].created_at).getTime()
      );
  }, [transacoes]);

  const isIncoming = (transacao: Transacao): boolean => {
    if (!user) return false;
    
    const userFornecedorIds = user.fornecedores?.map(f => f.id) || [];
    const userCompradorIds = user.compradores?.map(c => c.id) || [];
    
    const isUserComprador = userCompradorIds.includes(transacao.comprador.id);
    const isUserFornecedor = userFornecedorIds.includes(transacao.fornecedor.id);
    
    return isUserComprador && !isUserFornecedor;
  };

  const isEmpty = !loading && transacoes.length === 0;

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
          title={ERROR_EXTRATO_TITLE}
          description={error}
          action={{
            label: ERROR_BUTTON_TEXT,
            onClick: loadTransacoes,
          }}
        />
      )}

      {isEmpty && !error && (
        <EmptyState
          icon={<ICON_MAP.document />}
          title={EMPTY_EXTRATO_TITLE}
          description={EMPTY_EXTRATO_DESCRIPTION}
        />
      )}

      {!loading && !error && groupedTransactions.length > 0 && (
        <div className="flex flex-col gap-4 pb-6 pt-4" role="list">
          {groupedTransactions.map((group) => (
            <div
              key={group.date}
              className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm"
              role="listitem"
            >
              <p className="text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-3">
                {group.date}
              </p>
              <div className="flex flex-col gap-3">
                {group.transactions.map((transacao) => {
                  const incoming = isIncoming(transacao);
                  const Icon = incoming ? ICON_MAP.incoming : ICON_MAP.outgoing;
                  
                  return (
                    <Link
                      key={transacao.id}
                      to={`/transacoes/${transacao.id}`}
                      className="flex items-center justify-between gap-4 hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 ${
                            incoming
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                          aria-hidden="true"
                        />
                        <p className="text-sm font-semibold leading-tight text-text-light-primary dark:text-text-dark-primary line-clamp-2 flex-1">
                          {transacao.lote_residuo.titulo || transacao.lote_residuo.nome}
                        </p>
                      </div>
                      <p className={`text-sm font-bold whitespace-nowrap ${
                        incoming
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {incoming ? '+' : '-'} R$ {formatCurrencyValue(transacao.preco_total)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
