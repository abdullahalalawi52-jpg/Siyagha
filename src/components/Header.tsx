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
    setIsAboutOpen,
    t,
  } = useApp();

  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="h-[72px] sticky top-0 z-40 flex items-center transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative logo-container group cursor-pointer">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm transition-all group-hover:scale-105 group-hover:border-brown-400/40">
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
            <h1 className="text-xl font-bold tracking-tight text-brown-900 dark:text-white leading-none px-4 py-2 bg-white/60 dark:bg-teal-950/40 backdrop-blur-md border border-brown-100/50 dark:border-teal-800/80 rounded-xl shadow-sm">
              {t('صياغة', 'Siyagha')}
            </h1>
          </div>
          {/* Online/Offline indicator */}
          <div className={`hidden sm:flex ms-1 items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all border backdrop-blur-md shadow-sm ${
            isOnline
              ? 'bg-emerald-50/60 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40'
              : 'bg-amber-50/60 text-amber-700 border-amber-200/50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40'
          }`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? t('متصل', 'Online') : t('أوفلاين', 'Offline')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <p className="text-xs font-bold text-brown-700 dark:text-brown-300 hidden lg:block px-4 py-2 bg-white/60 dark:bg-teal-950/40 backdrop-blur-md border border-brown-100/50 dark:border-teal-800/80 rounded-xl shadow-sm">
            {t('خطابات رسمية واحترافية', 'Professional letters')}
          </p>

          {/* About Us Link */}
          <button
            onClick={() => setIsAboutOpen(true)}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold text-brown-700 dark:text-brown-300 bg-white/60 dark:bg-teal-950/40 backdrop-blur-md border border-brown-100/50 dark:border-teal-800/80 rounded-xl shadow-sm hover:bg-brown-50 dark:hover:bg-teal-900/40 transition-all cursor-pointer"
            type="button"
          >
            {t('من نحن', 'About Us')}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setAppLang(appLang === 'ar' ? 'en' : 'ar')}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold text-brown-700 dark:text-brown-300 bg-white/60 dark:bg-teal-950/40 backdrop-blur-md border border-brown-100/50 dark:border-teal-800/80 rounded-xl shadow-sm hover:bg-brown-50 dark:hover:bg-teal-900/40 transition-all cursor-pointer"
            title={t('تغيير اللغة', 'Change Language')}
            type="button"
          >
            {appLang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-brown-700 dark:text-brown-300 bg-white/60 dark:bg-teal-950/40 backdrop-blur-md border border-brown-100/50 dark:border-teal-800/80 rounded-xl shadow-sm hover:bg-brown-50 dark:hover:bg-teal-900/40 transition-all cursor-pointer overflow-hidden"
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
            className="relative flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-brown-700 dark:text-brown-300 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-white/60 dark:bg-teal-950/40 backdrop-blur-md border border-brown-100/50 dark:border-teal-800/80 rounded-xl shadow-sm hover:bg-brown-50 dark:hover:bg-teal-900/40 transition-all cursor-pointer"
            aria-label={t('الأرشيف', 'Archive')}
            type="button"
          >
            <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('الأرشيف', 'Archive')}</span>
            {savedLetters.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm">
                {savedLetters.length}
              </span>
            )}
          </button>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] font-bold text-brown-700 dark:text-brown-300 hidden md:block truncate max-w-[100px] px-3 py-1.5 bg-white/60 dark:bg-teal-950/40 backdrop-blur-md border border-brown-100/50 dark:border-teal-800/80 rounded-xl">
                {user.displayName || user.email}
              </span>
              <button
                onClick={signOut}
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold rounded-xl text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-500/10 backdrop-blur-md border border-red-200 dark:border-red-500/20 shadow-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-all cursor-pointer"
                title={t('تسجيل الخروج', 'Log Out')}
                type="button"
              >
                {t('خروج', 'Log Out')}
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold rounded-xl text-brown-700 dark:text-orange-400 bg-orange-50/60 dark:bg-orange-950/40 backdrop-blur-md border border-orange-200/60 dark:border-orange-900/40 shadow-sm hover:bg-orange-100/80 dark:hover:bg-orange-900/60 transition-all flex items-center gap-1 cursor-pointer"
              title={t('تسجيل الدخول باستخدام جوجل', 'Sign In with Google')}
              type="button"
            >
              <User className="w-3.5 h-3.5 hidden sm:block" />
              <span>{t('دخول', 'Sign In')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
