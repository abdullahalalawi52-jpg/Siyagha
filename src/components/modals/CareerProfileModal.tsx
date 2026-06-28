import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, User, Mail, Phone, GraduationCap, Briefcase, Award, Sparkles } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

export const CareerProfileModal: React.FC = () => {
  const {
    careerProfile,
    setCareerProfile,
    isCareerProfileModalOpen,
    setIsCareerProfileModalOpen,
    t,
    appLang,
  } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [skills, setSkills] = useState('');

  // Sync state with context when opened
  useEffect(() => {
    if (isCareerProfileModalOpen) {
      setFullName(careerProfile.fullName || '');
      setEmail(careerProfile.email || '');
      setPhone(careerProfile.phone || '');
      setQualification(careerProfile.qualification || '');
      setSpecialization(careerProfile.specialization || '');
      setExperienceYears(careerProfile.experienceYears || '');
      setSkills(careerProfile.skills || '');
    }
  }, [isCareerProfileModalOpen, careerProfile]);

  const handleClose = () => setIsCareerProfileModalOpen(false);

  const modalRef = useModalAccessibility(isCareerProfileModalOpen, handleClose);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCareerProfile({
      fullName,
      email,
      phone,
      qualification,
      specialization,
      experienceYears,
      skills,
    });
    handleClose();
  };

  return (
    <AnimatePresence>
      {isCareerProfileModalOpen && (
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
            aria-labelledby="career-modal-title"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden text-start z-10 border border-gray-100 dark:border-slate-800"
            dir={appLang === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
              <h3 id="career-modal-title" className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brown-600 dark:text-brown-400" />
                {t('الملف المهني للتقديم السريع', 'Quick Career Profile')}
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

            <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-400" />
                    {t('الاسم الكامل', 'Full Name')}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('مثال: عبدالله العلوي', 'e.g. Abdullah Alalawi')}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brown-500/20 focus:border-brown-500 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all text-sm"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {t('البريد الإلكتروني', 'Email Address')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brown-500/20 focus:border-brown-500 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all text-sm"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {t('رقم الهاتف', 'Phone Number')}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966 50 000 0000"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brown-500/20 focus:border-brown-500 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all text-sm"
                  />
                </div>

                {/* Years of Experience */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-gray-400" />
                    {t('سنوات الخبرة', 'Years of Experience')}
                  </label>
                  <input
                    type="text"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder={t('مثال: 5 سنوات', 'e.g. 5 Years')}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brown-500/20 focus:border-brown-500 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all text-sm"
                  />
                </div>

                {/* Qualification */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    {t('المؤهل الدراسي', 'Education / Qualification')}
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder={t('مثال: بكالوريوس', 'e.g. Bachelor')}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brown-500/20 focus:border-brown-500 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all text-sm"
                  />
                </div>

                {/* Specialization */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-gray-400" />
                    {t('التخصص', 'Field of Study / Specialization')}
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder={t('مثال: هندسة البرمجيات', 'e.g. Software Engineering')}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brown-500/20 focus:border-brown-500 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all text-sm"
                  />
                </div>
              </div>

              {/* Key Skills */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-gray-400" />
                  {t('المهارات الأساسية والإنجازات', 'Key Skills & Achievements')}
                </label>
                <textarea
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  rows={4}
                  placeholder={t('مثال: تطوير تطبيقات الويب، React، إدارة المشاريع، قيادة فرق العمل، زيادة المبيعات بنسبة 20%...', 'e.g. Web Development, React, Project Management, Team Leadership, increased sales by 20%...')}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brown-500/20 focus:border-brown-500 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all text-sm resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brown-600 hover:bg-brown-700 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('حفظ التغييرات', 'Save Changes')}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
