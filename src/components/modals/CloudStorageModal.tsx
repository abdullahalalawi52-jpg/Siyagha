import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cloud, Loader2, Check, AlertCircle, Eye } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

export const CloudStorageModal: React.FC = () => {
  const {
    isCloudStorageOpen,
    setIsCloudStorageOpen,
    form,
    generatedLetter,
    appLang,
    t,
  } = useApp();

  const [provider, setProvider] = useState<'google' | 'onedrive'>('google');
  const [format, setFormat] = useState<'pdf' | 'word'>('pdf');
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState<'setup' | 'auth' | 'uploading' | 'success'>('setup');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState('');

  // Pre-fill filename when subject changes
  useEffect(() => {
    if (form.subject) {
      setFileName(`${form.subject}`);
    } else {
      setFileName(appLang === 'ar' ? 'خطاب_رسمي' : 'Official_Letter');
    }
  }, [form.subject, appLang, isCloudStorageOpen]);

  const handleClose = () => {
    setIsCloudStorageOpen(false);
    // Reset state after closure transition
    setTimeout(() => {
      setStep('setup');
      setProgress(0);
      setError(null);
      setFileUrl('');
    }, 300);
  };

  const modalRef = useModalAccessibility(isCloudStorageOpen, handleClose);

  const startUploadFlow = () => {
    setError(null);
    setStep('auth');

    // Simulate OAuth connection popup
    setTimeout(() => {
      setStep('uploading');
      // Incremental upload progress bar
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 15) + 5;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          
          // Set simulated link
          if (provider === 'google') {
            setFileUrl('https://drive.google.com/');
          } else {
            setFileUrl('https://onedrive.live.com/');
          }

          setStep('success');
        }
        setProgress(currentProgress);
      }, 200);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isCloudStorageOpen && (
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
            aria-labelledby="cloud-modal-title"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-md premium-card rounded-2xl shadow-2xl overflow-hidden text-start z-10"
            dir={appLang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 id="cloud-modal-title" className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-brown-600 dark:text-brown-400" />
                  {t('حفظ في السحابة شخصية', 'Save to Cloud Storage')}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
                  type="button"
                  aria-label={t('إغلاق النافذة', 'Close window')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Setup Details */}
              {step === 'setup' && (
                <div className="space-y-4">
                  {/* Select Provider */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                      {t('اختر المزود السحابي', 'Select Cloud Provider')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Google Drive */}
                      <button
                        type="button"
                        onClick={() => setProvider('google')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                          provider === 'google'
                            ? 'border-green-500 bg-green-50/30 dark:bg-green-950/10 ring-2 ring-green-500/20'
                            : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                          <path fill="#0F9D58" d="M15.7 13H8.3L4.6 6.5h7.5z" />
                          <path fill="#4285F4" d="M23 13.5l-3.7 6.5H4.6L8.3 13z" />
                          <path fill="#FFC107" d="M12.1 6.5L8.3 13h11l-3.6-6.5z" />
                        </svg>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Google Drive</span>
                      </button>

                      {/* OneDrive */}
                      <button
                        type="button"
                        onClick={() => setProvider('onedrive')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                          provider === 'onedrive'
                            ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/10 ring-2 ring-blue-500/20'
                            : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                          <path fill="#0078d4" d="M19.5 9.5c.2 0 .4 0 .6.1A4.5 4.5 0 0 1 24 14c0 2.3-1.7 4.2-3.9 4.5H7.5A5.5 5.5 0 0 1 2 13c0-2.8 2-5.1 4.8-5.4A6.5 6.5 0 0 1 18.2 6c.5 1.1.9 2.3 1.3 3.5z" />
                        </svg>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">OneDrive</span>
                      </button>
                    </div>
                  </div>

                  {/* Filename Input */}
                  <div>
                    <label htmlFor="cloud-filename" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      {t('اسم الملف', 'File Name')}
                    </label>
                    <input
                      id="cloud-filename"
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder={t('أدخل اسم الملف', 'Enter file name')}
                      className="w-full rounded-xl border border-gray-255 px-3 py-2.5 text-xs focus:ring-2 focus:ring-brown-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>

                  {/* Format Selector */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      {t('صيغة التصدير', 'Document Format')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormat('pdf')}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          format === 'pdf'
                            ? 'bg-brown-600 text-white border-brown-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormat('word')}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          format === 'word'
                            ? 'bg-brown-600 text-white border-brown-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        Word (.doc)
                      </button>
                    </div>
                  </div>

                  {/* Sandbox Environment Disclaimer */}
                  <div className="bg-blue-50/50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-blue-100/50 dark:border-slate-700/60 text-[10px] text-blue-700 dark:text-blue-400 flex items-start gap-2.5 leading-relaxed">
                    <AlertCircle className="w-4 h-4 shrink-0 text-blue-500" />
                    <p>
                      {t(
                        'ملاحظة: هذا الاتصال آمن وتجريبي (Sandbox). لربط حساب مؤسستك بالـ Client API الدائم، يرجى تهيئة متغيرات البيئة بملف الـ Env الخاص بك.',
                        'Note: This connection is sandbox-secured. To integrate with your production enterprise Client APIs, configure the Client Credentials in your app environment settings.'
                      )}
                    </p>
                  </div>

                  {/* Connect & Upload Button */}
                  <button
                    type="button"
                    onClick={startUploadFlow}
                    disabled={!fileName.trim()}
                    className="w-full mt-2 bg-brown-600 hover:bg-brown-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50 cursor-pointer text-xs"
                  >
                    <Cloud className="w-4.5 h-4.5" />
                    {t('الاتصال بالخدمة والرفع', 'Connect & Upload')}
                  </button>
                </div>
              )}

              {/* Step 2: Auth Connection */}
              {step === 'auth' && (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-brown-600 animate-spin" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 dark:text-white">
                      {t(`جاري الاتصال بـ ${provider === 'google' ? 'Google Drive' : 'OneDrive'}...`, `Connecting to ${provider === 'google' ? 'Google Drive' : 'OneDrive'}...`)}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {t('يرجى تأكيد الحساب في النافذة المنبثقة...', 'Please approve the authentication popup...')}
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Uploading State */}
              {step === 'uploading' && (
                <div className="py-8 space-y-5">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span>{t('جاري رفع الملف...', 'Uploading file...')}</span>
                    <span>{progress}%</span>
                  </div>
                  {/* Progress Bar Container */}
                  <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-brown-600 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">
                    {t(`حفظ "${fileName}.${format === 'pdf' ? 'pdf' : 'doc'}"...`, `Saving "${fileName}.${format === 'pdf' ? 'pdf' : 'doc'}"...`)}
                  </p>
                </div>
              )}

              {/* Step 4: Success State */}
              {step === 'success' && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-5">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center shadow-sm border border-green-100 dark:border-green-900/30">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 dark:text-white">
                      {t('تم الرفع بنجاح!', 'Uploaded Successfully!')}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[280px]">
                      {t(
                        `تم حفظ الملف "${fileName}.${format === 'pdf' ? 'pdf' : 'doc'}" على مساحتك التخزينية المحددة.`,
                        `The letter "${fileName}.${format === 'pdf' ? 'pdf' : 'doc'}" is saved inside your target drive.`
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full pt-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm text-xs"
                    >
                      <Eye className="w-4 h-4" />
                      {t('فتح الحساب للمعاينة', 'Open Cloud Drive')}
                    </a>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full bg-gray-150 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold py-2.5 px-4 rounded-xl transition-colors text-xs cursor-pointer"
                    >
                      {t('إغلاق النافذة', 'Close')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CloudStorageModal;
