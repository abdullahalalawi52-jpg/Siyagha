import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, Archive, User, Sun, Moon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const {
    appLang,
    setAppLang,
    darkMode,
    toggleDarkMode,
    isOnline,
    savedLetters,
    setIsArchiveOpen,
    t,
  } = useApp();

  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="h-[72px] sticky top-0 z-40 flex items-center transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm transition-all">
              <svg viewBox="0 0 100 100" className="w-6 h-6 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="nibGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-logo-start)" />
                    <stop offset="100%" stopColor="var(--color-logo-end)" />
                  </linearGradient>
                  <linearGradient id="nibGradAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-logo-accent-start)" />
                    <stop offset="100%" stopColor="var(--color-logo-accent-end)" />
                  </linearGradient>
                </defs>
                {/* Classical Column/Pillar Cap at the top */}
                <path d="M 28,12 L 72,12 L 72,18 L 28,18 Z" fill="url(#nibGradAccent)" />
                <path d="M 34,22 L 66,22 L 66,27 L 34,27 Z" fill="url(#nibGradAccent)" />
                {/* Main Nib pointing downwards */}
                <path d="M 42,30 H 58 C 58,40 66,48 66,56 C 66,68 50,88 50,88 C 50,88 34,68 34,56 C 34,40 42,30 42,30 Z" fill="url(#nibGrad)" />
                {/* Slit & Breather Hole (cutout effect using container bg) */}
                <line x1="50" y1="56" x2="50" y2="88" stroke="var(--color-logo-bg)" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="50" cy="56" r="4.5" fill="var(--color-logo-bg)" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white leading-none px-4 py-2 bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl shadow-sm">
              {t('صياغة', 'Siyagha')}
            </h1>
          </div>
          {/* Online/Offline indicator */}
          <div className={`hidden sm:flex ms-1 items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all border backdrop-blur-md shadow-sm ${
            isOnline
              ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100/50 dark:bg-emerald-500/10 dark:border-emerald-500/20'
              : 'bg-amber-50/50 text-amber-600 border-amber-100/50 dark:bg-amber-500/10 dark:border-amber-500/20'
          }`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? t('متصل', 'Online') : t('أوفلاين', 'Offline')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <p className="text-xs font-bold text-gray-600 dark:text-gray-300 hidden lg:block px-4 py-2 bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl shadow-sm">
            {t('خطابات رسمية واحترافية', 'Professional letters')}
          </p>

          {/* Language Toggle */}
          <button
            onClick={() => setAppLang(appLang === 'ar' ? 'en' : 'ar')}
            className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl shadow-sm hover:bg-white/60 dark:hover:bg-white/10 transition-all cursor-pointer"
            title={t('تغيير اللغة', 'Change Language')}
            type="button"
          >
            {appLang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 flex items-center justify-center text-gray-700 dark:text-gray-200 bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl shadow-sm hover:bg-white/60 dark:hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
            title={darkMode ? t('الوضع المضيء', 'Light Mode') : t('الوضع الداكن', 'Dark Mode')}
            type="button"
          >
            <AnimatePresence mode="wait" initial={false}>
              {darkMode ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, scale: 0, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="flex items-center justify-center"
                >
                  <Sun className="w-4 h-4 text-yellow-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, scale: 0, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="flex items-center justify-center"
                >
                  <Moon className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Archive */}
          <button
            onClick={() => setIsArchiveOpen(true)}
            className="relative flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 px-4 py-2 bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl shadow-sm hover:bg-white/60 dark:hover:bg-white/10 transition-all cursor-pointer"
            type="button"
          >
            <Archive className="w-4 h-4" />
            <span className="hidden sm:inline">{t('الأرشيف', 'Archive')}</span>
            {savedLetters.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm">
                {savedLetters.length}
              </span>
            )}
          </button>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 hidden sm:block truncate max-w-[100px] px-3 py-1.5 bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl">
                {user.displayName || user.email}
              </span>
              <button
                onClick={signOut}
                className="px-4 py-2 text-xs font-bold rounded-xl text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-500/10 backdrop-blur-md border border-red-200 dark:border-red-500/20 shadow-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-all cursor-pointer"
                title="تسجيل الخروج"
                type="button"
              >
                خروج
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="px-4 py-2 text-xs font-bold rounded-xl text-brown-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-500/10 backdrop-blur-md border border-orange-200 dark:border-orange-500/20 shadow-sm hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title="تسجيل الدخول باستخدام جوجل"
              type="button"
            >
              <User className="w-3.5 h-3.5 hidden sm:block" />
              <span>دخول</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
