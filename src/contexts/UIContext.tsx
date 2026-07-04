import React, { createContext, useContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ToastMessage } from '../types';

export interface UIContextType {
  appLang: 'ar' | 'en';
  setAppLang: (lang: 'ar' | 'en') => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  isOnline: boolean;
  isArchiveOpen: boolean;
  setIsArchiveOpen: (open: boolean) => void;
  isLibraryOpen: boolean;
  setIsLibraryOpen: (open: boolean) => void;
  isStatsOpen: boolean;
  setIsStatsOpen: (open: boolean) => void;
  isEmailModalOpen: boolean;
  setIsEmailModalOpen: (open: boolean) => void;
  isSigningOpen: boolean;
  setIsSigningOpen: (open: boolean) => void;
  isOcrOpen: boolean;
  setIsOcrOpen: (open: boolean) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  isAboutOpen: boolean;
  setIsAboutOpen: (open: boolean) => void;
  isBrandVoiceModalOpen: boolean;
  setIsBrandVoiceModalOpen: (open: boolean) => void;
  isCareerProfileModalOpen: boolean;
  setIsCareerProfileModalOpen: (open: boolean) => void;
  ocrTargetField: 'details' | 'replyToText' | 'jobDescription' | 'resumeInfo';
  setOcrTargetField: (field: 'details' | 'replyToText' | 'jobDescription' | 'resumeInfo') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  archiveTab: 'all' | 'saved' | 'drafts';
  setArchiveTab: (tab: 'all' | 'saved' | 'drafts') => void;
  filterTag: string;
  setFilterTag: (tag: string) => void;
  tagInput: string;
  setTagInput: (val: string) => void;
  pendingTags: string[];
  setPendingTags: React.Dispatch<React.SetStateAction<string[]>>;
  libraryTab: 'system' | 'custom';
  setLibraryTab: (tab: 'system' | 'custom') => void;
  isSavingTemplate: boolean;
  setIsSavingTemplate: (open: boolean) => void;
  newTemplateName: string;
  setNewTemplateName: (name: string) => void;
  t: (arText: string, enText: string) => string;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

import i18n from '../i18n';

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App Language State
  const [appLang, setAppLangState] = useState<'ar' | 'en'>(() => (i18n.language === 'en' ? 'en' : 'ar'));
  
  const setAppLang = (lang: 'ar' | 'en') => {
    setAppLangState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('siyagha_lang', lang);
  };

  const t = (arText: string, enText: string) => (appLang === 'ar' ? arText : enText);

  // Theme
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const toggleDarkMode = () => {
    const doc = document as any;
    if (!doc.startViewTransition) {
      setDarkMode((prev) => !prev);
      return;
    }

    const isRtl = appLang === 'ar';
    const startPolygon = isRtl
      ? 'polygon(100% 0, 100% 0, 100% 0, 100% 0)'
      : 'polygon(0 0, 0 0, 0 0, 0 0)';
    const endPolygon = isRtl
      ? 'polygon(100% 0, 100% 100%, 0 100%, 0 0)'
      : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        setDarkMode((prev) => !prev);
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [startPolygon, endPolygon],
        },
        {
          duration: 500,
          easing: 'cubic-bezier(0.85, 0, 0.15, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Modals flags
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isBrandVoiceModalOpen, setIsBrandVoiceModalOpen] = useState(false);
  const [isCareerProfileModalOpen, setIsCareerProfileModalOpen] = useState(false);
  const [ocrTargetField, setOcrTargetField] = useState<'details' | 'replyToText' | 'jobDescription' | 'resumeInfo'>('details');

  // Archive filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [archiveTab, setArchiveTab] = useState<'all' | 'saved' | 'drafts'>('all');
  const [filterTag, setFilterTag] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [pendingTags, setPendingTags] = useState<string[]>([]);

  // Template custom save
  const [libraryTab, setLibraryTab] = useState<'system' | 'custom'>('system');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <UIContext.Provider
      value={{
        appLang,
        setAppLang,
        darkMode,
        toggleDarkMode,
        isOnline,
        isArchiveOpen,
        setIsArchiveOpen,
        isLibraryOpen,
        setIsLibraryOpen,
        isStatsOpen,
        setIsStatsOpen,
        isEmailModalOpen,
        setIsEmailModalOpen,
        isSigningOpen,
        setIsSigningOpen,
        isOcrOpen,
        setIsOcrOpen,
        isAiModalOpen,
        setIsAiModalOpen,
        isAboutOpen,
        setIsAboutOpen,
        isBrandVoiceModalOpen,
        setIsBrandVoiceModalOpen,
        isCareerProfileModalOpen,
        setIsCareerProfileModalOpen,
        ocrTargetField,
        setOcrTargetField,
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        archiveTab,
        setArchiveTab,
        filterTag,
        setFilterTag,
        tagInput,
        setTagInput,
        pendingTags,
        setPendingTags,
        libraryTab,
        setLibraryTab,
        isSavingTemplate,
        setIsSavingTemplate,
        newTemplateName,
        setNewTemplateName,
        t,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}

      {/* Modern Animated Toasts Overlay */}
      <div className="fixed bottom-6 right-6 left-6 md:left-auto md:right-6 z-55 flex flex-col gap-2.5 max-w-sm pointer-events-none" dir={appLang === 'ar' ? 'rtl' : 'ltr'}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: 15, transition: { duration: 0.2 } }}
              className={`p-3.5 rounded-xl shadow-xl text-xs font-bold text-white flex items-center justify-between gap-3 pointer-events-auto border backdrop-blur-md ${
                toast.type === 'success' ? 'bg-emerald-600/95 border-emerald-500/30' :
                toast.type === 'error' ? 'bg-rose-600/95 border-rose-500/30' :
                toast.type === 'warning' ? 'bg-amber-600/95 border-amber-500/30' :
                'bg-blue-600/95 border-blue-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="hover:opacity-75 cursor-pointer text-base leading-none font-black pl-1"
                title="Close"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </UIContext.Provider>
  );
};
export default UIContext;
