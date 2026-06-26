var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_crypto = __toESM(require("crypto"), 1);
import_dotenv.default.config();
var SAFETY_SETTINGS = [
  { category: import_genai.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: import_genai.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: import_genai.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: import_genai.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: import_genai.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: import_genai.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: import_genai.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: import_genai.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
];
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var safeGenerate = async (ai, params, maxRetries = 2) => {
  let attempt = 0;
  while (true) {
    try {
      return await ai.models.generateContent({
        model: params.model,
        contents: params.contents,
        config: {
          safetySettings: SAFETY_SETTINGS,
          ...params.config || {}
        }
      });
    } catch (error) {
      const isRateLimit = error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota") || error.message?.includes("RESOURCE_EXHAUSTED");
      if (isRateLimit && attempt < maxRetries && !process.env.VERCEL) {
        attempt++;
        console.warn(`[Rate Limit] Waiting 12 seconds to retry (Attempt ${attempt}/${maxRetries})...`);
        await sleep(12e3);
        continue;
      }
      throw error;
    }
  }
};
var esc = (s) => {
  if (s == null)
    return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};
var handleApiError = (error, res, defaultMessage) => {
  console.error(defaultMessage, error.message || error);
  if (error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota") || error.message?.includes("RESOURCE_EXHAUSTED")) {
    return res.status(429).json({ error: "\u0644\u0642\u062F \u0648\u0635\u0644\u062A \u0644\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629 \u0641\u064A \u0627\u0644\u062F\u0642\u064A\u0642\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 10 \u062B\u0648\u0627\u0646\u064D \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B." });
  }
  const errorDetails = error.message || String(error);
  res.status(500).json({ error: `${defaultMessage}: ${errorDetails}` });
};
var ipCache = /* @__PURE__ */ new Map();
var rateLimiter = (options) => {
  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "unknown";
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
var geminiLimiter = rateLimiter({
  windowMs: 60 * 1e3,
  max: 30,
  message: "\u0644\u0642\u062F \u062A\u062C\u0627\u0648\u0632\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0645\u0646 \u0627\u0644\u0637\u0644\u0628\u0627\u062A (30 \u0637\u0644\u0628 \u0641\u064A \u0627\u0644\u062F\u0642\u064A\u0642\u0629). \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B."
});
var emailLimiter = rateLimiter({
  windowMs: 60 * 1e3,
  max: 3,
  message: "\u0644\u0642\u062F \u062A\u062C\u0627\u0648\u0632\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0644\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 (3 \u0631\u0633\u0627\u0626\u0644 \u0641\u064A \u0627\u0644\u062F\u0642\u064A\u0642\u0629). \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B."
});
var shareLimiter = rateLimiter({
  windowMs: 60 * 1e3,
  max: 10,
  message: "\u0644\u0642\u062F \u062A\u062C\u0627\u0648\u0632\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0644\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 (10 \u0631\u0648\u0627\u0628\u0637 \u0641\u064A \u0627\u0644\u062F\u0642\u064A\u0642\u0629). \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B."
});
var app = (0, import_express.default)();
var PORT = process.env.PORT || 3e3;
var firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};
var isFirebaseConfigured = !!firebaseConfig.projectId;
if (isFirebaseConfigured) {
  console.log("Firebase Firestore REST API configured on the server");
} else {
  console.warn("VITE_FIREBASE_PROJECT_ID is missing. Firestore sharing is disabled.");
}
var hashPassword = (password) => {
  const salt = import_crypto.default.randomBytes(16).toString("hex");
  const hash = import_crypto.default.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};
var verifyPassword = (password, storedHash) => {
  const parts = storedHash.split(":");
  if (parts.length !== 2)
    return storedHash === password;
  const [salt, hash] = parts;
  const checkHash = import_crypto.default.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
  return hash === checkHash;
};
var checkGeminiKey = (req, res, next) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key is not configured" });
  }
  req.ai = new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } }
  });
  next();
};
app.use((0, import_helmet.default)({
  contentSecurityPolicy: false
  // Disabled CSP for now to allow inline scripts/styles for React
}));
app.use(import_express.default.json({ limit: "50mb" }));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.post("/api/send-email", emailLimiter, async (req, res) => {
  try {
    const { to, subject, text, pdfAttachment } = req.body;
    let transporter;
    const testAccount = await import_nodemailer.default.createTestAccount();
    transporter = import_nodemailer.default.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    const mailOptions = {
      from: '"AI Letter Editor" <no-reply@example.com>',
      to,
      subject,
      text
    };
    if (pdfAttachment) {
      const base64Data = pdfAttachment.replace(/^data:application\/pdf;base64,/, "");
      mailOptions.attachments = [
        {
          filename: "Letter.pdf",
          content: Buffer.from(base64Data, "base64"),
          contentType: "application/pdf"
        }
      ];
    }
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    const previewUrl = import_nodemailer.default.getTestMessageUrl(info);
    res.json({ success: true, previewUrl });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ error: `Failed to send email: ${error.message || error}` });
  }
});
app.post("/api/suggest-title", geminiLimiter, checkGeminiKey, async (req, res) => {
  try {
    const { type, subType, details, language } = req.body;
    const ai = req.ai;
    const prompt = `
\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0641\u064A \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u062E\u0637\u0627\u0628\u0627\u062A. \u0627\u0642\u062A\u0631\u062D \u0639\u0646\u0648\u0627\u0646\u0627\u064B \u0631\u0626\u064A\u0633\u064A\u0627\u064B (\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u062E\u0637\u0627\u0628) \u0648\u0627\u062D\u062F\u0627\u064B \u0642\u0627\u0637\u0639\u0627\u064B \u0648\u0648\u0627\u0636\u062D\u0627\u064B \u0648\u0645\u062E\u062A\u0635\u0631\u0627\u064B \u062C\u062F\u0627\u064B \u0644\u0644\u062E\u0637\u0627\u0628 \u0627\u0644\u062A\u0627\u0644\u064A.
\u0627\u0644\u0646\u0648\u0639: ${type} - ${subType}
\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644: ${details || "\u0644\u0627 \u062A\u0648\u062C\u062F \u062A\u0641\u0627\u0635\u064A\u0644\u060C \u0627\u0642\u062A\u0631\u062D \u0639\u0646\u0648\u0627\u0646\u0627\u064B \u0639\u0627\u0645\u0627\u064B \u0648\u0645\u0646\u0627\u0633\u0628\u0627\u064B \u0644\u0647\u0630\u0627 \u0627\u0644\u0646\u0648\u0639."}
\u0627\u0644\u0644\u063A\u0629: ${language === "en" ? "English" : "Arabic"}

\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0627\u0644\u0631\u062F \u0647\u0648 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0641\u0642\u0637 \u0648\u0628\u062F\u0648\u0646 \u0623\u064A \u0625\u0636\u0627\u0641\u0627\u062A\u060C \u0648\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0646\u0627\u0633\u0628\u0627\u064B \u0644\u064A\u0633\u0628\u0642 \u0646\u0635 \u0627\u0644\u062E\u0637\u0627\u0628.
`;
    const response = await safeGenerate(ai, {
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        safetySettings: SAFETY_SETTINGS,
        // @ts-ignore
        safety_settings: SAFETY_SETTINGS
      }
    });
    res.json({ title: response.text?.trim() });
  } catch (error) {
    handleApiError(error, res, "\u0641\u0634\u0644 \u0627\u0642\u062A\u0631\u0627\u062D \u0627\u0644\u0639\u0646\u0648\u0627\u0646");
  }
});
app.post("/api/proofread-letter", geminiLimiter, checkGeminiKey, async (req, res) => {
  try {
    const { text, language } = req.body;
    const ai = req.ai;
    const prompt = `
\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0644\u063A\u0648\u064A \u0648\u0645\u062F\u0642\u0642 \u0646\u062D\u0648\u064A.
\u0628\u0631\u062C\u0627\u0621 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0646\u0635 \u0627\u0644\u062A\u0627\u0644\u064A \u0648\u062A\u0635\u062D\u064A\u062D \u0623\u064A \u0623\u062E\u0637\u0627\u0621 \u0625\u0645\u0644\u0627\u0626\u064A\u0629 \u0623\u0648 \u0646\u062D\u0648\u064A\u0629 \u0623\u0648 \u0644\u063A\u0648\u064A\u0629.
\u0644\u063A\u0629 \u0627\u0644\u0646\u0635: ${language === "en" ? "English" : "Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629)"}

\u0627\u0644\u0646\u0635:
${text}

\u0627\u0644\u0634\u0631\u0648\u0637:
1. \u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0646\u0641\u0633 \u0627\u0644\u0635\u064A\u0627\u063A\u0629 \u0648\u0627\u0644\u0645\u0639\u0646\u0649\u060C \u0641\u0642\u0637 \u0642\u0645 \u0628\u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0623\u062E\u0637\u0627\u0621.
2. \u0644\u0627 \u062A\u0642\u0645 \u0628\u0625\u0636\u0627\u0641\u0629 \u0623\u064A \u0631\u062F\u0648\u062F \u0623\u0648 \u0645\u0642\u062F\u0645\u0627\u062A\u060C \u0641\u0642\u0637 \u0642\u0645 \u0628\u0625\u0631\u062C\u0627\u0639 \u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u0635\u062D\u062D \u0645\u0628\u0627\u0634\u0631\u0629.
      `;
    const response = await safeGenerate(ai, {
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        safetySettings: SAFETY_SETTINGS,
        // @ts-ignore
        safety_settings: SAFETY_SETTINGS
      }
    });
    res.json({ letter: response.text });
  } catch (error) {
    handleApiError(error, res, "\u0641\u0634\u0644 \u0627\u0644\u062A\u062F\u0642\u064A\u0642 \u0627\u0644\u0625\u0645\u0644\u0627\u0626\u064A");
  }
});
app.post("/api/analyze-tone", geminiLimiter, checkGeminiKey, async (req, res) => {
  try {
    const { text, language } = req.body;
    const ai = req.ai;
    const prompt = `
You are an expert communications analyzer. Analyze the tone of the following letter:
"${text}"

Provide the analysis as a JSON object (no markdown formatting, no \`\`\`json block, just raw JSON) containing:
1. "toneName": A brief name of the tone in Arabic (e.g. \u0631\u0633\u0645\u064A \u062C\u062F\u0627\u064B, \u062D\u0627\u0632\u0645, \u0648\u062F\u0651\u064A, \u0647\u0627\u062F\u0626, \u0627\u0639\u062A\u0630\u0627\u0631\u064A)
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
        safety_settings: SAFETY_SETTINGS
      }
    });
    let jsonStr = response.text || "{}";
    jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
    res.json(JSON.parse(jsonStr));
  } catch (error) {
    handleApiError(error, res, "\u0641\u0634\u0644 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0646\u0628\u0631\u0629");
  }
});
app.post("/api/polish-letter", geminiLimiter, checkGeminiKey, async (req, res) => {
  try {
    const { text, language } = req.body;
    const ai = req.ai;
    const prompt = `
\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0635\u064A\u0627\u063A\u0629 \u0631\u0633\u0627\u0626\u0644 \u0648\u062E\u0637\u0627\u0628\u0627\u062A \u0631\u0633\u0645\u064A\u0629.
\u0642\u0645 \u0628\u0625\u0639\u0627\u062F\u0629 \u0635\u064A\u0627\u063A\u0629 \u0627\u0644\u062E\u0637\u0627\u0628 \u0627\u0644\u062A\u0627\u0644\u064A \u0644\u064A\u0643\u0648\u0646 \u0628\u0623\u0639\u0644\u0649 \u062F\u0631\u062C\u0627\u062A \u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0648\u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0648\u0627\u0644\u062C\u0645\u0627\u0644 \u0627\u0644\u0644\u063A\u0648\u064A\u060C \u0645\u0639 \u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0639\u0627\u0645\u064A\u0629 \u0623\u0648 \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0629 \u0628\u0645\u0631\u0627\u062F\u0641\u0627\u062A \u0642\u0648\u064A\u0629 \u0648\u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0644\u0645\u0631\u0627\u0633\u0644\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0627\u0644\u0631\u0633\u0645\u064A\u0629.
\u0644\u063A\u0629 \u0627\u0644\u062E\u0637\u0627\u0628: ${language === "en" ? "English" : "Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629)"}

\u0627\u0644\u0646\u0635 \u0627\u0644\u062D\u0627\u0644\u064A:
"${text}"

\u0627\u0644\u0634\u0631\u0648\u0637:
1. \u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0646\u0641\u0633 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0648\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0628\u062F\u0648\u0646 \u062A\u063A\u064A\u064A\u0631 \u0623\u0648 \u062D\u0630\u0641.
2. \u0623\u0631\u062C\u0639 \u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u0635\u062D\u062D \u0648\u0627\u0644\u0645\u0646\u0633\u0642 \u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u062F\u0648\u0646 \u0623\u064A \u0645\u0642\u062F\u0645\u0627\u062A \u0623\u0648 \u0634\u0631\u0648\u062D\u0627\u062A.
      `;
    const response = await safeGenerate(ai, {
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        safetySettings: SAFETY_SETTINGS,
        // @ts-ignore
        safety_settings: SAFETY_SETTINGS
      }
    });
    res.json({ letter: response.text });
  } catch (error) {
    handleApiError(error, res, "\u0641\u0634\u0644 \u062A\u062D\u0633\u064A\u0646 \u0635\u064A\u0627\u063A\u0629 \u0627\u0644\u062E\u0637\u0627\u0628");
  }
});
app.post("/api/ocr", geminiLimiter, checkGeminiKey, async (req, res) => {
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
        { inlineData: { data: base64Data, mimeType } },
        prompt
      ]
    });
    res.json({ text: response.text });
  } catch (error) {
    handleApiError(error, res, "\u0641\u0634\u0644 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0646\u0635\u0648\u0635 \u0645\u0646 \u0627\u0644\u0635\u0648\u0631\u0629");
  }
});
app.post("/api/generate-letter", geminiLimiter, checkGeminiKey, async (req, res) => {
  try {
    const { type, subType, senderName, senderPhone, senderEmail, recipientName, recipientRole, subject, details, tone, formality, language, date } = req.body;
    const ai = req.ai;
    const prompt = `
\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0645\u062A\u0645\u0631\u0633 \u0648\u0645\u062D\u062A\u0631\u0641 \u0641\u064A \u0635\u064A\u0627\u063A\u0629 \u0627\u0644\u062E\u0637\u0627\u0628\u0627\u062A \u0627\u0644\u0631\u0633\u0645\u064A\u0629\u060C \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629\u060C \u0648\u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629. 
\u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0645\u0646\u0643 \u0635\u064A\u0627\u063A\u0629 \u062E\u0637\u0627\u0628 \u0645\u062A\u0643\u0627\u0645\u0644\u060C \u0628\u0644\u064A\u063A\u060C \u0648\u0630\u0648 \u0628\u0646\u064A\u0629 \u0645\u0646\u0637\u0642\u064A\u0629 \u0642\u0648\u064A\u0629\u060C \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0645\u0639\u0637\u064A\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629:

[\u0627\u0644\u0645\u0639\u0637\u064A\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629]
- \u0644\u063A\u0629 \u0627\u0644\u062E\u0637\u0627\u0628: ${language === "en" ? "English" : "Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649)"}
- \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062E\u0637\u0627\u0628: ${date || "[\u0627\u0644\u062A\u0627\u0631\u064A\u062E]"}
- \u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0648\u0627\u0644\u0646\u0648\u0639: ${type} ${subType ? "(" + subType + ")" : ""}
- \u0645\u0646 (\u0627\u0644\u0645\u0631\u0633\u0644): ${senderName}${senderPhone ? " (\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641: " + senderPhone + ")" : ""}${senderEmail ? " (\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: " + senderEmail + ")" : ""}
- \u0625\u0644\u0649 (\u0627\u0644\u0645\u0631\u0633\u0644 \u0625\u0644\u064A\u0647): ${recipientName}
- \u0635\u0641\u0629/\u0645\u0646\u0635\u0628 \u0627\u0644\u0645\u0631\u0633\u0644 \u0625\u0644\u064A\u0647: ${recipientRole || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}
- \u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0623\u0633\u0627\u0633\u064A \u0644\u0644\u062E\u0637\u0627\u0628: ${subject}
- \u0646\u0628\u0631\u0629 \u0627\u0644\u062E\u0637\u0627\u0628 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629: ${tone || "\u0631\u0633\u0645\u064A\u0629 \u0648\u0645\u0647\u0646\u064A\u0629"}
- \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0631\u0633\u0645\u064A\u0629: ${formality || "\u0631\u0633\u0645\u064A"}
- \u062A\u0641\u0627\u0635\u064A\u0644 \u0648\u0625\u0636\u0627\u0641\u0627\u062A \u064A\u062C\u0628 \u062A\u0636\u0645\u064A\u0646\u0647\u0627: ${details || "\u0644\u0627 \u062A\u0648\u062C\u062F \u062A\u0641\u0627\u0635\u064A\u0644 \u0625\u0636\u0627\u0641\u064A\u0629. \u0642\u0645 \u0628\u062A\u0623\u0644\u064A\u0641 \u0645\u062D\u062A\u0648\u0649 \u0645\u0646\u0627\u0633\u0628 \u0648\u0645\u0642\u0646\u0639 \u064A\u062E\u062F\u0645 \u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0623\u0633\u0627\u0633\u064A \u0628\u062F\u0642\u0629."}

[\u0634\u0631\u0648\u0637 \u0627\u0644\u0635\u064A\u0627\u063A\u0629 \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0627\u0644\u0635\u0627\u0631\u0645\u0629]
1. \u0627\u0644\u0647\u064A\u0643\u0644\u0629 \u0627\u0644\u0645\u0646\u0637\u0642\u064A\u0629: \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0643\u0648\u0646 \u0627\u0644\u062E\u0637\u0627\u0628 \u0645\u0646:
   - \u062F\u064A\u0628\u0627\u062C\u0629 \u0627\u0641\u062A\u062A\u0627\u062D\u064A\u0629 (\u0628\u0633\u0645\u0644\u0629 \u0641\u064A \u0627\u0644\u0639\u0631\u0628\u064A\u0629\u060C \u062B\u0645 \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u060C \u062B\u0645 \u0627\u0633\u0645 \u0627\u0644\u0645\u0631\u0633\u0644 \u0625\u0644\u064A\u0647 \u0648\u0645\u0646\u0635\u0628\u0647\u060C \u062B\u0645 \u0627\u0644\u062A\u062D\u064A\u0629 \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D\u064A\u0629).
   - \u0633\u0637\u0631 \u0627\u0644\u0645\u0648\u0636\u0648\u0639 (\u0645\u062B\u0627\u0644: \u0627\u0644\u0645\u0648\u0636\u0648\u0639: ...).
   - \u0641\u0642\u0631\u0629 \u062A\u0645\u0647\u064A\u062F\u064A\u0629 (\u062A\u062F\u062E\u0644 \u0641\u064A \u0635\u0644\u0628 \u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0628\u0644\u0628\u0627\u0642\u0629).
   - \u0641\u0642\u0631\u0629 \u0623\u0648 \u0641\u0642\u0631\u0627\u062A \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 (\u0634\u0631\u062D \u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0623\u0648 \u0627\u0644\u0637\u0644\u0628 \u0623\u0648 \u0627\u0644\u0642\u0631\u0627\u0631 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0639\u0637\u0627\u0629\u060C \u0628\u0623\u0633\u0644\u0648\u0628 \u0645\u0642\u0646\u0639 \u0648\u0648\u0627\u0636\u062D).
   - \u0641\u0642\u0631\u0629 \u062E\u062A\u0627\u0645\u064A\u0629 (\u062A\u0637\u0644\u0639\u0627\u062A\u060C \u0634\u0643\u0631 \u0648\u062A\u0642\u062F\u064A\u0631\u060C \u0623\u0648 \u062F\u0639\u0648\u0629 \u0644\u0625\u062C\u0631\u0627\u0621 \u0645\u0639\u064A\u0646).
   - \u0627\u0644\u062E\u0627\u062A\u0645\u0629 (\u0627\u0644\u062A\u062D\u064A\u0629 \u0627\u0644\u062E\u062A\u0627\u0645\u064A\u0629\u060C \u0627\u0644\u062A\u0648\u0642\u064A\u0639/\u0627\u0633\u0645 \u0627\u0644\u0645\u0631\u0633\u0644\u060C \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0645\u062B\u0644 \u0627\u0644\u0647\u0627\u062A\u0641 \u0623\u0648 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u062A\u062D\u062A \u0627\u0633\u0645 \u0627\u0644\u0645\u0631\u0633\u0644 \u0645\u0628\u0627\u0634\u0631\u0629 \u0641\u064A \u062D\u0627\u0644 \u062A\u0648\u0641\u0631\u0647\u0627 \u0628\u0634\u0643\u0644 \u0623\u0646\u064A\u0642 \u0648\u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0645\u0631\u0627\u0633\u0644\u0627\u062A).
2. \u0627\u0644\u0628\u0644\u0627\u063A\u0629 \u0648\u0627\u0644\u0644\u063A\u0629: \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0644\u063A\u0629 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u062F\u0642\u0629\u060C \u062E\u0627\u0644\u064A\u0629 \u0645\u0646 \u0627\u0644\u0623\u062E\u0637\u0627\u0621 \u0627\u0644\u0646\u062D\u0648\u064A\u0629 \u0648\u0627\u0644\u0625\u0645\u0644\u0627\u0626\u064A\u0629. \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629\u060C \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0641\u0635\u062D\u0649 \u0627\u0644\u0628\u0644\u064A\u063A\u0629 \u0648\u0627\u0644\u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0648\u062A\u062C\u0646\u0628 \u0623\u064A \u0631\u0643\u0627\u0643\u0629.
3. \u0627\u0644\u0646\u0628\u0631\u0629 \u0648\u0627\u0644\u0631\u0633\u0645\u064A\u0629: \u0627\u0644\u062A\u0632\u0645 \u062D\u0631\u0641\u064A\u0627\u064B \u0628\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0648\u0627\u0644\u0646\u0628\u0631\u0629. \u0625\u0630\u0627 \u0643\u0627\u0646 "\u0631\u0633\u0645\u064A \u062C\u062F\u0627\u064B"\u060C \u0627\u0633\u062A\u062E\u062F\u0645 \u0623\u0644\u0642\u0627\u0628 \u062A\u0641\u062E\u064A\u0645 (\u0645\u0639\u0627\u0644\u064A\u060C \u0633\u0639\u0627\u062F\u0629\u060C \u0627\u0644\u0645\u0643\u0631\u0645). \u0625\u0630\u0627 \u0643\u0627\u0646 "\u0648\u062F\u0651\u064A"\u060C \u0627\u062C\u0639\u0644\u0647 \u0623\u0643\u062B\u0631 \u0644\u064A\u0648\u0646\u0629 \u0648\u062A\u0642\u0627\u0631\u0628\u0627\u064B.
4. \u0627\u0644\u062A\u0646\u0633\u064A\u0642: \u0644\u0627 \u062A\u0633\u062A\u062E\u062F\u0645 \u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0640 Markdown (\u0645\u062B\u0644 ** \u0623\u0648 #). \u0627\u0633\u062A\u062E\u062F\u0645 \u0641\u0642\u0637 \u0627\u0644\u0645\u0633\u0627\u0641\u0627\u062A \u0648\u0627\u0644\u0623\u0633\u0637\u0631 \u0627\u0644\u0641\u0627\u0631\u063A\u0629 \u0644\u062A\u0642\u0633\u064A\u0645 \u0627\u0644\u0641\u0642\u0631\u0627\u062A \u0628\u0634\u0643\u0644 \u0646\u0638\u064A\u0641 \u0648\u0645\u0646\u0633\u0642 \u0644\u0644\u0637\u0628\u0627\u0639\u0629.
5. \u0627\u0644\u0625\u062E\u0631\u0627\u062C \u0627\u0644\u0646\u0647\u0627\u0626\u064A: \u0644\u0627 \u062A\u0636\u0641 \u0623\u064A \u0631\u062F\u0648\u062F \u062D\u0648\u0627\u0631\u064A\u0629 \u0645\u062B\u0644 "\u0625\u0644\u064A\u0643 \u0627\u0644\u062E\u0637\u0627\u0628" \u0623\u0648 "\u0628\u0627\u0644\u062A\u0623\u0643\u064A\u062F". \u0627\u0628\u062F\u0623 \u0641\u0648\u0631\u0627\u064B \u0628\u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0646\u0635 \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0644\u0644\u062E\u0637\u0627\u0628 \u0641\u0642\u0637 \u0644\u064A\u0643\u0648\u0646 \u062C\u0627\u0647\u0632\u0627\u064B \u0644\u0644\u0646\u0633\u062E \u0645\u0628\u0627\u0634\u0631\u0629.
      `;
    const response = await safeGenerate(ai, {
      model: "gemini-flash-lite-latest",
      contents: prompt
    });
    res.json({ text: response.text });
  } catch (error) {
    handleApiError(error, res, "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0635\u064A\u0627\u063A\u0629 \u0627\u0644\u062E\u0637\u0627\u0628");
  }
});
app.post("/api/share", shareLimiter, async (req, res) => {
  try {
    const { subject, content, branding, signatureImage, sealImage, language, password } = req.body;
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const passwordHash = password ? hashPassword(password) : void 0;
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
      console.warn("Firebase not configured, falling back to temporary in-memory map");
      global.fallbackSharedLetters = global.fallbackSharedLetters || /* @__PURE__ */ new Map();
      global.fallbackSharedLetters.set(token, {
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
    const host = req.get("host") || "localhost:3000";
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    res.json({ token, url: `${protocol}://${host}/share/${token}`, hasPassword: !!password });
  } catch (err) {
    console.error("Share Error:", err);
    res.status(500).json({ error: `Failed to create share link: ${err.message || err}` });
  }
});
app.get("/share/:token", async (req, res) => {
  const { token } = req.params;
  let letter = null;
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
    const fallbackMap = global.fallbackSharedLetters;
    if (fallbackMap) {
      letter = fallbackMap.get(token);
    }
  }
  if (!letter || letter.createdAt && Date.now() - letter.createdAt > 24 * 60 * 60 * 1e3) {
    return res.status(404).send(`
        <html dir="rtl">
        <head>
          <title>\u062E\u0637\u0623 - \u0627\u0644\u0631\u0627\u0628\u0637 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D</title>
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
            <h1>\u0631\u0627\u0628\u0637 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629</h1>
            <p>\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0627 \u0627\u0644\u062E\u0637\u0627\u0628 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631\u060C \u0623\u0648 \u062A\u0645 \u062D\u0630\u0641\u0647\u060C \u0623\u0648 \u0642\u062F \u064A\u0643\u0648\u0646 \u0627\u0646\u062A\u0647\u0649 \u0648\u0642\u062A \u0635\u0644\u0627\u062D\u064A\u062A\u0647 \u0627\u0644\u0645\u0624\u0642\u062A\u0629 (24 \u0633\u0627\u0639\u0629).</p>
          </div>
        </body>
        </html>
      `);
  }
  const { password } = req.query;
  if (letter.passwordHash && (!password || !verifyPassword(password, letter.passwordHash))) {
    return res.send(`
        <html dir="rtl">
        <head>
          <title>\u062E\u0637\u0627\u0628 \u0645\u062D\u0645\u064A \u0628\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631</title>
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
            <h1>\u062E\u0637\u0627\u0628 \u0631\u0633\u0645\u064A \u0645\u062D\u0645\u064A</h1>
            <p>\u0647\u0630\u0627 \u0627\u0644\u062E\u0637\u0627\u0628 \u0645\u062D\u0645\u064A \u0628\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0633\u0629. \u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0645\u0635\u0627\u062D\u0628\u0629 \u0644\u0644\u062E\u0637\u0627\u0628 \u0644\u0641\u062A\u062D\u0647.</p>
            <form method="GET">
              <input type="password" name="password" placeholder="\u0623\u062F\u062E\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" required />
              ${password ? '<div class="error">\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629\u060C \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u0627\u064B</div>' : ""}
              <button type="submit">\u0641\u062A\u062D \u0627\u0644\u062E\u0637\u0627\u0628 \u0648\u0645\u0639\u0627\u064A\u0646\u062A\u0647</button>
            </form>
          </div>
        </body>
        </html>
      `);
  }
  const dir = letter.language === "en" ? "ltr" : "rtl";
  const textAlignment = letter.language === "en" ? "left" : "right";
  const safeLogoUrl = letter.branding.logoUrl && (letter.branding.logoUrl.startsWith("data:image/") || letter.branding.logoUrl.startsWith("https://") || letter.branding.logoUrl.startsWith("http://")) ? esc(letter.branding.logoUrl) : "";
  const brandingHeader = letter.branding.enableHeader ? `
      <div style="border-bottom: 2px solid #eaddd7; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; direction: ${dir};">
        <div style="text-align: ${textAlignment};">
          <h3 style="margin: 0; color: #43302b; font-size: 18px;">${esc(letter.branding.companyName)}</h3>
          <p style="margin: 5px 0 0 0; color: #846358; font-size: 12px; white-space: pre-line;">${esc(letter.branding.companyDetails)}</p>
        </div>
        ${safeLogoUrl ? '<img src="' + safeLogoUrl + '" style="max-height: 60px; max-width: 120px; object-fit: contain;" />' : ""}
      </div>
    ` : "";
  const brandingFooter = letter.branding.enableFooter ? `
      <div style="border-top: 1px solid #f2e8e5; padding-top: 15px; margin-top: 40px; text-align: center; color: #846358; font-size: 12px;">
        ${esc(letter.branding.footerText)}
      </div>
    ` : "";
  const safeSignature = letter.signatureImage && (letter.signatureImage.startsWith("data:image/") || letter.signatureImage.startsWith("https://") || letter.signatureImage.startsWith("http://")) ? esc(letter.signatureImage) : "";
  const safeSeal = letter.sealImage && (letter.sealImage.startsWith("data:image/") || letter.sealImage.startsWith("https://") || letter.sealImage.startsWith("http://")) ? esc(letter.sealImage) : "";
  const signatures = safeSignature || safeSeal ? `
      <div style="margin-top: 40px; display: flex; justify-content: ${letter.language === "en" ? "flex-start" : "flex-end"};">
        <div style="text-align: center;">
          <p style="font-size: 12px; font-weight: bold; color: #43302b; margin-bottom: 10px;">\u0627\u0644\u062A\u0648\u0642\u064A\u0639 \u0648\u0627\u0644\u062E\u062A\u0645:</p>
          <div style="display: flex; gap: 15px; align-items: center; justify-content: center;">
            ${safeSignature ? '<img src="' + safeSignature + '" style="max-height: 60px; max-width: 100px; object-fit: contain;" />' : ""}
            ${safeSeal ? '<img src="' + safeSeal + '" style="max-height: 60px; max-width: 80px; object-fit: contain;" />' : ""}
          </div>
        </div>
      </div>
    ` : "";
  res.send(`
      <html>
      <head>
        <title>\u0645\u0639\u0627\u064A\u0646\u0629 \u0627\u0644\u062E\u0637\u0627\u0628: ${esc(letter.subject)}</title>
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
            <button class="btn btn-primary" onclick="window.print()">\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u062E\u0637\u0627\u0628 (PDF)</button>
            <a href="/" class="btn btn-secondary">\u0623\u0646\u0634\u0626 \u062E\u0637\u0627\u0628\u0643 \u0627\u0644\u062E\u0627\u0635</a>
          </div>
        </div>
      </body>
      </html>
    `);
});
async function configureStaticAndListen() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
if (!process.env.VERCEL) {
  configureStaticAndListen();
}
var server_default = app;
//# sourceMappingURL=server.cjs.map
