import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, Archive, User, Sun, Moon, Info, LogOut, LogIn } from 'lucide-react';
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
    <header className="h-16 sm:h-[72px] sticky top-0 z-40 w-full bg-white/75 dark:bg-teal-950/50 backdrop-blur-md border-b border-brown-100/30 dark:border-teal-900/40 shadow-xs transition-all flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-white/60 dark:bg-teal-900/30 backdrop-blur-sm border border-brown-200/40 dark:border-teal-800/80 shadow-xs transition-all group-hover:scale-105 group-hover:border-brown-400/40">
              <svg viewBox="0 0 100 100" className="w-5.5 h-5.5 sm:w-6 sm:h-6 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-brown-950 dark:text-white transition-colors group-hover:text-brown-700 dark:group-hover:text-brown-300">
              {t('صياغة', 'Siyagha')}
            </h1>
          </div>
          {/* Online/Offline indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
            isOnline
              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-900/30'
              : 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400 dark:border-amber-900/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'} ${isOnline ? 'animate-pulse' : ''}`} />
            <span>{isOnline ? t('متصل', 'Online') : t('أوفلاين', 'Offline')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <p className="text-xs font-semibold text-brown-600/70 dark:text-brown-400/70 hidden lg:block px-2">
            {t('خطابات رسمية واحترافية', 'Professional letters')}
          </p>

          {/* About Us Link */}
          <button
            onClick={() => setIsAboutOpen(true)}
            className="h-8 sm:h-9 px-2 sm:px-3 text-xs font-bold text-brown-700 dark:text-brown-300 bg-transparent border border-transparent rounded-xl hover:bg-white/60 dark:hover:bg-teal-950/40 hover:border-brown-100/50 dark:hover:border-teal-800/80 hover:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            title={t('من نحن', 'About Us')}
            type="button"
          >
            <Info className="w-4 h-4 text-brown-600 dark:text-brown-400" />
            <span className="hidden sm:inline">{t('من نحن', 'About Us')}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setAppLang(appLang === 'ar' ? 'en' : 'ar')}
            className="h-8 sm:h-9 px-2.5 sm:px-3 text-[10px] sm:text-xs font-bold text-brown-700 dark:text-brown-300 bg-transparent border border-transparent rounded-xl hover:bg-white/60 dark:hover:bg-teal-950/40 hover:border-brown-100/50 dark:hover:border-teal-800/80 hover:shadow-xs transition-all cursor-pointer flex items-center justify-center"
            title={t('تغيير اللغة', 'Change Language')}
            type="button"
          >
            {appLang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-brown-700 dark:text-brown-300 bg-transparent border border-transparent rounded-xl hover:bg-white/60 dark:hover:bg-teal-950/40 hover:border-brown-100/50 dark:hover:border-teal-800/80 hover:shadow-xs transition-all cursor-pointer overflow-hidden"
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
            className="relative h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-brown-700 dark:text-brown-300 bg-transparent border border-transparent rounded-xl hover:bg-white/60 dark:hover:bg-teal-950/40 hover:border-brown-100/50 dark:hover:border-teal-800/80 hover:shadow-xs transition-all cursor-pointer"
            aria-label={t('الأرشيف', 'Archive')}
            type="button"
          >
            <Archive className="w-4 h-4 text-brown-600 dark:text-brown-400" />
            <span className="hidden sm:inline">{t('الأرشيف', 'Archive')}</span>
            {savedLetters.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold shadow-xs">
                {savedLetters.length}
              </span>
            )}
          </button>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-[10px] font-bold text-brown-700 dark:text-brown-300 hidden md:block truncate max-w-[100px] px-2.5 py-1.5 bg-brown-500/10 dark:bg-teal-950/30 rounded-xl">
                {user.displayName || user.email}
              </span>
              <button
                onClick={signOut}
                className="h-8 sm:h-9 px-2 sm:px-3 text-[10px] sm:text-xs font-bold rounded-xl text-red-600 dark:text-red-400 bg-transparent border border-transparent hover:bg-red-50/80 dark:hover:bg-red-950/30 hover:border-red-200/50 dark:hover:border-red-900/30 transition-all cursor-pointer flex items-center gap-1"
                title={t('تسجيل الخروج', 'Log Out')}
                type="button"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('خروج', 'Log Out')}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="h-8 sm:h-9 px-2 sm:px-3 text-[10px] sm:text-xs font-bold rounded-xl text-white bg-brown-600 hover:bg-brown-500 dark:bg-brown-700 dark:hover:bg-brown-600 shadow-sm shadow-brown-600/10 transition-all flex items-center gap-1.5 cursor-pointer border border-transparent"
              title={t('تسجيل الدخول باستخدام جوجل', 'Sign In with Google')}
              type="button"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">{t('دخول', 'Sign In')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
