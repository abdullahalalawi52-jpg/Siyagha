import express, { Router, Response } from "express";
import { geminiLimiter, checkGeminiKey } from "../middleware.js";
import { handleApiError } from "../config.js";
import { safeGenerate } from "../services/gemini.js";
import { GoogleAiRequest } from "../types.js";
import {
  getSuggestTitlePrompt,
  getProofreadPrompt,
  getAnalyzeTonePrompt,
  getAnalyzeAtsPrompt,
  getPolishLetterPrompt,
  getAnalyzeStylePrompt,
  getGenerateLetterPrompt
} from "../prompts/aiPrompts.js";

const router = Router();

router.use(geminiLimiter);
router.use(checkGeminiKey);

// Input length validator helper to prevent oversized string attacks
const validateInputLength = (text: string | undefined, maxLen = 30000): boolean => {
  if (text === undefined || text === null) return true;
  return typeof text === 'string' && text.length <= maxLen;
};

// 1. Suggest Subject Title
router.post("/suggest-title", async (req: GoogleAiRequest, res: Response) => {
  try {
    const { letterContent, lang } = req.body;
    if (!letterContent) {
      return res.status(400).json({ error: "محتوى الخطاب مطلوب المقترح" });
    }
    if (!validateInputLength(letterContent)) {
      return res.status(400).json({ error: "حجم النص المدخل يتجاوز الحد الأقصى المسموح به" });
    }

    const isEn = lang === 'en';
    const ai = req.ai!;
    const prompt = getSuggestTitlePrompt(letterContent, isEn);

    const response = await safeGenerate(ai, {
      model: "gemini-flash-lite-latest",
      contents: prompt,
    });

    const suggestedTitle = response.text?.trim().replace(/^["'«]/, '').replace(/["'»]$/, '') || "";
    res.json({ suggestedTitle });
  } catch (error: any) {
    handleApiError(error, res, "حدث خطأ أثناء اقتراح العنوان");
  }
});

// 2. Proofread Letter
router.post("/proofread-letter", async (req: GoogleAiRequest, res: Response) => {
  try {
    const { letterContent, lang } = req.body;
    if (!letterContent) {
      return res.status(400).json({ error: "محتوى الخطاب مطلوب للتصحيح" });
    }
    if (!validateInputLength(letterContent)) {
      return res.status(400).json({ error: "حجم النص المدخل يتجاوز الحد الأقصى المسموح به" });
    }

    const isEn = lang === 'en';
    const ai = req.ai!;
    const prompt = getProofreadPrompt(letterContent, isEn);

    const response = await safeGenerate(ai, {
      model: "gemini-flash-lite-latest",
      contents: prompt,
    });

    res.json({ proofreadText: response.text || letterContent });
  } catch (error: any) {
    handleApiError(error, res, "حدث خطأ أثناء تدقيق الخطاب");
  }
});

// 3. Analyze Tone
router.post("/analyze-tone", async (req: GoogleAiRequest, res: Response) => {
  try {
    const { letterContent, lang } = req.body;
    if (!letterContent) {
      return res.status(400).json({ error: "محتوى الخطاب مطلوب للتحليل" });
    }
    if (!validateInputLength(letterContent)) {
      return res.status(400).json({ error: "حجم النص المدخل يتجاوز الحد الأقصى المسموح به" });
    }

    const isEn = lang === 'en';
    const ai = req.ai!;
    const prompt = getAnalyzeTonePrompt(letterContent, isEn);

    const response = await safeGenerate(ai, {
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    res.json(result);
  } catch (error: any) {
    handleApiError(error, res, "حدث خطأ أثناء تحليل النبرة");
  }
});

// 4. Analyze ATS
router.post("/analyze-ats", async (req: GoogleAiRequest, res: Response) => {
  try {
    const { letterContent, jobTitle, jobDescription, lang } = req.body;
    if (!letterContent) {
      return res.status(400).json({ error: "محتوى الخطاب/السيرة مطلوب للتحليل" });
    }
    if (!validateInputLength(letterContent) || !validateInputLength(jobDescription, 10000)) {
      return res.status(400).json({ error: "حجم النص المدخل يتجاوز الحد الأقصى المسموح به" });
    }

    const isEn = lang === 'en';
    const ai = req.ai!;
    const prompt = getAnalyzeAtsPrompt(letterContent, jobTitle, jobDescription, isEn);

    const response = await safeGenerate(ai, {
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    res.json(result);
  } catch (error: any) {
    handleApiError(error, res, "حدث خطأ أثناء تحليل ATS");
  }
});

// 5. Polish Letter
router.post("/polish-letter", async (req: GoogleAiRequest, res: Response) => {
  try {
    const { letterContent, targetTone, lang } = req.body;
    if (!letterContent) {
      return res.status(400).json({ error: "محتوى الخطاب مطلوب للتلميع" });
    }
    if (!validateInputLength(letterContent)) {
      return res.status(400).json({ error: "حجم النص المدخل يتجاوز الحد الأقصى المسموح به" });
    }

    const isEn = lang === 'en';
    const ai = req.ai!;
    const prompt = getPolishLetterPrompt(letterContent, targetTone, isEn);

    const response = await safeGenerate(ai, {
      model: "gemini-flash-lite-latest",
      contents: prompt,
    });

    res.json({ polishedText: response.text || letterContent });
  } catch (error: any) {
    handleApiError(error, res, "حدث خطأ أثناء تلميع الخطاب");
  }
});

// 6. OCR Image/PDF Base64 Text Extraction
router.post("/ocr", express.json({ limit: "50mb" }), async (req: GoogleAiRequest, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "بيانات الصورة/المستند مطلوبة" });
    }

    const ai = req.ai!;
    const base64Clean = imageBase64.replace(/^data:image\/\w+;base64,/, "").replace(/^data:application\/pdf;base64,/, "");

    const prompt = "Extract all written text from this image/document accurately with exact formatting and sentence structure, without adding commentary.";

    const response = await safeGenerate(ai, {
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Clean,
            mimeType: mimeType || "image/png"
          }
        },
        prompt
      ]
    });

    res.json({ extractedText: response.text || "" });
  } catch (error: any) {
    handleApiError(error, res, "حدث خطأ أثناء استخراج النص من المستند (OCR)");
  }
});

