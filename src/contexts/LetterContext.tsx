import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { useForm } from './FormContext';
import { SavedLetter, BrandingConfig, EmailFormState, ToneAnalysisResult, AtsAnalysisResult } from '../types';
import { useLetterHistory } from '../hooks/useLetterHistory';
import { useLetterBranding } from '../hooks/useLetterBranding';
import { useLetterPersistence } from '../hooks/useLetterPersistence';
import { useLetterCanvas } from '../hooks/useLetterCanvas';
import { useLetterApis } from '../hooks/useLetterApis';
import { escapeHtml, sanitizeUrl, buildPrintElement } from '../utils/helpers';

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
  branding: BrandingConfig;
  setBranding: React.Dispatch<React.SetStateAction<BrandingConfig>>;
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
  emailForm: EmailFormState;
  setEmailForm: React.Dispatch<React.SetStateAction<EmailFormState>>;

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
  toneResult: ToneAnalysisResult | null;
  setToneResult: React.Dispatch<React.SetStateAction<ToneAnalysisResult | null>>;
  toneLoading: boolean;
  atsLoading: boolean;
  atsResult: AtsAnalysisResult | null;
  setAtsResult: React.Dispatch<React.SetStateAction<AtsAnalysisResult | null>>;
  handleExportDOCX: () => void;
  handleExportPDF: () => Promise<void>;
  handlePolishLetter: () => Promise<void>;
  handleAnalyzeTone: () => Promise<void>;
  handleAnalyzeAts: () => Promise<void>;
  handleCreateShareLink: () => Promise<void>;
  handleTogglePin: (e: React.MouseEvent, id: string) => void;
  handleSave: () => void;
  handleSaveDraft: () => void;
  handleLoadSaved: (letter: SavedLetter) => void;
  handleSuggestTitle: () => Promise<void>;
  handleProofread: () => Promise<void>;
  handleCopy: () => void;
  copied: boolean;
  handleSendEmail: (provider?: 'gmail' | 'outlook' | 'default') => void;
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
  const {
    form,
    setForm,
    favoriteTemplates,
    favoritePredefined,
    setFavoriteTemplates,
    setFavoritePredefined,
    autoGenerate,
  } = useForm();

  // 1. History Hook
  const historyState = useLetterHistory();

  // 2. Branding Hook
  const brandingState = useLetterBranding();

  // 3. Canvas Hook
  const canvasState = useLetterCanvas({
    setSignatureImage: brandingState.setSignatureImage,
    setIsSigningOpen: ui.setIsSigningOpen,
  });

  // 4. API Operations Hook
  const apiState = useLetterApis({
    form,
    setForm,
    generatedLetter: historyState.generatedLetter,
    updateLetterContent: historyState.updateLetterContent,
    ui,
    branding: brandingState.branding,
    signatureImage: brandingState.signatureImage,
    setSignatureImage: brandingState.setSignatureImage,
    sealImage: brandingState.sealImage,
    fontFamily: brandingState.fontFamily,
    fontSize: brandingState.fontSize,
    setActiveSection: brandingState.setActiveSection,
    autoGenerate,
  });

  // 5. Persistence Hook
  const persistenceState = useLetterPersistence({
    user,
    form,
    setForm,
    generatedLetter: historyState.generatedLetter,
    updateLetterContent: historyState.updateLetterContent,
    favoriteTemplates,
    favoritePredefined,
    setFavoriteTemplates,
    setFavoritePredefined,
    ui,
  });

  // 6. Clipboard action
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(historyState.generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 7. DOCX Export logic (local helper)
  const handleExportDOCX = () => {
    if (!historyState.generatedLetter) return;

    const headerHtml = brandingState.branding.enableHeader
      ? '<div style="border-bottom: 2px solid #a18072; padding-bottom: 10px; margin-bottom: 20px; font-family: Arial, sans-serif;">' +
        '<h3 style="color: #a18072; margin: 0; font-size: 16px;">' +
        escapeHtml(brandingState.branding.companyName || '') +
        '</h3>' +
        '<p style="font-size: 11px; color: #555; margin: 5px 0 0 0; line-height: 1.4;">' +
        escapeHtml(brandingState.branding.companyDetails || '').replace(/\n/g, '<br />') +
        '</p>' +
        '</div>'
      : '';

    const footerHtml = brandingState.branding.enableFooter
      ? '<div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 30px; text-align: center; font-size: 10px; color: #777; font-family: Arial, sans-serif;">' +
        escapeHtml(brandingState.branding.footerText || '') +
        '</div>'
      : '';

    const signatureHtml =
      brandingState.signatureImage || brandingState.sealImage
        ? '<div style="margin-top: 40px; font-family: Arial, sans-serif;">' +
          '<p style="font-size: 12px; font-weight: bold; color: #222; margin-bottom: 8px;">' +
          (form.language === 'en' ? 'Signature & Seal:' : 'التوقيع والختم:') +
          '</p>' +
          '<div>' +
          (brandingState.signatureImage
            ? '<img src="' + sanitizeUrl(brandingState.signatureImage) + '" width="120" style="margin-right: 15px; vertical-align: middle;" />'
            : '') +
          (brandingState.sealImage ? '<img src="' + sanitizeUrl(brandingState.sealImage) + '" width="90" style="vertical-align: middle;" />' : '') +
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
      escapeHtml(historyState.generatedLetter) +
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

  // 8. PDF Export logic (local helper)
  const handleExportPDF = async () => {
    if (!historyState.generatedLetter) return;

    let parsedFontSize = parseInt(brandingState.fontSize);
    if (isNaN(parsedFontSize)) parsedFontSize = 15;

    const printElement = buildPrintElement({
      fontFamily: brandingState.fontFamily,
      fontSize: parsedFontSize + 2,
      isEn: form.language === 'en',
      subject: form.subject || 'خطاب',
      letterContent: historyState.generatedLetter,
      branding: brandingState.branding,
      signatureImage: brandingState.signatureImage,
      sealImage: brandingState.sealImage,
    });

    const opt = {
      margin: 15,
      filename: `${form.subject || 'letter'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    const html2pdfModule = await import('html2pdf.js') as unknown as { default: any };
    const html2pdf = html2pdfModule.default;
    html2pdf().set(opt).from(printElement).save();
  };

  return (
    <LetterContext.Provider
      value={{
        generatedLetter: historyState.generatedLetter,
        updateLetterContent: historyState.updateLetterContent,
        history: historyState.history,
        historyIndex: historyState.historyIndex,
        handleUndo: historyState.handleUndo,
        handleRedo: historyState.handleRedo,
        fontFamily: brandingState.fontFamily,
        setFontFamily: brandingState.setFontFamily,
        fontSize: brandingState.fontSize,
        setFontSize: brandingState.setFontSize,
        activeSection: brandingState.activeSection,
        setActiveSection: brandingState.setActiveSection,
        branding: brandingState.branding,
        setBranding: brandingState.setBranding,
        signatureImage: brandingState.signatureImage,
        setSignatureImage: brandingState.setSignatureImage,
        sealImage: brandingState.sealImage,
        setSealImage: brandingState.setSealImage,
        handleImageUpload: brandingState.handleImageUpload,
        canvasRef: canvasState.canvasRef,
        isDrawing: canvasState.isDrawing,
        setIsDrawing: canvasState.setIsDrawing,
        startDrawing: canvasState.startDrawing,
        draw: canvasState.draw,
        stopDrawing: canvasState.stopDrawing,
        clearCanvas: canvasState.clearCanvas,
        saveSignature: canvasState.saveSignature,
        loading: apiState.loading,
        error: apiState.error,
        setError: apiState.setError,
        emailForm: apiState.emailForm,
        setEmailForm: apiState.setEmailForm,

        isProofreading: apiState.isProofreading,
        isSuggestingTitle: apiState.isSuggestingTitle,
        ocrLoading: apiState.ocrLoading,
        ocrError: apiState.ocrError,
        setOcrError: apiState.setOcrError,
        sharePassword: apiState.sharePassword,
        setSharePassword: apiState.setSharePassword,
        shareUrl: apiState.shareUrl,
        setShareUrl: apiState.setShareUrl,
        shareLoading: apiState.shareLoading,
        shareCopied: apiState.shareCopied,
        setShareCopied: apiState.setShareCopied,
        aiPolishing: apiState.aiPolishing,
        toneResult: apiState.toneResult,
        setToneResult: apiState.setToneResult,
        toneLoading: apiState.toneLoading,
        atsLoading: apiState.atsLoading,
        atsResult: apiState.atsResult,
        setAtsResult: apiState.setAtsResult,
        generateLetter: apiState.generateLetter,
        handlePolishLetter: apiState.handlePolishLetter,
        handleAnalyzeTone: apiState.handleAnalyzeTone,
        handleAnalyzeAts: apiState.handleAnalyzeAts,
        handleCreateShareLink: apiState.handleCreateShareLink,
        handleOcrUpload: apiState.handleOcrUpload,
        handleSuggestTitle: apiState.handleSuggestTitle,
        handleProofread: apiState.handleProofread,
        handleSendEmail: apiState.handleSendEmail,
        savedLetters: persistenceState.savedLetters,
        setSavedLetters: persistenceState.setSavedLetters,
        savedStatus: persistenceState.savedStatus,
        draftStatus: persistenceState.draftStatus,
        handleTogglePin: persistenceState.handleTogglePin,
        handleSave: persistenceState.handleSave,
        handleSaveDraft: persistenceState.handleSaveDraft,
        handleLoadSaved: persistenceState.handleLoadSaved,
        handleExportDOCX,
        handleExportPDF,
        copied,
        handleCopy,
      }}
    >
      {children}
    </LetterContext.Provider>
  );
};
