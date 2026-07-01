import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, Loader2, Upload } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

export const OcrModal: React.FC = () => {
  const {
    isOcrOpen,
    setIsOcrOpen,
    ocrLoading,
    ocrError,
    handleOcrUpload,
    appLang,
    t,
  } = useApp();

  const handleClose = () => setIsOcrOpen(false);

  const modalRef = useModalAccessibility(isOcrOpen, handleClose);

  return (
    <AnimatePresence>
      {isOcrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ocr-modal-title"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-md premium-card rounded-2xl shadow-2xl overflow-hidden text-start z-10"
            dir={appLang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 id="ocr-modal-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-brown-600" />
                  {t('واجهة استخراج النصوص (OCR)', 'Text Extraction Interface (OCR)')}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
                  type="button"
                  aria-label={t('إغلاق النافذة', 'Close window')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t('قم بتصوير أو رفع صورة لخطاب رسمي ورقي قديم، وسيقوم الذكاء الاصطناعي باستخراج النص بالكامل لتتمكن من التعديل عليه وإعادة استخدامه.', 'Take a photo or upload an image of an old official paper letter, and AI will extract the full text so you can edit and reuse it.')}
                </p>

                <div className="border-2 border-dashed border-gray-200 hover:border-brown-400 rounded-xl p-8 text-center bg-gray-50/50 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleOcrUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={ocrLoading}
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    {ocrLoading ? (
                      <Loader2 className="w-10 h-10 animate-spin text-brown-600" />
                    ) : (
                      <Upload className="w-10 h-10 text-gray-400 group-hover:text-brown-500 transition-colors" />
                    )}
                    <span className="text-sm font-bold text-gray-700">
                      {ocrLoading ? t('جاري استخراج النصوص...', 'Extracting text...') : t('اختر صورة الخطاب أو اسحبها هنا', 'Choose letter image or drag it here')}
                    </span>
                    <span className="text-xs text-gray-400">{t('يدعم صيغ JPG, PNG, WEBP', 'Supports JPG, PNG, WEBP formats')}</span>
                  </div>
                </div>

                {ocrError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100">
                    {ocrError}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOcrOpen(false)}
                  disabled={ocrLoading}
                  className="text-xs font-bold text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-lg transition-colors border border-gray-200 disabled:opacity-50 cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OcrModal;
