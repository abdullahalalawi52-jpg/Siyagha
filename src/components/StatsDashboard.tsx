import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Calendar, Check, Pin } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { letterTypes } from '../data/templates';

export const StatsDashboard: React.FC = () => {
  const {
    isStatsOpen,
    savedLetters,
    filterTag,
    setFilterTag,
    setIsArchiveOpen,
  } = useApp();

  const total = savedLetters.length;
  const drafts = savedLetters.filter((l) => l.isDraft).length;
  const completed = total - drafts;
  const now = Date.now();
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const thisMonth = savedLetters.filter((l) => l.savedAt && l.savedAt > monthAgo).length;

  const typeCounts = Object.keys(letterTypes).map((t) => ({
    type: t,
    count: savedLetters.filter((l) => l.type === t).length,
  })).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...typeCounts.map((t) => t.count), 1);
  const allTags = Array.from(new Set(savedLetters.flatMap((l) => l.tags || [])));
  const pinnedCount = savedLetters.filter((l) => l.isPinned).length;

  return (
    <AnimatePresence>
      {isStatsOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden mb-5 text-right"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl border border-brown-100/60 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 bg-brown-100 rounded-lg flex items-center justify-center text-brown-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="font-bold text-gray-800 text-sm">لوحة إحصائياتي</h3>
              <span className="text-xs text-gray-400 mr-auto">بناءً على بياناتك المحفوظة محلياً</span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'إجمالي الخطابات', value: total, icon: <FileText className="w-5 h-5" />, bgClass: 'bg-brown-50 border-brown-200/60 text-brown-600 dark:border-brown-200 dark:text-brown-500' },
                { label: 'هذا الشهر', value: thisMonth, icon: <Calendar className="w-5 h-5" />, bgClass: 'bg-brown-50 border-brown-200/60 text-brown-600 dark:border-brown-200 dark:text-brown-500' },
                { label: 'مكتملة', value: completed, icon: <Check className="w-5 h-5" />, bgClass: 'bg-brown-50 border-brown-200/60 text-brown-600 dark:border-brown-200 dark:text-brown-500' },
                { label: 'مثبتة', value: pinnedCount, icon: <Pin className="w-5 h-5 -rotate-45" />, bgClass: 'bg-brown-50 border-brown-200/60 text-brown-600 dark:border-brown-200 dark:text-brown-500' },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white rounded-2xl p-4 text-center border border-brown-200/50 shadow-sm flex flex-col items-center justify-between transition-all hover:scale-[1.03] hover:shadow-md hover:border-brown-300">
                  <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center mb-2 border ${kpi.bgClass}`}>
                    {kpi.icon}
                  </div>
                  <div className="text-3xl font-black text-gray-900">{kpi.value}</div>
                  <div className="text-[11px] font-extrabold text-brown-700 mt-1">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Type Distribution Bar Chart */}
            {total > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">توزيع الأنواع</h4>
                <div className="space-y-2">
                  {typeCounts.map(({ type, count }) => (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-600 w-20 shrink-0 text-right">{type}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / maxCount) * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className="h-2 bg-brown-500 rounded-full"
                        />
                      </div>
                      <span className="text-xs font-black text-brown-600 w-6 text-left">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drafts ratio */}
            {total > 0 && (
              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold text-gray-500">نسبة الاكتمال:</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completed / total) * 100}%` }}
                    transition={{ duration: 0.7 }}
                    className="h-2 bg-green-500 rounded-full"
                  />
                </div>
                <span className="font-black text-green-600">{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
              </div>
            )}

            {/* All Tags */}
            {allTags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">الوسوم المستخدمة</h4>
                <div className="flex flex-wrap gap-1.5 justify-start">
                  <button
                    onClick={() => setFilterTag('')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      filterTag === '' ? 'bg-brown-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    type="button"
                  >الكل</button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { setFilterTag(filterTag === tag ? '' : tag); setIsArchiveOpen(true); }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        filterTag === tag ? 'bg-brown-600 text-white' : 'bg-brown-50 text-brown-700 hover:bg-brown-100'
                      }`}
                      type="button"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {total === 0 && (
              <p className="text-center text-xs text-gray-400 py-4">لم تقم بحفظ أي خطابات بعد. ابدأ بإنشاء خطابك الأول!</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatsDashboard;
