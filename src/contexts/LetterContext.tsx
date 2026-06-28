import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { useForm } from './FormContext';
import { syncUserDataToCloud, listenToCloudData } from '../lib/sync';
import { SavedLetter } from '../types';
import { escapeHtml, sanitizeUrl, buildPrintElement } from '../utils/helpers';

const handleResponse = async (res: Response, defaultError: string) => {
  let responseText = '';
  try {
    responseText = await res.text();
  } catch {}

  if (!res.ok) {
    let errorMsg = defaultError;
    try {
      const errData = JSON.parse(responseText);
      errorMsg = errData.error || errData.message || errorMsg;
    } catch {
      if (responseText) errorMsg = responseText;
    }
    throw new Error(errorMsg);
  }

  try {
    return JSON.parse(responseText);
  } catch (e: any) {
    throw new Error(`Invalid JSON response: ${e.message}`);
  }
};

const getApiUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}${path}`;
};

export interface LetterContextType {
  generatedLetter: string;
  updateLetterContent: (content: string, addToHistory?: boolean) => void;
  loading: boolean;
  error: string;
  setError: (err: string) => void;
  history: string[];
  historyIndex: number;
  handleUndo: () => void;
  handleRedo: () => void;
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
    footerTheme?: string;
  };
  setBranding: React.Dispatch<React.SetStateAction<any>>;
  signatureImage: string | null;
  setSignatureImage: (img: string | null) => void;
  sealImage: string | null;
  setSealImage: (img: string | null) => void;
  savedLetters: SavedLetter[];
  setSavedLetters: React.Dispatch<React.SetStateAction<SavedLetter[]>>;
  savedStatus: boolean;
  draftStatus: boolean;
  isProofreading: boolean;
  isSuggestingTitle: boolean;
  emailForm: { to: string; subject: string; attachPdf: boolean };
  setEmailForm: React.Dispatch<React.SetStateAction<any>>;
  isSendingEmail: boolean;
  emailSuccess: string | null;
  setEmailSuccess: (msg: string | null) => void;
  ocrLoading: boolean;
  ocrError: string;
  setOcrError: (err: string) => void;
  handleOcrUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  sharePassword: string;
  setSharePassword: (pwd: string) => void;
  shareUrl: string;
  setShareUrl: (url: string) => void;
  shareLoading: boolean;
  shareCopied: boolean;
  setShareCopied: (copied: boolean) => void;
  aiPolishing: boolean;
  toneResult: {
    toneName: string;
    formalityScore: number;
    summary: string;
    suggestions: string[];
  } | null;
  setToneResult: (res: any) => void;
  toneLoading: boolean;
  handleExportDOCX: () => void;
  handleExportPDF: () => Promise<void>;
  handlePolishLetter: () => Promise<void>;
  handleAnalyzeTone: () => Promise<void>;
  handleCreateShareLink: () => Promise<void>;
  handleTogglePin: (e: React.MouseEvent, id: string) => void;
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
}

const LetterContext = createContext<LetterContextType | undefined>(undefined);

export const useLetter = () => {
  const context = useContext(LetterContext);
  if (!context) {
    throw new Error('useLetter must be used within a LetterProvider');
  }
  return context;
};

export const LetterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const ui = useUI();
  const { form, setForm, favoriteTemplates, favoritePredefined, setFavoriteTemplates, setFavoritePredefined, autoGenerate } = useForm();

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

  // Formatting
  const [fontFamily, setFontFamily] = useState('Cairo');
  const [fontSize, setFontSize] = useState('15px');
  const [activeSection, setActiveSection] = useState<'basic' | 'branding' | 'signature'>('basic');

  const [savedStatus, setSavedStatus] = useState(false);
  const [draftStatus, setDraftStatus] = useState(false);
  const [isProofreading, setIsProofreading] = useState(false);
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);

  // Email form
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', attachPdf: true });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Branding details
  const [branding, setBranding] = useState({
    enableHeader: false,
    theme: 'classic',
    companyName: '',
    companyDetails: '',
    logoUrl: '',
    enableFooter: false,
    footerText: '',
    footerTheme: 'centered',
  });

  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [sealImage, setSealImage] = useState<string | null>(null);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // OCR states
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');

  // Sharing states
  const [sharePassword, setSharePassword] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // AI Polishing and Tone states
  const [aiPolishing, setAiPolishing] = useState(false);
  const [toneResult, setToneResult] = useState<any>(null);
  const [toneLoading, setToneLoading] = useState(false);

  // Load local saved letters
  useEffect(() => {
    try {
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
  }, []);

  // Sync state to Local Storage and Firebase
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

  // Sync from Firebase
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
  }, [user, setFavoriteTemplates, setFavoritePredefined]);

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
          '<p style="font-size: 12px; font-weight: bold; color: #222; margin-bottom: 8px;">' +
          (form.language === 'en' ? 'Signature & Seal:' : 'التوقيع والختم:') +
          '</p>' +
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
    if (!ui.isOnline) {
      alert('أنت غير متصل بالإنترنت حالياً. يرجى الاتصال بالإنترنت لتحسين الصياغة بالذكاء الاصطناعي.');
      return;
    }
    setAiPolishing(true);
    try {
      const response = await fetch(getApiUrl('/api/polish-letter'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: generatedLetter, language: form.language }),
      });

      const data = await handleResponse(response, 'فشل تحسين الصياغة');
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
    if (!ui.isOnline) {
      alert('أنت غير متصل بالإنترنت حالياً. يرجى الاتصال بالإنترنت لتحليل نبرة الخطاب.');
      return;
    }
    setToneLoading(true);
    setToneResult(null);
    try {
      const response = await fetch(getApiUrl('/api/analyze-tone'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: generatedLetter, language: form.language }),
      });

      const data = await handleResponse(response, 'فشل تحليل النبرة');
      setToneResult(data);
      ui.setIsAiModalOpen(true);
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
      const response = await fetch(getApiUrl('/api/share'), {
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

      const data = await handleResponse(response, 'فشل إنشاء رابط المشاركة');
      setShareUrl(data.url);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setShareLoading(false);
    }
  };

  // OCR Upload
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
          const res = await fetch(getApiUrl('/api/ocr'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: reader.result }),
          });

          const data = await handleResponse(res, 'فشل استخراج النصوص');

          if (data.text) {
            if (ui.ocrTargetField === 'replyToText') {
              setForm((prev: any) => ({ ...prev, replyToText: data.text }));
            } else {
              setForm((prev: any) => ({ ...prev, details: data.text }));
            }
            setActiveSection('basic');
            ui.setIsOcrOpen(false);
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

  // Toggle pin
  const handleTogglePin = (e: React.MouseEvent, letterId: string) => {
    e.stopPropagation();
    const updated = savedLetters.map((l) =>
      l.id === letterId ? { ...l, isPinned: !l.isPinned } : l
    );
    updateSavedLettersAndSync(updated);
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
      tags: ui.pendingTags.length > 0 ? [...ui.pendingTags] : undefined,
      savedAt: Date.now(),
    };
    const updated = [newLetter, ...savedLetters];
    updateSavedLettersAndSync(updated);
    ui.setPendingTags([]);
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
    ui.setIsArchiveOpen(false);
  };

  // Suggest title AI
  const handleSuggestTitle = async () => {
    if (!ui.isOnline) {
      alert('أنت غير متصل بالإنترنت حالياً. لا يمكن اقتراح عنوان للخطاب بدون اتصال.');
      return;
    }
    setIsSuggestingTitle(true);
    try {
      const response = await fetch(getApiUrl('/api/suggest-title'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          subType: form.subType,
          details: form.details,
          language: form.language,
        }),
      });

      const data = await handleResponse(response, 'فشل في اقتراح العنوان');
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
    if (!ui.isOnline) {
      setError('أنت غير متصل بالإنترنت حالياً. يرجى الاتصال بالإنترنت لتشغيل التدقيق الإملائي بالذكاء الاصطناعي.');
      return;
    }
    setIsProofreading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/proofread-letter'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: generatedLetter,
          language: form.language,
        }),
      });

      const data = await handleResponse(response, 'حدث خطأ أثناء التدقيق اللغوي');
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

  // Send Email
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

      const res = await fetch(getApiUrl('/api/send-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailForm.to,
          subject: emailForm.subject,
          text: generatedLetter,
          pdfAttachment: pdfAttachmentBase64,
        }),
      });

      const data = await handleResponse(res, 'Failed to send email');

      if (data.previewUrl) {
        setEmailSuccess(`تم الإرسال بنجاح (Ethereal test email). رابط المعاينة: ${data.previewUrl}`);
      } else {
        setEmailSuccess('تم إرسال البريد الإلكتروني بنجاح!');
      }

      setTimeout(() => {
        ui.setIsEmailModalOpen(false);
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
    if (!ui.isOnline) {
      setError('أنت غير متصل بالإنترنت حالياً. يمكنك كتابة وتعديل النص يدوياً وحفظ الخطاب كمسودة.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/generate-letter'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const data = await handleResponse(res, 'حدث خطأ أثناء الإنشاء');
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
    }, 5000);

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
    ui.setIsSigningOpen(false);
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

  return (
    <LetterContext.Provider
      value={{
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
        savedStatus,
        draftStatus,
        isProofreading,
        isSuggestingTitle,
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
        setShareUrl,
        shareLoading,
        shareCopied,
        setShareCopied,
        aiPolishing,
        toneResult,
        setToneResult,
        toneLoading,
        handleExportDOCX,
        handleExportPDF,
        handlePolishLetter,
        handleAnalyzeTone,
        handleCreateShareLink,
        handleTogglePin,
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
      }}
    >
      {children}
    </LetterContext.Provider>
  );
};
