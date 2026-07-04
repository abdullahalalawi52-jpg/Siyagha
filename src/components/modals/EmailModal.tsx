import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, X, Loader2, Send } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

export const EmailModal: React.FC = () => {
  const {
    isEmailModalOpen,
    setIsEmailModalOpen,
    emailForm,
    setEmailForm,
    handleSendEmail,
    appLang,
    t,
  } = useApp();

  const handleClose = () => setIsEmailModalOpen(false);

  const modalRef = useModalAccessibility(isEmailModalOpen, handleClose);

  return (
    <AnimatePresence>
      {isEmailModalOpen && (
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
            aria-labelledby="email-modal-title"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-md premium-card rounded-2xl shadow-2xl overflow-hidden text-start z-10"
            dir={appLang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 id="email-modal-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brown-600" />
                  {t('إرسال عبر البريد الإلكتروني', 'Send via Email')}
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
                  <div>
                    <label className="text-sm font-bold text-gray-800 block mb-1.5">{t('البريد الإلكتروني للمرسل إليه', 'Recipient Email Address')}</label>
                    <input
                      type="email"
                      placeholder="example@domain.com"
                      value={emailForm.to}
                      onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                      className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-800 block mb-1.5">{t('موضوع الرسالة', 'Message Subject')}</label>
                    <input
                      type="text"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                      className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">{t('اختر طريقة الإرسال:', 'Choose sending method:')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSendEmail('gmail')}
                        disabled={!emailForm.to || !emailForm.subject}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        type="button"
                      >
                        <Send className="w-4 h-4 rtl:-scale-x-100" />
                        Gmail
                      </button>
                      <button
                        onClick={() => handleSendEmail('outlook')}
                        disabled={!emailForm.to || !emailForm.subject}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        type="button"
                      >
                        <Send className="w-4 h-4 rtl:-scale-x-100" />
                        Outlook
                      </button>
                    </div>
                    <button
                      onClick={() => handleSendEmail('default')}
                      disabled={!emailForm.to || !emailForm.subject}
                      className="w-full mt-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      type="button"
                    >
                      <Mail className="w-4 h-4" />
                      {t('تطبيق افتراضي آخر', 'Other Default App')}
                    </button>
                  </div>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EmailModal;
