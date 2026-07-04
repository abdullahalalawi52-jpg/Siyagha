import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/Header';
import QuickTemplates from './components/QuickTemplates';
import StatsDashboard from './components/StatsDashboard';
import LetterForm from './components/LetterForm';
import LetterPreview from './components/LetterPreview';

// Lazy-loaded Modals
const ArchiveModal = React.lazy(() => import('./components/modals/ArchiveModal'));
const LibraryModal = React.lazy(() => import('./components/modals/LibraryModal'));
const EmailModal = React.lazy(() => import('./components/modals/EmailModal'));
const OcrModal = React.lazy(() => import('./components/modals/OcrModal'));
const SignatureModal = React.lazy(() => import('./components/modals/SignatureModal'));
const AiModal = React.lazy(() => import('./components/modals/AiModal'));
const AboutModal = React.lazy(() => import('./components/modals/AboutModal'));
const BrandVoiceModal = React.lazy(() => import('./components/modals/BrandVoiceModal'));
const CareerProfileModal = React.lazy(() =>
  import('./components/modals/CareerProfileModal').then((m) => ({ default: m.CareerProfileModal }))
);
const CloudStorageModal = React.lazy(() =>
  import('./components/modals/CloudStorageModal').then((m) => ({ default: m.CloudStorageModal }))
);

function MainAppContent() {
  const {
    appLang,
    form,
    generatedLetter,
    t,
    isArchiveOpen,
    isLibraryOpen,
    isEmailModalOpen,
    isOcrOpen,
    isSigningOpen,
    isAiModalOpen,
    isAboutOpen,
    isBrandVoiceModalOpen,
    isCareerProfileModalOpen,
    isCloudStorageOpen,
  } = useApp();

  const [activeMobileTab, setActiveMobileTab] = React.useState<'form' | 'preview'>('form');

  // Track which modals have been opened at least once to load them lazily and keep them mounted for exit animations
  const [openedModals, setOpenedModals] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setOpenedModals((prev) => {
      const updates: Record<string, boolean> = {};
      if (isArchiveOpen && !prev.archive) updates.archive = true;
      if (isLibraryOpen && !prev.library) updates.library = true;
      if (isEmailModalOpen && !prev.email) updates.email = true;
      if (isOcrOpen && !prev.ocr) updates.ocr = true;
      if (isSigningOpen && !prev.signing) updates.signing = true;
      if (isAiModalOpen && !prev.ai) updates.ai = true;
      if (isAboutOpen && !prev.about) updates.about = true;
      if (isBrandVoiceModalOpen && !prev.brandVoice) updates.brandVoice = true;
      if (isCareerProfileModalOpen && !prev.careerProfile) updates.careerProfile = true;
      if (isCloudStorageOpen && !prev.cloudStorage) updates.cloudStorage = true;

      if (Object.keys(updates).length > 0) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  }, [
    isArchiveOpen,
    isLibraryOpen,
    isEmailModalOpen,
    isOcrOpen,
    isSigningOpen,
    isAiModalOpen,
    isAboutOpen,
    isBrandVoiceModalOpen,
    isCareerProfileModalOpen,
    isCloudStorageOpen,
  ]);

  // Switch to preview tab when a letter is generated
  React.useEffect(() => {
    if (generatedLetter) {
      setActiveMobileTab('preview');
    }
  }, [generatedLetter]);

  React.useEffect(() => {
    const baseTitle = appLang === 'ar'
      ? 'صياغة - منشئ الخطابات الرسمية'
      : 'Siyagha - Official Letters Generator';

    if (form.subject) {
      document.title = `${form.subject} | ${baseTitle}`;
    } else if (form.type) {
      document.title = `${form.type} | ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [form.subject, form.type, appLang]);

  return (
    <div className="min-h-screen bg-transparent text-gray-900 font-sans pb-20" dir={appLang === 'ar' ? 'rtl' : 'ltr'}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brown-700 text-white px-4 py-2 rounded-xl z-50 font-bold"
      >
        {appLang === 'ar' ? 'تجاوز إلى المحتوى الرئيسي' : 'Skip to main content'}
      </a>
      <Header />
      
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-7 flex flex-col gap-8">
        <QuickTemplates />
        <StatsDashboard />

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-brown-100/50 dark:border-slate-800/80 shadow-sm w-full max-w-xs mx-auto gap-1">
          <button
            onClick={() => setActiveMobileTab('form')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeMobileTab === 'form'
                ? 'bg-brown-600 text-white shadow-sm'
                : 'text-brown-700 dark:text-brown-300 hover:bg-brown-50 dark:hover:bg-slate-800/40'
            }`}
          >
            {t('تعبئة البيانات', 'Fill Details')}
          </button>
          <button
            onClick={() => setActiveMobileTab('preview')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative cursor-pointer ${
              activeMobileTab === 'preview'
                ? 'bg-brown-600 text-white shadow-sm'
                : 'text-brown-700 dark:text-brown-300 hover:bg-brown-50 dark:hover:bg-slate-800/40'
            }`}
          >
            {t('معاينة الخطاب', 'Preview')}
            {activeMobileTab === 'form' && generatedLetter && (
              <span className="absolute top-2.5 right-3.5 w-2 h-2 bg-orange-500 rounded-full border border-white animate-pulse" />
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className={`${activeMobileTab === 'form' ? 'block' : 'hidden'} lg:block lg:col-span-5`}>
            <LetterForm />
          </div>
          <div className={`${activeMobileTab === 'preview' ? 'block' : 'hidden'} lg:block lg:col-span-7`}>
            <LetterPreview />
          </div>
        </div>
      </main>

      {/* Render modal overlays on demand via React.Suspense */}
      <React.Suspense fallback={null}>
        {openedModals.archive && <ArchiveModal />}
        {openedModals.library && <LibraryModal />}
        {openedModals.email && <EmailModal />}
        {openedModals.ocr && <OcrModal />}
        {openedModals.signing && <SignatureModal />}
        {openedModals.ai && <AiModal />}
        {openedModals.about && <AboutModal />}
        {openedModals.brandVoice && <BrandVoiceModal />}
        {openedModals.careerProfile && <CareerProfileModal />}
        {openedModals.cloudStorage && <CloudStorageModal />}
      </React.Suspense>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
