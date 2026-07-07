import React, { useState, useEffect } from 'react';
import { escapeHtml, sanitizeUrl, buildPrintElement } from '../utils/helpers';
import { LetterFormState, ToneAnalysisResult, AtsAnalysisResult, EmailFormState, BrandingConfig } from '../types';
import { UIContextType } from '../contexts/UIContext';

export interface UseLetterApisProps {
  form: LetterFormState;
  setForm: React.Dispatch<React.SetStateAction<LetterFormState>>;
  generatedLetter: string;
  updateLetterContent: (content: string, addToHistory?: boolean) => void;
  ui: UIContextType;
  branding: BrandingConfig;
  signatureImage: string | null;
  setSignatureImage: (img: string | null) => void;
  sealImage: string | null;
  fontFamily: string;
  fontSize: string;
  setActiveSection: (sec: 'basic' | 'branding' | 'signature') => void;
  autoGenerate: boolean;
}

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
  let baseUrl = import.meta.env.VITE_API_URL || '';
  // In live production (e.g. Vercel / GitHub Pages), ignore localhost VITE_API_URL and use relative /api paths
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      baseUrl = '';
    }
  }
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}${path}`;
};

export const useLetterApis = ({
  form,
  setForm,
  generatedLetter,
  updateLetterContent,
  ui,
  branding,
  signatureImage,
  setSignatureImage,
  sealImage,
  fontFamily,
  fontSize,
  setActiveSection,
  autoGenerate,
}: UseLetterApisProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Email state
  const [emailForm, setEmailForm] = useState<EmailFormState>({ to: '', subject: '', attachPdf: true });


  // Spelling linter status
  const [isProofreading, setIsProofreading] = useState(false);
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');

  // Share state
  const [sharePassword, setSharePassword] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // AI Tone and ATS match state
  const [aiPolishing, setAiPolishing] = useState(false);
  const [toneResult, setToneResult] = useState<ToneAnalysisResult | null>(null);
  const [toneLoading, setToneLoading] = useState(false);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<AtsAnalysisResult | null>(null);

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

  // AI polishing
  const handlePolishLetter = async () => {
    if (!generatedLetter) return;
    if (!ui.isOnline) {
      ui.addToast('أنت غير متصل بالإنترنت حالياً. يرجى الاتصال بالإنترنت لتحسين الصياغة بالذكاء الاصطناعي.', 'warning');
      return;
    }
    setAiPolishing(true);
    try {
      const response = await fetch(getApiUrl('/api/polish-letter'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterContent: generatedLetter, targetTone: form.tone, lang: form.language }),
      });

      const data = await handleResponse(response, 'فشل تحسين الصياغة');
      updateLetterContent(data.polishedText);
      ui.addToast('تم تحسين صياغة الخطاب بنجاح!', 'success');
    } catch (err: any) {
      ui.addToast(err.message || 'حدث خطأ أثناء تحسين الصياغة', 'error');
    } finally {
      setAiPolishing(false);
    }
  };

  // AI Tone Analysis
  const handleAnalyzeTone = async () => {
    if (!generatedLetter) return;
    if (!ui.isOnline) {
      ui.addToast('أنت غير متصل بالإنترنت حالياً. يرجى الاتصال بالإنترنت لتحليل نبرة الخطاب.', 'warning');
      return;
    }
    setToneLoading(true);
    setToneResult(null);
    try {
      const response = await fetch(getApiUrl('/api/analyze-tone'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterContent: generatedLetter, lang: form.language }),
      });

      const data = await handleResponse(response, 'فشل تحليل النبرة');
      setToneResult(data);
      ui.setIsAiModalOpen(true);
    } catch (err: any) {
      ui.addToast(err.message || 'حدث خطأ أثناء تحليل النبرة', 'error');
    } finally {
      setToneLoading(false);
    }
  };

  // AI ATS analysis
  const handleAnalyzeAts = async () => {
    if (!generatedLetter) return;
    if (!form.jobDescription) {
      ui.addToast(ui.appLang === 'ar' ? 'يرجى إدخال الوصف الوظيفي أولاً لإجراء تحليل ATS.' : 'Please enter a job description first to analyze ATS.', 'warning');
      return;
    }
    if (!ui.isOnline) {
      ui.addToast(ui.appLang === 'ar' ? 'أنت غير متصل بالإنترنت حالياً. يرجى الاتصال بالإنترنت لتحليل مطابقة ATS.' : 'You are currently offline. Please connect to the internet to analyze ATS match.', 'warning');
      return;
    }
    setAtsLoading(true);
    setAtsResult(null);
    try {
      const response = await fetch(getApiUrl('/api/analyze-ats'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterContent: generatedLetter, jobDescription: form.jobDescription, jobTitle: form.subject || form.recipientRole || form.recipientName, lang: ui.appLang }),
      });

      const data = await handleResponse(response, 'فشل تحليل مطابقة ATS');
      setAtsResult(data);
      ui.setIsAiModalOpen(true);
    } catch (err: any) {
      ui.addToast(err.message || 'حدث خطأ أثناء تحليل ATS', 'error');
    } finally {
      setAtsLoading(false);
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
      ui.addToast('تم إنشاء رابط المشاركة بنجاح!', 'success');
    } catch (err: any) {
      ui.addToast(err.message || 'حدث خطأ غير متوقع', 'error');
    } finally {
      setShareLoading(false);
    }
  };

  // OCR Upload
  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: Validate file type
    const validTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (!validTypes.includes(file.type)) {
      setOcrError('صيغة الملف غير مدعومة. يرجى رفع صورة أو ملف PDF أو Word.');
      return;
    }

    // Security: Validate file size (max 5MB)
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setOcrError(`حجم الصورة كبير جداً. الحد الأقصى هو ${MAX_SIZE_MB} ميجابايت.`);
      return;
    }

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
            body: JSON.stringify({ imageBase64: reader.result, mimeType: file.type }),
          });

          const data = await handleResponse(res, 'فشل استخراج النصوص');

          if (data.extractedText) {
            if (ui.ocrTargetField === 'replyToText') {
              setForm((prev) => ({ ...prev, replyToText: data.extractedText }));
            } else if (ui.ocrTargetField === 'jobDescription') {
              setForm((prev) => ({ ...prev, jobDescription: data.extractedText }));
            } else if (ui.ocrTargetField === 'resumeInfo') {
              setForm((prev) => ({ ...prev, resumeInfo: data.extractedText }));
            } else {
              setForm((prev) => ({ ...prev, details: data.extractedText }));
            }
            setActiveSection('basic');
            ui.setIsOcrOpen(false);
            ui.addToast('تم استخراج النص بنجاح وإدراجه في الحقل المناسب!', 'success');
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

  // Suggest title AI
  const handleSuggestTitle = async () => {
    if (!ui.isOnline) {
      ui.addToast('أنت غير متصل بالإنترنت حالياً. لا يمكن اقتراح عنوان للخطاب بدون اتصال.', 'warning');
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
        setForm((prev) => ({ ...prev, subject: data.title }));
        ui.addToast('تم اقتراح العنوان بنجاح!', 'success');
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
          letterContent: generatedLetter,
          lang: form.language,
        }),
      });

      const data = await handleResponse(response, 'حدث خطأ أثناء التدقيق اللغوي');
      updateLetterContent(data.proofreadText);
      ui.addToast('تم الانتهاء من التدقيق اللغوي وتحديث النص!', 'success');
    } catch (err) {
      console.error(err);
      setError('فشل التحديث. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProofreading(false);
    }
  };

  // Send Email
  const handleSendEmail = (provider: 'gmail' | 'outlook' | 'default' = 'default') => {
    if (!emailForm.to || !emailForm.subject) return;

    try {
      const subject = encodeURIComponent(emailForm.subject);
      const body = encodeURIComponent(generatedLetter);
      let url = `mailto:${emailForm.to}?subject=${subject}&body=${body}`;

      if (provider === 'gmail') {
        url = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailForm.to}&su=${subject}&body=${body}`;
      } else if (provider === 'outlook') {
        url = `https://outlook.live.com/mail/0/deeplink/compose?to=${emailForm.to}&subject=${subject}&body=${body}`;
      }

      if (provider === 'default') {
        window.location.href = url;
      } else {
        // For Gmail and Outlook, opening in a new tab might fail if the URL is too long
        // but we still try to open it in a new tab.
        window.open(url, '_blank');
      }

      ui.addToast(ui.appLang === 'ar' ? 'تم فتح تطبيق البريد الإلكتروني!' : 'Email client opened!', 'success');
      ui.setIsEmailModalOpen(false);
    } catch (err: any) {
      console.error(err);
      ui.addToast(ui.appLang === 'ar' ? 'حدث خطأ أثناء فتح البريد الإلكتروني' : 'Error opening email client', 'error');
    }
  };

  return {
    loading,
    error,
    setError,
    emailForm,
    setEmailForm,

    isProofreading,
    isSuggestingTitle,
    ocrLoading,
    ocrError,
    setOcrError,
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
    atsLoading,
    atsResult,
    setAtsResult,
    generateLetter,
    handlePolishLetter,
    handleAnalyzeTone,
    handleAnalyzeAts,
    handleCreateShareLink,
    handleOcrUpload,
    handleSuggestTitle,
    handleProofread,
    handleSendEmail,
  };
};
