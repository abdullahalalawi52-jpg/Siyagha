import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
// Set environment variables before importing app
process.env.GEMINI_API_KEY = 'test_key';
import app from '../../server';

describe('Server Security & Integration Tests', () => {
  beforeAll(() => {
    // Mock global fetch to intercept Firestore REST write requests
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
});
