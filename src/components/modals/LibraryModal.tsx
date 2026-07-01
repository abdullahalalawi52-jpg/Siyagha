import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Library, X, Star, Bookmark } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { predefinedTemplates, templateNameTranslations, categoryTranslations } from '../../data/templates';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

export const LibraryModal: React.FC = () => {
  const {
    isLibraryOpen,
    setIsLibraryOpen,
    libraryTab,
    setLibraryTab,
    customTemplates,
    setCustomTemplates,
    favoritePredefined,
    toggleFavoritePredefined,
    activeTemplate,
    applyTemplate,
    appLang,
    t,
  } = useApp();

  const handleClose = () => setIsLibraryOpen(false);
  const modalRef = useModalAccessibility(isLibraryOpen, handleClose);

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const categories = Array.from(new Set(predefinedTemplates.map((t) => t.category)));

  return (
    <AnimatePresence>
      {isLibraryOpen && (
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
            aria-labelledby="library-modal-title"
            initial={{ x: appLang === 'ar' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: appLang === 'ar' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={`fixed top-0 bottom-0 ${appLang === 'ar' ? 'left-0 border-r dark:border-slate-800' : 'right-0 border-l dark:border-slate-800'} w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl premium-card shadow-2xl flex flex-col overflow-hidden border-gray-200 text-start z-50`}
            dir={appLang === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brown-50/80 dark:bg-brown-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-brown-600 dark:text-brown-400 shadow-sm border border-brown-100/50 dark:border-brown-500/20">
                  <Library className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="library-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('مكتبة القوالب', 'Template Library')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('اختر قالباً جاهزاً أو من قوالبك المخصصة', 'Choose a ready template or from your custom templates')}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors shadow-sm cursor-pointer"
                type="button"
                aria-label={t('إغلاق المكتبة', 'Close library')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 px-6 sm:px-8 shrink-0 gap-6" role="tablist" aria-label="تبويبات القوالب">
              <button
                className={`py-4 font-bold text-sm border-b-2 transition-colors cursor-pointer ${libraryTab === 'system' ? 'border-brown-600 text-brown-700 dark:text-brown-400 dark:border-brown-500' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                onClick={() => setLibraryTab('system')}
                type="button"
                role="tab"
                aria-selected={libraryTab === 'system'}
              >
                {t('القوالب الجاهزة', 'Ready Templates')}
              </button>
              <button
                className={`py-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${libraryTab === 'custom' ? 'border-brown-600 text-brown-700 dark:text-brown-400 dark:border-brown-500' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                onClick={() => setLibraryTab('custom')}
                type="button"
                role="tab"
                aria-selected={libraryTab === 'custom'}
              >
                {t('قوالبي المخصصة', 'My Custom Templates')}
                {customTemplates.length > 0 && (
                  <span className="bg-brown-100/80 dark:bg-brown-900/60 text-brown-800 dark:text-brown-300 text-[10px] px-2 py-0.5 rounded-full">{customTemplates.length}</span>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              {libraryTab === 'system' ? (
                <div className="space-y-8">
                  {favoritePredefined.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-sm font-bold text-yellow-600 dark:text-yellow-550 uppercase tracking-wider mb-4 flex items-center gap-2 justify-start">
                        <span className="w-1.5 h-4 bg-yellow-400 rounded-full inline-block"></span>
                        {t('المفضلة', 'Favorites')}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {predefinedTemplates.filter((t) => favoritePredefined.includes(t.id)).map((template) => (
                          <div
                            key={template.id}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => handleKeyDown(e, () => applyTemplate(template.id, false))}
                            className={`bg-white dark:bg-slate-800/40 p-4 rounded-xl border transition-all cursor-pointer group flex items-start gap-3.5 relative ${
                              activeTemplate === template.id
                                ? 'border-brown-500 dark:border-brown-500 shadow-md ring-1 ring-brown-500/20'
                                : 'border-gray-200 dark:border-slate-800 hover:border-brown-300 dark:hover:border-brown-500/40 hover:shadow-sm template-card-btn'
                            }`}
                            onClick={() => applyTemplate(template.id, false)}
                            aria-label={t(`تطبيق قالب ${template.name}`, `Apply template ${t(template.name, templateNameTranslations[template.name] || template.name)}`)}
                          >
                            <button
                              type="button"
                              onClick={(e) => toggleFavoritePredefined(template.id, e)}
                              className="absolute top-2 left-2 p-1 text-yellow-400 hover:text-yellow-500 transition-colors premium-glass-white-80 dark:bg-slate-800/80 rounded-full cursor-pointer z-10"
                              title={t('إزالة من المفضلة', 'Remove from Favorites')}
                              aria-label={t('إزالة من المفضلة', 'Remove from Favorites')}
                            >
                              <Star className="w-4 h-4 fill-yellow-400" />
                            </button>
                            <div className={`p-2.5 rounded-xl shrink-0 transition-all ${activeTemplate === template.id ? 'bg-brown-50 dark:bg-brown-950/40 text-brown-600 dark:text-brown-400' : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 group-hover:bg-brown-50 dark:group-hover:bg-brown-950/40 group-hover:text-brown-500 dark:group-hover:text-brown-400'}`}>
                              {template.icon}
                            </div>
                            <div className={`flex-1 min-w-0 ${appLang === 'ar' ? 'text-right' : 'text-left'}`}>
                              <h5 className="font-bold text-sm text-gray-800 dark:text-gray-200 group-hover:text-brown-600 dark:group-hover:text-brown-400 transition-colors mb-1 ml-6">{t(template.name, templateNameTranslations[template.name] || template.name)}</h5>
                              <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">{template.data.subject || template.data.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {categories.map((category) => (
                    <div key={category}>
                      <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 justify-start">
                        <span className="w-1.5 h-4 bg-brown-300 rounded-full inline-block"></span>
                        {t(category, categoryTranslations[category] || category)}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {predefinedTemplates.filter((t) => t.category === category).map((template) => (
                          <div
                            key={template.id}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => handleKeyDown(e, () => applyTemplate(template.id, false))}
                            className={`bg-white dark:bg-slate-800/40 p-4 rounded-xl border transition-all cursor-pointer group flex items-start gap-3.5 relative ${
                              activeTemplate === template.id
                                ? 'border-brown-500 dark:border-brown-500 shadow-md ring-1 ring-brown-500/20'
                                : 'border-gray-200 dark:border-slate-800 hover:border-brown-300 dark:hover:border-brown-500/40 hover:shadow-sm template-card-btn'
                            }`}
                            onClick={() => applyTemplate(template.id, false)}
                            aria-label={t(`تطبيق قالب ${template.name}`, `Apply template ${t(template.name, templateNameTranslations[template.name] || template.name)}`)}
                          >
                            <button
                              type="button"
                              onClick={(e) => toggleFavoritePredefined(template.id, e)}
                              className={`absolute top-2 left-2 p-1 transition-colors premium-glass-white-80 dark:bg-slate-800/80 rounded-full cursor-pointer z-10 ${favoritePredefined.includes(template.id) ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400 dark:hover:text-yellow-550'}`}
                              title={favoritePredefined.includes(template.id) ? t('إزالة من المفضلة', 'Remove from Favorites') : t('إضافة للمفضلة', 'Add to Favorites')}
                              aria-label={favoritePredefined.includes(template.id) ? t('إزالة من المفضلة', 'Remove from Favorites') : t('إضافة للمفضلة', 'Add to Favorites')}
                            >
                              <Star className={`w-4 h-4 ${favoritePredefined.includes(template.id) ? 'fill-yellow-400' : ''}`} />
                            </button>
                            <div className={`p-2.5 rounded-xl shrink-0 transition-all ${activeTemplate === template.id ? 'bg-brown-50 dark:bg-brown-950/40 text-brown-600 dark:text-brown-400' : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 group-hover:bg-brown-50 dark:group-hover:bg-brown-950/40 group-hover:text-brown-500 dark:group-hover:text-brown-400'}`}>
                              {template.icon}
                            </div>
                            <div className={`flex-1 min-w-0 ${appLang === 'ar' ? 'text-right' : 'text-left'}`}>
                              <h5 className="font-bold text-sm text-gray-800 dark:text-gray-200 group-hover:text-brown-600 dark:group-hover:text-brown-400 transition-colors mb-1 ml-6">{t(template.name, templateNameTranslations[template.name] || template.name)}</h5>
                              <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">{template.data.subject || template.data.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {customTemplates.length === 0 ? (
                    <div className="text-center text-gray-400 mt-20">
                      <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{t('لا توجد قوالب مخصصة', 'No custom templates')}</p>
                      <p className="text-xs mt-2 text-gray-450 dark:text-gray-500">{t('يمكنك حفظ أي خطاب تقوم بإعداده كقالب مخصص لاستخدامه لاحقاً.', 'You can save any letter you prepare as a custom template to use it later.')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {customTemplates.map((template) => (
                        <div
                          key={template.id}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => handleKeyDown(e, () => applyTemplate(template.id, true))}
                          className={`bg-white dark:bg-slate-800/40 p-4 rounded-xl border transition-all cursor-pointer group flex items-center justify-between gap-4 ${
                            activeTemplate === template.id
                              ? 'border-brown-500 dark:border-brown-500 shadow-md ring-1 ring-brown-500/20'
                              : 'border-gray-200 dark:border-slate-800 hover:border-brown-300 dark:hover:border-brown-500/40 hover:shadow-sm template-card-btn'
                          }`}
                          onClick={() => applyTemplate(template.id, true)}
                          aria-label={t(`تطبيق قالب ${template.name}`, `Apply template ${template.name}`)}
                        >
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            <div className="p-2.5 rounded-xl bg-brown-50 dark:bg-brown-950/40 text-brown-600 dark:text-brown-400 shrink-0">
                              <Bookmark className="w-5 h-5" />
                            </div>
                            <div className={`flex-1 min-w-0 ${appLang === 'ar' ? 'text-right' : 'text-left'}`}>
                              <h5 className="font-bold text-sm text-gray-800 dark:text-gray-200 group-hover:text-brown-600 dark:group-hover:text-brown-400 transition-colors mb-1">{template.name}</h5>
                              <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">{template.data.subject}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = customTemplates.filter((t) => t.id !== template.id);
                              setCustomTemplates(updated);
                              localStorage.setItem('custom_templates', JSON.stringify(updated));
                            }}
                            className="text-gray-400 dark:text-gray-550 hover:text-red-500 p-1.5 bg-gray-50 dark:bg-slate-850 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors shrink-0 cursor-pointer"
                            title={t('حذف القالب', 'Delete template')}
                            aria-label={t('حذف القالب', 'Delete template')}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LibraryModal;
