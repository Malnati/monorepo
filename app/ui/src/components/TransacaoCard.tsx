// app/ui/src/components/TransacaoCard.tsx
import { Link } from 'react-router-dom';
import { Transacao } from '../types';
import { formatCurrencyValue, formatDate } from '../utils/format';

interface TransacaoCardProps {
  transacao: Transacao;
}

export default function TransacaoCard({ transacao }: TransacaoCardProps) {
  return (
    <Link
      to={`/transacoes/${transacao.id}`}
      className="
        flex flex-col gap-3 rounded-xl 
        bg-card-light dark:bg-card-dark 
        p-4 shadow-sm hover:shadow-md 
        transition-shadow
      "
      role="listitem"
    >
      <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
        {formatDate(transacao.created_at)}
      </p>
      
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold leading-tight text-text-light-primary dark:text-text-dark-primary line-clamp-2 flex-1">
          {transacao.lote_residuo.titulo || transacao.lote_residuo.nome}
        </p>
        <p className="text-sm font-bold text-text-light-primary dark:text-text-dark-primary whitespace-nowrap">
          R$ {formatCurrencyValue(transacao.preco_total)}
        </p>
      </div>
    </Link>
  );
}
