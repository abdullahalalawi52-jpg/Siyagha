import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";
import { HarmCategory, HarmBlockThreshold } from "@google/genai";

dotenv.config();

export const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://siyagha.vercel.app",
  "https://abdullahalalawi52-jpg.github.io"
];

export const isAllowedOrigin = (origin?: string | null): boolean => {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
};

export const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const isFirebaseConfigured = !!firebaseConfig.projectId;
if (isFirebaseConfigured) {
  console.log("Firebase Firestore REST API configured on the server");
} else {
  console.warn("VITE_FIREBASE_PROJECT_ID is missing. Firestore sharing is disabled.");
}

export const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const esc = (s: unknown): string => {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const handleApiError = (error: any, res: express.Response, defaultMessage: string) => {
  console.error(defaultMessage, error.message || error);
  if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
    return res.status(429).json({ error: "لقد وصلت للحد الأقصى للطلبات المجانية في الدقيقة. يرجى الانتظار 10 ثوانٍ والمحاولة مجدداً." });
  }
  const errorDetails = error.message || String(error);
  res.status(500).json({ error: `${defaultMessage}: ${errorDetails}` });
};

export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 600000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return storedHash === password;
  const [salt, hash] = parts;
  
  const checkHash600k = crypto.pbkdf2Sync(password, salt, 600000, 64, "sha512").toString("hex");
  if (hash === checkHash600k) return true;
  
  const checkHash1k = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === checkHash1k;
};
