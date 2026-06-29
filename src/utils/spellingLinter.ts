export interface SpellingIssue {
  id: string;
  word: string;
  suggestion: string;
  reasonAr: string;
  reasonEn: string;
  index: number;
  length: number;
}

interface SpellingRule {
  regex: RegExp;
  word: string;
  suggestion: string;
  reasonAr: string;
  reasonEn: string;
}

// Helper to create safe Arabic word boundary regexes with optional common prefixes
// standard \b fails for Unicode/Arabic characters in JS RegExp
// Captures prefix in group 1, and target word in group 2
const makeArabicWordRegex = (word: string) => {
  return new RegExp(`(?<=^|[^\\u0600-\\u06FFa-zA-Z0-9_])(و|ف|ب|ل|ك|ال|وال|بال|فال|لل)?(${word})(?=$|[^\\u0600-\\u06FFa-zA-Z0-9_])`, 'g');
};

const spellingRules: SpellingRule[] = [
  {
    regex: makeArabicWordRegex('انشاء'),
    word: 'انشاء',
    suggestion: 'إنشاء',
    reasonAr: 'همزة قطع مكسورة تحت الألف في مصدر الفعل الرباعي "أنشأ".',
    reasonEn: 'Hamza Qat is required under the Alif: "إنشاء".'
  },
  {
    regex: makeArabicWordRegex('اعداد'),
    word: 'اعداد',
    suggestion: 'إعداد',
    reasonAr: 'همزة قطع مكسورة تحت الألف في مصدر الفعل الرباعي "أعد".',
    reasonEn: 'Hamza Qat is required under the Alif: "إعداد".'
  },
  {
    regex: makeArabicWordRegex('إستفسار'),
    word: 'إستفسار',
    suggestion: 'استفسار',
    reasonAr: 'همزة وصل بدون همزة قطع في مصدر الفعل السداسي "استفسر".',
    reasonEn: 'Hamza Wasl is required (no hamza symbol): "استفسار".'
  },
  {
    regex: makeArabicWordRegex('إستعلام'),
    word: 'إستعلام',
    suggestion: 'استعلام',
    reasonAr: 'همزة وصل بدون همزة قطع في مصدر الفعل السداسي "استعلم".',
    reasonEn: 'Hamza Wasl is required (no hamza symbol): "استعلام".'
  },
  {
    regex: makeArabicWordRegex('إستخدام'),
    word: 'إستخدام',
    suggestion: 'استخدام',
    reasonAr: 'همزة وصل بدون همزة قطع في مصدر الفعل السداسي "استخدم".',
    reasonEn: 'Hamza Wasl is required (no hamza symbol): "استخدام".'
  },
  {
    regex: makeArabicWordRegex('إستثمار'),
    word: 'إستثمار',
    suggestion: 'استثمار',
    reasonAr: 'همزة وصل بدون همزة قطع في مصدر الفعل السداسي "استثمر".',
    reasonEn: 'Hamza Wasl is required (no hamza symbol): "استثمار".'
  },
  {
    regex: makeArabicWordRegex('إتخاذ'),
    word: 'إتخاذ',
    suggestion: 'اتخاذ',
    reasonAr: 'همزة وصل في مصدر الفعل الخماسي "اتخذ".',
    reasonEn: 'Hamza Wasl is required: "اتخاذ".'
  },
  {
    regex: makeArabicWordRegex('إتفاق'),
    word: 'إتفاق',
    suggestion: 'اتفاق',
    reasonAr: 'همزة وصل في مصدر الفعل الخماسي "اتفق".',
    reasonEn: 'Hamza Wasl is required: "اتفاق".'
  },
  {
    regex: makeArabicWordRegex('إجتماع'),
    word: 'إجتماع',
    suggestion: 'اجتماع',
    reasonAr: 'همزة وصل في مصدر الفعل الخماسي "اجتمع".',
    reasonEn: 'Hamza Wasl is required: "اجتماع".'
  },
  {
    regex: makeArabicWordRegex('ارسال'),
    word: 'ارسال',
    suggestion: 'إرسال',
    reasonAr: 'همزة قطع مكسورة تحت الألف في مصدر الفعل الرباعي "أرسل".',
    reasonEn: 'Hamza Qat is required under the Alif: "إرسال".'
  },
  {
    regex: makeArabicWordRegex('ارسل'),
    word: 'ارسل',
    suggestion: 'أرسل',
    reasonAr: 'همزة قطع مفتوحة فوق الألف في الفعل الرباعي الماضي/الأمر "أرسل".',
    reasonEn: 'Hamza Qat is required over the Alif: "أرسل".'
  },
  {
    regex: makeArabicWordRegex('اعلان'),
    word: 'اعلان',
    suggestion: 'إعلان',
    reasonAr: 'همزة قطع مكسورة تحت الألف في مصدر الفعل الرباعي "أعلن".',
    reasonEn: 'Hamza Qat is required under the Alif: "إعلان".'
  },
  {
    regex: makeArabicWordRegex('ارجو'),
    word: 'ارجو',
    suggestion: 'أرجو',
    reasonAr: 'همزة المضارعة (همزة قطع فوق الألف) في الفعل "أرجو".',
    reasonEn: 'Hamza Qat is required over the Alif for present tense verb: "أرجو".'
  },
  {
    regex: makeArabicWordRegex('الذى'),
    word: 'الذى',
    suggestion: 'الذي',
    reasonAr: 'يجب كتابة الياء بنقطتين في نهاية الاسم الموصول "الذي".',
    reasonEn: 'Requires dotting the final letter: "الذي".'
  },
  {
    regex: makeArabicWordRegex('الى'),
    word: 'الى',
    suggestion: 'إلى',
    reasonAr: 'حرف الجر يُكتب بهمزة قطع مكسورة وألف مقصورة.',
    reasonEn: 'Requires Hamza under Alif: "إلى".'
  },
  {
    regex: makeArabicWordRegex('اذا'),
    word: 'اذا',
    suggestion: 'إذا',
    reasonAr: 'ظرف زمان يُكتب بهمزة قطع مكسورة.',
    reasonEn: 'Requires Hamza under Alif: "إذا".'
  },
  {
    regex: makeArabicWordRegex('او'),
    word: 'او',
    suggestion: 'أو',
    reasonAr: 'حرف عطف يُكتب بهمزة قطع مفتوحة.',
    reasonEn: 'Requires Hamza over Alif: "أو".'
  },
  {
    regex: makeArabicWordRegex('ان'),
    word: 'ان',
    suggestion: 'أن',
    reasonAr: 'يجب كتابة الهمزة قطعاً فوق أو تحت الألف حسب السياق (أن/إن).',
    reasonEn: 'Requires Hamza (أن or إن).'
  }
];

export const checkSpelling = (text: string): SpellingIssue[] => {
  if (!text) return [];
  const issues: SpellingIssue[] = [];

  spellingRules.forEach((rule) => {
    // Reset regex index
    rule.regex.lastIndex = 0;
    let match;
    while ((match = rule.regex.exec(text)) !== null) {
      const fullMatch = match[0];
      const prefix = match[1] || '';
      issues.push({
        id: `${rule.word}-${match.index}`,
        word: fullMatch,
        suggestion: prefix + rule.suggestion,
        reasonAr: rule.reasonAr,
        reasonEn: rule.reasonEn,
        index: match.index,
        length: fullMatch.length
      });
    }
  });

  // Sort issues by index so we can replace them sequentially or understand locations
  return issues.sort((a, b) => a.index - b.index);
};

export const applySpellingFix = (text: string, issue: SpellingIssue): string => {
  const before = text.substring(0, issue.index);
  const after = text.substring(issue.index + issue.length);
  // Pick the first choice for suggestion if multiple exist (like 'أن / إن' -> 'أن')
  const cleanSuggestion = issue.suggestion.split(' / ')[0];
  return before + cleanSuggestion + after;
};
