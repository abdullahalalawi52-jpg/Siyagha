import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { syncUserDataToCloud } from '../lib/sync';
import { toneOptions, formalityOptions, letterTypes, predefinedTemplates } from '../data/templates';

const ObjectKeys = Object.keys(letterTypes);

export interface FormContextType {
  form: {
    type: string;
    subType: string;
    senderName: string;
    senderPhone: string;
    senderEmail: string;
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
  customTemplates: any[];
  setCustomTemplates: React.Dispatch<React.SetStateAction<any[]>>;
  favoriteTemplates: { type: string; subType: string }[];
  setFavoriteTemplates: React.Dispatch<React.SetStateAction<{ type: string; subType: string }[]>>;
  favoritePredefined: string[];
  setFavoritePredefined: React.Dispatch<React.SetStateAction<string[]>>;
  activeTemplate: string | null;
  setActiveTemplate: (id: string | null) => void;
  toggleFavorite: (type: string, subType: string) => void;
  toggleFavoritePredefined: (id: string, e: React.MouseEvent) => void;
  autoGenerate: boolean;
  setAutoGenerate: (val: boolean) => void;
  handleSaveCustomTemplate: () => void;
  applyTemplate: (id: string, isCustom?: boolean) => void;
  handleVoiceInput: () => void;
  isListening: boolean;
  currentVariables: string[];
  replaceVariable: (variable: string, value: string) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { appLang, setIsLibraryOpen } = useUI();

  // Form states
  const [form, setForm] = useState({
    type: ObjectKeys[0],
    subType: letterTypes['إداري/رسمي'].subTypes[0].name,
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    recipientName: '',
    recipientRole: '',
    subject: '',
    details: '',
    tone: toneOptions[0],
    formality: formalityOptions[1],
    language: 'ar',
    date: new Date().toISOString().split('T')[0],
  });

  // Sync form language when app language changes
  useEffect(() => {
    setForm((prev) => ({ ...prev, language: appLang }));
  }, [appLang]);

  // Lists & Favorites
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [favoriteTemplates, setFavoriteTemplates] = useState<{ type: string; subType: string }[]>([]);
  const [favoritePredefined, setFavoritePredefined] = useState<string[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  // Auto Generate state
  const [autoGenerate, setAutoGenerateState] = useState(() => {
    try {
      const saved = localStorage.getItem('auto_generate');
      return saved === 'true';
    } catch (e) {
      return false;
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

  // Load local storage templates
  useEffect(() => {
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

  // Helper helper to get savedLetters from localStorage without importing LetterContext
  const getLocalSavedLetters = () => {
    try {
      const saved = localStorage.getItem('saved_letters');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

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
        savedLetters: getLocalSavedLetters(),
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
        savedLetters: getLocalSavedLetters(),
        favoriteTemplates: next,
        favoritePredefined,
      });
    }
  };

  // Custom template saving
  const handleSaveCustomTemplate = () => {
    // We assume templateName is managed in UIContext or passed down
    // Since UIContext contains `newTemplateName` and `setNewTemplateName`, we can read/write it
    // Wait, let's look at UIContext fields we added:
    // libraryTab, setLibraryTab, isSavingTemplate, setIsSavingTemplate, newTemplateName, setNewTemplateName
    // We can read it here using useUI()
  };

  // Let's get these from UIContext
  const ui = useUI();

  const handleSaveCustomTemplateWrapper = () => {
    if (!ui.newTemplateName) return;
    const newTpl = {
      id: `custom_${Date.now()}`,
      name: ui.newTemplateName,
      data: { ...form },
    };
    const updated = [...customTemplates, newTpl];
    setCustomTemplates(updated);
    localStorage.setItem('custom_templates', JSON.stringify(updated));
    ui.setNewTemplateName('');
    ui.setIsSavingTemplate(false);
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

  // Voice recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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
    <FormContext.Provider
      value={{
        form,
        setForm,
        customTemplates,
        setCustomTemplates,
        favoriteTemplates,
        setFavoriteTemplates,
        favoritePredefined,
        setFavoritePredefined,
        activeTemplate,
        setActiveTemplate,
        toggleFavorite,
        toggleFavoritePredefined,
        autoGenerate,
        setAutoGenerate,
        handleSaveCustomTemplate: handleSaveCustomTemplateWrapper,
        applyTemplate,
        handleVoiceInput,
        isListening,
        currentVariables,
        replaceVariable,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
