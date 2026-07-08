import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, FileText } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const PreviewPaper: React.FC = () => {
  const {
    form,
    generatedLetter,
    updateLetterContent,
    loading,
    isProofreading,
    fontFamily,
    fontSize,
    branding,
    signatureImage,
    sealImage,
    t,
  } = useApp();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea to fit generated letter content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [generatedLetter]);

  return (
    <div className="flex-1 overflow-y-auto relative flex flex-col justify-between p-3 sm:p-6 md:p-8 rounded-xl document-paper">
      {/* Header inside Preview */}
      {generatedLetter && !loading && !isProofreading && branding.enableHeader && (
        <div className={`mb-8 w-full ${
          branding.theme === 'classic'
            ? 'border-b border-brown-200 pb-6 flex flex-col items-center text-center gap-3'
            : branding.theme === 'creative'
            ? `bg-brown-50/55 p-6 rounded-2xl border border-brown-100 flex items-center justify-between gap-4 ${form.language === 'en' ? 'flex-row' : 'flex-row-reverse'}`
            : branding.theme === 'elegant'
            ? `border-t-4 border-brown-600 pt-4 pb-2 flex items-center justify-between gap-4 ${form.language === 'en' ? 'flex-row' : 'flex-row-reverse'}`
            : `border-b-2 border-brown-600 pb-4 flex items-end justify-between gap-4 ${form.language === 'en' ? 'flex-row' : 'flex-row-reverse'}` // modern
        }`} dir={form.language === 'en' ? 'ltr' : 'rtl'}>

          {branding.theme === 'classic' ? (
            <>
              {branding.logoUrl && <img src={branding.logoUrl} alt="Logo" className="max-h-16 max-w-[150px] object-contain mb-1" />}
              <h3 className="font-bold text-lg text-brown-900" style={{ fontFamily }}>{branding.companyName || t('اسم الجهة/المؤسسة', 'Company Name')}</h3>
              <p className="text-xs text-gray-550 whitespace-pre-line leading-relaxed" style={{ fontFamily }}>{branding.companyDetails}</p>
            </>
          ) : (
            <>
              <div className={form.language === 'en' ? 'text-left' : 'text-right'}>
                <h3 className="font-bold text-lg text-brown-900 mb-1" style={{ fontFamily }}>{branding.companyName || t('اسم الجهة/المؤسسة', 'Company Name')}</h3>
                <p className="text-xs text-gray-550 whitespace-pre-line leading-relaxed" style={{ fontFamily }}>{branding.companyDetails}</p>
              </div>
              {branding.logoUrl && (
                <img src={branding.logoUrl} alt="Logo" className="max-h-14 max-w-[140px] object-contain shrink-0" />
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
            <div className="space-y-6 text-start">
              {/* Document Subject Header */}
              <h2 className="text-center text-xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily }}>{form.subject}</h2>

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
                className={`w-full min-h-[400px] resize-none bg-transparent outline-none border-2 border-transparent focus:border-brown-100 rounded-lg p-2 -mx-2 transition-all text-gray-800 dark:text-gray-100 leading-relaxed font-medium ${form.language === 'en' ? 'text-left' : 'text-right'}`}
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
        <div className={`mt-8 ${
          (branding.footerTheme || 'centered') === 'minimal'
            ? 'pt-2 text-center text-[10px] text-gray-400'
            : (branding.footerTheme || 'centered') === 'split'
            ? `border-t border-gray-150 pt-4 flex justify-between items-center text-xs text-brown-500/80 ${form.language === 'en' ? 'flex-row' : 'flex-row-reverse'}`
            : 'border-t border-gray-150 pt-4 text-center text-xs text-brown-500/80' // centered
        }`} dir={form.language === 'en' ? 'ltr' : 'rtl'} style={{ fontFamily }}>
          {(branding.footerTheme || 'centered') === 'split' ? (
            <>
              <span>{branding.companyName || t('اسم المؤسسة', 'Company Name')}</span>
              <span>{branding.footerText || t('التذييل السفلي', 'Footer Text')}</span>
            </>
          ) : (
            <span>{branding.footerText || t('التذييل السفلي', 'Footer Text')}</span>
          )}
        </div>
      )}
    </div>
  );
};
