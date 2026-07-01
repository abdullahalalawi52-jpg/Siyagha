export interface SavedLetter {
  id: string;
  subject: string;
  date: string;
  content: string;
  type?: string;
  isDraft?: boolean;
  formData?: LetterFormState;
  isPinned?: boolean;
  tags?: string[];
  savedAt?: number;
}

export interface BrandingConfig {
  enableHeader: boolean;
  theme: string;
  companyName: string;
  companyDetails: string;
  logoUrl: string;
  enableFooter: boolean;
  footerText: string;
  footerTheme?: string;
}

export interface PrintElementOptions {
  fontFamily: string;
  fontSize: number;
  isEn: boolean;
  subject: string;
  letterContent: string;
  branding: BrandingConfig;
  signatureImage: string | null;
  sealImage: string | null;
}

export interface LetterFormState {
  type: string;
  subType: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  recipientName: string;
  recipientRole: string;
  subject: string;
  details: string;
  tone: string;
  formality: string;
  language: string;
  date: string;
  brandVoiceProfile: string;
  brandVoiceName: string;
  isReplyMode: boolean;
  replyToText: string;
  replyStance: string;
  jobDescription?: string;
  resumeInfo?: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  data: LetterFormState;
}

export interface ToneAnalysisResult {
  toneName: string;
  formalityScore: number;
  summary: string;
  suggestions: string[];
}

export interface AtsAnalysisResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  summary: string;
  suggestions: string[];
}

export interface BrandVoiceProfile {
  id: string;
  name: string;
  profile: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface UserCloudData {
  savedLetters: SavedLetter[];
  favoriteTemplates: { type: string; subType: string }[];
  favoritePredefined: string[];
}

export interface EmailFormState {
  to: string;
  subject: string;
  attachPdf: boolean;
}
