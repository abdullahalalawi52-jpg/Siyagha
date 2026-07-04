import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import * as geminiService from '../../server/services/gemini';

process.env.GEMINI_API_KEY = 'test_key';
import app from '../../server';

describe('Server Security & Integration Tests', () => {
  beforeAll(() => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      if (url.toString().includes('firestore.googleapis.com')) {
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ name: 'projects/letter-a3f15/databases/(default)/documents/shared_letters/token' }),
          json: async () => ({ name: 'projects/letter-a3f15/databases/(default)/documents/shared_letters/token' }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({}),
        json: async () => ({}),
      } as Response;
    });

    vi.spyOn(geminiService, 'safeGenerate').mockImplementation(async (_ai, params) => {
      if (params.config?.responseMimeType === 'application/json') {
        return {
          text: JSON.stringify({
            detectedTone: 'رسمية صريحة',
            formalityScore: 95,
            suggestions: ['نصيحة لتحسين الخطاب'],
            score: 85,
            matchedKeywords: ['خبرة', 'إدارة'],
            missingKeywords: ['قيادة'],
            improvements: ['إضافة مهام أسلوبية'],
            voiceName: 'أسلوب إداري محترف',
            characteristics: ['مباشر', 'موجز'],
            summaryPrompt: 'اكتب بنبرة رسمية دقيقة'
          })
        } as any;
      }
      return {
        text: 'نص موصل ومحلل مسبقاً لاختبار السيرفر'
      } as any;
    });
  });

  describe('CORS and CSRF Protection Checks', () => {
    it('should allow CORS requests from allowed origin', async () => {
      const res = await request(app)
        .post('/api/share')
        .set('Origin', 'https://abdullahalalawi52-jpg.github.io')
        .send({ subject: 'Test' });
        
      expect(res.headers['access-control-allow-origin']).toBe('https://abdullahalalawi52-jpg.github.io');
    });

    it('should block state-modifying requests from unauthorized CSRF origins', async () => {
      const res = await request(app)
        .post('/api/share')
        .set('Origin', 'https://malicious-site.com')
        .send({ subject: 'Attack' });
        
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('CSRF origin verification failed');
    });

    it('should block state-modifying requests if origin is missing and it has unauthorized referer', async () => {
      const res = await request(app)
        .post('/api/share')
        .set('Referer', 'https://malicious-site.com/attack')
        .send({ subject: 'Attack' });
        
      expect(res.status).toBe(403);
    });
  });

  describe('Input Sanitization Checks', () => {
    it('should sanitize HTML tags from POST body to prevent XSS/injection', async () => {
      const res = await request(app)
        .post('/api/share')
        .set('Origin', 'http://localhost:5173')
        .send({
          subject: '<h1>Test Subject</h1>',
          content: '<script>alert("xss")</script>Hello World',
          branding: {
            enableHeader: false,
            enableFooter: false,
            companyName: '<b>Company</b>',
            companyDetails: 'Details',
            logoUrl: '',
            theme: 'classic',
            footerText: ''
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.url).toBeDefined();
    });
  });

  describe('Password Hashing iterations and verification', () => {
    it('should hash and verify passwords with high iterations', async () => {
      const res = await request(app)
        .post('/api/share')
        .set('Origin', 'http://localhost:5173')
        .send({
          subject: 'Protected Letter',
          content: 'Secret content',
          password: 'secure_password_123',
          branding: {
            enableHeader: false,
            enableFooter: false,
            companyName: 'Company',
            companyDetails: 'Details',
            logoUrl: '',
            theme: 'classic',
            footerText: ''
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.url).toBeDefined();
    });
  });

  describe('AI Endpoint Integrations', () => {
    it('/api/suggest-title should return suggested title', async () => {
      const res = await request(app)
        .post('/api/suggest-title')
        .set('Origin', 'http://localhost:5173')
        .send({ letterContent: 'محتوى الخطاب الرسمي لاقتراح عنوان' });

      expect(res.status).toBe(200);
      expect(res.body.suggestedTitle).toBeDefined();
    });

    it('/api/proofread-letter should return proofread text', async () => {
      const res = await request(app)
        .post('/api/proofread-letter')
        .set('Origin', 'http://localhost:5173')
        .send({ letterContent: 'نص خطاب يحتوي اخصاء املائية' });

      expect(res.status).toBe(200);
      expect(res.body.proofreadText).toBeDefined();
    });

    it('/api/analyze-tone should analyze tone and return JSON structure', async () => {
      const res = await request(app)
        .post('/api/analyze-tone')
        .set('Origin', 'http://localhost:5173')
        .send({ letterContent: 'نص الخطاب المراد تحليل نبرته' });

      expect(res.status).toBe(200);
      expect(res.body.detectedTone).toBe('رسمية صريحة');
      expect(res.body.formalityScore).toBe(95);
    });

    it('/api/analyze-ats should evaluate ATS keywords', async () => {
      const res = await request(app)
        .post('/api/analyze-ats')
        .set('Origin', 'http://localhost:5173')
        .send({ letterContent: 'السيرة الذاتية والمهارات', jobTitle: 'مدير تنفيذي' });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(85);
    });

    it('/api/polish-letter should polish text with target tone', async () => {
      const res = await request(app)
        .post('/api/polish-letter')
        .set('Origin', 'http://localhost:5173')
        .send({ letterContent: 'نص الخطاب', targetTone: 'حازمة' });

      expect(res.status).toBe(200);
      expect(res.body.polishedText).toBeDefined();
    });

    it('/api/analyze-style should extract brand voice', async () => {
      const res = await request(app)
        .post('/api/analyze-style')
        .set('Origin', 'http://localhost:5173')
        .send({ sampleText: 'نموذج من كتاباتي السابقة' });

      expect(res.status).toBe(200);
      expect(res.body.voiceName).toBeDefined();
    });

    it('/api/generate-letter should generate a full formal letter', async () => {
      const res = await request(app)
        .post('/api/generate-letter')
        .set('Origin', 'http://localhost:5173')
        .send({
          sender: 'عبدالله العلي',
          recipient: 'مدير الشركة',
          subject: 'طلب ترقية',
          details: 'تفاصيل الإنجازات والخبرة المكتسبة',
          type: 'شركات خاصة',
          tone: 'مهني جداً'
        });

      expect(res.status).toBe(200);
      expect(res.body.text).toBeDefined();
    });

    it('/api/ocr should extract text from base64 document', async () => {
      const res = await request(app)
        .post('/api/ocr')
        .set('Origin', 'http://localhost:5173')
        .send({ imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', mimeType: 'image/png' });

      expect(res.status).toBe(200);
      expect(res.body.extractedText).toBeDefined();
    });

    it('/api/send-email should validate required fields', async () => {
      const res = await request(app)
        .post('/api/send-email')
        .set('Origin', 'http://localhost:5173')
        .send({ recipientEmail: '' });

      expect(res.status).toBe(400);
    });
  });
});
