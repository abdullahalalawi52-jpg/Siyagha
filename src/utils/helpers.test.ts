import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeUrl, escapeRegExp, applyStyles, buildPrintElement } from './helpers';

describe('Helpers Utility Functions', () => {
  describe('escapeHtml', () => {
    it('escapes special HTML characters correctly', () => {
      expect(escapeHtml('<div>Hello & "World"</div>')).toBe('&lt;div&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;');
      expect(escapeHtml("'single'")).toBe('&#039;single&#039;');
    });

    it('returns empty string if input is not a string', () => {
      // @ts-ignore
      expect(escapeHtml(null)).toBe('');
      // @ts-ignore
      expect(escapeHtml(undefined)).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('sanitizes valid HTTP/HTTPS and data URLs', () => {
      expect(sanitizeUrl('https://example.com/logo.png')).toBe('https://example.com/logo.png');
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
      expect(sanitizeUrl('data:image/png;base64,123')).toBe('data:image/png;base64,123');
    });

    it('replaces quotes to prevent attribute breakout', () => {
      expect(sanitizeUrl('https://example.com/"quote"')).toBe('https://example.com/&quot;quote&quot;');
      expect(sanitizeUrl("https://example.com/'quote'")).toBe('https://example.com/&#39;quote&#39;');
    });

    it('returns empty string for invalid URL schemes', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeUrl('ftp://file-server')).toBe('');
      expect(sanitizeUrl(null)).toBe('');
    });
  });

  describe('escapeRegExp', () => {
    it('escapes regular expression special characters', () => {
      expect(escapeRegExp('hello.world*')).toBe('hello\\.world\\*');
      expect(escapeRegExp('^abc$')).toBe('\\^abc\\$');
    });
  });

  describe('applyStyles', () => {
    it('applies style objects to HTML elements', () => {
      const el = document.createElement('div');
      applyStyles(el, { color: 'red', fontSize: '12px' });
      expect(el.style.color).toBe('red');
      expect(el.style.fontSize).toBe('12px');
    });
  });

  describe('buildPrintElement', () => {
    it('builds a printable HTML element with given options', () => {
      const opts = {
        fontFamily: 'Cairo',
        fontSize: 14,
        isEn: false,
        subject: 'موضوع الخطاب',
        letterContent: 'محتوى الخطاب التجريبي',
        branding: {
          enableHeader: true,
          theme: 'classic',
          companyName: 'شركتنا',
          companyDetails: 'تفاصيل التواصل',
          logoUrl: 'https://example.com/logo.png',
          enableFooter: true,
          footerText: 'تذييل الصفحة',
        },
        signatureImage: 'data:image/png;base64,sig',
        sealImage: 'data:image/png;base64,seal',
      };

      const result = buildPrintElement(opts);
      expect(result).toBeInstanceOf(HTMLElement);
      expect(result.style.fontFamily).toContain('Cairo');
      expect(result.style.fontSize).toBe('14px');
      expect(result.style.direction).toBe('rtl');

      // Verify header components are rendered
      expect(result.innerHTML).toContain('شركتنا');
      expect(result.innerHTML).toContain('تفاصيل التواصل');
      expect(result.innerHTML).toContain('https://example.com/logo.png');

      // Verify subject and content
      expect(result.innerHTML).toContain('موضوع الخطاب');
      expect(result.innerHTML).toContain('محتوى الخطاب التجريبي');

      // Verify signatures
      expect(result.innerHTML).toContain('التوقيع والختم:');
      expect(result.innerHTML).toContain('data:image/png;base64,sig');
      expect(result.innerHTML).toContain('data:image/png;base64,seal');

      // Verify footer
      expect(result.innerHTML).toContain('تذييل الصفحة');
    });

    it('builds element with minimum options and English layout', () => {
      const opts = {
        fontFamily: 'Arial',
        fontSize: 16,
        isEn: true,
        subject: '',
        letterContent: 'English content',
        branding: {
          enableHeader: false,
          theme: 'classic',
          companyName: '',
          companyDetails: '',
          logoUrl: '',
          enableFooter: false,
          footerText: '',
        },
        signatureImage: null,
        sealImage: null,
      };

      const result = buildPrintElement(opts);
      expect(result.style.direction).toBe('ltr');
      expect(result.style.textAlign).toBe('left');
      expect(result.innerHTML).toContain('English content');
      expect(result.innerHTML).not.toContain('التوقيع والختم:');
    });
  });
});
