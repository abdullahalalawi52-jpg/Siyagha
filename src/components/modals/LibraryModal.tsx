import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Library, X, Star, Bookmark } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { predefinedTemplates } from '../../data/templates';
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
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="fixed top-0 left-0 bottom-0 w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden border-r border-gray-200 text-right"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-white/40 dark:bg-black/20 p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brown-50/80 dark:bg-brown-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-brown-600 dark:text-brown-400 shadow-sm border border-brown-100/50 dark:border-brown-500/20">
                  <Library className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="library-modal-title" className="text-xl font-bold text-gray-900 mb-1">مكتبة القوالب</h3>
                  <p className="text-sm text-gray-600">اختر قالباً جاهزاً أو من قوالبك المخصصة</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors shadow-sm cursor-pointer"
                type="button"
                aria-label="إغلاق المكتبة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/30 px-6 sm:px-8 shrink-0 gap-6" role="tablist" aria-label="تبويبات القوالب">
              <button
                className={`py-4 font-bold text-sm border-b-2 transition-colors cursor-pointer ${libraryTab === 'system' ? 'border-brown-600 text-brown-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                onClick={() => setLibraryTab('system')}
                type="button"
                role="tab"
                aria-selected={libraryTab === 'system'}
              >
                القوالب الجاهزة
              </button>
              <button
                className={`py-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${libraryTab === 'custom' ? 'border-brown-600 text-brown-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                onClick={() => setLibraryTab('custom')}
                type="button"
                role="tab"
                aria-selected={libraryTab === 'custom'}
              >
                قوالبي المخصصة
                {customTemplates.length > 0 && (
                  <span className="bg-brown-100/80 text-brown-800 text-[10px] px-2 py-0.5 rounded-full">{customTemplates.length}</span>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              {libraryTab === 'system' ? (
                <div className="space-y-8">
                  {favoritePredefined.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-sm font-bold text-yellow-600 uppercase tracking-wider mb-4 flex items-center gap-2 justify-start">
                        <span className="w-1.5 h-4 bg-yellow-400 rounded-full inline-block"></span>
                        المفضلة
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {predefinedTemplates.filter((t) => favoritePredefined.includes(t.id)).map((template) => (
                          <div
                            key={template.id}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => handleKeyDown(e, () => applyTemplate(template.id, false))}
                            className={`bg-white p-4 rounded-xl border transition-all cursor-pointer group flex items-start gap-3.5 relative ${
                              activeTemplate === template.id
                                ? 'border-brown-500 shadow-md ring-1 ring-brown-500/20'
                                : 'border-gray-200 hover:border-brown-300 hover:shadow-sm'
                            }`}
                            onClick={() => applyTemplate(template.id, false)}
                            aria-label={`تطبيق قالب ${template.name}`}
                          >
                            <button
                              type="button"
                              onClick={(e) => toggleFavoritePredefined(template.id, e)}
                              className="absolute top-2 left-2 p-1 text-yellow-400 hover:text-yellow-500 transition-colors bg-white/80 rounded-full cursor-pointer z-10"
                              title="إزالة من المفضلة"
                              aria-label="إزالة من المفضلة"
                            >
                              <Star className="w-4 h-4 fill-yellow-400" />
                            </button>
                            <div className={`p-2.5 rounded-xl shrink-0 transition-all ${activeTemplate === template.id ? 'bg-brown-50 text-brown-600' : 'bg-gray-50 text-gray-500 group-hover:bg-brown-50 group-hover:text-brown-500'}`}>
                              {template.icon}
                            </div>
                            <div className="flex-1 min-w-0 text-right">
                              <h5 className="font-bold text-sm text-gray-800 group-hover:text-brown-600 transition-colors mb-1 ml-6">{template.name}</h5>
                              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{template.data.subject || template.data.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {categories.map((category) => (
                    <div key={category}>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2 justify-start">
                        <span className="w-1.5 h-4 bg-brown-300 rounded-full inline-block"></span>
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {predefinedTemplates.filter((t) => t.category === category).map((template) => (
                          <div
                            key={template.id}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => handleKeyDown(e, () => applyTemplate(template.id, false))}
                            className={`bg-white p-4 rounded-xl border transition-all cursor-pointer group flex items-start gap-3.5 relative ${
                              activeTemplate === template.id
                                ? 'border-brown-500 shadow-md ring-1 ring-brown-500/20'
                                : 'border-gray-200 hover:border-brown-300 hover:shadow-sm'
                            }`}
                            onClick={() => applyTemplate(template.id, false)}
                            aria-label={`تطبيق قالب ${template.name}`}
                          >
                            <button
                              type="button"
                              onClick={(e) => toggleFavoritePredefined(template.id, e)}
                              className={`absolute top-2 left-2 p-1 transition-colors bg-white/80 rounded-full cursor-pointer z-10 ${favoritePredefined.includes(template.id) ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                              title={favoritePredefined.includes(template.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                              aria-label={favoritePredefined.includes(template.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                            >
                              <Star className={`w-4 h-4 ${favoritePredefined.includes(template.id) ? 'fill-yellow-400' : ''}`} />
                            </button>
                            <div className={`p-2.5 rounded-xl shrink-0 transition-all ${activeTemplate === template.id ? 'bg-brown-50 text-brown-600' : 'bg-gray-50 text-gray-500 group-hover:bg-brown-50 group-hover:text-brown-500'}`}>
                              {template.icon}
                            </div>
                            <div className="flex-1 min-w-0 text-right">
                              <h5 className="font-bold text-sm text-gray-800 group-hover:text-brown-600 transition-colors mb-1 ml-6">{template.name}</h5>
                              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{template.data.subject || template.data.details}</p>
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
                      <p className="text-sm font-bold text-gray-600">لا توجد قوالب مخصصة</p>
                      <p className="text-xs mt-2">يمكنك حفظ أي خطاب تقوم بإعداده كقالب مخصص لاستخدامه لاحقاً.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {customTemplates.map((template) => (
                        <div
                          key={template.id}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => handleKeyDown(e, () => applyTemplate(template.id, true))}
                          className={`bg-white p-4 rounded-xl border transition-all cursor-pointer group flex items-center justify-between gap-4 ${
                            activeTemplate === template.id
                              ? 'border-brown-500 shadow-md ring-1 ring-brown-500/20'
                              : 'border-gray-200 hover:border-brown-300 hover:shadow-sm'
                          }`}
                          onClick={() => applyTemplate(template.id, true)}
                          aria-label={`تطبيق قالب ${template.name}`}
                        >
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            <div className="p-2.5 rounded-xl bg-brown-50 text-brown-600 shrink-0">
                              <Bookmark className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 text-right">
                              <h5 className="font-bold text-sm text-gray-800 group-hover:text-brown-600 transition-colors mb-1">{template.name}</h5>
                              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{template.data.subject}</p>
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
                            className="text-gray-400 hover:text-red-500 p-1.5 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                            title="حذف القالب"
                            aria-label="حذف القالب"
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
