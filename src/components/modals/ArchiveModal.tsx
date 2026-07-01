import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Archive, X, Search, Filter, Pin, PinOff, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { CustomSelect } from '../CustomSelect';
import { letterTypes, typeTranslations } from '../../data/templates';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

export const ArchiveModal: React.FC = () => {
  const {
    isArchiveOpen,
    setIsArchiveOpen,
    archiveTab,
    setArchiveTab,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterTag,
    setFilterTag,
    savedLetters,
    handleTogglePin,
    handleLoadSaved,
    appLang,
    t,
  } = useApp();

  const handleClose = () => setIsArchiveOpen(false);
  const modalRef = useModalAccessibility(isArchiveOpen, handleClose);

  const ObjectKeys = Object.keys(letterTypes);

  const filteredLetters = savedLetters
    .filter((letter) => {
      const matchesSearch =
        letter.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        letter.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        letter.date.includes(searchQuery);
      const matchesFilter = filterType === 'all' || letter.type === filterType;
      const matchesTag = !filterTag || (letter.tags && letter.tags.includes(filterTag));
      let matchesTab = true;
      if (archiveTab === 'drafts') matchesTab = !!letter.isDraft;
      if (archiveTab === 'saved') matchesTab = !letter.isDraft;

      return matchesSearch && matchesFilter && matchesTab && matchesTag;
    })
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const archiveTags = Array.from(new Set(savedLetters.flatMap((l) => l.tags || [])));

  return (
    <AnimatePresence>
      {isArchiveOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-modal-title"
            initial={{ x: appLang === 'ar' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: appLang === 'ar' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={`absolute top-0 bottom-0 ${appLang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} w-full max-w-sm premium-card shadow-2xl flex flex-col border-gray-200 text-start z-10`}
            dir={appLang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brown-100 rounded-lg flex items-center justify-center text-brown-600">
                  <Archive className="w-4 h-4" />
                </div>
                <h3 id="archive-modal-title" className="font-bold text-gray-900">{t('الأرشيف المحلي', 'Local Archive')}</h3>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
                type="button"
                aria-label={t('إغلاق الأرشيف', 'Close archive')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100 bg-white flex flex-col gap-3 shrink-0">
              <div className="flex bg-gray-100 dark:bg-slate-800/80 p-1 rounded-lg" role="tablist" aria-label="تبويبات الأرشيف">
                <button
                  onClick={() => setArchiveTab('all')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${archiveTab === 'all' ? 'bg-white text-brown-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                  type="button"
                  role="tab"
                  aria-selected={archiveTab === 'all'}
                >
                  {t('الكل', 'All')}
                </button>
                <button
                  onClick={() => setArchiveTab('saved')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${archiveTab === 'saved' ? 'bg-white text-brown-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                  type="button"
                  role="tab"
                  aria-selected={archiveTab === 'saved'}
                >
                  {t('مكتملة', 'Completed')}
                </button>
                <button
                  onClick={() => setArchiveTab('drafts')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${archiveTab === 'drafts' ? 'bg-white text-brown-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                  type="button"
                  role="tab"
                  aria-selected={archiveTab === 'drafts'}
                >
                  {t('مسودات', 'Drafts')}
                </button>
              </div>
              <div className="relative">
                <Search className={`w-4 h-4 text-gray-400 absolute ${appLang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                <input
                  type="text"
                  placeholder={t('ابحث في الخطابات...', 'Search letters...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${appLang === 'ar' ? 'pl-3 pr-9' : 'pl-9 pr-3'} py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-brown-500/20 focus:border-brown-500 outline-none transition-all`}
                  aria-label={t('ابحث في الخطابات', 'Search letters')}
                />
              </div>
              <div className="flex items-center gap-2 relative z-30">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <CustomSelect
                    value={filterType}
                    onChange={(val) => setFilterType(val)}
                    options={[
                      { value: 'all', label: t('جميع الأنواع', 'All Types') },
                      ...ObjectKeys.map((type) => ({ value: type, label: t(type, typeTranslations[type] || type) })),
                    ]}
                  />
                </div>
              </div>
              {/* Tags filter */}
              {archiveTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 justify-start">
                  <button
                    onClick={() => setFilterTag('')}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                      filterTag === '' ? 'bg-brown-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    type="button"
                    aria-label={t('تصفية حسب كل الوسوم', 'Filter by all tags')}
                  >
                    {t('كل الوسوم', 'All Tags')}
                  </button>
                  {archiveTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        filterTag === tag ? 'bg-brown-600 text-white' : 'bg-brown-50 text-brown-700 hover:bg-brown-100'
                      }`}
                      type="button"
                      aria-label={t(`تصفية حسب الوسم ${tag}`, `Filter by tag ${tag}`)}
                      aria-pressed={filterTag === tag}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredLetters.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                  <Archive className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">{t('لا توجد خطابات مطابقة', 'No matching letters found')}</p>
                </div>
              ) : (
                filteredLetters.map((letter) => (
                  <div
                    key={letter.id}
                    onClick={() => handleLoadSaved(letter)}
                    className={`bg-white border ${
                      letter.isPinned
                        ? 'border-brown-300 ring-1 ring-brown-200/60'
                        : letter.isDraft
                        ? 'border-dashed border-yellow-300 bg-yellow-50/30 hover:border-yellow-500'
                        : 'border-gray-200 hover:border-brown-300'
                    } p-4 rounded-xl cursor-pointer hover:shadow-md transition-all group relative`}
                  >
                    {/* Pin Button */}
                    <button
                      type="button"
                      onClick={(e) => handleTogglePin(e, letter.id)}
                      className={`absolute top-3 ${appLang === 'ar' ? 'left-3' : 'right-3'} p-1 rounded-md transition-all cursor-pointer ${
                        letter.isPinned
                          ? 'text-brown-600 bg-brown-50 opacity-100'
                          : 'text-gray-300 hover:text-brown-500 hover:bg-brown-50 opacity-0 group-hover:opacity-100'
                      }`}
                      title={letter.isPinned ? t('إلغاء التثبيت', 'Unpin') : t('تثبيت الخطاب', 'Pin letter')}
                      aria-label={letter.isPinned ? t('إلغاء تثبيت الخطاب', 'Unpin letter') : t('تثبيت الخطاب', 'Pin letter')}
                    >
                      {letter.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </button>

                    <h4 className={`font-bold text-gray-800 text-sm mb-2 group-hover:text-brown-600 transition-colors ${appLang === 'ar' ? 'pr-2' : 'pl-2'}`}>{letter.subject}</h4>
                    <div className="flex gap-2 items-center mb-2 justify-start">
                      {letter.isPinned && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-brown-50 text-brown-600 border border-brown-200">
                          📌 {t('مثبت', 'Pinned')}
                        </span>
                      )}
                      {letter.type && (
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${letter.isDraft ? 'bg-yellow-100/50 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                          {t(letter.type, typeTranslations[letter.type] || letter.type)}
                        </span>
                      )}
                      {letter.isDraft && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                          {t('مسودة مؤقتة', 'Temporary Draft')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {letter.content || letter.formData?.details || t('(بدون محتوى)', '(No content)')}
                      </p>
                      {/* Tags */}
                      {letter.tags && letter.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 justify-start">
                          {letter.tags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFilterTag(filterTag === tag ? '' : tag);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                filterTag === tag
                                  ? 'bg-brown-600 text-white'
                                  : 'bg-brown-50 text-brown-600 hover:bg-brown-100'
                              }`}
                              aria-label={t(`تصفية حسب الوسم ${tag}`, `Filter by tag ${tag}`)}
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1 justify-start">
                        <Clock className="w-3 h-3" />
                        {letter.date}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ArchiveModal;
