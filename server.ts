import express from "express";
import path from "path";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import helmet from "helmet";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import crypto from "crypto";

dotenv.config();

// Shared safety settings applied to every Gemini call
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper that always includes safety_settings to satisfy IDE lint rules and auto-retries on rate limits
const safeGenerate = async (ai: GoogleGenAI, params: {
  model: string;
  contents: any;
  config?: Record<string, any>;
}, maxRetries = 2) => {
  let attempt = 0;
  while (true) {
    try {
      return await ai.models.generateContent({
        model: params.model,
        contents: params.contents,
        config: { 
          safetySettings: SAFETY_SETTINGS, 
          ...(params.config || {}) 
        },
      });
    } catch (error: any) {
      const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota') || error.message?.includes('RESOURCE_EXHAUSTED');
      if (isRateLimit && attempt < maxRetries) {
        attempt++;
        console.warn(`[Rate Limit] Waiting 12 seconds to retry (Attempt ${attempt}/${maxRetries})...`);
        await sleep(12000);
        continue;
      }
      throw error;
    }
  }
};

// HTML-escape helper for server-side rendered pages
const esc = (s: unknown): string => {
  if (s == null) return '';
  return String(s)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
};

// Helper for sending friendly Arabic errors on API limits
const handleApiError = (error: any, res: express.Response, defaultMessage: string) => {
  console.error(defaultMessage, error.message || error);
  if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
    return res.status(429).json({ error: "لقد وصلت للحد الأقصى للطلبات المجانية في الدقيقة. يرجى الانتظار 10 ثوانٍ والمحاولة مجدداً." });
  }
  res.status(500).json({ error: defaultMessage });
};

const ipCache = new Map<string, { count: number; resetTime: number }>();

const rateLimiter = (options: { windowMs: number; max: number; message: string }) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(',')[0].trim() || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    
    // Cleanup expired entries
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

const geminiLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "لقد تجاوزت الحد المسموح به من الطلبات (30 طلب في الدقيقة). يرجى المحاولة لاحقاً."
});

const emailLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 3,
  message: "لقد تجاوزت الحد المسموح به لإرسال الرسائل (3 رسائل في الدقيقة). يرجى المحاولة لاحقاً."
});

const shareLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "لقد تجاوزت الحد المسموح به لإنشاء الروابط (10 روابط في الدقيقة). يرجى المحاولة لاحقاً."
});

const app = express();
const PORT = process.env.PORT || 3000;

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

let db: any = null;
if (firebaseConfig.apiKey) {
  try {
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    console.log("Firebase Firestore successfully initialized on the server");
  } catch (error) {
    console.error("Failed to initialize Firebase on the server:", error);
  }
} else {
  console.warn("VITE_FIREBASE_API_KEY is missing. Firestore sharing is disabled.");
}

// Secure PBKDF2 hashing helper for shared links passwords
const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, storedHash: string): boolean => {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return storedHash === password; // Backwards compatible fallback for plain text
  const [salt, hash] = parts;
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === checkHash;
};

