// app/ui/src/pages/StatementPage.tsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import BottomNavigation from "../components/BottomNavigation";
import OfflineBanner from "../components/OfflineBanner";
import TextButton from "../components/TextButton";
import StatementTab from "../components/StatementTab";
import SelledTab from "../components/SelledTab";
import PurchasedTab from "../components/PurchasedTab";
import { ICON_MAP } from "../utils/icons";

const TITLE_TEXT = "Extrato";
const LOGOUT_TEXT = "Sair";
const TAB_VENDIDOS_TEXT = "Vendidos";
const TAB_COMPRADOS_TEXT = "Comprados";
const TAB_EXTRATO_TEXT = "Extrato";

type TabType = "vendidos" | "comprados" | "extrato";

export default function StatementPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("comprados");

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark/80 backdrop-blur-sm">
        <div className="flex items-center p-4 pb-2 justify-between">
          <h1 className="text-sm font-bold leading-tight tracking-[-0.015em] flex-1 text-text-light-primary dark:text-text-dark-primary">
            {TITLE_TEXT}
          </h1>
          <TextButton
            onClick={logout}
            icon={<ICON_MAP.logout className="h-5 w-5" aria-hidden="true" />}
            size="small"
            variant="secondary"
            aria-label={LOGOUT_TEXT}
          >
            {LOGOUT_TEXT}
          </TextButton>
        </div>

        <div className="px-4 pt-3 pb-0">
          <div className="flex relative">
            <button
              onClick={() => setActiveTab("vendidos")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "vendidos"
                  ? "text-text-light-primary dark:text-text-dark-primary"
                  : "text-text-light-secondary dark:text-text-dark-secondary"
              }`}
              aria-label={TAB_VENDIDOS_TEXT}
              aria-pressed={activeTab === "vendidos"}
            >
              <ICON_MAP.sell className="h-5 w-5" aria-hidden="true" />
              <span className="uppercase tracking-wide">
                {TAB_VENDIDOS_TEXT}
              </span>
              {activeTab === "vendidos" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2D0F55] dark:bg-[#8B5CF6]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("comprados")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "comprados"
                  ? "text-text-light-primary dark:text-text-dark-primary"
                  : "text-text-light-secondary dark:text-text-dark-secondary"
              }`}
              aria-label={TAB_COMPRADOS_TEXT}
              aria-pressed={activeTab === "comprados"}
            >
              <ICON_MAP.shopping className="h-5 w-5" aria-hidden="true" />
              <span className="uppercase tracking-wide">
                {TAB_COMPRADOS_TEXT}
              </span>
              {activeTab === "comprados" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2D0F55] dark:bg-[#8B5CF6]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("extrato")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "extrato"
                  ? "text-text-light-primary dark:text-text-dark-primary"
                  : "text-text-light-secondary dark:text-text-dark-secondary"
              }`}
              aria-label={TAB_EXTRATO_TEXT}
              aria-pressed={activeTab === "extrato"}
            >
              <ICON_MAP.document className="h-5 w-5" aria-hidden="true" />
              <span className="uppercase tracking-wide">
                {TAB_EXTRATO_TEXT}
              </span>
              {activeTab === "extrato" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2D0F55] dark:bg-[#8B5CF6]" />
              )}
            </button>
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-700 mt-0" />
        </div>
      </header>

      <main className="flex-1 pb-20" role="main" aria-label="Painel de lotes">
        <div className="px-4">
          {activeTab === "extrato" && <StatementTab />}
          {activeTab === "vendidos" && <SelledTab />}
          {activeTab === "comprados" && <PurchasedTab />}
        </div>
      </main>

      <BottomNavigation />
      <OfflineBanner />
    </div>
  );
}
