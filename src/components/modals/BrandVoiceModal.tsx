import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Loader2, Trash2, Check, PenTool } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

export const BrandVoiceModal: React.FC = () => {
  const {
    isBrandVoiceModalOpen,
    setIsBrandVoiceModalOpen,
    brandVoiceProfiles,
    saveBrandVoiceProfile,
    deleteBrandVoiceProfile,
    form,
    setForm,
    appLang,
    t,
  } = useApp();

  const handleClose = () => setIsBrandVoiceModalOpen(false);
  const modalRef = useModalAccessibility(isBrandVoiceModalOpen, handleClose);

  // Form states for creating a new profile
  const [profileName, setProfileName] = useState('');
  const [sample1, setSample1] = useState('');
  const [sample2, setSample2] = useState('');
  const [sample3, setSample3] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getApiUrl = (path: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}${path}`;
  };

  const handleAnalyzeStyle = async () => {
    if (!profileName.trim()) {
      setError(t('يرجى إدخال اسم البصمة', 'Please enter a profile name'));
      return;
    }
    if (!sample1.trim() || !sample2.trim()) {
      setError(t('يرجى إدخال نموذجين على الأقل للتحليل', 'Please enter at least two sample letters for analysis'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      const samples = [sample1, sample2];
      if (sample3.trim()) samples.push(sample3);

      const res = await fetch(getApiUrl('/api/analyze-style'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ samples }),
      });

      if (!res.ok) {
        throw new Error(t('فشل تحليل الأسلوب اللغوي', 'Failed to analyze style profile'));
      }

      const data = await res.json();
      if (data.styleProfile) {
        saveBrandVoiceProfile(profileName.trim(), data.styleProfile);
        // Clear form
        setProfileName('');
        setSample1('');
        setSample2('');
        setSample3('');
        // Select it immediately
        setForm((prev) => ({
          ...prev,
          brandVoiceName: profileName.trim(),
          brandVoiceProfile: data.styleProfile,
        }));
      } else {
        throw new Error(t('لم يرجع الخادم أي نتيجة صالحة للتحليل', 'Server returned empty style profile'));
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || t('حدث خطأ أثناء الاتصال بالخادم', 'An error occurred while calling the server'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isBrandVoiceModalOpen && (
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
            aria-labelledby="brand-voice-modal-title"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-2xl premium-card rounded-2xl shadow-2xl overflow-hidden text-start z-10 max-h-[85vh] flex flex-col"
            dir={appLang === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 id="brand-voice-modal-title" className="text-lg font-black text-gray-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brown-50 text-brown-600">
                  <PenTool className="w-4 h-4" />
                </div>
                {t('بصمة الأسلوب اللغوي الخاص', 'Custom Brand Voice')}
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

            {/* Content (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed">
                {t(
                  'قم برفع أو كتابة خطاباتك الإدارية السابقة ليتعلم منها الذكاء الاصطناعي ويحاكي أسلوبك الفريد بدقة في المراسلات المستقبلية.',
                  'Upload or write your past official letters so AI can learn and mimic your unique style in future drafts.'
                )}
              </p>

              {/* Saved Profiles */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  {t('البصمات اللغوية المحفوظة', 'Saved Style Profiles')}
                </h4>
                {brandVoiceProfiles.length === 0 ? (
                  <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400 bg-gray-50/50">
                    {t('لا يوجد بصمات محفوظة بعد. أنشئ بصمتك الأولى بالأسفل.', 'No saved profiles yet. Create your first profile below.')}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {brandVoiceProfiles.map((p) => {
                      const isActive = form.brandVoiceName === p.name;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              brandVoiceName: isActive ? '' : p.name,
                              brandVoiceProfile: isActive ? '' : p.profile,
                            }));
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative group ${
                            isActive
                              ? 'bg-brown-50/50 border-brown-500 shadow-sm'
                              : 'bg-white border-gray-200 hover:border-brown-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                              {p.name}
                              {isActive && <Check className="w-3.5 h-3.5 text-brown-600" />}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBrandVoiceProfile(p.id);
                              }}
                              className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer md:opacity-0 group-hover:opacity-100"
                              title={t('حذف البصمة', 'Delete profile')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                            {p.profile}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* Create New Profile Form */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {t('إنشاء بصمة أسلوب جديدة', 'Create New Style Profile')}
                </h4>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-750">{t('اسم البصمة', 'Profile Name')}</label>
                  <input
                    type="text"
                    placeholder={t('مثال: الأسلوب الرسمي، أسلوب الشؤون القانونية', 'e.g., Legal Department Style, Friendly tone')}
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:ring-2 focus:ring-brown-505 outline-none focus:border-brown-500"
                    disabled={loading}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-750 flex items-center justify-between">
                      <span>{t('النموذج الأول', 'Sample Letter 1')}</span>
                      <span className="text-[10px] text-red-500">{t('إجباري *', 'Required *')}</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder={t('الصق نص خطابك السابق هنا...', 'Paste your previous letter text here...')}
                      value={sample1}
                      onChange={(e) => setSample1(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:ring-2 focus:ring-brown-500 outline-none resize-none leading-relaxed"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-750 flex items-center justify-between">
                      <span>{t('النموذج الثاني', 'Sample Letter 2')}</span>
                      <span className="text-[10px] text-red-500">{t('إجباري *', 'Required *')}</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder={t('الصق نص خطابك السابق هنا...', 'Paste your previous letter text here...')}
                      value={sample2}
                      onChange={(e) => setSample2(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:ring-2 focus:ring-brown-500 outline-none resize-none leading-relaxed"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-750 flex items-center justify-between">
                    <span>{t('النموذج الثالث', 'Sample Letter 3')}</span>
                    <span className="text-[10px] text-gray-400">{t('اختياري', 'Optional')}</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder={t('الصق نص خطاب إضافي لزيادة دقة التحليل (اختياري)...', 'Paste an optional additional letter for better precision...')}
                    value={sample3}
                    onChange={(e) => setSample3(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:ring-2 focus:ring-brown-500 outline-none resize-none leading-relaxed"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="text-xs font-bold text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-lg transition-colors border border-gray-200 disabled:opacity-50 cursor-pointer"
              >
                {t('إلغاء', 'Cancel')}
              </button>

              <button
                type="button"
                onClick={handleAnalyzeStyle}
                disabled={loading}
                className="text-xs font-bold text-white bg-brown-600 hover:bg-brown-700 px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('جاري استخلاص البصمة...', 'Analyzing style...')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('تحليل الأسلوب بالذكاء الاصطناعي', 'Analyze Style with AI')}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BrandVoiceModal;
