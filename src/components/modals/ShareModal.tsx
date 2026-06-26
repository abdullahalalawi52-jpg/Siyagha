import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Loader2, Copy, Check } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

export const ShareModal: React.FC = () => {
  const {
    isShareModalOpen,
    setIsShareModalOpen,
    sharePassword,
    setSharePassword,
    shareUrl,
    setShareUrl,
    shareLoading,
    shareCopied,
    setShareCopied,
    handleCreateShareLink,
    appLang,
    t,
  } = useApp();

  const handleClose = () => {
    setIsShareModalOpen(false);
    setShareUrl('');
    setSharePassword('');
  };

  const modalRef = useModalAccessibility(isShareModalOpen, handleClose);

  return (
    <AnimatePresence>
      {isShareModalOpen && (
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
            aria-labelledby="share-modal-title"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden text-start z-10"
            dir={appLang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 id="share-modal-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-brown-600" />
                  {t('مشاركة الخطاب برابط آمن', 'Share Letter via Secure Link')}
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
                  {t('سيتم توليد رابط مؤقت (صالح لمدة 24 ساعة) يتيح لمن يملكه استعراض الخطاب الرسمي وقراءته بطريقة منسقة وتصديره لـ PDF.', 'A temporary link (valid for 24 hours) will be generated, allowing anyone who has it to view, read, and export the official letter to PDF.')}
                </p>

                {!shareUrl ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 block">{t('كلمة مرور لحماية الرابط (اختياري)', 'Password to protect the link (optional)')}</label>
                      <input
                        type="password"
                        placeholder={t('أدخل كلمة مرور (مثال: 1234)', 'Enter password (e.g. 1234)')}
                        value={sharePassword}
                        onChange={(e) => setSharePassword(e.target.value)}
                        className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateShareLink}
                      disabled={shareLoading}
                      className="w-full bg-brown-600 hover:bg-brown-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {shareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {t('إنشاء رابط المشاركة المؤقت', 'Create Temporary Share Link')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 text-xs font-bold">
                      {t('تم إنشاء رابط المعاينة الآمن بنجاح!', 'Secure preview link created successfully!')}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="flex-1 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600 outline-none text-left select-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(shareUrl);
                          setShareCopied(true);
                          setTimeout(() => setShareCopied(false), 2000);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 rounded-xl text-xs font-bold transition-all border border-gray-200 flex items-center justify-center gap-1 min-w-[80px] cursor-pointer"
                      >
                        {shareCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {shareCopied ? t('تم!', 'Copied!') : t('نسخ', 'Copy')}
                      </button>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(t('معاينة الخطاب الرسمي: ', 'Official Letter Preview: ') + shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        {t('مشاركة عبر WhatsApp', 'Share via WhatsApp')}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setShareUrl('');
                          setSharePassword('');
                        }}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {t('رابط جديد', 'New Link')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
