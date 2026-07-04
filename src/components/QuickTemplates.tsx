import React, { useState, useEffect } from 'react';
import { Library, Star } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { templateNameTranslations, categoryTranslations } from '../data/templateTranslations';
import { predefinedTemplates } from '../data/predefinedTemplates';
import { Reorder } from 'motion/react';

export const QuickTemplates: React.FC = () => {
  const {
    activeTemplate,
    favoritePredefined,
    toggleFavoritePredefined,
    setFavoritePredefined,
    applyTemplate,
    isStatsOpen,
    setIsStatsOpen,
    setIsLibraryOpen,
    t,
  } = useApp();

  // Sort templates so favorites come first, and respect their custom dragged order
  const favoriteTemplatesList = favoritePredefined
    .map(id => predefinedTemplates.find(t => t.id === id))
    .filter((t): t is typeof predefinedTemplates[0] => t !== undefined);

  const nonFavoriteTemplatesList = predefinedTemplates.filter(t => !favoritePredefined.includes(t.id));

  const sortedTemplates = [...favoriteTemplatesList, ...nonFavoriteTemplatesList];

  const initialTop4 = sortedTemplates.slice(0, 4);
  const [displayTemplates, setDisplayTemplates] = useState(initialTop4);

  useEffect(() => {
    const currentIds = displayTemplates.map((t) => t.id).join(',');
    const newIds = sortedTemplates.slice(0, 4).map((t) => t.id).join(',');
    if (currentIds !== newIds) {
      setDisplayTemplates(sortedTemplates.slice(0, 4));
    }
  }, [favoritePredefined]); // we only listen to favoritePredefined changes

  const handleReorder = (newOrder: typeof displayTemplates) => {
    setDisplayTemplates(newOrder);
  };

  const handleDragEnd = () => {
    // Only reorder items that are ALREADY favorites
    const displayedFavoriteIds = displayTemplates
      .map((t) => t.id)
      .filter((id) => favoritePredefined.includes(id));
      
    const otherFavorites = favoritePredefined.filter((id) => !displayedFavoriteIds.includes(id));
    
    // Save the new order of favorites without adding non-favorites
    setFavoritePredefined([...displayedFavoriteIds, ...otherFavorites]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-black text-brown-500/80 uppercase tracking-[0.12em] flex items-center gap-2">
          <span className="w-4 h-px bg-gradient-to-r from-brown-400 to-transparent inline-block"></span>
          {t('نماذج الاستخدام السريع', 'Quick Templates')}
        </h2>
        <div className="flex items-center gap-2">
          {/* Stats Toggle */}
          <button
            onClick={() => setIsStatsOpen(!isStatsOpen)}
            className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              isStatsOpen
                ? 'bg-brown-600 text-white'
                : 'text-brown-700 hover:text-brown-800 bg-brown-50 hover:bg-brown-100 dark:text-brown-300 dark:hover:text-brown-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border dark:border-slate-700'
            }`}
            type="button"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            {t('إحصائياتي', 'My Stats')}
          </button>
          <button 
            onClick={() => setIsLibraryOpen(true)}
            className="text-xs font-bold text-brown-700 hover:text-brown-800 flex items-center gap-1.5 bg-brown-50 hover:bg-brown-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer dark:text-brown-300 dark:hover:text-brown-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border dark:border-slate-700"
            type="button"
          >
            <Library className="w-4 h-4" />
            {t('مكتبة القوالب', 'Template Library')}
          </button>
        </div>
      </div>

      {/* Render top 4 templates */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Reorder.Group 
          axis="x" 
          values={displayTemplates} 
          onReorder={handleReorder} 
          className="flex flex-wrap sm:flex-nowrap gap-3 list-none p-0 m-0 flex-1"
        >
          {displayTemplates.map((template) => (
            <Reorder.Item
              key={template.id}
              value={template}
              onDragEnd={handleDragEnd}
              onClick={() => applyTemplate(template.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  applyTemplate(template.id);
                }
              }}
              tabIndex={0}
              role="button"
              dragListener={favoritePredefined.includes(template.id)}
              className={`w-[calc(50%-0.375rem)] sm:w-full group relative flex items-center gap-3 p-4 rounded-2xl border text-start transition-colors ${
                favoritePredefined.includes(template.id) ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
              } ${
                activeTemplate === template.id
                  ? 'border-brown-400 bg-gradient-to-br from-brown-50 to-orange-50 dark:from-brown-950/50 dark:to-orange-950/50 text-brown-700 dark:text-brown-400 shadow-lg ring-2 ring-brown-400/25'
                  : 'border-gray-200/80 dark:border-slate-800 premium-glass-white-80 dark:bg-slate-800/80 hover:border-brown-300/70 dark:hover:border-brown-500/40 text-gray-700 dark:text-gray-300 shadow-sm template-card-btn bg-white'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                activeTemplate === template.id
                  ? 'bg-white dark:bg-slate-800 text-brown-600 dark:text-brown-400 shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 group-hover:bg-brown-100 dark:group-hover:bg-brown-900/40 group-hover:text-brown-600 dark:group-hover:text-brown-400'
              }`}>
                {template.icon}
              </div>
              {favoritePredefined.includes(template.id) && (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoritePredefined(template.id, e);
                  }}
                  className="absolute top-2 left-2 p-1 transition-transform hover:scale-110 z-10 cursor-pointer"
                  title={t('إزالة من المفضلة', 'Remove from Favorites')}
                >
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                </button>
              )}
              <div className="flex flex-col min-w-0 text-start select-none pointer-events-none">
                <span className="font-bold text-sm truncate dark:text-gray-200">{t(template.name, templateNameTranslations[template.name] || template.name)}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{t(template.category, categoryTranslations[template.category] || template.category)}</span>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <button
          onClick={() => setIsLibraryOpen(true)}
          type="button"
          className="w-full sm:w-[90px] sm:shrink-0 group relative flex sm:flex-col items-center justify-center gap-3 sm:gap-2 p-4 sm:p-2 rounded-2xl border border-dashed border-brown-300/80 dark:border-brown-500/40 bg-white/60 dark:bg-slate-800/40 hover:bg-brown-50 dark:hover:bg-brown-950/40 hover:border-brown-400 dark:hover:border-brown-500/60 text-brown-600 dark:text-brown-400 hover:text-brown-700 dark:hover:text-brown-300 transition-all cursor-pointer shadow-sm template-card-btn"
          title={t('المزيد من القوالب', 'More Templates')}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 bg-brown-50/80 dark:bg-brown-950/50 group-hover:bg-white dark:group-hover:bg-slate-800 text-brown-600 dark:text-brown-400 group-hover:scale-110 shadow-sm transition-all">
            <Library className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-bold text-sm sm:text-xs">{t('المزيد', 'More')}</span>
        </button>
      </div>
    </div>
  );
};

export default QuickTemplates;
