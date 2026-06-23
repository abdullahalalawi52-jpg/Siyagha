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
    emailSuccess,
    isSendingEmail,
    handleSendEmail,
  } = useApp();

  const handleClose = () => setIsEmailModalOpen(false);

  const modalRef = useModalAccessibility(isEmailModalOpen, handleClose);

  return (
    <AnimatePresence>
      {isEmailModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-modal-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden text-right"
            dir="rtl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 id="email-modal-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brown-600" />
                  إرسال عبر البريد الإلكتروني
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
                  type="button"
                  aria-label="إغلاق النافذة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {emailSuccess ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 text-sm font-medium leading-relaxed">
                  {emailSuccess.includes('Ethereal') ? (
                    <>
                      تم الإرسال بنجاح (بيئة تجريبية).
                      <br />
                      <a href={emailSuccess.split('رابط المعاينة: ')[1]} target="_blank" rel="noopener noreferrer" className="underline font-bold text-green-800">
                        اضغط هنا لمعاينة الرسالة
                      </a>
                    </>
                  ) : (
                    emailSuccess
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-800 block mb-1.5">البريد الإلكتروني للمرسل إليه</label>
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
                    <label className="text-sm font-bold text-gray-800 block mb-1.5">موضوع الرسالة</label>
                    <input
                      type="text"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                      className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-2 group justify-start">
                    <input
                      type="checkbox"
                      checked={emailForm.attachPdf}
                      onChange={(e) => setEmailForm({ ...emailForm, attachPdf: e.target.checked })}
                      className="w-5 h-5 border-2 border-gray-300 rounded text-brown-600 focus:ring-brown-500 cursor-pointer form-checkbox transition-colors"
                    />
                    <span className="text-sm font-semibold text-gray-700 select-none group-hover:text-gray-900 transition-colors">
                      إرفاق الخطاب كـ PDF
                    </span>
                  </label>

                  <button
                    onClick={handleSendEmail}
                    disabled={isSendingEmail || !emailForm.to || !emailForm.subject}
                    className="w-full mt-2 bg-brown-600 hover:bg-brown-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brown-200 cursor-pointer"
                    type="button"
                  >
                    {isSendingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rtl:-scale-x-100" />}
                    {isSendingEmail ? 'جاري الإرسال...' : 'إرسال'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmailModal;
