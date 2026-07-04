import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Sparkles, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { BasicInfoTab } from './letter-form/BasicInfoTab';
import { BrandingTab } from './letter-form/BrandingTab';
import { SignatureTab } from './letter-form/SignatureTab';

export const LetterForm: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    generateLetter,
    currentVariables,
    replaceVariable,
    isSavingTemplate,
    setIsSavingTemplate,
    newTemplateName,
    setNewTemplateName,
    handleSaveCustomTemplate,
    appLang,
    t,
  } = useApp();

  return (
    <div className="lg:col-span-5 premium-card p-6 rounded-2xl shadow-sm border border-brown-100/60 relative overflow-hidden text-start" dir={appLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* decorative top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-brown-500 via-brown-400 to-brown-500" />
      <h2 className="text-base font-black text-gray-900 dark:text-white dark:text-white mb-6 flex items-center gap-2.5 tracking-tight">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-brown-500 to-brown-600">
          <PenLine className="w-3.5 h-3.5 text-white" />
        </div>
        {t('التخصيص والتفاصيل', 'Customization & Details')}
      </h2>

      {/* Tab Selector */}
      <div className="flex bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setActiveSection('basic')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeSection === 'basic' ? 'bg-white text-brown-900 shadow-sm tab-btn-active dark:bg-slate-700 dark:text-white' : 'text-gray-550 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          {t('بيانات الخطاب', 'Letter Data')}
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('branding')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeSection === 'branding' ? 'bg-white text-brown-900 shadow-sm tab-btn-active dark:bg-slate-700 dark:text-white' : 'text-gray-550 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          {t('الهوية والترويسة', 'Branding & Header')}
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('signature')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeSection === 'signature' ? 'bg-white text-brown-900 shadow-sm tab-btn-active dark:bg-slate-700 dark:text-white' : 'text-gray-550 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          {t('التوقيع والختم', 'Signature & Seal')}
        </button>
      </div>

      <form onSubmit={generateLetter} className="space-y-4">
        <AnimatePresence mode="wait">
          {activeSection === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <BasicInfoTab />
            </motion.div>
          )}

          {activeSection === 'branding' && (
            <motion.div
              key="branding"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <BrandingTab />
            </motion.div>
          )}

          {activeSection === 'signature' && (
            <motion.div
              key="signature"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <SignatureTab />
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Dynamic Variables Panel */}
      {currentVariables.length > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 bg-brown-50/50 border border-brown-100 rounded-xl p-4">
          <h3 className="text-sm font-bold text-brown-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brown-600" />
            {t('المتغيرات الذكية (املأ الفراغات)', 'Smart Variables (Fill-in-the-blanks)')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentVariables.map((variable) => (
              <div key={variable} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-brown-700">{variable}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id={`var_${variable}`}
                    placeholder={t(`أدخل ${variable}`, `Enter ${variable}`)}
                    className="w-full rounded-lg border-brown-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(`var_${variable}`) as HTMLInputElement;
                      if (input) replaceVariable(variable, input.value);
                    }}
                    className="bg-brown-600 text-white px-3 rounded-lg text-xs font-bold hover:bg-brown-700 cursor-pointer"
                  >
                    {t('تطبيق', 'Apply')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Save Template Modal Inside Form Column */}
      <AnimatePresence>
        {isSavingTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-lg absolute bottom-12 left-6 right-6 z-20"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t('تسمية القالب المخصص', 'Name Custom Template')}</h4>
              <button type="button" onClick={() => setIsSavingTemplate(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('مثال: طلب إجازة خاصة', 'e.g., Special Leave Request')}
                className="flex-1 rounded-lg border-gray-200 dark:border-slate-700 border px-3 dark:bg-slate-900 dark:text-white py-2 text-sm outline-none focus:border-brown-500"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSaveCustomTemplate}
                disabled={!newTemplateName}
                className="bg-brown-600 text-white px-4 rounded-lg text-sm font-bold disabled:opacity-50 cursor-pointer"
              >
                {t('حفظ', 'Save')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LetterForm;
