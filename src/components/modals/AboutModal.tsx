import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X, HelpCircle, Sparkles, Languages, Save, Key, FileSignature, FileText } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

export const AboutModal: React.FC = () => {
  const {
    isAboutOpen,
    setIsAboutOpen,
    appLang,
    t,
  } = useApp();

  const handleClose = () => setIsAboutOpen(false);

  const modalRef = useModalAccessibility(isAboutOpen, handleClose);

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      titleAr: "صياغة وتعديل بالذكاء الاصطناعي",
      titleEn: "AI Generation & Refinement",
      descAr: "إنشاء خطابات كاملة بناءً على معطيات بسيطة، وتحسين الصياغة، وضبط نبرة الخطاب ليكون رسمياً وبليغاً.",
      descEn: "Generate complete letters from simple inputs, improve style, and adjust the tone to be formal and elegant."
    },
    {
      icon: <FileSignature className="w-5 h-5 text-emerald-500" />,
      titleAr: "التواقيع والأختام الرقمية",
      titleEn: "Digital Signatures & Seals",
      descAr: "إضافة وحفظ تواقيعك وأختامك الرسمية لتطبيقها بلمسة واحدة على خطاباتك المجهزة للطباعة.",
      descEn: "Add and save your official signatures and seals to apply them with one click on print-ready letters."
    },
    {
      icon: <Save className="w-5 h-5 text-blue-500" />,
      titleAr: "المزامنة والأرشيف السحابي",
      titleEn: "Cloud Sync & Archive",
      descAr: "حفظ خطاباتك كمسودات أو خطابات منتهية ومزامنتها تلقائياً مع حسابك السحابي في Firebase.",
      descEn: "Save your letters as drafts or completed documents and sync them automatically with your Firebase cloud account."
    },
    {
      icon: <Key className="w-5 h-5 text-purple-500" />,
      titleAr: "مشاركة آمنة بكلمة مرور",
      titleEn: "Secure Password Sharing",
      descAr: "إنشاء روابط ويب لمشاركة خطاباتك مع الآخرين مع إمكانية حمايتها بكلمة مرور وصلاحية مؤقتة.",
      descEn: "Generate web links to share your letters with others, with optional password protection and temp expiry."
    },
    {
      icon: <FileText className="w-5 h-5 text-rose-500" />,
      titleAr: "استخراج النصوص من الصور (OCR)",
      titleEn: "AI Text Extraction (OCR)",
      descAr: "رفع صور الخطابات القديمة أو الورقية ليقوم الذكاء الاصطناعي باستخراج نصوصها لتبدأ التعديل عليها فوراً.",
      descEn: "Upload images of old paper letters and let AI extract the text so you can start editing them immediately."
    },
    {
      icon: <Languages className="w-5 h-5 text-cyan-500" />,
      titleAr: "ثنائية اللغة بالكامل",
      titleEn: "Fully Multilingual",
      descAr: "دعم كتابة وتصدير الخطابات باللغتين العربية والإنجليزية مع لوحة تحكم كاملة تدعم الاتجاهين (RTL/LTR).",
      descEn: "Support writing and exporting letters in both Arabic and English with full RTL/LTR bi-directional layouts."
    }
  ];

  return (
    <AnimatePresence>
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-modal-title"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-2xl premium-card rounded-2xl shadow-2xl overflow-hidden text-start z-10 border border-slate-100 dark:border-slate-800"
            dir={appLang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 id="about-modal-title" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
                  <Info className="w-6 h-6 text-brown-600 dark:text-brown-400" />
                  {t('عن منصة صياغة', 'About Siyagha')}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
                  type="button"
                  aria-label={t('إغلاق النافذة', 'Close window')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Intro */}
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                    {t(
                      '«صياغة» هي منصة رقمية ذكية ومتكاملة مصممة خصيصاً لمساعدة الأفراد والشركات والجهات الحكومية في كتابة وصياغة الخطابات الرسمية، الإدارية، والتجارية بأعلى مستويات الاحترافية والجمال اللغوي في دقائق معدودة.',
                      '"Siyagha" is an intelligent, integrated digital platform designed to help individuals, companies, and government entities write and draft official, administrative, and commercial letters with the highest levels of professionalism and linguistic elegance in minutes.'
                    )}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t(
                      'تجمع المنصة بين قوة تقنيات الذكاء الاصطناعي التوليدي المتطورة من Google، وسهولة الواجهة التفاعلية الفاخرة، لتجعل عملية إنشاء المراسلات الإدارية الرسمية تجربة سلسة وخالية من المتاعب.',
                      'The platform combines the power of cutting-edge generative AI models from Google with a premium, user-friendly interactive interface, turning the process of creating official administrative correspondence into a seamless, hassle-free experience.'
                    )}
                  </p>
                </div>

                {/* Features Grid */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-brown-500" />
                    {t('أبرز مميزات وخدمات المنصة:', 'Key Features & Services:')}
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    {features.map((feat, index) => (
                      <div key={index} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex gap-3 transition-colors hover:border-brown-100 dark:hover:border-slate-700">
                        <div className="mt-1 flex-shrink-0">{feat.icon}</div>
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {appLang === 'ar' ? feat.titleAr : feat.titleEn}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {appLang === 'ar' ? feat.descAr : feat.descEn}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    {t('صياغة - الإصدار 1.0.0 © جميع الحقوق محفوظة 2026', 'Siyagha - Version 1.0.0 © All Rights Reserved 2026')}
                  </span>
                </div>
              </div>

              {/* Close Action */}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-xs font-bold text-white bg-brown-600 hover:bg-brown-700 px-5 py-2.5 rounded-lg transition-colors border border-transparent shadow-sm cursor-pointer"
                >
                  {t('إغلاق', 'Close')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AboutModal;