// 7. Analyze Style
router.post("/analyze-style", async (req: GoogleAiRequest, res: Response) => {
  try {
    const { sampleText, lang } = req.body;
    if (!sampleText) {
      return res.status(400).json({ error: "النص العينة مطلوب لتحليل الأسلوب" });
    }
    if (!validateInputLength(sampleText, 20000)) {
      return res.status(400).json({ error: "حجم النص المدخل يتجاوز الحد الأقصى المسموح به" });
    }

    const isEn = lang === 'en';
    const ai = req.ai!;
    const prompt = getAnalyzeStylePrompt(sampleText, isEn);

    const response = await safeGenerate(ai, {
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    res.json(result);
  } catch (error: any) {
    handleApiError(error, res, "حدث خطأ أثناء تحليل بصمة الأسلوب");
  }
});

// 8. Generate Letter
router.post("/generate-letter", async (req: GoogleAiRequest, res: Response) => {
  try {
    const {
      senderName,
      senderPhone,
      senderEmail,
      recipientName,
      recipientRole,
      subject,
      details,
      type,
      subType,
      tone,
      language,
      brandVoiceProfile,
      resumeInfo,
      isReplyMode,
      replyToText,
      replyStance
    } = req.body;
    
    const sender = [senderName, senderPhone, senderEmail].filter(Boolean).join(' - ');
    const recipient = [recipientName, recipientRole].filter(Boolean).join(' - ');
    const lang = language;
    const brandVoicePrompt = brandVoiceProfile;
    const careerProfile = resumeInfo ? { summary: resumeInfo } : undefined;
    
    // Incorporate reply context into details if it's reply mode
    let finalDetails = details || "";
    if (isReplyMode && replyToText) {
      finalDetails += `\n\n[Context: This is a reply to the following letter: "${replyToText}".\nStance/Direction of reply: ${replyStance || 'Neutral/Appropriate'}]`;
    }

    const ai = req.ai!;

    if (!validateInputLength(finalDetails, 20000)) {
      return res.status(400).json({ error: "تفاصيل الخطاب تتجاوز الحد الأقصى المسموح به" });
    }

    const { mainPrompt, correctionPrompt } = getGenerateLetterPrompt({
      sender,
      recipient,
      subject,
      details: finalDetails,
      type,
      subType,
      tone,
      lang,
      brandVoicePrompt,
      careerProfile,
    });

    const response = await safeGenerate(ai, {
      model: "gemini-2.5-flash",
      contents: mainPrompt,
    });

    const generatedText = response.text || "";
    res.json({ text: generatedText });
  } catch (error: any) {
    handleApiError(error, res, "حدث خطأ أثناء صياغة الخطاب");
  }
});

export default router;
