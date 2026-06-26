import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Save, Check, Copy, Download, Send, Mail, Sparkles, Loader2, Undo as UndoIcon, Redo as RedoIcon, ChevronDown, Share2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { CustomSelect } from './CustomSelect';
import { fontFamilies, fontSizes } from '../data/templates';

export const LetterPreview: React.FC = () => {
  const {
    form,
    generatedLetter,
    updateLetterContent,
    loading,
    isProofreading,
    history,
    historyIndex,
    handleUndo,
    handleRedo,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    branding,
    signatureImage,
    sealImage,
    setIsAiModalOpen,
    handleSaveDraft,
    draftStatus,
    pendingTags,
    setPendingTags,
    tagInput,
    setTagInput,
    handleSave,
    savedStatus,
    handleCopy,
    copied,
    handleExportDOCX,
    handleExportPDF,
    setIsShareModalOpen,
    setIsEmailModalOpen,
    appLang,
    t,
  } = useApp();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSaveMenu, setShowSaveMenu] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [showShareMenu, setShowShareMenu] = React.useState(false);

  const saveMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) {
        setShowSaveMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Auto-resize the textarea to fit generated letter content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [generatedLetter]);

  const wordCount = generatedLetter ? generatedLetter.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = generatedLetter ? generatedLetter.length : 0;

  return (
    <div className="lg:col-span-7 bg-white rounded-2xl shadow-2xl border border-brown-100/60 min-h-[600px] flex flex-col relative overflow-hidden text-start" dir={appLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #f9883a, #e86c1a, #c8520d)' }} />

      <div className="flex flex-col h-full relative z-10 p-8 sm:p-10">
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-100 flex-wrap gap-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {t('الخطاب الناتج', 'Generated Letter')}
          </h2>
          <div className="flex items-center gap-2 flex-wrap justify-start">
            {/* Undo/Redo */}
            <div className="flex items-center border border-gray-200 bg-white rounded-xl shadow-sm h-[36px] overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              <button
                onClick={handleUndo}
                disabled={historyIndex < 0}
                type="button"
                className="px-3 h-full text-gray-500 hover:text-brown-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-l border-gray-100 dark:border-gray-700 flex items-center justify-center cursor-pointer"
                title={t('تراجع', 'Undo')}
              >
                <UndoIcon className="w-4 h-4 rtl:-scale-x-100" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                type="button"
                className="px-3 h-full text-gray-500 hover:text-brown-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer"
                title={t('إعادة', 'Redo')}
              >
                <RedoIcon className="w-4 h-4 rtl:-scale-x-100" />
              </button>
            </div>

            {/* AI Assistant */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              disabled={!generatedLetter}
              className="text-xs font-bold text-white bg-brown-600 hover:bg-brown-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-sm transition-all cursor-pointer shrink-0 h-[36px]"
              title={t('المساعد الذكي: صياغة، تدقيق، وتحليل النبرة', 'Smart Assistant: Polish, Proofread, and Analyze Tone')}
              type="button"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>{t('مساعد الذكاء الاصطناعي', 'AI Assistant')}</span>
            </button>

            {/* Save Menu */}
            <div className="relative" ref={saveMenuRef}>
              <button
                onClick={() => setShowSaveMenu(!showSaveMenu)}
                className="text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-sm glass-btn cursor-pointer shrink-0 h-[36px]"
                type="button"
              >
                {savedStatus || draftStatus ? <Check className="w-4 h-4 text-green-500" /> : <Save className="w-4 h-4" />}
                <span>{t('حفظ الخطاب', 'Save Letter')}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              <AnimatePresence>
                {showSaveMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4 right-0 origin-top-right rtl:right-auto rtl:left-0 rtl:origin-top-left"
                  >
                    {/* Tags Input */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                        {t('وسوم الخطاب (Tags)', 'Letter Tags')}
                      </label>
                      <div className="flex flex-wrap gap-1 items-center border border-gray-200 dark:border-gray-700 rounded-lg p-2 min-h-[38px] bg-gray-50 dark:bg-gray-900">
                        {pendingTags.map((tag) => (
                          <span key={tag} className="flex items-center gap-0.5 bg-brown-100/40 text-brown-800 dark:bg-brown-900/60 dark:text-brown-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-brown-200/20">
                            #{tag}
                            <button
                              type="button"
                              onClick={() => setPendingTags((prev) => prev.filter((t) => t !== tag))}
                              className="hover:text-red-500 mr-0.5 transition-colors cursor-pointer text-xs"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          placeholder={t('+ وسم جديد', '+ new tag')}
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && tagInput.trim()) {
                              e.preventDefault();
                              const newTag = tagInput.trim().replace(/\s+/g, '-');
                              if (!pendingTags.includes(newTag)) setPendingTags((prev) => [...prev, newTag]);
                              setTagInput('');
                            }
                          }}
                          className="text-xs px-1 py-0.5 outline-none bg-transparent flex-1 min-w-[60px] dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex flex-col gap-1">
                      <button
                        onClick={() => {
                          handleSave();
                          setShowSaveMenu(false);
                        }}
                        disabled={!generatedLetter}
                        className="w-full text-start text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-brown-600 dark:hover:text-brown-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        type="button"
                      >
                        {savedStatus ? <Check className="w-4 h-4 text-green-500" /> : <Save className="w-4 h-4 text-brown-600 dark:text-brown-400" />}
                        <span>{t('حفظ كخطاب رسمي', 'Save as Official Letter')}</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSaveDraft();
                          setShowSaveMenu(false);
                        }}
                        className="w-full text-start text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-brown-600 dark:hover:text-brown-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                        type="button"
                      >
                        {draftStatus ? <Check className="w-4 h-4 text-green-500" /> : <FileText className="w-4 h-4 text-brown-600 dark:text-brown-400" />}
                        <span>{t('حفظ كمسودة مؤقتة', 'Save as Temporary Draft')}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export Menu */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={!generatedLetter}
                className="text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-sm glass-btn cursor-pointer shrink-0 h-[36px] disabled:opacity-40 disabled:cursor-not-allowed"
                type="button"
              >
                <Download className="w-4 h-4" />
                <span>{t('تنزيل وتصدير', 'Download & Export')}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-1.5 right-0 origin-top-right rtl:right-auto rtl:left-0 rtl:origin-top-left"
                  >
                    <button
                      onClick={() => {
                        handleExportPDF();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-start text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-brown-600 dark:hover:text-brown-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                      type="button"
                    >
                      <Download className="w-4 h-4 text-red-500" />
                      <span>{t('تصدير كملف PDF', 'Export as PDF')}</span>
                    </button>

                    <button
                      onClick={() => {
                        handleExportDOCX();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-start text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-brown-600 dark:hover:text-brown-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                      type="button"
                    >
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>{t('تصدير كملف Word', 'Export as Word')}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Share Menu */}
            <div className="relative" ref={shareMenuRef}>
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                disabled={!generatedLetter}
                className="text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-sm glass-btn cursor-pointer shrink-0 h-[36px] disabled:opacity-40 disabled:cursor-not-allowed"
                type="button"
              >
                <Share2 className="w-4 h-4" />
                <span>{t('مشاركة الخطاب', 'Share')}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-1.5 right-0 origin-top-right rtl:right-auto rtl:left-0 rtl:origin-top-left"
                  >
                    {/* Copy Text */}
                    <button
                      onClick={() => {
                        handleCopy();
                        setShowShareMenu(false);
                      }}
                      className="w-full text-start text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-brown-600 dark:hover:text-brown-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer"
                      type="button"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                      <span>{t('نسخ الخطاب للحافظة', 'Copy to Clipboard')}</span>
                    </button>

                    {/* Share Link */}
                    <button
                      onClick={() => {
                        setIsShareModalOpen(true);
                        setShowShareMenu(false);
                      }}
                      className="w-full text-start text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-brown-600 dark:hover:text-brown-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer"
                      type="button"
                    >
                      <Send className="w-4 h-4 text-brown-600 dark:text-brown-400" />
                      <span>{t('مشاركة برابط آمن', 'Share via Secure Link')}</span>
                    </button>

                    {/* WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent((form.subject ? form.subject + ':\n\n' : '') + generatedLetter)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowShareMenu(false)}
                      className="w-full text-start text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-brown-600 dark:hover:text-brown-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      <span>{t('مشاركة عبر WhatsApp', 'WhatsApp')}</span>
                    </a>

                    {/* Email */}
                    <button
                      onClick={() => {
                        setIsEmailModalOpen(true);
                        setShowShareMenu(false);
                      }}
                      className="w-full text-start text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-brown-600 dark:hover:text-brown-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer"
                      type="button"
                    >
                      <Mail className="w-4 h-4 text-purple-500" />
                      <span>{t('مشاركة عبر البريد الإلكتروني', 'Share via Email')}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {generatedLetter && !loading && (
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 relative z-20">
              <label className="text-xs font-bold text-gray-500">{t('الخط:', 'Font:')}</label>
              <div className="w-48">
                <CustomSelect
                  value={fontFamily}
                  onChange={(val) => setFontFamily(val)}
                  options={fontFamilies}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-20">
              <label className="text-xs font-bold text-gray-500">{t('حجم النص:', 'Font Size:')}</label>
              <div className="w-36">
                <CustomSelect
                  value={fontSize}
                  onChange={(val) => setFontSize(val)}
                  options={fontSizes}
                />
              </div>
            </div>
          </div>
        )}

        {/* Word / Char Counter */}
        {generatedLetter && !loading && (
          <div className="flex items-center gap-4 mb-3 text-[11px] font-semibold text-gray-400">
            <span>{wordCount} {t('كلمة', 'words')}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 inline-block"></span>
            <span>{charCount} {t('حرف', 'chars')}</span>
            <span className={`mr-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
              wordCount > 500 ? 'bg-red-50 text-red-600' :
              wordCount > 300 ? 'bg-amber-50 text-amber-600' :
              'bg-green-50 text-green-600'
            }`}>
              {wordCount > 500 ? t('خطاب طويل جداً', 'Very long letter') : wordCount > 300 ? t('خطاب طويل', 'Long letter') : t('طول مناسب', 'Suitable length')}
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto relative flex flex-col justify-between p-6 rounded-xl document-paper">
          {/* Header inside Preview */}
          {generatedLetter && !loading && !isProofreading && branding.enableHeader && (
            <div className={`mb-8 ${
              branding.theme === 'classic'
                ? 'border-b-2 border-brown-200 pb-6 flex flex-col items-center text-center gap-3'
                : branding.theme === 'creative'
                ? `bg-brown-50/50 p-6 rounded-2xl border border-brown-100 flex items-center justify-between ${form.language === 'en' ? 'flex-row' : 'flex-row-reverse'}`
                : `border-b-4 border-brown-600 pb-4 flex items-end justify-between ${form.language === 'en' ? 'flex-row' : 'flex-row-reverse'}`
            }`} dir={form.language === 'en' ? 'ltr' : 'rtl'}>

              {branding.theme === 'classic' ? (
                <>
                  {branding.logoUrl && <img src={branding.logoUrl} alt="Logo" className="max-h-20 max-w-[150px] object-contain mb-2" />}
                  <h3 className="font-bold text-xl text-brown-900" style={{ fontFamily }}>{branding.companyName || t('اسم الجهة/المؤسسة', 'Company Name')}</h3>
                  <p className="text-sm text-gray-500 whitespace-pre-line" style={{ fontFamily }}>{branding.companyDetails}</p>
                </>
              ) : (
                <>
                  <div className={form.language === 'en' ? 'text-left' : 'text-right'}>
                    <h3 className="font-bold text-xl text-brown-900 mb-1" style={{ fontFamily }}>{branding.companyName || t('اسم الجهة/المؤسسة', 'Company Name')}</h3>
                    <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed" style={{ fontFamily }}>{branding.companyDetails}</p>
                  </div>
                  {branding.logoUrl && (
                    <img src={branding.logoUrl} alt="Logo" className="max-h-16 max-w-[140px] object-contain shrink-0" />
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              {loading || isProofreading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-brown-400" />
                  <p className="text-sm font-bold">{isProofreading ? t('نقوم بالتدقيق النحوي والإملائي...', 'Proofreading grammar & spelling...') : t('نقوم بالصياغة...', 'Drafting...')}</p>
                </motion.div>
              ) : generatedLetter ? (
                <div className="space-y-6">
                  {/* Document Subject Header */}
                  <h2 className="text-center text-xl font-bold text-gray-900" style={{ fontFamily }}>{form.subject}</h2>

                  <motion.textarea
                    id="preview-textarea"
                    key="content"
                    ref={textareaRef}
                    value={generatedLetter}
                    onChange={(e) => {
                      updateLetterContent(e.target.value, true);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    spellCheck={true}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`w-full min-h-[400px] resize-none bg-transparent outline-none border-2 border-transparent focus:border-brown-100 rounded-lg p-2 -mx-2 transition-all text-gray-800 leading-relaxed font-medium ${form.language === 'en' ? 'text-left' : 'text-right'}`}
                    dir={form.language === 'en' ? 'ltr' : 'rtl'}
                    style={{ fontFamily, fontSize }}
                  />
                </div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center text-gray-400 gap-5 h-full min-h-[300px] my-auto"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 rounded-full border-2 border-gray-100 bg-gray-50 flex items-center justify-center mb-2 shadow-sm relative"
                  >
                    <FileText className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="text-xl md:text-2xl font-bold text-gray-500 leading-loose pb-1"
                  >
                    {t('لا يوجد خطاب بعد', 'No letter yet')}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="text-sm md:text-base text-center text-gray-500 max-w-md leading-relaxed pb-1"
                  >
                    {t('املأ التفاصيل واضغط على زر الإنشاء لتحصل على صياغة رسمية جاهزة للاستخدام.', 'Fill in the details and press the create button to get a professional draft ready to use.')}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Signatures/Stamps in Preview */}
          {generatedLetter && !loading && !isProofreading && (signatureImage || sealImage) && (
            <div className={`mt-8 pt-4 flex gap-8 items-center ${form.language === 'en' ? 'justify-start' : 'justify-end'}`} dir={form.language === 'en' ? 'ltr' : 'rtl'}>
              <div className="text-center">
                <p className="text-xs font-bold text-brown-900 mb-2" style={{ fontFamily }}>{form.language === 'en' ? 'Signature & Seal:' : 'التوقيع والختم:'}</p>
                <div className="flex gap-4 items-center justify-center h-20">
                  {signatureImage && (
                    <img src={signatureImage} alt="Signature" className="max-h-16 max-w-[100px] object-contain" />
                  )}
                  {sealImage && (
                    <img src={sealImage} alt="Seal/Stamp" className="max-h-16 max-w-[80px] object-contain" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer in Preview */}
          {generatedLetter && !loading && !isProofreading && branding.enableFooter && (
            <div className="border-t border-gray-100 pt-4 mt-8 text-center text-xs text-brown-500/80" style={{ fontFamily }}>
              {branding.footerText || t('التذييل السفلي', 'Footer')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LetterPreview;
