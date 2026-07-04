import { Building2, Briefcase, AlertCircle, MessageSquare, FileText, User, Heart, Sparkles, Calendar, Mail, Scale, Stethoscope, GraduationCap } from 'lucide-react';

export const letterTypes = {
  'إداري/رسمي': {
    icon: Building2,
    subTypes: [
      { name: 'خطاب طلب (وظيفة، إجازة، مساعدة)', icon: Briefcase },
      { name: 'خطاب شكوى (تظلم، إبلاغ عن مشكلة)', icon: AlertCircle },
      { name: 'خطاب استفسار', icon: MessageSquare },
      { name: 'أخرى', icon: FileText }
    ]
  },
  'أعمال': {
    icon: Briefcase,
    subTypes: [
      { name: 'خطاب عرض سعر', icon: FileText },
      { name: 'خطاب شراكة', icon: User },
      { name: 'خطاب تعريف بالشركة', icon: Building2 },
      { name: 'أخرى', icon: FileText }
    ]
  },
  'شخصي': {
    icon: User,
    subTypes: [
      { name: 'خطاب شكر', icon: Heart },
      { name: 'خطاب اعتذار', icon: AlertCircle },
      { name: 'خطاب تهنئة', icon: Sparkles },
      { name: 'أخرى', icon: FileText }
    ]
  },
  'توظيف وتطوير مهني': {
    icon: Briefcase,
    subTypes: [
      { name: 'خطاب تغطية (Cover Letter)', icon: FileText },
      { name: 'رسالة متابعة طلب توظيف', icon: Mail },
      { name: 'رسالة تواصل LinkedIn', icon: User },
      { name: 'رسالة شكر بعد المقابلة', icon: Heart },
      { name: 'رسالة قبول/اعتذار عن عرض عمل', icon: AlertCircle }
    ]
  },
  'قانوني': {
    icon: Scale,
    subTypes: [
      { name: 'خطاب إنذار قانوني', icon: AlertCircle },
      { name: 'خطاب مطالبة حقوقية', icon: FileText },
      { name: 'عقد/اتفاقية تقديم خدمات', icon: FileText },
      { name: 'أخرى', icon: FileText }
    ]
  },
  'طبي': {
    icon: Stethoscope,
    subTypes: [
      { name: 'خطاب تقرير طبي', icon: Heart },
      { name: 'خطاب إجازة مرضية', icon: Calendar },
      { name: 'طلب إحالة طبية', icon: FileText },
      { name: 'أخرى', icon: FileText }
    ]
  },
  'أكاديمي/تعليمي': {
    icon: GraduationCap,
    subTypes: [
      { name: 'خطاب طلب قبول جامعي', icon: Building2 },
      { name: 'خطاب توصية أكاديمية', icon: User },
      { name: 'طلب تأجيل دراسي', icon: Calendar },
      { name: 'أخرى', icon: FileText }
    ]
  }
};

export const getLetterTypeData = (type: string) => {
  if (type === 'إداري/رسمي') return letterTypes['إداري/رسمي'];
  if (type === 'أعمال') return letterTypes['أعمال'];
  if (type === 'شخصي') return letterTypes['شخصي'];
  if (type === 'توظيف وتطوير مهني') return letterTypes['توظيف وتطوير مهني'];
  if (type === 'قانوني') return letterTypes['قانوني'];
  if (type === 'طبي') return letterTypes['طبي'];
  if (type === 'أكاديمي/تعليمي') return letterTypes['أكاديمي/تعليمي'];
  return letterTypes['إداري/رسمي'];
};

export const toneOptions = ['رسمي', 'مهني جداً', 'ودود', 'حماسي', 'إقناعي', 'حازم'];
export const formalityOptions = ['رسمي جداً', 'رسمي', 'شبه رسمي', 'ودي (غير رسمي)'];

export const fontFamilies = [
  { value: 'Cairo', label: 'القاهرة (Cairo)', id: 'Cairo', name: 'القاهرة (Cairo)', labelEn: 'Cairo' },
  { value: 'Amiri', label: 'أميري (Amiri)', id: 'Amiri', name: 'أميري (Amiri)', labelEn: 'Amiri' },
  { value: 'Tajawal', label: 'تجوال (Tajawal)', id: 'Tajawal', name: 'تجوال (Tajawal)', labelEn: 'Tajawal' },
  { value: 'Arial', label: 'أريال (Arial)', id: 'Arial', name: 'أريال (Arial)', labelEn: 'Arial' }
];

export const fontSizes = [
  { value: '14', label: 'صغير (14px)', id: 14, name: 'صغير (14px)', labelEn: 'Small (14px)' },
  { value: '16', label: 'متوسط (16px)', id: 16, name: 'متوسط (16px)', labelEn: 'Medium (16px)' },
  { value: '18', label: 'كبير (18px)', id: 18, name: 'كبير (18px)', labelEn: 'Large (18px)' },
  { value: '20', label: 'كبير جداً (20px)', id: 20, name: 'كبير جداً (20px)', labelEn: 'Extra Large (20px)' }
];
