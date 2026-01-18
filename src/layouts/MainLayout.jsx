import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { useI18n } from '../features/i18n/I18nProvider';
import { User as _User, Globe, Calendar, MessageSquare, LogOut, Facebook, Instagram, Linkedin, ArrowUp } from 'lucide-react';
import { ChatWidget } from '../features/chat/ChatWidget';
import { ModalManager } from '../components/ModalManager';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();

  // Centralized Modal State
  const [modalType, setModalType] = useState(null); // 'login' | 'reg' | 'appt' | 'history'

  const handleOpenAppt = () => {
    // TODO: Login for appointment, depends on real need
    // if (!user) {
    //     setModalType('login');
    //     return;
    // }
    setModalType('appt');
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-sans text-gray-900">
      {/* --- Header --- */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm px-6 py-4 flex justify-between items-center transition-all">
        {/* Logo Area */}
        <div className="flex items-center gap-3 text-[#4a6741] cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          {/* Replace with actual image tag if needed */}
          <img 
          src='/public/logo.svg'
          className="w-20 h-20 rounded-full flex items-center justify-center">
          </img>
          <span className="text-2xl font-bold tracking-tighter font-serif">{t("app.name")}</span>
        </div>

        {/* Right Navigation */}
        <div className="flex gap-4 items-center">
          {/* Language Switcher */}
          <div className="hidden md:flex items-center gap-2 mr-2 border-r pr-4 border-gray-200">
            <Globe size={18} className="text-gray-400" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          </div>

          {/* Appointment Button */}
          <button
            onClick={handleOpenAppt}
            className="bg-[#8c4b37] hover:bg-[#7a4130] text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-sm transition transform active:scale-95"
          >
            <Calendar size={18} />
            <span className="hidden sm:inline">{t("nav.appt")}</span>
          </button>

          {/* User Status */}
          {user ? (
            <div className="flex items-center gap-3 ml-2">
              <button
                onClick={() => setModalType('userCenter')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              >
                <_User size={18} className="text-[#4a6741]" /> {/* 使用重命名的图标 */}
                <span className="text-sm font-bold hidden lg:inline">
                  {user?.name || "Guest"} {/* 安全访问属性 */}
                </span>
              </button>
              <button
                onClick={() => setModalType('history')}
                className="hidden sm:flex border border-[#4a6741] text-[#4a6741] px-4 py-2 rounded-full items-center gap-2 hover:bg-[#4a6741] hover:text-white transition"
              >
                <MessageSquare size={18} /> {t("nav.history")}
              </button>
              <div className="text-right hidden md:block">
                <div className="text-xs text-gray-400">Welcome</div>
                <div className="font-bold text-sm leading-none">{user?.name}</div>
              </div>

              <button
                onClick={logout}
                className="text-gray-400 hover:text-red-500 transition p-2 bg-gray-100 rounded-full hover:bg-red-50"
                title={t("agent.exit")}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2 ml-2">
              <button
                onClick={() => setModalType('login')}
                className="text-[#4a6741] font-bold px-3 hover:underline"
              >
                {t("nav.login")}
              </button>
              <button
                onClick={() => setModalType('reg')}
                className="hidden sm:block border border-[#4a6741] text-[#4a6741] px-4 py-1.5 rounded-full hover:bg-[#4a6741] hover:text-white transition font-medium"
              >
                {t("nav.register")}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-grow">
        {/* Router Outlet: Renders Home, etc. */}
        <Outlet />
      </main>

      {/* --- Footer --- */}
      <footer className="bg-neutral-900 text-white pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-gray-800 pb-12 mb-8">
          <div>
            <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#4a6741] inline-block"></span>
              {t("footer.contact")}
            </h4>
            <div className="space-y-3 opacity-80 font-light">
              <p>Hotline: +86 755 8888 9999</p>
              <p>Email: support@shennong.com</p>
              <p>Add: 3012 Sungang East Rd, Luohu, Shenzhen</p>
            </div>
            <div className="flex gap-4 mt-6">
              <Facebook className="hover:text-[#4a6741] cursor-pointer transition" />
              <Instagram className="hover:text-[#4a6741] cursor-pointer transition" />
              <Linkedin className="hover:text-[#4a6741] cursor-pointer transition" />
            </div>
          </div>
          <div className="md:text-right">
            <h4 className="text-xl font-bold mb-6">SHEN NONG TCM</h4>
            <ul className="space-y-3 opacity-70">
              <li className="cursor-pointer hover:text-[#4a6741] transition">About Us</li>
              <li className="cursor-pointer hover:text-[#4a6741] transition">TCM Services</li>
              <li className="cursor-pointer hover:text-[#4a6741] transition">Expert Team</li>
              <li className="cursor-pointer hover:text-[#4a6741] transition">Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Shen Nong Traditional Chinese Medicine. All rights reserved.
        </div>
      </footer>

      {/* --- Global Floating Elements --- */}

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed left-6 bottom-10 z-40 bg-[#4a6741] hover:bg-[#3d5535] text-white p-3 rounded-full shadow-lg transition-all active:scale-90"
      >
        <ArrowUp />
      </button>

      {/* Chat Widget (Connects via SocketProvider) */}
      <ChatWidget />

      {/* Modal Manager (Handles all popups) */}
      <ModalManager
        type={modalType}
        onClose={() => setModalType(null)}
        onSwitch={(newType) => setModalType(newType)}
      />
    </div>
  );
};