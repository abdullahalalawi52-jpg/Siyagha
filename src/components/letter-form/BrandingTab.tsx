import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLetter } from '../../contexts/LetterContext';

export const BrandingTab: React.FC = () => {
  const { t } = useApp();
  const { branding, setBranding, handleImageUpload } = useLetter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="enable-header-checkbox" className="text-sm font-bold text-gray-800 flex items-center gap-2 cursor-pointer">
          {t('تفعيل الترويسة العلوية (Header)', 'Enable Header')}
        </label>
        <input
          id="enable-header-checkbox"
          type="checkbox"
          checked={branding.enableHeader}
          onChange={(e) => setBranding((prev) => ({ ...prev, enableHeader: e.target.checked }))}
          className="w-5 h-5 rounded border-gray-300 text-brown-600 focus:ring-brown-500 transition-colors cursor-pointer"
        />
      </div>

      {branding.enableHeader && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 p-4 border border-gray-100 bg-gray-50/50 rounded-xl overflow-hidden text-start">
          <div className="space-y-1.5">
            <span id="header-theme-label" className="text-xs font-semibold text-gray-500 block">{t('شكل وتصميم الترويسة (Theme)', 'Header Theme')}</span>
            <div role="group" aria-labelledby="header-theme-label" className="grid grid-cols-2 gap-2">
              {[
                { id: 'classic', label: t('كلاسيكي ممركز', 'Classic Centered') },
                { id: 'modern', label: t('حديث منقسم', 'Modern Split') },
                { id: 'creative', label: t('كرت إبداعي', 'Creative Card') },
                { id: 'elegant', label: t('أنيق عصري', 'Elegant Top-Bar') },
              ].map((tTheme) => (
                <button
                  key={tTheme.id}
                  type="button"
                  onClick={() => setBranding((prev) => ({ ...prev, theme: tTheme.id }))}
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
            <label htmlFor="company-name-input" className="text-xs font-semibold text-gray-500 block">{t('اسم الجهة / الشركة', 'Organization / Company Name')}</label>
            <input
              id="company-name-input"
              type="text"
              placeholder={t('مثال: شركة التقنية الحديثة', 'e.g., Modern Technology Company')}
              value={branding.companyName}
              onChange={(e) => setBranding((prev) => ({ ...prev, companyName: e.target.value }))}
              className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="company-details-textarea" className="text-xs font-semibold text-gray-500 block">{t('تفاصيل التواصل والعنوان (سطور متعددة)', 'Contact Details & Address (Multi-line)')}</label>
            <textarea
              id="company-details-textarea"
              rows={3}
              placeholder={t('مثال:&#10;الرياض، المملكة العربية السعودية&#10;هاتف: 920000000&#10;info@company.com', 'e.g.,&#10;London, UK&#10;Phone: +44 20 7946 0958&#10;info@company.com')}
              value={branding.companyDetails}
              onChange={(e) => setBranding((prev) => ({ ...prev, companyDetails: e.target.value }))}
              className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="logo-file-input" className="text-xs font-semibold text-gray-500 block">{t('شعار الجهة (Logo)', 'Organization Logo')}</label>
            <input
              id="logo-file-input"
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
                  onClick={() => setBranding((prev) => ({ ...prev, logoUrl: '' }))}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow cursor-pointer"
                  aria-label={t('حذف الشعار', 'Remove logo')}
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
        <label htmlFor="enable-footer-checkbox" className="text-sm font-bold text-gray-800 flex items-center gap-2 cursor-pointer">
          {t('تفعيل التذييل السفلي (Footer)', 'Enable Footer')}
        </label>
        <input
          id="enable-footer-checkbox"
          type="checkbox"
          checked={branding.enableFooter}
          onChange={(e) => setBranding((prev) => ({ ...prev, enableFooter: e.target.checked }))}
          className="w-5 h-5 rounded border-gray-300 text-brown-600 focus:ring-brown-500 transition-colors cursor-pointer"
        />
      </div>

      {branding.enableFooter && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 p-4 border border-gray-100 bg-gray-50/50 rounded-xl text-start">
          <div className="space-y-1.5">
            <label htmlFor="footer-text-input" className="text-xs font-semibold text-gray-500 block">{t('نص التذييل (الهامش السفلي)', 'Footer Text')}</label>
            <input
              id="footer-text-input"
              type="text"
              placeholder={t('مثال: هذا الخطاب سري وخاص بالجهة المرسل إليها.', 'e.g., This letter is confidential and intended solely for the recipient.')}
              value={branding.footerText}
              onChange={(e) => setBranding((prev) => ({ ...prev, footerText: e.target.value }))}
              className="w-full rounded-xl border-gray-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
            />
          </div>
          <div className="space-y-1.5 mt-3 text-start">
            <span id="footer-theme-label" className="text-xs font-semibold text-gray-500 block">{t('شكل وتصميم التذييل', 'Footer Layout')}</span>
            <div role="group" aria-labelledby="footer-theme-label" className="grid grid-cols-3 gap-2">
              {[
                { id: 'centered', label: t('ممركز', 'Centered') },
                { id: 'split', label: t('منقسم', 'Split') },
                { id: 'minimal', label: t('بسيط', 'Minimal') },
              ].map((fTheme) => (
                <button
                  key={fTheme.id}
                  type="button"
                  onClick={() => setBranding((prev) => ({ ...prev, footerTheme: fTheme.id }))}
                  className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                    (branding.footerTheme || 'centered') === fTheme.id
                      ? 'bg-brown-600 text-white border-brown-600 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brown-300 hover:bg-gray-50'
                  }`}
                >
                  {fTheme.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
