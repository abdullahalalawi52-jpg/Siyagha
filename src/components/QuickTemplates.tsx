import React from 'react';
import { Library, Star } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { predefinedTemplates, templateNameTranslations, categoryTranslations } from '../data/templates';

export const QuickTemplates: React.FC = () => {
  const {
    activeTemplate,
    favoritePredefined,
    toggleFavoritePredefined,
    applyTemplate,
    isStatsOpen,
    setIsStatsOpen,
    setIsLibraryOpen,
    t,
  } = useApp();

  // Sort templates so favorites come first
  const sortedTemplates = [
    ...predefinedTemplates.filter((t) => favoritePredefined.includes(t.id)),
    ...predefinedTemplates.filter((t) => !favoritePredefined.includes(t.id)),
  ];

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
                : 'text-brown-700 hover:text-brown-800 bg-brown-50 hover:bg-brown-100'
            }`}
            type="button"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            {t('إحصائياتي', 'My Stats')}
          </button>
          <button 
            onClick={() => setIsLibraryOpen(true)}
            className="text-xs font-bold text-brown-700 hover:text-brown-800 flex items-center gap-1.5 bg-brown-50 hover:bg-brown-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            type="button"
          >
            <Library className="w-4 h-4" />
            {t('مكتبة القوالب', 'Template Library')}
          </button>
        </div>
      </div>

      {/* Render top 4 templates */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {sortedTemplates.slice(0, 4).map((template) => (
          <div
            key={template.id}
            onClick={() => applyTemplate(template.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                applyTemplate(template.id);
              }
            }}
            tabIndex={0}
            role="button"
            className={`group relative flex items-center gap-3 p-4 rounded-2xl border text-start transition-all hover:-translate-y-0.5 active:scale-[0.97] cursor-pointer ${
              activeTemplate === template.id
                ? 'border-brown-400 bg-gradient-to-br from-brown-50 to-orange-50 text-brown-700 shadow-lg ring-2 ring-brown-400/25'
                : 'border-gray-200/80 bg-white/80 hover:border-brown-300/70 text-gray-700 shadow-sm'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              activeTemplate === template.id
                ? 'bg-white text-brown-600 shadow-sm'
                : 'bg-gray-100 text-gray-500 group-hover:bg-brown-100 group-hover:text-brown-600'
            }`}>
              {template.icon}
            </div>
            {favoritePredefined.includes(template.id) && (
              <button 
                type="button"
                onClick={(e) => toggleFavoritePredefined(template.id, e)}
                className="absolute top-2 left-2 p-1 transition-transform hover:scale-110 z-10 cursor-pointer"
                title={t('إزالة من المفضلة', 'Remove from Favorites')}
              >
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
              </button>
            )}
            <div className="flex flex-col min-w-0 text-start">
              <span className="font-bold text-sm truncate">{t(template.name, templateNameTranslations[template.name] || template.name)}</span>
              <span className="text-[10px] text-gray-400 font-medium">{t(template.category, categoryTranslations[template.category] || template.category)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickTemplates;
