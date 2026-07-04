import express from "express";
import { GoogleGenAI } from "@google/genai";
import { ALLOWED_ORIGINS, isAllowedOrigin } from "./config";

const ipCache = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (options: { windowMs: number; max: number; message: string }) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }
    const ip = (req.headers["x-forwarded-for"] as string)?.split(',')[0].trim() || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    
    for (const [key, value] of ipCache.entries()) {
      if (value.resetTime < now) {
        ipCache.delete(key);
      }
    }
    
    const record = ipCache.get(ip);
    if (!record) {
      ipCache.set(ip, { count: 1, resetTime: now + options.windowMs });
      return next();
    }
    
    if (record.resetTime < now) {
      ipCache.set(ip, { count: 1, resetTime: now + options.windowMs });
      return next();
    }
    
    if (record.count >= options.max) {
      return res.status(429).json({ error: options.message });
    }
    
    record.count++;
    next();
  };
};

export const geminiLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "لقد تجاوزت الحد المسموح به من الطلبات (30 طلب في الدقيقة). يرجى المحاولة لاحقاً."
});

export const emailLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 3,
  message: "لقد تجاوزت الحد المسموح به لإرسال الرسائل (3 رسائل في الدقيقة). يرجى المحاولة لاحقاً."
});

export const shareLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "لقد تجاوزت الحد المسموح به لإنشاء الروابط (10 روابط في الدقيقة). يرجى المحاولة لاحقاً."
});

import { GoogleAiRequest } from "./types";

export const checkGeminiKey = (req: GoogleAiRequest, res: express.Response, next: express.NextFunction) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key is not configured" });
  }
  req.ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
  next();
};

export const sanitizeInput = (text: string): string => {
  if (typeof text !== 'string') return '';
  return text.replace(/<[^>]*>/g, '').trim();
};

export const sanitizeBody = (body: any): any => {
  if (!body) return body;
  const sanitized: any = {};
  for (const key in body) {
    if (typeof body[key] === 'string') {
      sanitized[key] = sanitizeInput(body[key]);
    } else if (typeof body[key] === 'object' && body[key] !== null) {
      sanitized[key] = sanitizeBody(body[key]);
    } else {
      sanitized[key] = body[key];
    }
  }
  return sanitized;
};

export const sanitizeRequestBody = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeBody(req.body);
  }
  next();
};

export const csrfCheck = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const targetOrigin = origin || (referer ? new URL(referer).origin : null);
    
    if (!targetOrigin || !isAllowedOrigin(targetOrigin)) {
      console.warn(`[Security Alert] Blocked CSRF request from origin: ${targetOrigin}`);
      return res.status(403).json({ error: "Forbidden: CSRF origin verification failed" });
    }
  }
  next();
};

export const corsMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://siyagha.vercel.app');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
};
