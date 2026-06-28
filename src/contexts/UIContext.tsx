import React, { createContext, useContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';

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
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
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
  ocrTargetField: 'details' | 'replyToText';
  setOcrTargetField: (field: 'details' | 'replyToText') => void;
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
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App Language State
  const [appLang, setAppLangState] = useState<'ar' | 'en'>('ar');
  const t = (arText: string, enText: string) => (appLang === 'ar' ? arText : enText);

  // Theme
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const toggleDarkMode = () => {
    // @ts-ignore
    if (!document.startViewTransition) {
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

    // @ts-ignore
    const transition = document.startViewTransition(() => {
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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isBrandVoiceModalOpen, setIsBrandVoiceModalOpen] = useState(false);
  const [ocrTargetField, setOcrTargetField] = useState<'details' | 'replyToText'>('details');

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

  // We expose setAppLangState but wrapping it so that children can call setAppLang
  const setAppLang = (lang: 'ar' | 'en') => {
    setAppLangState(lang);
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
        isShareModalOpen,
        setIsShareModalOpen,
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
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
