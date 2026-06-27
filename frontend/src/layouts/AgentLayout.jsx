import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { useI18n } from '../features/i18n/I18nProvider';
import { Headset, LogOut } from 'lucide-react';

export const AgentLayout = () => {
  const { user, logout } = useAuth();
  const { t } = useI18n();

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Agent Header */}
      <header className="bg-[#4a6741] text-white px-6 py-3 flex justify-between items-center shadow-lg z-10">
        <div className="flex items-center gap-2">
          <Headset className="text-green-200" />
          <h1 className="text-lg font-bold">{t("agent.title")}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Agent: {user?.name}</span>
          <button 
            onClick={logout} 
            className="bg-black/20 hover:bg-black/30 px-3 py-1 rounded text-sm flex items-center gap-1 transition"
          >
            <LogOut size={14} /> {t("agent.exit")}
          </button>
        </div>
      </header>

      {/* Main Workspace (Full Height) */}
      <main className="flex-grow overflow-hidden flex">
        <Outlet />
      </main>
    </div>
  );
};