export interface SavedLetter {
  id: string;
  subject: string;
  date: string;
  content: string;
  type?: string;
  isDraft?: boolean;
  formData?: any;
  isPinned?: boolean;
  tags?: string[];
  savedAt?: number;
}

export interface PrintElementOptions {
  fontFamily: string;
  fontSize: number;
  isEn: boolean;
  subject: string;
  letterContent: string;
  branding: {
    enableHeader: boolean;
    enableFooter: boolean;
    companyName?: string;
    companyDetails?: string;
    logoUrl?: string;
    footerText?: string;
  };
  signatureImage: string | null;
  sealImage: string | null;
}
