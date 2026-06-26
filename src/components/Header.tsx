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
    <header className="h-16 sm:h-[72px] sticky top-0 z-40 w-full bg-transparent border-none shadow-none transition-all flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Logo Bubble */}
          <div className="h-10 sm:h-11 px-3 flex items-center gap-2.5 bg-white/60 dark:bg-teal-950/40 backdrop-blur-md border border-brown-100/50 dark:border-teal-800/80 rounded-2xl shadow-sm transition-all hover:border-brown-400/40 group cursor-pointer">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/40 dark:bg-black/20 border border-white/50 dark:border-white/10 shadow-xs transition-all group-hover:scale-105">
              <svg viewBox="0 0 100 100" className="w-4.5 h-4.5 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-brown-950 dark:text-white leading-none">
              {t('صياغة', 'Siyagha')}
            </h1>
          </div>

          {/* Online/Offline indicator as its own bubble */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 h-10 sm:h-11 rounded-2xl text-[10px] font-bold border bg-white/60 dark:bg-teal-950/40 backdrop-blur-md border-brown-100/50 dark:border-teal-800/80 shadow-sm transition-all ${
            isOnline
              ? 'text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/40'
              : 'text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40'
          }`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? t('متصل', 'Online') : t('أوفلاين', 'Offline')}</span>
          </div>
        </div>

        {/* Actions Bubble */}
        <div className="flex items-center gap-1 px-1.5 py-1 bg-white/60 dark:bg-teal-950/40 backdrop-blur-md border border-brown-100/50 dark:border-teal-800/80 rounded-2xl shadow-sm h-10 sm:h-11">
          <p className="text-xs font-semibold text-brown-600/70 dark:text-brown-400/70 hidden lg:block px-2">
            {t('خطابات رسمية واحترافية', 'Professional letters')}
          </p>
          
          {/* Separator line if text label is visible */}
          <span className="w-px h-5 bg-brown-200/40 dark:bg-teal-800/50 hidden lg:block" />

          {/* About Us Link */}
          <button
            onClick={() => setIsAboutOpen(true)}
            className="h-7 sm:h-8 px-2 sm:px-2.5 text-xs font-bold text-brown-700 dark:text-brown-300 rounded-lg hover:bg-brown-500/10 dark:hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1"
            title={t('من نحن', 'About Us')}
            type="button"
          >
            <Info className="w-4 h-4 text-brown-600 dark:text-brown-400" />
            <span className="hidden sm:inline">{t('من نحن', 'About Us')}</span>
          </button>

          {/* Separator line */}
          <span className="w-px h-4 sm:h-5 bg-brown-200/40 dark:bg-teal-800/50" />

          {/* Language Toggle */}
          <button
            onClick={() => setAppLang(appLang === 'ar' ? 'en' : 'ar')}
            className="h-7 sm:h-8 px-2 sm:px-2.5 text-[10px] sm:text-xs font-bold text-brown-700 dark:text-brown-300 rounded-lg hover:bg-brown-500/10 dark:hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
            title={t('تغيير اللغة', 'Change Language')}
            type="button"
          >
            {appLang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Separator line */}
          <span className="w-px h-4 sm:h-5 bg-brown-200/40 dark:bg-teal-800/50" />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-brown-700 dark:text-brown-300 rounded-lg hover:bg-brown-500/10 dark:hover:bg-white/5 transition-all cursor-pointer overflow-hidden"
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
                  transition={{ duration: 0.2 }}
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
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  <Moon className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Separator line */}
          <span className="w-px h-4 sm:h-5 bg-brown-200/40 dark:bg-teal-800/50" />

          {/* Archive */}
          <button
            onClick={() => setIsArchiveOpen(true)}
            className="relative h-7 sm:h-8 px-2 sm:px-2.5 flex items-center gap-1 text-[10px] sm:text-xs font-bold text-brown-700 dark:text-brown-300 rounded-lg hover:bg-brown-500/10 dark:hover:bg-white/5 transition-all cursor-pointer"
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

          {/* Separator line */}
          <span className="w-px h-4 sm:h-5 bg-brown-200/40 dark:bg-teal-800/50" />

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-brown-700 dark:text-brown-300 hidden md:block truncate max-w-[80px] px-2 py-1 bg-brown-500/5 dark:bg-teal-950/20 rounded-md">
                {user.displayName || user.email}
              </span>
              <button
                onClick={signOut}
                className="h-7 sm:h-8 px-2 sm:px-2.5 text-[10px] sm:text-xs font-bold rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all cursor-pointer flex items-center gap-1"
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
              className="h-7 sm:h-8 px-2 sm:px-2.5 text-[10px] sm:text-xs font-bold rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 dark:hover:bg-orange-500/20 transition-all flex items-center gap-1 cursor-pointer"
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
