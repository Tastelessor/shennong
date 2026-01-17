import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { useI18n } from '../features/i18n/I18nProvider';
import { Shield, LogOut } from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Admin Header */}
      <header className="bg-indigo-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <Shield className="text-indigo-300" />
          <h1 className="text-xl font-bold tracking-wider">{t("admin.title")}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">Admin: {user?.name}</span>
          <button 
            onClick={logout} 
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
          >
            <LogOut size={14} /> {t("agent.exit")}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};