import React from 'react';
import { useApp } from '../contexts/AppContext';
import { PreviewToolbar } from './letter-preview/PreviewToolbar';
import { PreviewPaper } from './letter-preview/PreviewPaper';

export const LetterPreview: React.FC = () => {
  const { appLang } = useApp();

  return (
    <div className="lg:col-span-7 premium-card rounded-2xl shadow-2xl border border-brown-100/60 min-h-[600px] flex flex-col relative overflow-hidden text-start" dir={appLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brown-400 via-brown-500 to-brown-600" />

      <div className="flex flex-col h-full relative z-10 p-2 sm:p-8 lg:p-10">
        <PreviewToolbar />
        <PreviewPaper />
      </div>
    </div>
  );
};

export default LetterPreview;
