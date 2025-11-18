// app/ui/src/components/OfferCard.tsx
import { Link } from "react-router-dom";
import { Offer } from "../types";
import { formatCurrency, formatNumber } from "../utils/format";
import { useAuthenticatedImage } from "../hooks/useAuthenticatedImage";
import { ICON_MAP } from "../utils/icons";

const SYNCING_TEXT = "Sincronizando";
const SEPARATOR = "·";
const NO_TITLE_TEXT = "Sem título";
const NO_DESCRIPTION_TEXT = "Sem descrição";
const NO_PHOTO_ALT = "Sem foto";

interface OfferCardProps {
  offer: Offer;
  isSyncing?: boolean;
  showPhoto?: boolean;
  showLink?: boolean;
  className?: string;
}

// Componente auxiliar para foto principal autenticada
function AuthenticatedPhotoCard({ url, alt }: { url: string; alt: string }) {
  const imageUrl = useAuthenticatedImage(url);
  return (
    <div
      className="h-24 w-24 flex-shrink-0 rounded-lg bg-cover bg-center bg-no-repeat bg-gray-200 dark:bg-gray-700"
      style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }}
      role="img"
      aria-label={alt}
    />
  );
}

// Função para obter endereço sugerido (neighborhood ou city, nunca localização exata)
function getSuggestedAddress(offer: Offer): string | null {
  // Priorizar neighborhood, depois city, nunca real
  if (offer.locationLayers?.neighborhood?.label) {
    const cityLabel = offer.locationLayers?.city?.label;
    if (cityLabel) {
      return `${offer.locationLayers.neighborhood.label}, ${cityLabel}`;
    }
    return offer.locationLayers.neighborhood.label;
  }

  if (offer.locationLayers?.city?.label) {
    return offer.locationLayers.city.label;
  }

  // Fallback para endereço formatado aproximado se disponível
  if (offer.approx_formatted_address) {
    return offer.approx_formatted_address;
  }

  return null;
}

export default function OfferCard({
  offer,
  isSyncing = false,
  showPhoto = true,
  showLink = true,
  className = "",
}: OfferCardProps) {
  // Compatibilidade com tipo legacy LoteResiduo
  const title = offer.title || (offer as any).titulo || NO_TITLE_TEXT;
  const description =
    offer.description || (offer as any).descricao || NO_DESCRIPTION_TEXT;
  const suggestedAddress = getSuggestedAddress(offer);

  const cardContent = (
    <>
      {isSyncing && (
        <div className="absolute top-2 right-2 z-10">
          <span
            className="
            inline-flex items-center gap-1 
            px-2 py-1 rounded-full 
            bg-orange-100 dark:bg-orange-900 
            text-orange-800 dark:text-orange-100 
            text-xs font-medium
          "
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            {SYNCING_TEXT}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 flex-col gap-3">
          {/* Título */}
          <h3 className="text-base font-semibold leading-tight text-text-light-primary dark:text-text-dark-primary line-clamp-2">
            {title}
          </h3>
          {/* Descrição */}
          <p className="text-sm leading-relaxed text-text-light-secondary dark:text-text-dark-secondary line-clamp-2">
            {description}
          </p>

          {/* Tipo */}
          {offer.tipo && (
            <div className="flex items-center gap-2">
              <ICON_MAP.tag
                className="h-4 w-4 text-text-light-secondary dark:text-text-dark-secondary"
                aria-hidden="true"
              />
              <span className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                {offer.tipo.nome}
              </span>
            </div>
          )}

          {/* Quantidade e Valor */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
              {formatNumber(offer.quantidade)} {offer.unidade?.nome || ""}
            </span>
            <span className="text-text-light-secondary dark:text-text-dark-secondary">
              {SEPARATOR}
            </span>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(offer.preco)}
            </span>
          </div>

          {/* Endereço sugerido */}
          {suggestedAddress && (
            <div className="flex items-start gap-2">
              <ICON_MAP.location
                className="h-4 w-4 text-text-light-secondary dark:text-text-dark-secondary mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-sm text-text-light-secondary dark:text-text-dark-secondary line-clamp-1">
                {suggestedAddress}
              </span>
            </div>
          )}
        </div>

        {showPhoto && (
          <>
            {offer.foto_principal ? (
              <AuthenticatedPhotoCard
                url={offer.foto_principal.url}
                alt={`Foto de ${title}`}
              />
            ) : (
              <div
                className="h-24 w-24 flex-shrink-0 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                role="img"
                aria-label={NO_PHOTO_ALT}
              >
                <ICON_MAP.photo
                  className="h-12 w-12 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );

  const baseClassName = `
    flex flex-col gap-4 rounded-xl 
    bg-card-light dark:bg-card-dark 
    p-4 shadow-sm hover:shadow-md 
    transition-shadow
    relative
    ${className}
  `.trim();

  if (showLink) {
    return (
      <Link
        to={`/offers/${offer.id}`}
        className={baseClassName}
        role="listitem"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={baseClassName} role="listitem">
      {cardContent}
    </div>
  );
}
