import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Loader2, Sparkles, Mic, MicOff, Camera, Bookmark } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { CustomSelect } from '../CustomSelect';
import { letterTypes, toneOptions, formalityOptions, getLetterTypeData, typeTranslations, subTypeTranslations, toneTranslations, formalityTranslations } from '../../data/templates';
import { checkSpelling, applySpellingFix, SpellingIssue } from '../../utils/spellingLinter';

export const BasicInfoTab: React.FC = () => {
  const {
    form,
    setForm,
    favoriteTemplates,
    toggleFavorite,
    isSuggestingTitle,
    handleSuggestTitle,
    isListening,
    handleVoiceInput,
    setIsOcrOpen,
    error,
    setIsSavingTemplate,
    generateLetter,
    autoGenerate,
    setAutoGenerate,
    loading,
    t,
    setIsBrandVoiceModalOpen,
    setIsCareerProfileModalOpen,
    careerProfile,
    setOcrTargetField,
    brandVoiceProfiles,
  } = useApp();

  const [spellingIssues, setSpellingIssues] = useState<SpellingIssue[]>([]);

  useEffect(() => {
    if (form.language === 'ar') {
      const issues = checkSpelling(form.details || '');
      setSpellingIssues(issues);
    } else {
      setSpellingIssues([]);
    }
  }, [form.details, form.language]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <CustomSelect
          id="type-select"
          label={t('نوع الخطاب', 'Letter Type')}
          value={form.type}
          onChange={(val) => setForm({ ...form, type: val, subType: getLetterTypeData(val).subTypes[0].name })}
          options={Object.keys(letterTypes).map((typeKey) => ({
            value: typeKey,
            label: t(typeKey, typeTranslations[typeKey] || typeKey),
            icon: getLetterTypeData(typeKey).icon,
          }))}
        />

        <CustomSelect
          id="subtype-select"
          label={
            <div className="flex items-center justify-between">
              <span>{t('التصنيف', 'Category')}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(form.type, form.subType);
                }}
                className="text-gray-400 hover:text-yellow-500 transition-colors cursor-pointer"
                title={favoriteTemplates.some((p) => p.type === form.type && p.subType === form.subType) ? t('إزالة من المفضلة', 'Remove from Favorites') : t('إضافة للمفضلة', 'Add to Favorites')}
              >
                <Star className={`w-3.5 h-3.5 ${favoriteTemplates.some((p) => p.type === form.type && p.subType === form.subType) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </button>
            </div>
          }
          value={form.subType}
          onChange={(val) => setForm({ ...form, subType: val })}
          options={getLetterTypeData(form.type).subTypes.map((st) => ({
            value: st.name,
            label: t(st.name, subTypeTranslations[st.name] || st.name),
            icon: st.icon,
          }))}
        />
      </div>

      {/* Custom Brand Voice Dropdown */}
      <div className="space-y-1.5 mt-2 bg-gray-50/50 border border-gray-100 p-3 rounded-xl">
        <div className="flex items-center justify-between">
          <label htmlFor="brand-voice-select" className="text-xs font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer">
            <Sparkles className="w-3.5 h-3.5 text-brown-600 animate-pulse" />
            {t('بصمة الأسلوب اللغوي الخاص', 'Custom Brand Voice')}
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsCareerProfileModalOpen(true)}
              className="text-[10px] text-brown-700 hover:text-brown-850 bg-brown-100/40 hover:bg-brown-100/80 px-2 py-0.5 rounded transition-colors font-bold cursor-pointer"
            >
              {t('الملف المهني 💼', 'Career Profile 💼')}
            </button>
            <button
              type="button"
              onClick={() => setIsBrandVoiceModalOpen(true)}
              className="text-[10px] text-brown-750 hover:text-brown-850 bg-brown-100/40 hover:bg-brown-100/80 px-2 py-0.5 rounded transition-colors font-bold cursor-pointer"
            >
              {t('إدارة البصمات ⚙️', 'Manage Voices ⚙️')}
            </button>
          </div>
        </div>
        <CustomSelect
          id="brand-voice-select"
          value={form.brandVoiceName}
          onChange={(val) => {
            const selected = brandVoiceProfiles.find((p) => p.name === val);
            setForm((prev) => ({
              ...prev,
              brandVoiceName: val,
              brandVoiceProfile: selected ? selected.profile : '',
            }));
          }}
          options={[
            { value: '', label: t('توليد تلقائي افتراضي (Default)', 'Default Style') },
            ...brandVoiceProfiles.map((p) => ({
              value: p.name,
              label: p.name,
            }))
          ]}
        />
      </div>

      {/* Smart Auto-Reply Mode Toggle */}
      <div className="flex items-center justify-between text-xs text-gray-550 bg-brown-50/20 p-3 rounded-xl border border-brown-100/30 animate-all">
        <label htmlFor="reply-mode-checkbox" className="font-bold text-gray-755 cursor-pointer">
          {t('تفعيل وضع الرد الذكي على خطاب وارد', 'Enable Reply to Incoming Letter')}
        </label>
        <input
          id="reply-mode-checkbox"
          type="checkbox"
          checked={form.isReplyMode}
          onChange={(e) => {
            const val = e.target.checked;
            setForm((prev) => ({
              ...prev,
              isReplyMode: val,
              subject: val ? (prev.subject || t('رد رسمي', 'Official Reply')) : prev.subject,
            }));
          }}
          className="w-4.5 h-4.5 rounded border-gray-300 text-brown-600 focus:ring-brown-500 cursor-pointer"
        />
      </div>

      {favoriteTemplates.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-0 mb-4 justify-start">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 py-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {t('المفضلة:', 'Favorites:')}
          </span>
          {favoriteTemplates.map((fav) => (
            <button
              key={`${fav.type}-${fav.subType}`}
              type="button"
              onClick={() => setForm({ ...form, type: fav.type, subType: fav.subType })}
              className="text-[11px] bg-yellow-50/80 text-yellow-800 hover:bg-yellow-100 border border-yellow-200/60 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 font-bold shadow-sm cursor-pointer"
            >
              {t(fav.subType, subTypeTranslations[fav.subType] || fav.subType)}
            </button>
          ))}
        </div>
      )}

      <hr className="border-gray-100 my-4 border-dashed" />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="letter-date" className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">{t('تاريخ الخطاب', 'Letter Date')}</label>
          <input
            id="letter-date"
            type="date"
            className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all bg-white font-medium text-gray-700"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div className="space-y-1.5 relative z-10">
          <CustomSelect
            id="language-select"
            label={t('لغة الخطاب (Language)', 'Letter Language')}
            value={form.language}
            onChange={(val) => setForm({ ...form, language: val })}
            options={[
              { value: 'ar', label: t('العربية (Arabic)', 'Arabic (العربية)') },
              { value: 'en', label: t('الإنجليزية (English)', 'English (الإنجليزية)') },
            ]}
          />
        </div>
      </div>

      <hr className="border-gray-100 my-4 border-dashed" />

      <div className="space-y-1.5">
        <label htmlFor="sender-name" className="text-sm font-bold text-gray-800 flex items-center gap-2">
          {t('اسم المرسل', 'Sender Name')} <span className="text-red-500">*</span>
        </label>
        <input
          id="sender-name"
          type="text"
          placeholder={t('اسمك أو اسم المؤسسة', 'Your name or organization')}
          className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all"
          value={form.senderName}
          onChange={(e) => setForm({ ...form, senderName: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-1.5">
          <label htmlFor="sender-phone" className="text-sm font-bold text-gray-800 flex items-center gap-2">
            {t('رقم الهاتف', 'Phone Number')}
          </label>
          <input
            id="sender-phone"
            type="tel"
            placeholder={t('مثال: 0501234567', 'e.g., 0501234567')}
            className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all text-start"
            dir="ltr"
            value={form.senderPhone || ''}
            onChange={(e) => setForm({ ...form, senderPhone: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="sender-email" className="text-sm font-bold text-gray-800 flex items-center gap-2">
            {t('البريد الإلكتروني', 'Email Address')}
          </label>
          <input
            id="sender-email"
            type="email"
            placeholder="name@example.com"
            className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all text-start"
            dir="ltr"
            value={form.senderEmail || ''}
            onChange={(e) => setForm({ ...form, senderEmail: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-1.5">
          <label htmlFor="recipient-name" className="text-sm font-bold text-gray-800 flex items-center gap-2">
            {t('اسم الموجه إليه', 'Recipient Name')} <span className="text-red-500">*</span>
          </label>
          <input
            id="recipient-name"
            type="text"
            placeholder={t('المؤسسة أو الشخص المتلقي', 'Recipient person or organization')}
            className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all"
            value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="recipient-role" className="text-sm font-bold text-gray-800 flex items-center gap-2">
            {t('صفة الموجه إليه', 'Recipient Role/Title')}
          </label>
          <input
            id="recipient-role"
            type="text"
            placeholder={t('مدير الموارد البشرية', 'e.g., HR Manager')}
            className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all"
            value={form.recipientRole}
            onChange={(e) => setForm({ ...form, recipientRole: e.target.value })}
          />
        </div>
      </div>

      {!form.isReplyMode && (
        <>
          <hr className="border-gray-100 my-4 border-dashed" />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="letter-subject" className="text-sm font-bold text-gray-800 flex items-center gap-2">
                {t('موضوع الخطاب / عنوانه', 'Letter Subject / Title')} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleSuggestTitle}
                disabled={isSuggestingTitle}
                className="text-xs text-brown-700 hover:text-brown-800 bg-brown-50 hover:bg-brown-100 flex items-center gap-1.5 px-2 py-1 rounded transition-colors disabled:opacity-50 cursor-pointer"
                title={t('الذكاء الاصطناعي سيقوم باقتراح عنوان مناسب بناءً على التفاصيل', 'AI will suggest a suitable title based on details')}
              >
                {isSuggestingTitle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {t('اقتراح عنوان ذكي', 'Suggest Smart Title')}
              </button>
            </div>
            <input
              id="letter-subject"
              type="text"
              placeholder={t('اتركه فارغاً، أو ادخل مثال: طلب الموافقة على رصيد إجازة', 'Leave blank, or enter e.g., Request for annual leave approval')}
              className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>
        </>
      )}

      <hr className="border-gray-100 my-4 border-dashed" />

      <div className="space-y-2 mt-4">
        <span id="tone-label" className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">{t('نبرة الخطاب (بنقرة زر)', 'Letter Tone')}</span>
        <div role="group" aria-labelledby="tone-label" className="flex flex-wrap gap-2 justify-start">
          {toneOptions.map((toneVal) => (
            <button
              key={toneVal}
              type="button"
              onClick={() => setForm({ ...form, tone: toneVal })}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                form.tone === toneVal
                  ? 'bg-brown-600 text-white shadow-sm tone-pill-active'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200/50'
              }`}
            >
              {t(toneVal, toneTranslations[toneVal] || toneVal)}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-gray-100 my-4 border-dashed" />

      <div className="grid grid-cols-1 gap-4 mt-4">
        <div className="space-y-1.5 relative z-10">
          <CustomSelect
            id="formality-select"
            label={t('مستوى الرسمية', 'Formality Level')}
            value={form.formality}
            onChange={(val) => setForm({ ...form, formality: val })}
            options={formalityOptions.map((formalityVal) => ({ value: formalityVal, label: t(formalityVal, formalityTranslations[formalityVal] || formalityVal) }))}
          />
        </div>
      </div>

      {form.isReplyMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 bg-brown-50/20 border border-brown-100/50 p-4 rounded-xl mt-4 text-start"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="incoming-letter-textarea" className="text-xs font-bold text-gray-750">
                {t('نص الخطاب الوارد', 'Incoming Letter Text')} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setOcrTargetField('replyToText');
                  setIsOcrOpen(true);
                }}
                className="text-[10px] text-brown-750 hover:text-brown-850 bg-brown-100/40 hover:bg-brown-100/80 flex items-center gap-1 px-2 py-0.5 rounded transition-colors font-bold cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                {t('استخراج بـ OCR', 'Extract via OCR')}
              </button>
            </div>
            <textarea
              id="incoming-letter-textarea"
              rows={4}
              placeholder={t('قم بلصق الخطاب الوارد الذي تريد الرد عليه، أو استخرجه من صورة بالـ OCR بالضغط على الزر بالأعلى...', 'Paste the incoming letter you wish to reply to, or extract it from an image using OCR...')}
              className="w-full rounded-xl border border-gray-250 p-2.5 text-xs focus:ring-2 focus:ring-brown-500 outline-none resize-none leading-relaxed bg-white text-gray-800"
              value={form.replyToText}
              onChange={(e) => setForm({ ...form, replyToText: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <span id="stance-label" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              {t('موقف الرد المطلوب', 'Reply Stance')}
            </span>
            <div role="group" aria-labelledby="stance-label" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'approval', label: t('موافقة وقبول', 'Accept / Approve') },
                { id: 'rejection', label: t('رفض واعتذار', 'Reject / Decline') },
                { id: 'more_info', label: t('طلب تفاصيل', 'Request Details') },
                { id: 'thanks', label: t('شكر وتقدير', 'Thanks / Appreciation') },
                { id: 'clarification', label: t('توضيح واستفسار', 'Clarification') },
              ].map((stance) => (
                <button
                  key={stance.id}
                  type="button"
                  onClick={() => setForm({ ...form, replyStance: stance.id })}
                  className={`py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                    form.replyStance === stance.id
                      ? 'bg-brown-600 text-white border-brown-600 shadow-sm'
                      : 'bg-white text-gray-655 border-gray-200 hover:border-brown-300 hover:bg-gray-50'
                  }`}
                >
                  {stance.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {form.type === 'توظيف وتطوير مهني' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 bg-brown-50/10 border border-brown-100/20 p-4 rounded-xl mt-4 text-start"
        >
          {/* Job Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="job-desc-textarea" className="text-xs font-bold text-gray-755 dark:text-gray-300">
                {t('الوصف الوظيفي للوظيفة المستهدفة', 'Target Job Description')}
              </label>
              <button
                type="button"
                onClick={() => {
                  setOcrTargetField('jobDescription');
                  setIsOcrOpen(true);
                }}
                className="text-[10px] text-brown-750 hover:text-brown-850 bg-brown-100/40 hover:bg-brown-100/80 flex items-center gap-1 px-2 py-0.5 rounded transition-colors font-bold cursor-pointer"
              >
                <Camera className="w-3 h-3" />
                {t('استخراج بـ OCR', 'Extract via OCR')}
              </button>
            </div>
            <textarea
              id="job-desc-textarea"
              rows={3}
              placeholder={t('قم بلصق متمتطلبات الوظيفة أو الوصف الوظيفي هنا ليتطابق الخطاب معها...', 'Paste job requirements or Job Description here...')}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:ring-2 focus:ring-brown-500 outline-none resize-none leading-relaxed bg-white dark:bg-slate-850 dark:text-white dark:border-slate-700 text-gray-800"
              value={form.jobDescription || ''}
              onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
            />
          </div>

          {/* Resume Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="resume-info-textarea" className="text-xs font-bold text-gray-755 dark:text-gray-300">
                {t('نبذة عن سيرتك الذاتية وخبراتك', 'Your Resume Info / Career Bio')}
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      resumeInfo: `${careerProfile.fullName ? `الاسم: ${careerProfile.fullName}\n` : ''}${careerProfile.qualification ? `المؤهل: ${careerProfile.qualification} (${careerProfile.specialization || ''})\n` : ''}${careerProfile.experienceYears ? `الخبرة: ${careerProfile.experienceYears}\n` : ''}${careerProfile.skills ? `المهارات والإنجازات: ${careerProfile.skills}` : ''}`,
                      senderName: prev.senderName || careerProfile.fullName || '',
                      senderEmail: prev.senderEmail || careerProfile.email || '',
                      senderPhone: prev.senderPhone || careerProfile.phone || '',
                    }));
                  }}
                  className="text-[10px] text-brown-750 hover:text-brown-850 bg-brown-100/40 hover:bg-brown-100/80 flex items-center gap-1 px-2 py-0.5 rounded transition-colors font-bold cursor-pointer"
                  title={t('تعبئة تلقائية من بيانات ملفك المهني المحفوظ', 'Autofill from your career profile')}
                >
                  {t('تعبئة من ملفي المهني 📝', 'Autofill from Profile 📝')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOcrTargetField('resumeInfo');
                    setIsOcrOpen(true);
                  }}
                  className="text-[10px] text-brown-750 hover:text-brown-850 bg-brown-100/40 hover:bg-brown-100/80 flex items-center gap-1 px-2 py-0.5 rounded transition-colors font-bold cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>
            </div>
            <textarea
              id="resume-info-textarea"
              rows={3}
              placeholder={t('اكتب مهاراتك وخبراتك الرئيسية أو انقر على تعبئة لإدراجها تلقائياً...', 'Write your key skills and experience or autofill them...')}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:ring-2 focus:ring-brown-500 outline-none resize-none leading-relaxed bg-white dark:bg-slate-855 dark:text-white dark:border-slate-700 text-gray-800"
              value={form.resumeInfo || ''}
              onChange={(e) => setForm({ ...form, resumeInfo: e.target.value })}
            />
          </div>
        </motion.div>
      )}

      <div className="space-y-1.5 mt-4">
        <div className="flex items-center justify-between">
          <label htmlFor="details-textarea" className="text-sm font-bold text-gray-800">
            {form.isReplyMode 
              ? t('ملاحظات وتفاصيل إضافية للرد', 'Additional Details / Notes for Reply') 
              : t('الصياغة الذكية: تفاصيل الخطاب / المبررات', 'Smart Drafting: Letter Details / Reasons')}
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-brown-700 hover:text-brown-800 bg-brown-50 hover:bg-brown-100'
              }`}
              title={isListening ? t('إيقاف الإدخال الصوتي', 'Stop Voice Input') : t('إدخال صوتي', 'Voice Input')}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {isListening ? t('جارٍ الاستماع...', 'Listening...') : t('صوت', 'Voice')}
            </button>
            <button
              type="button"
              onClick={() => setIsOcrOpen(true)}
              className="text-xs text-brown-700 hover:text-brown-800 bg-brown-50 hover:bg-brown-100 flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer"
              title={t('قم بتحميل صورة لخطاب ورقي قديم لاستخراج النص منه بالذكاء الاصطناعي', 'Upload an image of an old paper letter to extract its text using AI')}
            >
              <Camera className="w-3.5 h-3.5" />
              OCR
            </button>
          </div>
        </div>
        <textarea
          id="details-textarea"
          rows={4}
          placeholder={t('اكتب الغرض، وبعض نقاط القوة أو المبررات ليقوم الذكاء الاصطناعي بكتابة وتنسيق الخطاب بالكامل لك...', 'Write the purpose, key points, or reasons, and the AI will draft and format the entire letter for you...')}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all resize-none ${
            isListening ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
          }`}
          value={form.details}
          onChange={(e) => setForm({ ...form, details: e.target.value })}
        ></textarea>
        {isListening && (
          <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            {t('يستمع... تحدث الآن', 'Listening... speak now')}
          </p>
        )}

        {/* Spelling Linter Suggestions */}
        {spellingIssues.length > 0 && (
          <div className="mt-2.5 space-y-2 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 p-3.5 rounded-xl text-xs">
            <p className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-3 bg-amber-500 rounded-full"></span>
              {t('تنبيهات إملائية مقترحة:', 'Suggested spelling warnings:')}
            </p>
            <div className="flex flex-col gap-2">
              {spellingIssues.slice(0, 3).map((issue) => (
                <div key={issue.id} className="flex items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/40 p-2 rounded-lg border border-amber-100/50 dark:border-amber-950/30">
                  <div className="min-w-0">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">
                      {t('الكلمة:', 'Word:')}{' '}
                      <span className="line-through text-red-500 font-bold px-1">{issue.word}</span>
                      {' '}←{' '}
                      <span className="text-green-600 dark:text-green-400 font-black px-1 text-sm">{issue.suggestion}</span>
                    </span>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">{t(issue.reasonAr, issue.reasonEn)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const fixedText = applySpellingFix(form.details || '', issue);
                      setForm((prev) => ({ ...prev, details: fixedText }));
                    }}
                    className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer text-[10px]"
                  >
                    {t('تطبيق التعديل ✨', 'Apply Fix ✨')}
                  </button>
                </div>
              ))}
              {spellingIssues.length > 3 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-550 font-medium text-start">
                  {t(`+ هناك ${spellingIssues.length - 3} تنبيهات إملائية أخرى في النص...`, `+ There are ${spellingIssues.length - 3} other spelling warnings...`)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mt-6">
          {error}
        </motion.div>
      )}

      <div className="mt-6 space-y-4">
        {/* Auto generate toggle */}
        <div className="flex items-center justify-between text-xs text-gray-550 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
          <label htmlFor="auto-generate-checkbox" className="font-semibold cursor-pointer">
            {t('توليد الخطاب تلقائياً أثناء الكتابة', 'Auto-generate letter while typing')}
          </label>
          <input
            id="auto-generate-checkbox"
            type="checkbox"
            checked={autoGenerate}
            onChange={(e) => setAutoGenerate(e.target.checked)}
            className="w-4.5 h-4.5 rounded border-gray-300 text-brown-600 focus:ring-brown-500 cursor-pointer"
          />
        </div>

        {/* Generate button */}
        <button
          type="submit"
          disabled={loading || !form.senderName || !form.recipientName || (!form.isReplyMode && !form.subject) || (form.isReplyMode && !form.replyToText)}
          className="w-full py-3 bg-brown-600 hover:bg-brown-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('جاري صياغة الخطاب بالذكاء الاصطناعي...', 'Drafting letter with AI...')}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t('صياغة الخطاب بالذكاء الاصطناعي', 'Draft Letter with AI')}</span>
            </>
          )}
        </button>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsSavingTemplate(true)}
            className="text-xs font-bold text-gray-600 hover:text-brown-600 flex items-center gap-1.5 transition-colors border border-gray-200 hover:border-brown-200 px-3 py-1.5 rounded-lg bg-white shadow-sm cursor-pointer"
          >
            <Bookmark className="w-4 h-4" />
            {t('حفظ كقالب مخصص', 'Save as Custom Template')}
          </button>
        </div>
      </div>
    </div>
  );
};
