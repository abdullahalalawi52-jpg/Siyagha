import React, { useState } from 'react';

export const useLetterBranding = () => {
  const [fontFamily, setFontFamily] = useState('Cairo');
  const [fontSize, setFontSize] = useState('15px');
  const [activeSection, setActiveSection] = useState<'basic' | 'branding' | 'signature'>('basic');

  const [branding, setBranding] = useState({
    enableHeader: false,
    theme: 'classic',
    companyName: '',
    companyDetails: '',
    logoUrl: '',
    enableFooter: false,
    footerText: '',
    footerTheme: 'centered',
  });

  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [sealImage, setSealImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature' | 'seal') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (type === 'logo') {
          setBranding((prev) => ({ ...prev, logoUrl: reader.result as string }));
        } else if (type === 'signature') {
          setSignatureImage(reader.result);
        } else if (type === 'seal') {
          setSealImage(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return {
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    activeSection,
    setActiveSection,
    branding,
    setBranding,
    signatureImage,
    setSignatureImage,
    sealImage,
    setSealImage,
    handleImageUpload,
  };
};
