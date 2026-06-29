import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/Header';
import QuickTemplates from './components/QuickTemplates';
import StatsDashboard from './components/StatsDashboard';
import LetterForm from './components/LetterForm';
import LetterPreview from './components/LetterPreview';

// Modals
import ArchiveModal from './components/modals/ArchiveModal';
import LibraryModal from './components/modals/LibraryModal';
import EmailModal from './components/modals/EmailModal';
import ShareModal from './components/modals/ShareModal';
import OcrModal from './components/modals/OcrModal';
import SignatureModal from './components/modals/SignatureModal';
import AiModal from './components/modals/AiModal';
import AboutModal from './components/modals/AboutModal';
import BrandVoiceModal from './components/modals/BrandVoiceModal';
import { CareerProfileModal } from './components/modals/CareerProfileModal';
import { CloudStorageModal } from './components/modals/CloudStorageModal';

function MainAppContent() {
  const { appLang, form, generatedLetter, t } = useApp();
  const [activeMobileTab, setActiveMobileTab] = React.useState<'form' | 'preview'>('form');

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
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-7 flex flex-col gap-8">
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

      {/* Render all modal overlays */}
      <ArchiveModal />
      <LibraryModal />
      <EmailModal />
      <ShareModal />
      <OcrModal />
      <SignatureModal />
      <AiModal />
      <AboutModal />
      <BrandVoiceModal />
      <CareerProfileModal />
      <CloudStorageModal />
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
