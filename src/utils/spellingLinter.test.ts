import { describe, it, expect } from 'vitest';
import { checkSpelling, applySpellingFix } from './spellingLinter';

describe('Arabic Spelling Linter Utility', () => {
  describe('checkSpelling', () => {
    it('detects common spelling errors in Arabic text', () => {
      const text = 'نأمل انشاء مركز جديد واعداد تقرير بخصوص ذلك ارجو المساعدة';
      const issues = checkSpelling(text);

      expect(issues.length).toBe(3);

      const words = issues.map((i) => i.word);
      expect(words).toContain('انشاء');
      expect(words).toContain('واعداد');
      expect(words).toContain('ارجو');

      // Check suggestion for prefixed word
      const waEdaadIssue = issues.find(i => i.word === 'واعداد');
      expect(waEdaadIssue).toBeDefined();
      expect(waEdaadIssue?.suggestion).toBe('وإعداد');
    });

    it('correctly maps the replacement suggestions and positions', () => {
      const text = 'انشاء';
      const issues = checkSpelling(text);

      expect(issues[0].word).toBe('انشاء');
      expect(issues[0].suggestion).toBe('إنشاء');
      expect(issues[0].index).toBe(0);
      expect(issues[0].length).toBe(5);
    });

    it('returns empty array if text has no mistakes', () => {
      const cleanText = 'أرجو التكرم بالموافقة على طلب إنشاء هذا المشروع المتميز وتجهيز إعداد التجهيزات اللازمة.';
      const issues = checkSpelling(cleanText);

      expect(issues.length).toBe(0);
    });
  });

  describe('applySpellingFix', () => {
    it('applies corrections at the correct position', () => {
      const text = 'نود انشاء المرفق';
      const issues = checkSpelling(text);
      expect(issues.length).toBe(1);

      const fixed = applySpellingFix(text, issues[0]);
      expect(fixed).toBe('نود إنشاء المرفق');
    });

    it('applies corrections with prefixes correctly', () => {
      const text = 'نأمل واعداد التقرير';
      const issues = checkSpelling(text);
      expect(issues.length).toBe(1);

      const fixed = applySpellingFix(text, issues[0]);
      expect(fixed).toBe('نأمل وإعداد التقرير');
    });
  });
});
