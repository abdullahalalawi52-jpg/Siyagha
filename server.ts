import express from "express";
import path from "path";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import helmet from "helmet";
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
      // Skip sleeping/retrying on Vercel serverless environment to prevent function timeout
      if (isRateLimit && attempt < maxRetries && !process.env.VERCEL) {
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
  const errorDetails = error.message || String(error);
  res.status(500).json({ error: `${defaultMessage}: ${errorDetails}` });
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

const isFirebaseConfigured = !!firebaseConfig.projectId;
if (isFirebaseConfigured) {
  console.log("Firebase Firestore REST API configured on the server");
} else {
  console.warn("VITE_FIREBASE_PROJECT_ID is missing. Firestore sharing is disabled.");
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

  // CORS Middleware to allow requests from frontend domains like GitHub Pages
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

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
    } catch (error: any) {
      console.error("Email Error:", error);
      res.status(500).json({ error: `Failed to send email: ${error.message || error}` });
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
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
          safetySettings: SAFETY_SETTINGS,
          // @ts-ignore
          safety_settings: SAFETY_SETTINGS,
        },
      });

      res.json({ title: response.text?.trim() });
    } catch (error: any) {
      handleApiError(error, res, "فشل اقتراح العنوان");
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
        model: "gemini-flash-lite-latest",
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
        model: "gemini-flash-lite-latest",
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

  app.post("/api/analyze-ats", geminiLimiter, checkGeminiKey, async (req: any, res) => {
    try {
      const { text, jobDescription } = req.body;
      if (!text || !jobDescription) {
        return res.status(400).json({ error: "خطاب التقديم والوصف الوظيفي مطلوبان للتحليل" });
      }
      const ai = req.ai;

      const prompt = `
You are an expert ATS (Applicant Tracking System) recruiter and scanner.
Analyze the following candidate's cover letter/application against the job description:

Job Description:
"""
${jobDescription}
"""

Candidate's Cover Letter:
"""
${text}
"""

Evaluate the match and provide the analysis as a JSON object (no markdown formatting, no \`\`\`json block, just raw JSON) containing:
1. "matchScore": A percentage score (number between 0 and 100) representing how well the letter matches the job requirements.
2. "matchedKeywords": An array of important keywords/skills found in the job description that ARE present in the letter.
3. "missingKeywords": An array of important keywords/skills found in the job description that ARE MISSING from the letter.
4. "summary": A brief analysis in Arabic (2-3 sentences) of how well the letter represents the candidate's fit.
5. "suggestions": An array of 3 actionable suggestions in Arabic to optimize this letter for ATS scanners and increase the match score.
`;

      const response = await safeGenerate(ai, {
        model: "gemini-flash-lite-latest",
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
      handleApiError(error, res, "فشل تحليل مطابقة ATS");
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
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
          safetySettings: SAFETY_SETTINGS,
          // @ts-ignore
          safety_settings: SAFETY_SETTINGS,
        },
      });

      res.json({ letter: response.text });
    } catch (error: any) {
      handleApiError(error, res, "فشل تحسين صياغة الخطاب");
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
        model: "gemini-flash-lite-latest",
        contents: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          prompt
        ],
      });

      res.json({ text: response.text });
    } catch (error: any) {
      handleApiError(error, res, "فشل استخراج النصوص من الصورة");
    }
  });

  app.post("/api/analyze-style", geminiLimiter, checkGeminiKey, async (req: any, res) => {
    try {
      const { samples } = req.body;
      if (!samples || !Array.isArray(samples) || samples.length === 0) {
        return res.status(400).json({ error: "Samples are required" });
      }

      const ai = req.ai;
      const combinedSamples = samples.map((s, i) => `نموذج ${i + 1}:\n"""\n${s}\n"""`).join("\n\n");
      const prompt = `
أنت خبير لغوي متخصص في تحليل أساليب الكتابة العربية والإنجليزية.
قم بتحليل النماذج التالية من خطابات المستخدم واستخلص "بصمة أسلوبه اللغوي" (خصائصه الكتابية المكررة).

النماذج:
${combinedSamples}

الشروط والتعليمات:
1. صِف الخصائص الأسلوبية اللغوية بدقة (طول الجمل، نوعية المفردات المستخدمة، طريقة البدء والترحيب، أسلوب الختام، مستوى المباشرة أو التفصيل، علامات الترقيم، والنبرة العامة).
2. اكتب الوصف باللغة العربية بأسلوب مقتضب ومباشر في فقرة واحدة أو فقرتين (بحد أقصى 120 كلمة).
3. أرجع الوصف النهائي مباشرة وبدون أي مقدمات أو هوامش أو علامات تنسيق Markdown (مثل ** أو #).
`;

      const response = await safeGenerate(ai, {
        model: "gemini-flash-lite-latest",
        contents: prompt,
      });

      res.json({ styleProfile: response.text?.trim() });
    } catch (error: any) {
      handleApiError(error, res, "فشل تحليل بصمة الأسلوب");
    }
  });

  app.post("/api/generate-letter", geminiLimiter, checkGeminiKey, async (req: any, res) => {
    try {
      const { 
        type, subType, senderName, senderPhone, senderEmail, recipientName, recipientRole, 
        subject, details, tone, formality, language, date,
        brandVoiceProfile, replyToText, replyStance,
        jobDescription, resumeInfo
      } = req.body;
      const ai = req.ai;

      // Define Few-Shot Examples for Arabic
      const fewShotExamplesAr = `
[أمثلة للخطابات الرسمية الممتازة للمحاكاة]

مثال 1: خطاب طلب رسمي
بسم الله الرحمن الرحيم
التاريخ: 26 يونيو 2026

سعادة مدير عام الشركة المحترم،
السلام عليكم ورحمة الله وبركاته،

الموضوع: طلب توفير رخص برمجية إضافية لقسم التطوير

أهدي سعادتكم أطيب التحيات، متمنياً لكم دوام التوفيق والنجاح في أعمالكم.

بالإشارة إلى حاجة قسم التطوير والابتكار البرمجي الحالية لتسريع وتيرة العمل على منصة "صياغة"، نود إحاطة سعادتكم علماً بأننا نمر بمرحلة توسع وتعيين مهندسين جدد. وبناءً عليه، نتقدم لطلب الموافقة على شراء وتوفير خمس رخص إضافية لبيئات التطوير البرمجية.

إن توفير هذه الرخص سيساهم بشكل مباشر في تمكين المهندسين الجدد من بدء مهامهم فوراً وضمان عدم تأخر المشاريع المجدولة لهذا الربع. مرفق مع هذا الطلب قائمة بالأسماء والتكلفة التقديرية للرخص المطلوبة للاطلاع عليها.

شاكرين ومقدرين لسعادتكم حسن تعاونكم الدائم ودعمكم المستمر لفرق العمل.

وتقبلوا فائق الاحترام والتقدير،

المرسل: أحمد الحربي (رئيس قسم التطوير)
البريد الإلكتروني: a.harbi@example.com
الهاتف: 0500000000

---

مثال 2: خطاب إشعار أو إقرار إداري
بسم الله الرحمن الرحيم
التاريخ: 26 يونيو 2026

سعادة رئيس مجلس الإدارة المحترم،
السلام عليكم ورحمة الله وبركاته،

الموضوع: إشعار بانتهاء المرحلة الأولى من مشروع صياغة

تهديكم إدارة المشاريع أطيب تحياتها، وتتمنى لكم وافر الصحة والعافية.

يسرنا إشعار سعادتكم بانتهاء كافة أعمال البناء والاختبار الخاصة بالمرحلة الأولى لمشروع "منصة صياغة للخطابات الرسمية" في الوقت المحدد ووفق الميزانية المرصودة.

وقد شملت هذه المرحلة تهيئة السياقات الأساسية للتطبيق وإعادة تصميم شريط أدوات المعاينة وحل مشاكل تباين الألوان في الهيدر، وتم فحص كافة الوظائف لتعمل بنجاح تام وبأعلى معايير الأمان وتجربة المستخدم.

نتطلع لتعيين موعد قريب لتقديم عرض توضيحي حي لسعادتكم وأعضاء المجلس لاستعراض النتائج ومناقشة خطة إطلاق المرحلة الثانية.

شاكرين لكم توجيهاتكم السديدة ومتابعتكم المستمرة التي كانت الركيزة الأساسية لهذا النجاح.

وتفضلوا بقبول خالص التحية والتقدير،

المرسل: سارة العتيبي (مديرة إدارة المشاريع)
البريد الإلكتروني: s.otaibi@example.com
`;

      // Define Few-Shot Examples for English
      const fewShotExamplesEn = `
[Examples of High-Quality English Official Letters for Simulation]

Example 1: Official Request Letter
Date: June 26, 2026

To: The Director General of the Company,
Dear Sir,

Subject: Request for Additional Software Licenses for the Development Team

I hope this letter finds you well. I would like to express my appreciation for your continuous support of our department.

With reference to the current expansion of the Software Development and Innovation department, we would like to inform you that we are hiring new engineers. Consequently, we kindly request your approval for the procurement of five additional development software licenses.

Acquiring these licenses will directly enable the new team members to initiate their tasks immediately, ensuring all projects remain on schedule for this quarter. Attached is the list of candidates along with the estimated cost details for your review.

Thank you for your prompt attention to this matter and for your ongoing cooperation.

Sincerely,

Sender: Ahmad Al-Harbi (Head of Development)
Email: a.harbi@example.com
Phone: 0500000000
`;

      const fewShotExamples = language === 'en' ? fewShotExamplesEn : fewShotExamplesAr;

      let customStylePrompt = "";
      if (brandVoiceProfile) {
        customStylePrompt = `
[بصمة الأسلوب اللغوي المطلوب محاكاتها]
يجب كتابة الخطاب بالكامل باتباع الخصائص اللغوية ونبرة وصياغة وبنية الجمل التالية بدقة:
"${brandVoiceProfile}"
تأكد من مطابقة هذا الأسلوب قدر الإمكان في المفردات وطول الجمل والترحيب والخاتمة.
`;
      }

      let contentPrompt = "";
      if (replyToText) {
        let stanceText = "";
        if (replyStance === 'approval') stanceText = language === 'en' ? 'Approval / Acceptance' : 'الموافقة والقبول التام';
        else if (replyStance === 'rejection') stanceText = language === 'en' ? 'Rejection / Decline' : 'الرفض والاعتذار بلباقة';
        else if (replyStance === 'more_info') stanceText = language === 'en' ? 'Request for more information / clarification' : 'طلب معلومات أو تفاصيل إضافية أو توضيح';
        else if (replyStance === 'thanks') stanceText = language === 'en' ? 'Thanks & Appreciation' : 'الشكر والتقدير والامتنان';
        else if (replyStance === 'clarification') stanceText = language === 'en' ? 'Clarification / Inquiry' : 'التوضيح والرد على الاستفسارات';
        else stanceText = replyStance || (language === 'en' ? 'Formal Reply' : 'رد رسمي ملائم');

        contentPrompt = `
[الخطاب الوارد المطلوب الرد عليه]
"${replyToText}"

[موقف الرد المطلوب اتخاذه]
موقفك من الخطاب الوارد هو: ${stanceText}

[تفاصيل وملاحظات إضافية للرد]
${details || 'صياغة رد إداري رسمي مناسب متكامل يتناول النقاط المذكورة بالخطاب الوارد.'}

المطلوب: صياغة خطاب رد رسمي واحترافي يوجه إلى المرسل الأصلي للخطاب الوارد (أو الجهة الوارد منها)، بحيث يجيب على النقاط الرئيسية للرسالة الواردة بلباقة واحترافية وبناءً على التفاصيل وموقف الرد المحدد.
`;
      } else {
        contentPrompt = `
- الموضوع الأساسي للخطاب: ${subject}
- تفاصيل وإضافات يجب تضمينها: ${details || 'لا توجد تفاصيل إضافية. قم بتأليف محتوى مناسب ومقنع يخدم الموضوع الأساسي بدقة.'}
`;
        if (type === 'توظيف وتطوير مهني' || jobDescription || resumeInfo) {
          contentPrompt += `
[سياق التقديم على وظيفة (Career Context)]
- وصف الوظيفة المستهدفة (Job Description):
"""
${jobDescription || ''}
"""
- السيرة الذاتية / مهارات وخبرات المتقدم (Resume/Bio):
"""
${resumeInfo || ''}
"""

تعليمات الصياغة المهنية:
عند صياغة الخطاب، قم بمطابقة خبرات المتقدم وسيرته الذاتية بذكاء وإقناع مع متطلبات الوصف الوظيفي، مع إبراز نقاط القوة المناسبة وكيف يمكن للمتقدم تقديم قيمة مضافة للجهة الموظفة.
`;
        }
      }

      const prompt = `
أنت خبير متمرس ومحترف في صياغة الخطابات الرسمية، الإدارية، والتجارية. 
المطلوب منك صياغة خطاب متكامل، بليغ، وذو بنية منطقية قوية، بناءً على المعطيات التالية:

[المعطيات الأساسية]
- لغة الخطاب: ${language === 'en' ? 'English' : 'Arabic (العربية الفصحى)'}
- تاريخ الخطاب: ${date || '[التاريخ]'}
- التصنيف والنوع: ${type} ${subType ? '(' + subType + ')' : ''}
- من (المرسل): ${senderName}${senderPhone ? ' (رقم الهاتف: ' + senderPhone + ')' : ''}${senderEmail ? ' (البريد الإلكتروني: ' + senderEmail + ')' : ''}
- إلى (المرسل إليه): ${recipientName}
- صفة/منصب المرسل إليه: ${recipientRole || 'غير محدد'}
- نبرة الخطاب المطلوبة: ${tone || 'رسمية ومهنية'}
- مستوى الرسمية: ${formality || 'رسمي'}

${contentPrompt}

${customStylePrompt}

${fewShotExamples}

[شروط الصياغة والتعليمات الصارمة]
1. الهيكلة المنطقية: يجب أن يتكون الخطاب من:
   - ديباجة افتتاحية (بسملة في العربية، ثم التاريخ، ثم اسم المرسل إليه ومنصبه، ثم التحية الافتتاحية).
   - سطر الموضوع (مثال: الموضوع: ...).
   - فقرة تمهيدية (تدخل في صلب الموضوع بلباقة).
   - فقرة أو فقرات التفاصيل (شرح الموضوع أو الطلب أو القرار بناءً على التفاصيل ومحتوى الخطاب، بأسلوب مقنع وواضح).
   - فقرة ختامية (تطلعات، شكر وتقدير، أو دعوة لإجراء معين).
   - الخاتمة (التحية الختامية، التوقيع/اسم المرسل، وتفاصيل الاتصال مثل الهاتف أو البريد الإلكتروني تحت اسم المرسل مباشرة في حال توفرها بشكل أنيق ومناسب للمراسلات).
2. البلاغة واللغة: استخدام لغة عالية الدقة، خالية من الأخطاء النحوية والإملائية. إذا كانت اللغة العربية، استخدم الفصحى البليغة والمصطلحات الإدارية المعتمدة وتجنب أي ركاكة.
3. النبرة والرسمية: التزم حرفياً بمستوى الرسمية والنبرة. إذا كان "رسمي جداً"، استخدم ألقاب تفخيم (معالي، سعادة، المكرم). إذا كان "ودّي"، اجعله أكثر ليونة وتقارباً.
4. التنسيق: لا تستخدم علامات التنسيق الخاصة بـ Markdown (مثل ** أو #). استخدم فقط المسافات والأسطر الفارغة لتقسيم الفقرات بشكل نظيف ومنسق للطباعة.
5. الإخراج النهائي: لا تضف أي ردود حوارية مثل "إليك الخطاب" أو "بالتأكيد". ابدأ فوراً بكتابة النص النهائي للخطاب فقط ليكون جاهزاً للنسخ مباشرة.
      `;

      // Step 1: Generate initial letter draft
      const response = await safeGenerate(ai, {
        model: "gemini-flash-lite-latest",
        contents: prompt,
      });

      const generatedText = response.text || "";

      // Step 2: Self-Correction/Verification Step (Fast grammar and spelling check)
      const correctionPrompt = `
أنت مدقق لغوي خبير متخصص في المراسلات الإدارية الرسمية.
قم بمراجعة وتصحيح الخطاب التالي للتأكد من خلوه تماماً من أي أخطاء إملائية، نحوية، أو لغوية.

[تعليمات التدقيق الصارمة]
1. ركز بشكل خاص في اللغة العربية على:
   - التفريق الصحيح بين همزة الوصل وهمزة القطع (مثل: استخدام "إنشاء" بدلاً من "انشاء"، و"إعداد" بدلاً من "اعداد"، و"استعلام" بدلاً من "إستعلام"، و"اتخاذ" بدلاً من "إتخاذ").
   - الاستخدام الصحيح للياء والألف المقصورة (مثل: "علي" كحرف جر تُكتب "على"، و"في" تُكتب "في").
   - التفريق الصحيح بين التاء المربوطة والهاء (مثل: "كتابة" بالتاء المربوطة، و"توجه" بالهاء).
2. حافظ على هيكل الخطاب بالكامل، ونبرته، ومضمونه، ومعلوماته الحساسة دون أي تغيير أو حذف.
3. أرجع النص المصحح والمنسق مباشرة بدون أي مقدمات أو شروحات أو علامات تنسيق Markdown (لا تستخدم ** أو #).

النص المراد تدقيقه:
"${generatedText}"
      `;

      const correctedResponse = await safeGenerate(ai, {
        model: "gemini-flash-lite-latest",
        contents: correctionPrompt,
      });

      res.json({ text: correctedResponse.text || generatedText });
    } catch (error: any) {
      handleApiError(error, res, "حدث خطأ أثناء صياغة الخطاب");
    }
  });

  app.post("/api/share", shareLimiter, async (req, res) => {
    try {
      const { subject, content, branding, signatureImage, sealImage, language, password } = req.body;
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const passwordHash = password ? hashPassword(password) : undefined;
      
      if (isFirebaseConfigured) {
        const projectId = firebaseConfig.projectId;
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/shared_letters/${token}`;
        
        const docData = {
          fields: {
            subject: { stringValue: subject || "" },
            content: { stringValue: content || "" },
            branding: {
              mapValue: {
                fields: {
                  enableHeader: { booleanValue: !!branding?.enableHeader },
                  theme: { stringValue: branding?.theme || "classic" },
                  companyName: { stringValue: branding?.companyName || "" },
                  companyDetails: { stringValue: branding?.companyDetails || "" },
                  logoUrl: { stringValue: branding?.logoUrl || "" },
                  enableFooter: { booleanValue: !!branding?.enableFooter },
                  footerText: { stringValue: branding?.footerText || "" }
                }
              }
            },
            signatureImage: { stringValue: signatureImage || "" },
            sealImage: { stringValue: sealImage || "" },
            language: { stringValue: language || "ar" },
            passwordHash: passwordHash ? { stringValue: passwordHash } : { nullValue: null },
            createdAt: { integerValue: String(Date.now()) }
          }
        };

        const fsResponse = await fetch(firestoreUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(docData)
        });

        if (!fsResponse.ok) {
          const errText = await fsResponse.text();
          throw new Error(`Firestore REST Write Error: ${errText}`);
        }
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
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      res.json({ token, url: `${protocol}://${host}/share/${token}`, hasPassword: !!password });
    } catch (err: any) {
      console.error("Share Error:", err);
      res.status(500).json({ error: `Failed to create share link: ${err.message || err}` });
    }
  });

  app.get("/share/:token", async (req, res) => {
    const { token } = req.params;
    let letter: any = null;

    if (isFirebaseConfigured) {
      try {
        const projectId = firebaseConfig.projectId;
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/shared_letters/${token}`;
        const fsResponse = await fetch(firestoreUrl);
        if (fsResponse.ok) {
          const docData = await fsResponse.json();
          const fields = docData.fields || {};
          letter = {
            subject: fields.subject?.stringValue || "",
            content: fields.content?.stringValue || "",
            branding: {
              enableHeader: fields.branding?.mapValue?.fields?.enableHeader?.booleanValue || false,
              theme: fields.branding?.mapValue?.fields?.theme?.stringValue || "classic",
              companyName: fields.branding?.mapValue?.fields?.companyName?.stringValue || "",
              companyDetails: fields.branding?.mapValue?.fields?.companyDetails?.stringValue || "",
              logoUrl: fields.branding?.mapValue?.fields?.logoUrl?.stringValue || "",
              enableFooter: fields.branding?.mapValue?.fields?.enableFooter?.booleanValue || false,
              footerText: fields.branding?.mapValue?.fields?.footerText?.stringValue || ""
            },
            signatureImage: fields.signatureImage?.stringValue || "",
            sealImage: fields.sealImage?.stringValue || "",
            language: fields.language?.stringValue || "ar",
            passwordHash: fields.passwordHash?.stringValue || null,
            createdAt: fields.createdAt?.integerValue ? Number(fields.createdAt.integerValue) : null
          };
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
