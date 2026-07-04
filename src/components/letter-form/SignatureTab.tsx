import React from 'react';
import { PenLine, Upload, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const SignatureTab: React.FC = () => {
  const {
    setIsSigningOpen,
    handleImageUpload,
    signatureImage,
    setSignatureImage,
    sealImage,
    setSealImage,
    t,
  } = useApp();

  return (
    <div className="space-y-6">
      {/* Signature Upload / Draw */}
      <div role="group" aria-labelledby="sig-group-label" className="space-y-2">
        <span id="sig-group-label" className="text-sm font-bold text-gray-800 dark:text-gray-200 block">{t('التوقيع الرقمي (Signature)', 'Digital Signature')}</span>
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
              aria-label={t('حذف التوقيع', 'Remove signature')}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <hr className="border-gray-100 my-4 border-dashed" />

      {/* Seal/Stamp Upload */}
      <div className="space-y-2">
        <label htmlFor="seal-file-upload" className="text-sm font-bold text-gray-800 dark:text-gray-200 block cursor-pointer">{t('شعار الختم الرسمي (Stamp/Seal)', 'Official Stamp/Seal')}</label>
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
          <div className="relative mt-2 inline-block border border-gray-250 rounded p-2 bg-white">
            <img src={sealImage} alt="Seal preview" className="max-h-16 max-w-[100px] object-contain" />
            <button
              type="button"
              onClick={() => setSealImage(null)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow cursor-pointer"
              aria-label={t('حذف الختم', 'Remove seal')}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
