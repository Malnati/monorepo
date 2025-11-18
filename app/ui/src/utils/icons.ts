// app/ui/src/utils/icons.ts

// Outline icons (24x24) - para ações padrão
import {
  HomeIcon,
  BuildingStorefrontIcon,
  PlusCircleIcon,
  ArchiveBoxIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  DocumentDuplicateIcon,
  MapIcon,
  CameraIcon,
  ArrowPathIcon,
  XMarkIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  WifiIcon,
  SignalSlashIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  PhotoIcon,
  CreditCardIcon,
  QrCodeIcon,
  DocumentTextIcon,
  ChevronUpIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  TagIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

// Solid icons (24x24) - para feedback e estados
import {
  ExclamationCircleIcon as ExclamationCircleSolid,
  ExclamationTriangleIcon as ExclamationTriangleSolid,
  CheckCircleIcon as CheckCircleSolid,
  InformationCircleIcon as InformationCircleSolid,
  BanknotesIcon as BanknotesSolid,
} from "@heroicons/react/24/solid";

/**
 * Mapeamento centralizado de ícones outline (ações padrão).
 * Todos os ícones seguem grid 8pt e tokens de cor do sistema.
 */
export const ICON_MAP = {
  // Navegação
  home: HomeIcon,
  catalog: BuildingStorefrontIcon,
  create: PlusCircleIcon,
  inventory: ArchiveBoxIcon,

  // Ações
  back: ArrowLeftIcon,
  logout: ArrowRightOnRectangleIcon,
  search: MagnifyingGlassIcon,
  copy: DocumentDuplicateIcon,
  directions: MapIcon,
  camera: CameraIcon,
  sync: ArrowPathIcon,
  close: XMarkIcon,
  download: ArrowDownTrayIcon,

  // Tabs/Categorias
  sell: CurrencyDollarIcon,
  shopping: ShoppingBagIcon,

  // Status
  wifi: WifiIcon,
  wifiOff: SignalSlashIcon,

  // UI elements
  chevronDown: ChevronDownIcon,
  chevronUp: ChevronUpIcon,
  photo: PhotoIcon,

  // Pagamentos
  creditCard: CreditCardIcon,
  qrCode: QrCodeIcon,
  document: DocumentTextIcon,
  coin: CurrencyDollarIcon,

  // Transações
  incoming: ArrowDownCircleIcon,
  outgoing: ArrowUpCircleIcon,

  // Categorias e localização
  tag: TagIcon,
  location: MapPinIcon,
} as const;

/**
 * Mapeamento de ícones solid para feedback e estados.
 */
export const ICON_SOLID_MAP = {
  error: ExclamationCircleSolid,
  warning: ExclamationTriangleSolid,
  success: CheckCircleSolid,
  info: InformationCircleSolid,
  marker: BanknotesSolid, // Marcador do mapa
} as const;

/**
 * Tipo para chaves semânticas de ícones outline.
 */
export type IconName = keyof typeof ICON_MAP;

/**
 * Tipo para chaves semânticas de ícones solid.
 */
export type IconSolidName = keyof typeof ICON_SOLID_MAP;

/**
 * Tipo utilitário para componentes de ícone Heroicons.
 */
export type HeroIconComponent = (typeof ICON_MAP)[IconName];
export type HeroIconSolidComponent = (typeof ICON_SOLID_MAP)[IconSolidName];

/**
 * Busca um ícone outline pelo nome semântico.
 * @param name - Nome semântico do ícone
 * @returns Componente React do ícone
 */
export function getIcon(name: IconName): HeroIconComponent {
  return ICON_MAP[name];
}

/**
 * Busca um ícone solid pelo nome semântico.
 * @param name - Nome semântico do ícone solid
 * @returns Componente React do ícone
 */
export function getIconSolid(name: IconSolidName): HeroIconSolidComponent {
  return ICON_SOLID_MAP[name];
}
