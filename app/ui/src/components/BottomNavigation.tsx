// app/ui/src/components/BottomNavigation.tsx
import { Link, useLocation } from 'react-router-dom';
import { ICON_MAP } from '../utils/icons';

const NAV_ITEMS_TEXT = {
  HOME: 'Extrato',
  CATALOG: 'Ofertas',
  CREATE: 'Publicar',
};

interface NavItem {
  path: string;
  icon: keyof typeof ICON_MAP;
  label: string;
  key: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/home', icon: 'inventory', label: NAV_ITEMS_TEXT.HOME, key: 'home' },
  { path: '/offers', icon: 'catalog', label: NAV_ITEMS_TEXT.CATALOG, key: 'catalog' },
  { path: '/offers/novo', icon: 'create', label: NAV_ITEMS_TEXT.CREATE, key: 'create' },
];

export default function BottomNavigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="sticky bottom-0 z-10 bg-card-light dark:bg-card-dark border-t border-background-light dark:border-background-dark p-2 mt-auto"
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="flex justify-around gap-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const IconComponent = ICON_MAP[item.icon];
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg w-20 
                transition-all duration-150 ease-out
                ${active 
                  ? 'bg-primary/20 dark:bg-primary/30' 
                  : 'hover:bg-chip-light dark:hover:bg-chip-dark active:scale-95'
                }
              `}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <IconComponent 
                className={`
                  h-6 w-6
                  ${active 
                    ? 'text-text-light-primary dark:text-text-dark-primary' 
                    : 'text-text-light-secondary dark:text-text-dark-secondary'
                  }
                `}
                aria-hidden="true"
              />
              <span 
                className={`
                  text-xs
                  ${active 
                    ? 'font-bold text-text-light-primary dark:text-text-dark-primary' 
                    : 'font-medium text-text-light-secondary dark:text-text-dark-secondary'
                  }
                `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
