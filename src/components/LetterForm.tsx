import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Star, Loader2, Sparkles, Mic, MicOff, Camera, Bookmark, X, Upload } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { CustomSelect } from './CustomSelect';
import { letterTypes, toneOptions, formalityOptions, getLetterTypeData } from '../data/templates';

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
    t,
  } = useApp();

  return (
    <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-brown-100/60 relative overflow-hidden text-right" dir="rtl">
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
        {activeSection === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <CustomSelect
                id="type-select"
                label="نوع الخطاب"
                value={form.type}
                onChange={(val) => setForm({ ...form, type: val, subType: getLetterTypeData(val).subTypes[0].name })}
                options={Object.keys(letterTypes).map((typeKey) => ({
                  value: typeKey,
                  label: typeKey,
                  icon: getLetterTypeData(typeKey).icon,
                }))}
              />

              <CustomSelect
                id="subtype-select"
                label={
                  <div className="flex items-center justify-between">
                    <span>التصنيف</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(form.type, form.subType);
                      }}
                      className="text-gray-400 hover:text-yellow-500 transition-colors cursor-pointer"
                      title={favoriteTemplates.some((p) => p.type === form.type && p.subType === form.subType) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                    >
                      <Star className={`w-3.5 h-3.5 ${favoriteTemplates.some((p) => p.type === form.type && p.subType === form.subType) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                  </div>
                }
                value={form.subType}
                onChange={(val) => setForm({ ...form, subType: val })}
                options={getLetterTypeData(form.type).subTypes.map((st: any) => ({
                  value: st.name,
                  label: st.name,
                  icon: st.icon,
                }))}
              />
            </div>

            {favoriteTemplates.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-0 mb-4 justify-start">
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 py-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> المفضلة:
                </span>
                {favoriteTemplates.map((fav) => (
                  <button
                    key={`${fav.type}-${fav.subType}`}
                    type="button"
                    onClick={() => setForm({ ...form, type: fav.type, subType: fav.subType })}
                    className="text-[11px] bg-yellow-50/80 text-yellow-800 hover:bg-yellow-100 border border-yellow-200/60 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 font-bold shadow-sm cursor-pointer"
                  >
                    {fav.subType}
                  </button>
                ))}
              </div>
            )}

            <hr className="border-gray-100 my-4 border-dashed" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="letter-date" className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">تاريخ الخطاب</label>
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
                  label="لغة الخطاب (Language)"
                  value={form.language}
                  onChange={(val) => setForm({ ...form, language: val })}
                  options={[
                    { value: 'ar', label: 'العربية (Arabic)' },
                    { value: 'en', label: 'الإنجليزية (English)' },
                  ]}
                />
              </div>
            </div>

            <hr className="border-gray-100 my-4 border-dashed" />

            <div className="space-y-1.5">
              <label htmlFor="sender-name" className="text-sm font-bold text-gray-800 flex items-center gap-2">
                اسم المرسل <span className="text-red-500">*</span>
              </label>
              <input
                id="sender-name"
                type="text"
                placeholder="اسمك أو اسم المؤسسة"
                className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all"
                value={form.senderName}
                onChange={(e) => setForm({ ...form, senderName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-1.5">
                <label htmlFor="recipient-name" className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  اسم الموجه إليه <span className="text-red-500">*</span>
                </label>
                <input
                  id="recipient-name"
                  type="text"
                  placeholder="المؤسسة أو الشخص المتلقي"
                  className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all"
                  value={form.recipientName}
                  onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="recipient-role" className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  صفة الموجه إليه
                </label>
                <input
                  id="recipient-role"
                  type="text"
                  placeholder="مدير الموارد البشرية"
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
                  موضوع الخطاب / عنوانه <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSuggestTitle}
                  disabled={isSuggestingTitle}
                  className="text-xs text-brown-700 hover:text-brown-800 bg-brown-50 hover:bg-brown-100 flex items-center gap-1.5 px-2 py-1 rounded transition-colors disabled:opacity-50 cursor-pointer"
                  title="الذكاء الاصطناعي سيقوم باقتراح عنوان مناسب بناءً على التفاصيل"
                >
                  {isSuggestingTitle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  اقتراح عنوان ذكي
                </button>
              </div>
              <input
                id="letter-subject"
                type="text"
                placeholder="اتركه فارغاً، أو ادخل مثال: طلب الموافقة على رصيد إجازة"
                className="w-full rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>

            <hr className="border-gray-100 my-4 border-dashed" />

            <div className="space-y-2 mt-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">نبرة الخطاب (بنقرة زر)</label>
              <div className="flex flex-wrap gap-2 justify-start">
                {toneOptions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, tone: t })}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      form.tone === t
                        ? 'bg-brown-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200/50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-100 my-4 border-dashed" />

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="space-y-1.5 relative z-10">
                <CustomSelect
                  id="formality-select"
                  label="مستوى الرسمية"
                  value={form.formality}
                  onChange={(val) => setForm({ ...form, formality: val })}
                  options={formalityOptions.map((t) => ({ value: t, label: t }))}
                />
              </div>
            </div>

            <div className="space-y-1.5 mt-4">
              <div className="flex items-center justify-between">
                <label htmlFor="details-textarea" className="text-sm font-bold text-gray-800">الصياغة الذكية: تفاصيل الخطاب / المبررات</label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded transition-all cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-brown-700 hover:text-brown-800 bg-brown-50 hover:bg-brown-100'
                    }`}
                    title={isListening ? 'إيقاف الإدخال الصوتي' : 'إدخال صوتي'}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {isListening ? 'جارٍ الاستماع...' : 'صوت'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOcrOpen(true)}
                    className="text-xs text-brown-700 hover:text-brown-800 bg-brown-50 hover:bg-brown-100 flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer"
                    title="قم بتحميل صورة لخطاب ورقي قديم لاستخراج النص منه بالذكاء الاصطناعي"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    OCR
                  </button>
                </div>
              </div>
              <textarea
                id="details-textarea"
                rows={4}
                placeholder="اكتب الغرض، وبعض نقاط القوة أو المبررات ليقوم الذكاء الاصطناعي بكتابة وتنسيق الخطاب بالكامل لك..."
                className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:border-brown-500 outline-none transition-all resize-none ${
                  isListening ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                }`}
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
              ></textarea>
              {isListening && (
                <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                  يستمع... تحدث الآن
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
          </div>
        )}

        {activeSection === 'branding' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                تفعيل الترويسة العلوية (Header)
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
                  <label className="text-xs font-semibold text-gray-500 block">شكل وتصميم الترويسة (Theme)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'classic', label: 'كلاسيكي' },
                      { id: 'modern', label: 'حديث' },
                      { id: 'creative', label: 'إبداعي' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setBranding((prev: any) => ({ ...prev, theme: t.id }))}
                        className={`py-2 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                          branding.theme === t.id
                            ? 'bg-brown-600 text-white border-brown-600 shadow-md'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-brown-300 hover:bg-gray-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">اسم الجهة / الشركة</label>
                  <input
                    type="text"
                    placeholder="مثال: شركة التقنية الحديثة"
                    value={branding.companyName}
                    onChange={(e) => setBranding((prev: any) => ({ ...prev, companyName: e.target.value }))}
                    className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">تفاصيل التواصل والعنوان (سطور متعددة)</label>
                  <textarea
                    rows={3}
                    placeholder="مثال:&#10;الرياض، المملكة العربية السعودية&#10;هاتف: 920000000&#10;info@company.com"
                    value={branding.companyDetails}
                    onChange={(e) => setBranding((prev: any) => ({ ...prev, companyDetails: e.target.value }))}
                    className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 block">شعار الجهة (Logo)</label>
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
                تفعيل التذييل السفلي (Footer)
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
                  <label className="text-xs font-semibold text-gray-500">نص التذييل (الهامش السفلي)</label>
                  <input
                    type="text"
                    placeholder="مثال: هذا الخطاب سري وخاص بالجهة المرسل إليها."
                    value={branding.footerText}
                    onChange={(e) => setBranding((prev: any) => ({ ...prev, footerText: e.target.value }))}
                    className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                  />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeSection === 'signature' && (
          <div className="space-y-6">
            {/* Signature Upload / Draw */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800 block">التوقيع الرقمي (Signature)</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSigningOpen(true)}
                  className="flex-1 py-2 px-3 border border-brown-200 text-brown-700 bg-brown-50 hover:bg-brown-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PenLine className="w-4 h-4" />
                  ارسم توقيعك
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
                    ارفع صورة التوقيع
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
              <label className="text-sm font-bold text-gray-800 block">شعار الختم الرسمي (Stamp/Seal)</label>
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
                  ارفع صورة الختم الدائري
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
          </div>
        )}
      </form>

      {/* Dynamic Variables Panel */}
      {currentVariables.length > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 bg-brown-50/50 border border-brown-100 rounded-xl p-4">
          <h3 className="text-sm font-bold text-brown-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brown-600" />
            المتغيرات الذكية (املأ الفراغات)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentVariables.map((variable) => (
              <div key={variable} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-brown-700">{variable}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id={`var_${variable}`}
                    placeholder={`أدخل ${variable}`}
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
                    تطبيق
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
              <h4 className="text-sm font-bold text-gray-900">تسمية القالب المخصص</h4>
              <button type="button" onClick={() => setIsSavingTemplate(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="مثال: طلب إجازة خاصة"
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
                حفظ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LetterForm;

