import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Star, Loader2, Sparkles, Mic, MicOff, Camera, Bookmark, X, Upload } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { CustomSelect } from './CustomSelect';
import { letterTypes, toneOptions, formalityOptions, getLetterTypeData, typeTranslations, subTypeTranslations, toneTranslations, formalityTranslations } from '../data/templates';

export const LetterForm: React.FC = () => {
    const {
    form,
    setForm,
    favoriteTemplates,
    toggleFavorite,
    activeSection,
    setActiveSection,
    isSuggestingTitle,
    handleSuggestTitle,
    isListening,
    handleVoiceInput,
    setIsOcrOpen,
    error,
    setIsSavingTemplate,
    branding,
    setBranding,
    handleImageUpload,
    signatureImage,
    setSignatureImage,
    sealImage,
    setSealImage,
    setIsSigningOpen,
    generateLetter,
    currentVariables,
    replaceVariable,
    isSavingTemplate,
    newTemplateName,
    setNewTemplateName,
    handleSaveCustomTemplate,
    autoGenerate,
    setAutoGenerate,
    loading,
    appLang,
    t,
  } = useApp();

  return (
    <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-brown-100/60 relative overflow-hidden text-start" dir={appLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* decorative top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #e86c1a, #f9883a, #e86c1a)' }} />
      <h2 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2.5" style={{ letterSpacing: '-0.01em' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#e86c1a,#c8520d)' }}>
          <PenLine className="w-3.5 h-3.5 text-white" />
        </div>
        {t('التخصيص والتفاصيل', 'Customization & Details')}
      </h2>

      {/* Tab Selector */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setActiveSection('basic')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeSection === 'basic' ? 'bg-white text-brown-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t('بيانات الخطاب', 'Letter Data')}
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('branding')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeSection === 'branding' ? 'bg-white text-brown-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {t('الهوية والترويسة', 'Branding & Header')}
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('signature')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeSection === 'signature' ? 'bg-white text-brown-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
              className="space-y-4"
            >
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
                options={getLetterTypeData(form.type).subTypes.map((st: any) => ({
                  value: st.name,
                  label: t(st.name, subTypeTranslations[st.name] || st.name),
                  icon: st.icon,
                }))}
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

            <hr className="border-gray-100 my-4 border-dashed" />

            <div className="space-y-2 mt-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">{t('نبرة الخطاب (بنقرة زر)', 'Letter Tone')}</label>
              <div className="flex flex-wrap gap-2 justify-start">
                {toneOptions.map((toneVal) => (
                  <button
                    key={toneVal}
                    type="button"
                    onClick={() => setForm({ ...form, tone: toneVal })}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      form.tone === toneVal
                        ? 'bg-brown-600 text-white shadow-sm'
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

            <div className="space-y-1.5 mt-4">
              <div className="flex items-center justify-between">
                <label htmlFor="details-textarea" className="text-sm font-bold text-gray-800">{t('الصياغة الذكية: تفاصيل الخطاب / المبررات', 'Smart Drafting: Letter Details / Reasons')}</label>
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
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mt-6">
                {error}
              </motion.div>
            )}

            <div className="mt-6 space-y-4">
              {/* Auto generate toggle */}
              <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
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
                disabled={loading || !form.senderName || !form.recipientName || !form.subject}
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
            </motion.div>
          )}

          {activeSection === 'branding' && (
            <motion.div
              key="branding"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                {t('تفعيل الترويسة العلوية (Header)', 'Enable Header')}
              </label>
              <input
                type="checkbox"
                checked={branding.enableHeader}
                onChange={(e) => setBranding((prev: any) => ({ ...prev, enableHeader: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-300 text-brown-600 focus:ring-brown-500 transition-colors"
              />
            </div>

            {branding.enableHeader && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 p-4 border border-gray-100 bg-gray-50/50 rounded-xl overflow-hidden">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 block">{t('شكل وتصميم الترويسة (Theme)', 'Header Theme')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'classic', label: t('كلاسيكي', 'Classic') },
                      { id: 'modern', label: t('حديث', 'Modern') },
                      { id: 'creative', label: t('إبداعي', 'Creative') },
                    ].map((tTheme) => (
                      <button
                        key={tTheme.id}
                        type="button"
                        onClick={() => setBranding((prev: any) => ({ ...prev, theme: tTheme.id }))}
                        className={`py-2 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                          branding.theme === tTheme.id
                            ? 'bg-brown-600 text-white border-brown-600 shadow-md'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-brown-300 hover:bg-gray-50'
                        }`}
                      >
                        {tTheme.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">{t('اسم الجهة / الشركة', 'Organization / Company Name')}</label>
                  <input
                    type="text"
                    placeholder={t('مثال: شركة التقنية الحديثة', 'e.g., Modern Technology Company')}
                    value={branding.companyName}
                    onChange={(e) => setBranding((prev: any) => ({ ...prev, companyName: e.target.value }))}
                    className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">{t('تفاصيل التواصل والعنوان (سطور متعددة)', 'Contact Details & Address (Multi-line)')}</label>
                  <textarea
                    rows={3}
                    placeholder={t('مثال:&#10;الرياض، المملكة العربية السعودية&#10;هاتف: 920000000&#10;info@company.com', 'e.g.,&#10;London, UK&#10;Phone: +44 20 7946 0958&#10;info@company.com')}
                    value={branding.companyDetails}
                    onChange={(e) => setBranding((prev: any) => ({ ...prev, companyDetails: e.target.value }))}
                    className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 block">{t('شعار الجهة (Logo)', 'Organization Logo')}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-brown-50 file:text-brown-700 hover:file:bg-brown-100 cursor-pointer"
                  />
                  {branding.logoUrl && (
                    <div className="relative mt-2 inline-block">
                      <img src={branding.logoUrl} alt="Logo preview" className="max-h-16 rounded border border-gray-200 bg-white" />
                      <button
                        type="button"
                        onClick={() => setBranding((prev: any) => ({ ...prev, logoUrl: '' }))}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <hr className="border-gray-100 my-4 border-dashed" />

            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                {t('تفعيل التذييل السفلي (Footer)', 'Enable Footer')}
              </label>
              <input
                type="checkbox"
                checked={branding.enableFooter}
                onChange={(e) => setBranding((prev: any) => ({ ...prev, enableFooter: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-300 text-brown-600 focus:ring-brown-500 transition-colors"
              />
            </div>

            {branding.enableFooter && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 p-4 border border-gray-100 bg-gray-50/50 rounded-xl">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">{t('نص التذييل (الهامش السفلي)', 'Footer Text')}</label>
                  <input
                    type="text"
                    placeholder={t('مثال: هذا الخطاب سري وخاص بالجهة المرسل إليها.', 'e.g., This letter is confidential and intended solely for the recipient.')}
                    value={branding.footerText}
                    onChange={(e) => setBranding((prev: any) => ({ ...prev, footerText: e.target.value }))}
                    className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                  />
                </div>
              </motion.div>
            )}
            </motion.div>
          )}

          {activeSection === 'signature' && (
            <motion.div
              key="signature"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
            {/* Signature Upload / Draw */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800 block">{t('التوقيع الرقمي (Signature)', 'Digital Signature')}</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSigningOpen(true)}
                  className="flex-1 py-2 px-3 border border-brown-200 text-brown-700 bg-brown-50 hover:bg-brown-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PenLine className="w-4 h-4" />
                  {t('ارسم توقيعك', 'Draw Signature')}
                </button>
                <div className="flex-1 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'signature')}
                    className="hidden"
                    id="sig-file-upload"
                  />
                  <label
                    htmlFor="sig-file-upload"
                    className="w-full py-2 px-3 border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Upload className="w-4 h-4" />
                    {t('ارفع صورة التوقيع', 'Upload Signature Image')}
                  </label>
                </div>
              </div>

              {signatureImage && (
                <div className="relative mt-2 inline-block border border-gray-200 rounded p-2 bg-white">
                  <img src={signatureImage} alt="Signature preview" className="max-h-16 max-w-[120px] object-contain" />
                  <button
                    type="button"
                    onClick={() => setSignatureImage(null)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <hr className="border-gray-100 my-4 border-dashed" />

            {/* Seal/Stamp Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800 block">{t('شعار الختم الرسمي (Stamp/Seal)', 'Official Stamp/Seal')}</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'seal')}
                  className="hidden"
                  id="seal-file-upload"
                />
                <label
                  htmlFor="seal-file-upload"
                  className="w-full py-2.5 px-3 border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <Upload className="w-4 h-4" />
                  {t('ارفع صورة الختم الدائري', 'Upload Seal Image')}
                </label>
              </div>

              {sealImage && (
                <div className="relative mt-2 inline-block border border-gray-200 rounded p-2 bg-white">
                  <img src={sealImage} alt="Seal preview" className="max-h-16 max-w-[100px] object-contain" />
                  <button
                    type="button"
                    onClick={() => setSealImage(null)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
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
            className="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-lg absolute bottom-12 left-6 right-6 z-20"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-900">{t('تسمية القالب المخصص', 'Name Custom Template')}</h4>
              <button type="button" onClick={() => setIsSavingTemplate(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('مثال: طلب إجازة خاصة', 'e.g., Special Leave Request')}
                className="flex-1 rounded-lg border-gray-200 border px-3 py-2 text-sm outline-none focus:border-brown-500"
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

