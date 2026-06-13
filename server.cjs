var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
import_dotenv.default.config();
var SAFETY_SETTINGS = [
  { category: import_genai.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: import_genai.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: import_genai.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: import_genai.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: import_genai.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: import_genai.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: import_genai.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: import_genai.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
];
var safeGenerate = (ai, params) => {
  return ai.models.generateContent({
    model: params.model,
    contents: params.contents,
    config: {
      safetySettings: SAFETY_SETTINGS,
      ...params.config || {}
    }
  });
};
var esc = (s) => {
  if (s == null)
    return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  const sharedLetters = /* @__PURE__ */ new Map();
  app.use(import_express.default.json({ limit: "50mb" }));
  app.post("/api/send-email", async (req, res) => {
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
      res.status(500).json({ error: "Failed to send email" });
    }
  });
  app.post("/api/suggest-title", async (req, res) => {
    try {
      const { type, subType, details, language } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API key is not configured" });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const prompt = `
\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0641\u064A \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u062E\u0637\u0627\u0628\u0627\u062A. \u0627\u0642\u062A\u0631\u062D \u0639\u0646\u0648\u0627\u0646\u0627\u064B \u0631\u0626\u064A\u0633\u064A\u0627\u064B (\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u062E\u0637\u0627\u0628) \u0648\u0627\u062D\u062F\u0627\u064B \u0642\u0627\u0637\u0639\u0627\u064B \u0648\u0648\u0627\u0636\u062D\u0627\u064B \u0648\u0645\u062E\u062A\u0635\u0631\u0627\u064B \u062C\u062F\u0627\u064B \u0644\u0644\u062E\u0637\u0627\u0628 \u0627\u0644\u062A\u0627\u0644\u064A.
\u0627\u0644\u0646\u0648\u0639: ${type} - ${subType}
\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644: ${details || "\u0644\u0627 \u062A\u0648\u062C\u062F \u062A\u0641\u0627\u0635\u064A\u0644\u060C \u0627\u0642\u062A\u0631\u062D \u0639\u0646\u0648\u0627\u0646\u0627\u064B \u0639\u0627\u0645\u0627\u064B \u0648\u0645\u0646\u0627\u0633\u0628\u0627\u064B \u0644\u0647\u0630\u0627 \u0627\u0644\u0646\u0648\u0639."}
\u0627\u0644\u0644\u063A\u0629: ${language === "en" ? "English" : "Arabic"}

\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0627\u0644\u0631\u062F \u0647\u0648 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0641\u0642\u0637 \u0648\u0628\u062F\u0648\u0646 \u0623\u064A \u0625\u0636\u0627\u0641\u0627\u062A\u060C \u0648\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0646\u0627\u0633\u0628\u0627\u064B \u0644\u064A\u0633\u0628\u0642 \u0646\u0635 \u0627\u0644\u062E\u0637\u0627\u0628.
`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          safetySettings: SAFETY_SETTINGS,
          // @ts-ignore
          safety_settings: SAFETY_SETTINGS
        }
      });
      res.json({ title: response.text?.trim() });
    } catch (error) {
      console.error("Suggest Title Error:", error);
      res.status(500).json({ error: "Failed to suggest title" });
    }
  });
  app.post("/api/proofread-letter", async (req, res) => {
    try {
      const { text, language } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API key is not configured" });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
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
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          safetySettings: SAFETY_SETTINGS,
          // @ts-ignore
          safety_settings: SAFETY_SETTINGS
        }
      });
      res.json({ letter: response.text });
    } catch (error) {
      console.error("Proofreading Error:", error);
      res.status(500).json({ error: "Failed to proofread the letter" });
    }
  });
  app.post("/api/analyze-tone", async (req, res) => {
    try {
      const { text, language } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API key is not configured" });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const prompt = `
You are an expert communications analyzer. Analyze the tone of the following letter:
"${text}"

Provide the analysis as a JSON object (no markdown formatting, no \`\`\`json block, just raw JSON) containing:
1. "toneName": A brief name of the tone in Arabic (e.g. \u0631\u0633\u0645\u064A \u062C\u062F\u0627\u064B, \u062D\u0627\u0632\u0645, \u0648\u062F\u0651\u064A, \u0647\u0627\u062F\u0626, \u0627\u0639\u062A\u0630\u0627\u0631\u064A)
2. "formalityScore": A score from 1 to 10 of how formal the letter is
3. "summary": A brief analysis in Arabic (2-3 sentences) of the strengths and weaknesses of the tone.
4. "suggestions": An array of 3 suggestions in Arabic to make the communication more professional or effective.
      `;
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
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
      console.error("Tone Analysis Error:", error);
      res.status(500).json({ error: "Failed to analyze tone" });
    }
  });
  app.post("/api/polish-letter", async (req, res) => {
    try {
      const { text, language } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API key is not configured" });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
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
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          safetySettings: SAFETY_SETTINGS,
          // @ts-ignore
          safety_settings: SAFETY_SETTINGS
        }
      });
      res.json({ letter: response.text });
    } catch (error) {
      console.error("Polish Error:", error);
      res.status(500).json({ error: "Failed to polish letter" });
    }
  });
  app.post("/api/ocr", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image data is required" });
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API key is not configured" });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
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
          { inlineData: { data: base64Data, mimeType } },
          prompt
        ]
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("OCR Error:", error);
      res.status(500).json({ error: "Failed to perform OCR" });
    }
  });
  app.post("/api/generate-letter", async (req, res) => {
    try {
      const { type, subType, senderName, recipientName, recipientRole, subject, details, tone, formality, language, date } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API key is not configured" });
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      const prompt = `
\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0645\u062A\u0645\u0631\u0633 \u0648\u0645\u062D\u062A\u0631\u0641 \u0641\u064A \u0635\u064A\u0627\u063A\u0629 \u0627\u0644\u062E\u0637\u0627\u0628\u0627\u062A \u0627\u0644\u0631\u0633\u0645\u064A\u0629\u060C \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629\u060C \u0648\u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629. 
\u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0645\u0646\u0643 \u0635\u064A\u0627\u063A\u0629 \u062E\u0637\u0627\u0628 \u0645\u062A\u0643\u0627\u0645\u0644\u060C \u0628\u0644\u064A\u063A\u060C \u0648\u0630\u0648 \u0628\u0646\u064A\u0629 \u0645\u0646\u0637\u0642\u064A\u0629 \u0642\u0648\u064A\u0629\u060C \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0645\u0639\u0637\u064A\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629:

[\u0627\u0644\u0645\u0639\u0637\u064A\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629]
- \u0644\u063A\u0629 \u0627\u0644\u062E\u0637\u0627\u0628: ${language === "en" ? "English" : "Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649)"}
- \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062E\u0637\u0627\u0628: ${date || "[\u0627\u0644\u062A\u0627\u0631\u064A\u062E]"}
- \u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0648\u0627\u0644\u0646\u0648\u0639: ${type} ${subType ? "(" + subType + ")" : ""}
- \u0645\u0646 (\u0627\u0644\u0645\u0631\u0633\u0644): ${senderName}
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
   - \u0627\u0644\u062E\u0627\u062A\u0645\u0629 (\u0627\u0644\u062A\u062D\u064A\u0629 \u0627\u0644\u062E\u062A\u0627\u0645\u064A\u0629\u060C \u0627\u0644\u062A\u0648\u0642\u064A\u0639/\u0627\u0633\u0645 \u0627\u0644\u0645\u0631\u0633\u0644).
2. \u0627\u0644\u0628\u0644\u0627\u063A\u0629 \u0648\u0627\u0644\u0644\u063A\u0629: \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0644\u063A\u0629 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u062F\u0642\u0629\u060C \u062E\u0627\u0644\u064A\u0629 \u0645\u0646 \u0627\u0644\u0623\u062E\u0637\u0627\u0621 \u0627\u0644\u0646\u062D\u0648\u064A\u0629 \u0648\u0627\u0644\u0625\u0645\u0644\u0627\u0626\u064A\u0629. \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629\u060C \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0641\u0635\u062D\u0649 \u0627\u0644\u0628\u0644\u064A\u063A\u0629 \u0648\u0627\u0644\u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0648\u062A\u062C\u0646\u0628 \u0623\u064A \u0631\u0643\u0627\u0643\u0629.
3. \u0627\u0644\u0646\u0628\u0631\u0629 \u0648\u0627\u0644\u0631\u0633\u0645\u064A\u0629: \u0627\u0644\u062A\u0632\u0645 \u062D\u0631\u0641\u064A\u0627\u064B \u0628\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0648\u0627\u0644\u0646\u0628\u0631\u0629. \u0625\u0630\u0627 \u0643\u0627\u0646 "\u0631\u0633\u0645\u064A \u062C\u062F\u0627\u064B"\u060C \u0627\u0633\u062A\u062E\u062F\u0645 \u0623\u0644\u0642\u0627\u0628 \u062A\u0641\u062E\u064A\u0645 (\u0645\u0639\u0627\u0644\u064A\u060C \u0633\u0639\u0627\u062F\u0629\u060C \u0627\u0644\u0645\u0643\u0631\u0645). \u0625\u0630\u0627 \u0643\u0627\u0646 "\u0648\u062F\u0651\u064A"\u060C \u0627\u062C\u0639\u0644\u0647 \u0623\u0643\u062B\u0631 \u0644\u064A\u0648\u0646\u0629 \u0648\u062A\u0642\u0627\u0631\u0628\u0627\u064B.
4. \u0627\u0644\u062A\u0646\u0633\u064A\u0642: \u0644\u0627 \u062A\u0633\u062A\u062E\u062F\u0645 \u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0640 Markdown (\u0645\u062B\u0644 ** \u0623\u0648 #). \u0627\u0633\u062A\u062E\u062F\u0645 \u0641\u0642\u0637 \u0627\u0644\u0645\u0633\u0627\u0641\u0627\u062A \u0648\u0627\u0644\u0623\u0633\u0637\u0631 \u0627\u0644\u0641\u0627\u0631\u063A\u0629 \u0644\u062A\u0642\u0633\u064A\u0645 \u0627\u0644\u0641\u0642\u0631\u0627\u062A \u0628\u0634\u0643\u0644 \u0646\u0638\u064A\u0641 \u0648\u0645\u0646\u0633\u0642 \u0644\u0644\u0637\u0628\u0627\u0639\u0629.
5. \u0627\u0644\u0625\u062E\u0631\u0627\u062C \u0627\u0644\u0646\u0647\u0627\u0626\u064A: \u0644\u0627 \u062A\u0636\u0641 \u0623\u064A \u0631\u062F\u0648\u062F \u062D\u0648\u0627\u0631\u064A\u0629 \u0645\u062B\u0644 "\u0625\u0644\u064A\u0643 \u0627\u0644\u062E\u0637\u0627\u0628" \u0623\u0648 "\u0628\u0627\u0644\u062A\u0623\u0643\u064A\u062F". \u0627\u0628\u062F\u0623 \u0641\u0648\u0631\u0627\u064B \u0628\u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0646\u0635 \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0644\u0644\u062E\u0637\u0627\u0628 \u0641\u0642\u0637 \u0644\u064A\u0643\u0648\u0646 \u062C\u0627\u0647\u0632\u0627\u064B \u0644\u0644\u0646\u0633\u062E \u0645\u0628\u0627\u0634\u0631\u0629.
      `;
      const response = await safeGenerate(ai, {
        model: "gemini-2.0-flash",
        contents: prompt
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/share", async (req, res) => {
    try {
      const { subject, content, branding, signatureImage, sealImage, language, password } = req.body;
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sharedLetters.set(token, {
        subject,
        content,
        branding,
        signatureImage,
        sealImage,
        language,
        passwordHash: password || void 0,
        createdAt: Date.now()
      });
      setTimeout(() => sharedLetters.delete(token), 24 * 60 * 60 * 1e3);
      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol;
      res.json({ token, url: `${protocol}://${host}/share/${token}`, hasPassword: !!password });
    } catch (err) {
      console.error("Share Error:", err);
      res.status(500).json({ error: "Failed to create share link" });
    }
  });
  app.get("/share/:token", (req, res) => {
    const { token } = req.params;
    const letter = sharedLetters.get(token);
    if (!letter) {
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
    if (letter.passwordHash && letter.passwordHash !== password) {
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
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
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
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