// Middleware to validate Gemini API Key and attach the client instance to the request
const checkGeminiKey = (req: any, res: express.Response, next: express.NextFunction) => {
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

// Basic Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false // Disabled CSP for now to allow inline scripts/styles for React
  }));
  app.use(express.json({ limit: "50mb" })); // Increased limit to handle PDF base64 payloads

  // API routes
  app.post("/api/send-email", emailLimiter, async (req, res) => {
    try {
      const { to, subject, text, pdfAttachment } = req.body;
      
      let transporter;
      
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const mailOptions: any = {
        from: '"AI Letter Editor" <no-reply@example.com>',
        to,
        subject,
        text,
      };

      if (pdfAttachment) {
        // Assume pdfAttachment is a dataURI string: "data:application/pdf;base64,..."
        const base64Data = pdfAttachment.replace(/^data:application\/pdf;base64,/, "");
        mailOptions.attachments = [
          {
            filename: 'Letter.pdf',
            content: Buffer.from(base64Data, 'base64'),
            contentType: 'application/pdf'
          }
        ];
      }

      const info = await transporter.sendMail(mailOptions);
      console.log("Message sent: %s", info.messageId);
      
      const previewUrl = nodemailer.getTestMessageUrl(info);

      res.json({ success: true, previewUrl });
    } catch (error) {
      console.error("Email Error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post("/api/suggest-title", geminiLimiter, checkGeminiKey, async (req: any, res) => {
    try {
      const { type, subType, details, language } = req.body;
      const ai = req.ai;

      const prompt = `
أنت خبير في كتابة الخطابات. اقترح عنواناً رئيسياً (موضوع الخطاب) واحداً قاطعاً وواضحاً ومختصراً جداً للخطاب التالي.
النوع: ${type} - ${subType}
التفاصيل: ${details || 'لا توجد تفاصيل، اقترح عنواناً عاماً ومناسباً لهذا النوع.'}
اللغة: ${language === 'en' ? 'English' : 'Arabic'}

يجب أن يكون الرد هو العنوان فقط وبدون أي إضافات، ويجب أن يكون مناسباً ليسبق نص الخطاب.
`;

      const response = await safeGenerate(ai, {
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          safetySettings: SAFETY_SETTINGS,
          // @ts-ignore
          safety_settings: SAFETY_SETTINGS,
        },
      });

      res.json({ title: response.text?.trim() });
    } catch (error) {
      console.error("Suggest Title Error:", error);
      res.status(500).json({ error: "Failed to suggest title" });
    }
  });

  app.post("/api/proofread-letter", geminiLimiter, checkGeminiKey, async (req: any, res) => {
    try {
      const { text, language } = req.body;
      const ai = req.ai;

      const prompt = `
أنت خبير لغوي ومدقق نحوي.
برجاء مراجعة النص التالي وتصحيح أي أخطاء إملائية أو نحوية أو لغوية.
لغة النص: ${language === 'en' ? 'English' : 'Arabic (العربية)'}

النص:
${text}

الشروط:
1. حافظ على نفس الصياغة والمعنى، فقط قم بتصحيح الأخطاء.
2. لا تقم بإضافة أي ردود أو مقدمات، فقط قم بإرجاع النص المصحح مباشرة.
      `;

      const response = await safeGenerate(ai, {
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          safetySettings: SAFETY_SETTINGS,
          // @ts-ignore
          safety_settings: SAFETY_SETTINGS,
        },
      });

      res.json({ letter: response.text });
    } catch (error: any) {
      handleApiError(error, res, "فشل التدقيق الإملائي");
    }
  });

  app.post("/api/analyze-tone", geminiLimiter, checkGeminiKey, async (req: any, res) => {
    try {
      const { text, language } = req.body;
      const ai = req.ai;

      const prompt = `
You are an expert communications analyzer. Analyze the tone of the following letter:
"${text}"

Provide the analysis as a JSON object (no markdown formatting, no \`\`\`json block, just raw JSON) containing:
1. "toneName": A brief name of the tone in Arabic (e.g. رسمي جداً, حازم, ودّي, هادئ, اعتذاري)
2. "formalityScore": A score from 1 to 10 of how formal the letter is
3. "summary": A brief analysis in Arabic (2-3 sentences) of the strengths and weaknesses of the tone.
4. "suggestions": An array of 3 suggestions in Arabic to make the communication more professional or effective.
      `;

      const response = await safeGenerate(ai, {
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          safetySettings: SAFETY_SETTINGS,
          // @ts-ignore
          safety_settings: SAFETY_SETTINGS,
        },
      });

      let jsonStr = response.text || "{}";
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      
      res.json(JSON.parse(jsonStr));
    } catch (error: any) {
      handleApiError(error, res, "فشل تحليل النبرة");
    }
  });

  app.post("/api/polish-letter", geminiLimiter, checkGeminiKey, async (req: any, res) => {
    try {
      const { text, language } = req.body;
      const ai = req.ai;

      const prompt = `
أنت خبير صياغة رسائل وخطابات رسمية.
قم بإعادة صياغة الخطاب التالي ليكون بأعلى درجات الاحترافية والرسمية والجمال اللغوي، مع استبدال الكلمات العامية أو المتكررة بمرادفات قوية ومناسبة للمراسلات الإدارية الرسمية.
لغة الخطاب: ${language === 'en' ? 'English' : 'Arabic (العربية)'}

النص الحالي:
"${text}"

الشروط:
1. حافظ على نفس الرسالة والمعلومات الأساسية بدون تغيير أو حذف.
2. أرجع النص المصحح والمنسق مباشرة بدون أي مقدمات أو شروحات.
      `;

      const response = await safeGenerate(ai, {
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          safetySettings: SAFETY_SETTINGS,
          // @ts-ignore
          safety_settings: SAFETY_SETTINGS,
        },
      });

      res.json({ letter: response.text });
    } catch (error: any) {
      console.error("Polish Error:", error);
      res.status(500).json({ error: "Failed to polish letter" });
    }
  });

  app.post("/api/ocr", geminiLimiter, checkGeminiKey, async (req: any, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image data is required" });
      }

      const ai = req.ai;

      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid image format" });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      const prompt = "Extract all the text from this image representing a document/letter. Return ONLY the extracted text. Keep its logical paragraphs, formatting and lists. Do not add any chat explanations, markdown wraps, introduction, or conversational text. Preserve the original language (Arabic or English).";

      const response = await safeGenerate(ai, {
        model: "gemini-2.5-flash",
        contents: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          prompt
        ],
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("OCR Error:", error);
      res.status(500).json({ error: "Failed to perform OCR" });
    }
  });

  app.post("/api/generate-letter", geminiLimiter, checkGeminiKey, async (req: any, res) => {
    try {
      const { type, subType, senderName, recipientName, recipientRole, subject, details, tone, formality, language, date } = req.body;
      const ai = req.ai;

      const prompt = `
أنت خبير متمرس ومحترف في صياغة الخطابات الرسمية، الإدارية، والتجارية. 
المطلوب منك صياغة خطاب متكامل، بليغ، وذو بنية منطقية قوية، بناءً على المعطيات التالية:

[المعطيات الأساسية]
- لغة الخطاب: ${language === 'en' ? 'English' : 'Arabic (العربية الفصحى)'}
- تاريخ الخطاب: ${date || '[التاريخ]'}
- التصنيف والنوع: ${type} ${subType ? '(' + subType + ')' : ''}
- من (المرسل): ${senderName}
- إلى (المرسل إليه): ${recipientName}
- صفة/منصب المرسل إليه: ${recipientRole || 'غير محدد'}
- الموضوع الأساسي للخطاب: ${subject}
- نبرة الخطاب المطلوبة: ${tone || 'رسمية ومهنية'}
- مستوى الرسمية: ${formality || 'رسمي'}
- تفاصيل وإضافات يجب تضمينها: ${details || 'لا توجد تفاصيل إضافية. قم بتأليف محتوى مناسب ومقنع يخدم الموضوع الأساسي بدقة.'}

[شروط الصياغة والتعليمات الصارمة]
1. الهيكلة المنطقية: يجب أن يتكون الخطاب من:
   - ديباجة افتتاحية (بسملة في العربية، ثم التاريخ، ثم اسم المرسل إليه ومنصبه، ثم التحية الافتتاحية).
   - سطر الموضوع (مثال: الموضوع: ...).
   - فقرة تمهيدية (تدخل في صلب الموضوع بلباقة).
   - فقرة أو فقرات التفاصيل (شرح الموضوع أو الطلب أو القرار بناءً على التفاصيل المعطاة، بأسلوب مقنع وواضح).
   - فقرة ختامية (تطلعات، شكر وتقدير، أو دعوة لإجراء معين).
   - الخاتمة (التحية الختامية، التوقيع/اسم المرسل).
2. البلاغة واللغة: استخدام لغة عالية الدقة، خالية من الأخطاء النحوية والإملائية. إذا كانت اللغة العربية، استخدم الفصحى البليغة والمصطلحات الإدارية المعتمدة وتجنب أي ركاكة.
3. النبرة والرسمية: التزم حرفياً بمستوى الرسمية والنبرة. إذا كان "رسمي جداً"، استخدم ألقاب تفخيم (معالي، سعادة، المكرم). إذا كان "ودّي"، اجعله أكثر ليونة وتقارباً.
4. التنسيق: لا تستخدم علامات التنسيق الخاصة بـ Markdown (مثل ** أو #). استخدم فقط المسافات والأسطر الفارغة لتقسيم الفقرات بشكل نظيف ومنسق للطباعة.
5. الإخراج النهائي: لا تضف أي ردود حوارية مثل "إليك الخطاب" أو "بالتأكيد". ابدأ فوراً بكتابة النص النهائي للخطاب فقط ليكون جاهزاً للنسخ مباشرة.
      `;

      const response = await safeGenerate(ai, {
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      handleApiError(error, res, "حدث خطأ أثناء صياغة الخطاب");
    }
  });

  app.post("/api/share", shareLimiter, async (req, res) => {
    try {
      const { subject, content, branding, signatureImage, sealImage, language, password } = req.body;
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const passwordHash = password ? hashPassword(password) : undefined;
      
      if (db) {
        const docRef = doc(db, "shared_letters", token);
        await setDoc(docRef, {
          subject,
          content,
          branding,
          signatureImage,
          sealImage,
          language,
          passwordHash: passwordHash || null,
          createdAt: Date.now()
        });
      } else {
        // Fallback to local memory if Firebase is not configured
        console.warn("Firebase not configured, falling back to temporary in-memory map");
        (global as any).fallbackSharedLetters = (global as any).fallbackSharedLetters || new Map();
        (global as any).fallbackSharedLetters.set(token, {
          subject,
          content,
          branding,
          signatureImage,
          sealImage,
          language,
          passwordHash: passwordHash || null,
          createdAt: Date.now()
        });
      }

      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol;
      res.json({ token, url: `${protocol}://${host}/share/${token}`, hasPassword: !!password });
    } catch (err) {
      console.error("Share Error:", err);
      res.status(500).json({ error: "Failed to create share link" });
    }
  });

  app.get("/share/:token", async (req, res) => {
    const { token } = req.params;
    let letter: any = null;

    if (db) {
      try {
        const docRef = doc(db, "shared_letters", token);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          letter = docSnap.data();
        }
      } catch (err) {
        console.error("Error reading from Firestore:", err);
      }
    } else {
      const fallbackMap = (global as any).fallbackSharedLetters;
      if (fallbackMap) {
        letter = fallbackMap.get(token);
      }
    }

    if (!letter || (letter.createdAt && Date.now() - letter.createdAt > 24 * 60 * 60 * 1000)) {
      return res.status(404).send(`
        <html dir="rtl">
        <head>
          <title>خطأ - الرابط غير صالح</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Cairo', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f7f3f0; margin: 0; }
            .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(67,48,43,0.1); border: 2px solid #f2e8e5; text-align: center; max-width: 450px; width: 90%; }
            h1 { color: #846358; font-size: 22px; margin-bottom: 12px; }
            p { color: #5a4b47; font-size: 14px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>رابط غير صالح أو منتهي الصلاحية</h1>
            <p>عذراً، هذا الخطاب غير متوفر، أو تم حذفه، أو قد يكون انتهى وقت صلاحيته المؤقتة (24 ساعة).</p>
          </div>
        </body>
        </html>
      `);
    }

    const { password } = req.query;
    if (letter.passwordHash && (!password || !verifyPassword(password as string, letter.passwordHash))) {
      return res.send(`
        <html dir="rtl">
        <head>
          <title>خطاب محمي بكلمة مرور</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Cairo', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f7f3f0; margin: 0; }
            .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(67,48,43,0.1); border: 2px solid #f2e8e5; text-align: center; max-width: 400px; width: 90%; }
            h1 { color: #43302b; font-size: 22px; margin-bottom: 10px; }
            p { color: #6b5a55; font-size: 13px; margin-bottom: 24px; line-height: 1.6; }
            input { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 8px; border: 1px solid #eaddd7; margin-bottom: 15px; text-align: center; font-size: 14px; outline: none; }
            input:focus { border-color: #a18072; }
            button { width: 100%; padding: 12px; background: #a18072; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; transition: background 0.2s; }
            button:hover { background: #846358; }
            .error { color: #dc2626; font-size: 13px; margin-top: -10px; margin-bottom: 15px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>خطاب رسمي محمي</h1>
            <p>هذا الخطاب محمي بكلمة مرور لحماية البيانات الحساسة. يرجى إدخال كلمة المرور المصاحبة للخطاب لفتحه.</p>
            <form method="GET">
              <input type="password" name="password" placeholder="أدخل كلمة المرور" required />
              ${password ? '<div class="error">\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629\u060c \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b</div>' : ''}
              <button type="submit">\u0641\u062a\u062d \u0627\u0644\u062e\u0637\u0627\u0628 \u0648\u0645\u0639\u0627\u064a\u0646\u062a\u0647</button>
            </form>
          </div>
        </body>
        </html>
      `);
    }

    const dir = letter.language === 'en' ? 'ltr' : 'rtl';
    const textAlignment = letter.language === 'en' ? 'left' : 'right';
    
    const safeLogoUrl = letter.branding.logoUrl &&
      (letter.branding.logoUrl.startsWith('data:image/') ||
       letter.branding.logoUrl.startsWith('https://') ||
       letter.branding.logoUrl.startsWith('http://'))
      ? esc(letter.branding.logoUrl) : '';

    const brandingHeader = (letter.branding.enableHeader) ? `
      <div style="border-bottom: 2px solid #eaddd7; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; direction: ${dir};">
        <div style="text-align: ${textAlignment};">
          <h3 style="margin: 0; color: #43302b; font-size: 18px;">${esc(letter.branding.companyName)}</h3>
          <p style="margin: 5px 0 0 0; color: #846358; font-size: 12px; white-space: pre-line;">${esc(letter.branding.companyDetails)}</p>
        </div>
        ${safeLogoUrl ? '<img src="' + safeLogoUrl + '" style="max-height: 60px; max-width: 120px; object-fit: contain;" />' : ''}
      </div>
    ` : '';

    const brandingFooter = (letter.branding.enableFooter) ? `
      <div style="border-top: 1px solid #f2e8e5; padding-top: 15px; margin-top: 40px; text-align: center; color: #846358; font-size: 12px;">
        ${esc(letter.branding.footerText)}
      </div>
    ` : '';

    const safeSignature = letter.signatureImage &&
      (letter.signatureImage.startsWith('data:image/') || letter.signatureImage.startsWith('https://') || letter.signatureImage.startsWith('http://'))
      ? esc(letter.signatureImage) : '';
    const safeSeal = letter.sealImage &&
      (letter.sealImage.startsWith('data:image/') || letter.sealImage.startsWith('https://') || letter.sealImage.startsWith('http://'))
      ? esc(letter.sealImage) : '';

    const signatures = (safeSignature || safeSeal) ? `
      <div style="margin-top: 40px; display: flex; justify-content: ${letter.language === 'en' ? 'flex-start' : 'flex-end'};">
        <div style="text-align: center;">
          <p style="font-size: 12px; font-weight: bold; color: #43302b; margin-bottom: 10px;">التوقيع والختم:</p>
          <div style="display: flex; gap: 15px; align-items: center; justify-content: center;">
            ${safeSignature ? '<img src="' + safeSignature + '" style="max-height: 60px; max-width: 100px; object-fit: contain;" />' : ''}
            ${safeSeal ? '<img src="' + safeSeal + '" style="max-height: 60px; max-width: 80px; object-fit: contain;" />' : ''}
          </div>
        </div>
      </div>
    ` : '';

    res.send(`
      <html>
      <head>
        <title>معاينة الخطاب: ${esc(letter.subject)}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Amiri&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cairo', sans-serif; background-color: #f7f3f0; margin: 0; padding: 40px 20px; direction: ${dir}; }
          .container { max-width: 800px; margin: 0 auto; }
          .paper { background: white; padding: 50px; border-radius: 16px; box-shadow: 0 10px 30px rgba(67,48,43,0.08); border: 1px solid #eaddd7; min-height: 600px; display: flex; flex-direction: column; justify-content: space-between; }
          .content { flex-grow: 1; font-family: 'Amiri', serif; font-size: 18px; line-height: 1.8; color: #2d201c; white-space: pre-line; text-align: ${textAlignment}; }
          h2 { text-align: center; color: #43302b; margin-bottom: 30px; font-size: 22px; }
          .actions { max-width: 800px; margin: 20px auto 0 auto; display: flex; justify-content: center; gap: 15px; }
          .btn { padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; cursor: pointer; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
          .btn-primary { background: #a18072; color: white; }
          .btn-primary:hover { background: #846358; }
          .btn-secondary { background: #f2e8e5; color: #43302b; }
          .btn-secondary:hover { background: #eaddd7; }
          @media print {
            body { padding: 0; background-color: white; }
            .paper { box-shadow: none; border: none; padding: 0; }
            .actions { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="paper">
            <div>
              ${brandingHeader}
              <h2>${esc(letter.subject)}</h2>
              <div class="content">${esc(letter.content)}</div>
            </div>
            <div>
              ${signatures}
              ${brandingFooter}
            </div>
          </div>
          <div class="actions">
            <button class="btn btn-primary" onclick="window.print()">طباعة الخطاب (PDF)</button>
            <a href="/" class="btn btn-secondary">أنشئ خطابك الخاص</a>
          </div>
        </div>
      </body>
      </html>
    `);
  });

async function configureStaticAndListen() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  configureStaticAndListen();
}

export default app;
