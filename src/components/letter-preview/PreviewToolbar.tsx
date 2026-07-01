import React, { useRef, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Undo as UndoIcon, Redo as RedoIcon, Sparkles, Check, Save, FileText, Download, ChevronDown, Cloud, Share2, Send, Mail, Copy } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { CustomSelect } from '../CustomSelect';
import { fontFamilies, fontSizes } from '../../data/templates';

export const PreviewToolbar: React.FC = () => {
  const {
    form,
    generatedLetter,
    loading,
    history,
    historyIndex,
    handleUndo,
    handleRedo,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
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
    setIsCloudStorageOpen,
    t,
  } = useApp();

  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

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

  const wordCount = generatedLetter ? generatedLetter.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = generatedLetter ? generatedLetter.length : 0;

  return (
    <>
      <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-100 flex-wrap gap-4 text-start">
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
                      {pendingTags.map((tag: string) => (
                        <span key={tag} className="flex items-center gap-0.5 bg-brown-100/40 text-brown-800 dark:bg-brown-900/60 dark:text-brown-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-brown-200/20">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => setPendingTags((prev: string[]) => prev.filter((t) => t !== tag))}
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
                            if (!pendingTags.includes(newTag)) setPendingTags((prev: string[]) => [...prev, newTag]);
                            setTagInput('');
                          }
                        }}
                        className="text-xs px-1 py-0.5 outline-none bg-transparent flex-1 min-w-[60px] dark:text-white border-0 focus:ring-0"
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

                  <hr className="border-gray-100 dark:border-gray-700 my-1" />

                  <button
                    onClick={() => {
                      setIsCloudStorageOpen(true);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-start text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-brown-600 dark:hover:text-brown-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                    type="button"
                  >
                    <Cloud className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>{t('حفظ في السحابة', 'Save to Cloud')}</span>
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
        <div className="flex items-center gap-4 mb-6 flex-wrap text-start">
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
        <div className="flex items-center gap-4 mb-3 text-[11px] font-semibold text-gray-400 text-start">
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
    </>
  );
};
