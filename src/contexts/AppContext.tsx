import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { syncUserDataToCloud, listenToCloudData } from '../lib/sync';
import { SavedLetter, PrintElementOptions } from '../types';
import { letterTypes, toneOptions, formalityOptions, predefinedTemplates, fontFamilies, fontSizes, getLetterTypeData } from '../data/templates';
import { escapeHtml, sanitizeUrl, buildPrintElement } from '../utils/helpers';

interface AppContextType {
  // App settings
  appLang: 'ar' | 'en';
  setAppLang: (lang: 'ar' | 'en') => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  isOnline: boolean;

  // Active inputs
  form: {
    type: string;
    subType: string;
    senderName: string;
    recipientName: string;
    recipientRole: string;
    subject: string;
    details: string;
    tone: string;
    formality: string;
    language: string;
    date: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  generatedLetter: string;
  updateLetterContent: (content: string, addToHistory?: boolean) => void;
  loading: boolean;
  error: string;
  setError: (err: string) => void;

  // History / Undo / Redo
  history: string[];
  historyIndex: number;
  handleUndo: () => void;
  handleRedo: () => void;

  // Active layout sections / settings
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  activeSection: 'basic' | 'branding' | 'signature';
  setActiveSection: (sec: 'basic' | 'branding' | 'signature') => void;
  branding: {
    enableHeader: boolean;
    theme: string;
    companyName: string;
    companyDetails: string;
    logoUrl: string;
    enableFooter: boolean;
    footerText: string;
  };
  setBranding: React.Dispatch<React.SetStateAction<any>>;
  signatureImage: string | null;
  setSignatureImage: (img: string | null) => void;
  sealImage: string | null;
  setSealImage: (img: string | null) => void;

  // Lists & Favorites
  savedLetters: SavedLetter[];
  setSavedLetters: React.Dispatch<React.SetStateAction<SavedLetter[]>>;
  customTemplates: any[];
  setCustomTemplates: React.Dispatch<React.SetStateAction<any[]>>;
  favoriteTemplates: { type: string; subType: string }[];
  favoritePredefined: string[];
  toggleFavorite: (type: string, subType: string) => void;
  toggleFavoritePredefined: (id: string, e: React.MouseEvent) => void;
  activeTemplate: string | null;
  setActiveTemplate: (id: string | null) => void;

  // Modals visibility
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

  // Modals / Specific feature logic & states
  savedStatus: boolean;
  draftStatus: boolean;
  isProofreading: boolean;
  isSuggestingTitle: boolean;
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

  // E-mail form
  emailForm: { to: string; subject: string; attachPdf: boolean };
  setEmailForm: React.Dispatch<React.SetStateAction<any>>;
  isSendingEmail: boolean;
  emailSuccess: string | null;
  setEmailSuccess: (msg: string | null) => void;

  // OCR
  ocrLoading: boolean;
  ocrError: string;
  setOcrError: (err: string) => void;
  handleOcrUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;

  // Share
  sharePassword: string;
  setSharePassword: (pwd: string) => void;
  shareUrl: string;
  shareLoading: boolean;
  shareCopied: boolean;
  setShareCopied: (copied: boolean) => void;

  // Auto Generate Toggle
  autoGenerate: boolean;
  setAutoGenerate: (val: boolean) => void;

  // AI assistant / Tone
  aiPolishing: boolean;
  toneResult: {
    toneName: string;
    formalityScore: number;
    summary: string;
    suggestions: string[];
  } | null;
  setToneResult: (res: any) => void;
  toneLoading: boolean;

  // Actions
  handleExportDOCX: () => void;
  handleExportPDF: () => Promise<void>;
  handlePolishLetter: () => Promise<void>;
  handleAnalyzeTone: () => Promise<void>;
  handleCreateShareLink: () => Promise<void>;
  handleVoiceInput: () => void;
  isListening: boolean;
  handleTogglePin: (e: React.MouseEvent, id: string) => void;
  handleSaveCustomTemplate: () => void;
  newTemplateName: string;
  setNewTemplateName: (name: string) => void;
  isSavingTemplate: boolean;
  setIsSavingTemplate: (open: boolean) => void;
  applyTemplate: (id: string, isCustom?: boolean) => void;
  handleSave: () => void;
  handleSaveDraft: () => void;
  handleLoadSaved: (letter: SavedLetter) => void;
  handleSuggestTitle: () => Promise<void>;
  handleProofread: () => Promise<void>;
  handleCopy: () => void;
  copied: boolean;
  handleSendEmail: () => Promise<void>;
  generateLetter: (e?: React.FormEvent) => Promise<void>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  clearCanvas: () => void;
  saveSignature: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature' | 'seal') => void;
  currentVariables: string[];
  replaceVariable: (variable: string, value: string) => void;
  t: (arText: string, enText: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const ObjectKeys = Object.keys(letterTypes);

  // App Language State
  const [appLang, setAppLang] = useState<'ar' | 'en'>('ar');
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
    // @ts-ignore
    document.startViewTransition(() => {
      import('react-dom').then(({ flushSync }) => {
        flushSync(() => {
          setDarkMode((prev) => !prev);
        });
      });
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

  // Form states
  const [form, setForm] = useState({
    type: ObjectKeys[0],
    subType: letterTypes['إداري/رسمي'].subTypes[0].name,
    senderName: '',
    recipientName: '',
    recipientRole: '',
    subject: '',
    details: '',
    tone: toneOptions[0],
    formality: formalityOptions[1],
    language: 'ar',
    date: new Date().toISOString().split('T')[0],
  });

  const [generatedLetter, setGeneratedLetterState] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const updateLetterContent = (newContent: string, addToHistory = true) => {
    setGeneratedLetterState(newContent);
    const currentHistItem = historyIndex >= 0 ? history.at(historyIndex) : undefined;
    if (addToHistory && newContent !== currentHistItem) {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        const newHistory = [...sliced, newContent].slice(-50);
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setGeneratedLetterState(history.at(prevIndex) || '');
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setGeneratedLetterState('');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setGeneratedLetterState(history.at(nextIndex) || '');
    }
  };

  // General App states
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>('');
  const [savedLetters, setSavedLetters] = useState<SavedLetter[]>([]);
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [favoriteTemplates, setFavoriteTemplates] = useState<{ type: string; subType: string }[]>([]);
  const [favoritePredefined, setFavoritePredefined] = useState<string[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  // Formatting
  const [fontFamily, setFontFamily] = useState('Cairo');
  const [fontSize, setFontSize] = useState('15px');
  const [activeSection, setActiveSection] = useState<'basic' | 'branding' | 'signature'>('basic');

  // Modals flags
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [savedStatus, setSavedStatus] = useState(false);
  const [draftStatus, setDraftStatus] = useState(false);
  const [isProofreading, setIsProofreading] = useState(false);
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
  
  // Archive filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [archiveTab, setArchiveTab] = useState<'all' | 'saved' | 'drafts'>('all');
  const [filterTag, setFilterTag] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [pendingTags, setPendingTags] = useState<string[]>([]);

  // Email form
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', attachPdf: true });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Template custom save
  const [libraryTab, setLibraryTab] = useState<'system' | 'custom'>('system');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Branding details
  const [branding, setBranding] = useState({
    enableHeader: false,
    theme: 'classic',
    companyName: '',
    companyDetails: '',
    logoUrl: '',
    enableFooter: false,
    footerText: '',
  });

  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [sealImage, setSealImage] = useState<string | null>(null);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // OCR states
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');

  // Voice states
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Sharing states
  const [sharePassword, setSharePassword] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Auto Generate state
  const [autoGenerate, setAutoGenerateState] = useState(() => {
    try {
      const saved = localStorage.getItem('auto_generate');
      return saved !== 'false';
    } catch (e) {
      return true;
    }
  });

  const setAutoGenerate = (val: boolean) => {
    setAutoGenerateState(val);
    try {
      localStorage.setItem('auto_generate', String(val));
    } catch (e) {
      console.error(e);
    }
  };

  // AI Polishing and Tone states
  const [aiPolishing, setAiPolishing] = useState(false);
  const [toneResult, setToneResult] = useState<any>(null);
  const [toneLoading, setToneLoading] = useState(false);

  // Load local data and unify Local Storage keys
  useEffect(() => {
    try {
      // Use unified key: saved_letters (with fallback to savedLetters for migration)
      let saved = localStorage.getItem('saved_letters');
      if (!saved) {
        saved = localStorage.getItem('savedLetters');
        if (saved) {
          localStorage.setItem('saved_letters', saved);
          localStorage.removeItem('savedLetters');
        }
      }
      if (saved) {
        setSavedLetters(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error reading saved letters:', e);
    }

    try {
      const savedTpls = localStorage.getItem('custom_templates');
      if (savedTpls) setCustomTemplates(JSON.parse(savedTpls));
    } catch (e) {
      console.error(e);
    }

    try {
      const savedFavs = localStorage.getItem('favoriteTemplates');
      if (savedFavs) setFavoriteTemplates(JSON.parse(savedFavs));
    } catch (e) {
      console.error(e);
    }

    try {
      const savedPre = localStorage.getItem('favoritePredefined');
      if (savedPre) setFavoritePredefined(JSON.parse(savedPre));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync state to Local Storage
  const updateSavedLettersAndSync = (letters: SavedLetter[]) => {
    setSavedLetters(letters);
    localStorage.setItem('saved_letters', JSON.stringify(letters));
    if (user) {
      syncUserDataToCloud(user, {
        savedLetters: letters,
        favoriteTemplates,
        favoritePredefined,
      });
    }
  };

  // Sync to Firebase on user login
  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToCloudData(user, (data) => {
      if (data.savedLetters) {
        setSavedLetters(data.savedLetters);
        localStorage.setItem('saved_letters', JSON.stringify(data.savedLetters));
      }
      if (data.favoriteTemplates) {
        setFavoriteTemplates(data.favoriteTemplates);
        localStorage.setItem('favoriteTemplates', JSON.stringify(data.favoriteTemplates));
      }
      if (data.favoritePredefined) {
        setFavoritePredefined(data.favoritePredefined);
        localStorage.setItem('favoritePredefined', JSON.stringify(data.favoritePredefined));
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Favorites handlers
  const toggleFavoritePredefined = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = favoritePredefined.includes(id)
      ? favoritePredefined.filter((t) => t !== id)
      : [...favoritePredefined, id];
    setFavoritePredefined(next);
    localStorage.setItem('favoritePredefined', JSON.stringify(next));
    if (user) {
      syncUserDataToCloud(user, {
        savedLetters,
        favoriteTemplates,
        favoritePredefined: next,
      });
    }
  };

  const toggleFavorite = (type: string, subType: string) => {
    const exists = favoriteTemplates.some((p) => p.type === type && p.subType === subType);
    const next = exists
      ? favoriteTemplates.filter((p) => !(p.type === type && p.subType === subType))
      : [...favoriteTemplates, { type, subType }];
    setFavoriteTemplates(next);
    localStorage.setItem('favoriteTemplates', JSON.stringify(next));
    if (user) {
      syncUserDataToCloud(user, {
        savedLetters,
        favoriteTemplates: next,
        favoritePredefined,
      });
    }
  };

  // DOCX Export
  const handleExportDOCX = () => {
    if (!generatedLetter) return;

    const headerHtml = branding.enableHeader
      ? '<div style="border-bottom: 2px solid #a18072; padding-bottom: 10px; margin-bottom: 20px; font-family: Arial, sans-serif;">' +
        '<h3 style="color: #a18072; margin: 0; font-size: 16px;">' +
        escapeHtml(branding.companyName || '') +
        '</h3>' +
        '<p style="font-size: 11px; color: #555; margin: 5px 0 0 0; line-height: 1.4;">' +
        escapeHtml(branding.companyDetails || '').replace(/\n/g, '<br />') +
        '</p>' +
        '</div>'
      : '';

    const footerHtml = branding.enableFooter
      ? '<div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 30px; text-align: center; font-size: 10px; color: #777; font-family: Arial, sans-serif;">' +
        escapeHtml(branding.footerText || '') +
        '</div>'
      : '';

    const signatureHtml =
      signatureImage || sealImage
        ? '<div style="margin-top: 40px; font-family: Arial, sans-serif;">' +
          '<p style="font-size: 12px; font-weight: bold; color: #222; margin-bottom: 8px;">التوقيع والختم:</p>' +
          '<div>' +
          (signatureImage
            ? '<img src="' + sanitizeUrl(signatureImage) + '" width="120" style="margin-right: 15px; vertical-align: middle;" />'
            : '') +
          (sealImage ? '<img src="' + sanitizeUrl(sealImage) + '" width="90" style="vertical-align: middle;" />' : '') +
          '</div>' +
          '</div>'
        : '';

    const htmlContent =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
      '<head>' +
      '<title>' +
      escapeHtml(form.subject) +
      '</title>' +
      '<meta charset="utf-8">' +
      '<style>' +
      'body {' +
      "font-family: 'Arial', serif;" +
      'direction: ' +
      (form.language === 'en' ? 'ltr' : 'rtl') +
      ';' +
      'text-align: ' +
      (form.language === 'en' ? 'left' : 'right') +
      ';' +
      'line-height: 1.6;' +
      '}' +
      'h2 {' +
      'text-align: center;' +
      'color: #222;' +
      'font-size: 18px;' +
      '}' +
      '.main-content {' +
      'font-size: 13px;' +
      'color: #333;' +
      'white-space: pre-line;' +
      '}' +
      '</style>' +
      '</head>' +
      '<body>' +
      headerHtml +
      '<h2>' +
      escapeHtml(form.subject) +
      '</h2>' +
      '<div class="main-content">' +
      escapeHtml(generatedLetter) +
      '</div>' +
      signatureHtml +
      footerHtml +
      '</body>' +
      '</html>';

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.subject || 'خطاب_رسمي'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // PDF Export
  const handleExportPDF = async () => {
    if (!generatedLetter) return;

    let parsedFontSize = parseInt(fontSize);
    if (isNaN(parsedFontSize)) parsedFontSize = 15;

    const printElement = buildPrintElement({
      fontFamily,
      fontSize: parsedFontSize + 2,
      isEn: form.language === 'en',
      subject: form.subject || 'خطاب',
      letterContent: generatedLetter,
      branding,
      signatureImage,
      sealImage,
    });

    const opt: any = {
      margin: 15,
      filename: `${form.subject || 'letter'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // @ts-ignore
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opt).from(printElement).save();
  };

  // AI polishing
  const handlePolishLetter = async () => {
    if (!generatedLetter) return;
    if (!isOnline) {
      alert('أنت غير متصل بالإنترنت حالياً. يرجى الاتصال بالإنترنت لتحسين الصياغة بالذكاء الاصطناعي.');
      return;
    }
    setAiPolishing(true);
    try {
      const response = await fetch('/api/polish-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: generatedLetter, language: form.language }),
      });

      if (!response.ok) throw new Error('فشل تحسين الصياغة');
      const data = await response.json();
      updateLetterContent(data.letter);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تحسين الصياغة');
    } finally {
      setAiPolishing(false);
    }
  };

  // AI Tone Analysis
  const handleAnalyzeTone = async () => {
    if (!generatedLetter) return;
    if (!isOnline) {
      alert('أنت غير متصل بالإنترنت حالياً. يرجى الاتصال بالإنترنت لتحليل نبرة الخطاب.');
      return;
    }
    setToneLoading(true);
    setToneResult(null);
    try {
      const response = await fetch('/api/analyze-tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: generatedLetter, language: form.language }),
      });

      if (!response.ok) throw new Error('فشل تحليل النبرة');
      const data = await response.json();
      setToneResult(data);
      setIsAiModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تحليل النبرة');
    } finally {
      setToneLoading(false);
    }
  };

  // AI Sharing Link
  const handleCreateShareLink = async () => {
    if (!generatedLetter) return;
    setShareLoading(true);
    setShareUrl('');
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: form.subject || 'خطاب رسمي',
          content: generatedLetter,
          branding,
          signatureImage,
          sealImage,
          language: form.language,
          password: sharePassword || undefined,
        }),
      });

      if (!response.ok) throw new Error('فشل إنشاء رابط المشاركة');
      const data = await response.json();
      setShareUrl(data.url);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setShareLoading(false);
    }
  };

  // OCR Parser
  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrError('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result !== 'string') {
          setOcrError('فشل قراءة ملف الصورة');
          setOcrLoading(false);
          return;
        }

        try {
          const res = await fetch('/api/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: reader.result }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'فشل استخراج النصوص');

          if (data.text) {
            setForm((prev: any) => ({ ...prev, details: data.text }));
            setActiveSection('basic');
            setIsOcrOpen(false);
          } else {
            setOcrError('لم يتم العثور على نصوص واضحة في الصورة');
          }
        } catch (err: any) {
          setOcrError(err.message || 'حدث خطأ أثناء معالجة الصورة');
        } finally {
          setOcrLoading(false);
        }
      };

      reader.onerror = () => {
        setOcrError('حدث خطأ أثناء قراءة ملف الصورة');
        setOcrLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setOcrError('فشل تحميل الصورة');
      setOcrLoading(false);
    }
  };

  // Voice recognition
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('متصفحك لا يدعم الإدخال الصوتي. استخدم Google Chrome للحصول على أفضل تجربة.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = form.language === 'en' ? 'en-US' : 'ar-SA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setForm((prev: any) => ({
        ...prev,
        details: prev.details ? prev.details + ' ' + transcript : transcript,
      }));
    };

    recognition.start();
  };

  // Toggle pin
  const handleTogglePin = (e: React.MouseEvent, letterId: string) => {
    e.stopPropagation();
    const updated = savedLetters.map((l) =>
      l.id === letterId ? { ...l, isPinned: !l.isPinned } : l
    );
    updateSavedLettersAndSync(updated);
  };

  // Custom template saving
  const handleSaveCustomTemplate = () => {
    if (!newTemplateName) return;
    const newTpl = {
      id: `custom_${Date.now()}`,
      name: newTemplateName,
      data: { ...form },
    };
    const updated = [...customTemplates, newTpl];
    setCustomTemplates(updated);
    localStorage.setItem('custom_templates', JSON.stringify(updated));
    setNewTemplateName('');
    setIsSavingTemplate(false);
  };

  // Template applier
  const applyTemplate = (templateId: string, isCustom = false) => {
    const templateList = isCustom ? customTemplates : predefinedTemplates;
    const template = templateList.find((t) => t.id === templateId);
    if (template) {
      setForm((prev) => ({ ...prev, ...template.data }));
      setActiveTemplate(templateId);
      setIsLibraryOpen(false);
    }
  };

  // Save letters
  const handleSave = () => {
    if (!generatedLetter) return;
    const newLetter: SavedLetter = {
      id: Date.now().toString(),
      subject: form.subject || 'خطاب بدون عنوان',
      date: new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
      content: generatedLetter,
      type: form.type,
      isDraft: false,
      formData: form,
      tags: pendingTags.length > 0 ? [...pendingTags] : undefined,
      savedAt: Date.now(),
    };
    const updated = [newLetter, ...savedLetters];
    updateSavedLettersAndSync(updated);
    setPendingTags([]);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleSaveDraft = () => {
    const newLetter: SavedLetter = {
      id: Date.now().toString(),
      subject: form.subject || 'مسودة خطاب',
      date: new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
      content: generatedLetter || '',
      type: form.type,
      isDraft: true,
      formData: form,
    };
    const updated = [newLetter, ...savedLetters];
    updateSavedLettersAndSync(updated);
    setDraftStatus(true);
    setTimeout(() => setDraftStatus(false), 2000);
  };

  const handleLoadSaved = (letter: SavedLetter) => {
    updateLetterContent(letter.content);
    if (letter.formData) {
      setForm(letter.formData);
    }
    setIsArchiveOpen(false);
  };

  // Suggest title AI
  const handleSuggestTitle = async () => {
    if (!isOnline) {
      alert('أنت غير متصل بالإنترنت حالياً. لا يمكن اقتراح عنوان للخطاب بدون اتصال.');
      return;
    }
    setIsSuggestingTitle(true);
    try {
      const response = await fetch('/api/suggest-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          subType: form.subType,
          details: form.details,
          language: form.language,
        }),
      });

      if (!response.ok) throw new Error('فشل في اقتراح العنوان');

      const data = await response.json();
      if (data.title) {
        setForm((prev: any) => ({ ...prev, subject: data.title }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggestingTitle(false);
    }
  };

  // Proofread spelling AI
  const handleProofread = async () => {
    if (!generatedLetter) return;
    if (!isOnline) {
      setError('أنت غير متصل بالإنترنت حالياً. يرجى الاتصال بالإنترنت لتشغيل التدقيق الإملائي بالذكاء الاصطناعي.');
      return;
    }
    setIsProofreading(true);
    setError('');

    try {
      const response = await fetch('/api/proofread-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: generatedLetter,
          language: form.language,
        }),
      });

      if (!response.ok) {
        throw new Error('حدث خطأ أثناء التدقيق اللغوي');
      }

      const data = await response.json();
      updateLetterContent(data.letter);
    } catch (err) {
      console.error(err);
      setError('فشل التحديث. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProofreading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Send Email with optional PDF attachment
  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject) return;

    setIsSendingEmail(true);
    setEmailSuccess(null);
    let pdfAttachmentBase64 = null;

    try {
      if (emailForm.attachPdf) {
        let parsedFontSize = parseInt(fontSize);
        if (isNaN(parsedFontSize)) parsedFontSize = 15;
        const pdfFontSize = parsedFontSize + 2;

        const printElement = buildPrintElement({
          fontFamily,
          fontSize: pdfFontSize,
          isEn: form.language === 'en',
          subject: form.subject || 'خطاب',
          letterContent: generatedLetter,
          branding,
          signatureImage,
          sealImage,
        });

        const opt: any = {
          margin: 15,
          filename: 'letter.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        // @ts-ignore
        const html2pdf = (await import('html2pdf.js')).default;
        pdfAttachmentBase64 = await html2pdf().set(opt).from(printElement).outputPdf('datauristring');
      }

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailForm.to,
          subject: emailForm.subject,
          text: generatedLetter,
          pdfAttachment: pdfAttachmentBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');

      if (data.previewUrl) {
        setEmailSuccess(`تم الإرسال بنجاح (Ethereal test email). رابط المعاينة: ${data.previewUrl}`);
      } else {
        setEmailSuccess('تم إرسال البريد الإلكتروني بنجاح!');
      }

      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailSuccess(null);
      }, 5000);
    } catch (err: any) {
      setEmailSuccess(null);
      console.error(err);
      alert('حدث خطأ أثناء إرسال البريد الإلكتروني');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Generate Letter fetch call
  const generateLetter = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.senderName || !form.recipientName || !form.subject) {
      setError('يرجى تعبئة الحقول الإلزامية الأساسية');
      return;
    }
    if (!isOnline) {
      setError('أنت غير متصل بالإنترنت حالياً. يمكنك كتابة وتعديل النص يدوياً وحفظ الخطاب كمسودة.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء الإنشاء');
      }
      updateLetterContent(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generation logic (with cleanup/debouncing)
  useEffect(() => {
    if (!autoGenerate) return;
    if (!form.senderName || !form.recipientName || !form.subject) return;

    const timer = setTimeout(() => {
      generateLetter();
    }, 3000); // Increased debounce to 3 seconds for better performance and API conservation

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, autoGenerate]);

  // Drawing Canvas helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureImage(dataUrl);
    setIsSigningOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature' | 'seal') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (type === 'logo') {
          setBranding((prev) => ({ ...prev, logoUrl: reader.result as string }));
        } else if (type === 'signature') {
          setSignatureImage(reader.result);
        } else if (type === 'seal') {
          setSealImage(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Variable extraction
  const extractVariables = (text: string) => {
    const matches = text.match(/\[(.*?)\]/g);
    return matches ? matches.map((m) => m.slice(1, -1)) : [];
  };

  const currentVariables = Array.from(
    new Set([...extractVariables(form.subject), ...extractVariables(form.details)])
  );

  const replaceVariable = (variable: string, value: string) => {
    if (!value) return;
    const target = '[' + variable + ']';
    setForm((prev: any) => ({
      ...prev,
      subject: prev.subject.replaceAll(target, value),
      details: prev.details.replaceAll(target, value),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        appLang,
        setAppLang,
        darkMode,
        toggleDarkMode,
        isOnline,
        form,
        setForm,
        generatedLetter,
        updateLetterContent,
        loading,
        error,
        setError,
        history,
        historyIndex,
        handleUndo,
        handleRedo,
        fontFamily,
        setFontFamily,
        fontSize,
        setFontSize,
        activeSection,
        setActiveSection,
        branding,
        setBranding,
        signatureImage,
        setSignatureImage,
        sealImage,
        setSealImage,
        savedLetters,
        setSavedLetters,
        customTemplates,
        setCustomTemplates,
        favoriteTemplates,
        favoritePredefined,
        toggleFavorite,
        toggleFavoritePredefined,
        activeTemplate,
        setActiveTemplate,
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
        savedStatus,
        draftStatus,
        isProofreading,
        isSuggestingTitle,
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
        emailForm,
        setEmailForm,
        isSendingEmail,
        emailSuccess,
        setEmailSuccess,
        ocrLoading,
        ocrError,
        setOcrError,
        handleOcrUpload,
        sharePassword,
        setSharePassword,
        shareUrl,
        shareLoading,
        shareCopied,
        setShareCopied,
        autoGenerate,
        setAutoGenerate,
        aiPolishing,
        toneResult,
        setToneResult,
        toneLoading,
        handleExportDOCX,
        handleExportPDF,
        handlePolishLetter,
        handleAnalyzeTone,
        handleCreateShareLink,
        handleVoiceInput,
        isListening,
        handleTogglePin,
        handleSaveCustomTemplate,
        newTemplateName,
        setNewTemplateName,
        isSavingTemplate,
        setIsSavingTemplate,
        applyTemplate,
        handleSave,
        handleSaveDraft,
        handleLoadSaved,
        handleSuggestTitle,
        handleProofread,
        handleCopy,
        copied,
        handleSendEmail,
        generateLetter,
        canvasRef,
        isDrawing,
        setIsDrawing,
        startDrawing,
        draw,
        stopDrawing,
        clearCanvas,
        saveSignature,
        handleImageUpload,
        currentVariables,
        replaceVariable,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
