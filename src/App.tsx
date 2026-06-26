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

function MainAppContent() {
  const { appLang, form } = useApp();

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

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <LetterForm />
          <LetterPreview />
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
