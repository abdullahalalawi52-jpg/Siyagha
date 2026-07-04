export interface GenerateLetterParams {
  sender?: string;
  recipient?: string;
  subject?: string;
  details?: string;
  type?: string;
  subType?: string;
  tone?: string;
  lang?: 'ar' | 'en';
  date?: string;
  brandVoicePrompt?: string;
  careerProfile?: {
    fullName?: string;
    jobTitle?: string;
    summary?: string;
    keySkills?: string[];
  };
}

export const getSuggestTitlePrompt = (type: string, subType: string, details: string, isEn: boolean): string => {
  return isEn
    ? `You are an expert formal letter writing assistant. Suggest a concise, highly formal Subject line for a letter based on the following details.
Category: ${type}
Sub-category: ${subType}
Details: ${details}

Return ONLY the suggested subject title without quotes, markdown formatting, or preamble.`
    : `أنت خبير في صياغة الخطابات الرسمية باللغة العربية.
قم باقتراح عنوان موضوع (Subject) قصير ورسمي جداً ومناسب لخطاب بناءً على التفاصيل التالية.
التصنيف: ${type}
النوع الفرعي: ${subType}
التفاصيل: ${details}

الشرط الوحيد: أرجع فقط عنوان الموضوع بدون أي مقدمات أو علامات تنصيص أو نصوص إضافية.`;
};

export const getProofreadPrompt = (letterContent: string, isEn: boolean): string => {
  return isEn
    ? `You are an expert editor and proofreader. Proofread the following letter text for grammar, spelling, and formal style enhancement.\nImportant guidelines:\n1. Preserve all names, dates, numbers, and facts.\n2. Fix spelling, grammar, and sentence flow.\n3. Output ONLY the polished final text without any comments or explanation.\n\nText:\n"${letterContent}"`
    : `أنت مدقق لغوي خبير ومحترف في اللغة العربية والإنجليزية.\nقم بتدقيق النص التالي إملائياً ونحوياً وتصحيح صياغته ليكون خطاباً رسمياً بليغاً.\nملاحظات مهمة:\n1. حافظ على كامل المعنى الهيكلي للخطاب وجميع البيانات والأرقام والتفاصيل.\n2. أصلح فقط الأخطاء الإملائية والنحوية الصريحة وحسّن سلاسة التعبير.\n3. أرجع النص المصحح النهائي مباشرة دون أي مقدمات أو شرح أو ملاحظات.\n\nالنص:\n"${letterContent}"`;
};

export const getAnalyzeTonePrompt = (letterContent: string, isEn: boolean): string => {
  return isEn
    ? `Analyze the tone and formality of the following letter. Return JSON strictly in this format:\n{\n  "detectedTone": "Tone description (e.g. Formal, Direct, Persuasive)",\n  "formalityScore": number from 0 to 100,\n  "suggestions": ["Suggestion 1", "Suggestion 2"]\n}\n\nText:\n"${letterContent}"`
    : `حلل النبرة ومستوى الرسمية في النص التالي وأرجع النتيجة بصيغة JSON حصراً بدون أي نصوص أخرى:\n{\n  "detectedTone": "اسم النبرة باللغة العربية (مثال: رسمية صريحة، ودية ومحترفة، حازمة، إلخ)",\n  "formalityScore": رقم من 0 إلى 100 يمثل نسبة الرسمية,\n  "suggestions": ["نصيحة 1 لتحسين الخطاب", "نصيحة 2 لتحسين الصياغة"]\n}\n\nالنص:\n"${letterContent}"`;
};

export const getAnalyzeAtsPrompt = (
  letterContent: string,
  jobTitle?: string,
  jobDescription?: string,
  isEn?: boolean
): string => {
  return isEn
    ? `You are an ATS System Optimization Expert. Analyze this cover letter/resume against Job Title "${jobTitle || 'N/A'}" and Job Description "${jobDescription || 'N/A'}".\nReturn JSON strictly in this format:\n{\n  "score": number 0 to 100,\n  "matchedKeywords": ["keyword 1", "keyword 2"],\n  "missingKeywords": ["missing 1", "missing 2"],\n  "improvements": ["recommendation 1", "recommendation 2"]\n}\n\nText:\n"${letterContent}"`
    : `أنت خبير في أنظمة تتبع المتقدمين (ATS System Optimization).\nقم بتحليل هذا الخطاب/المستند مقابل المسمى الوظيفي "${jobTitle || 'غير محدد'}" والوصف الوظيفي "${jobDescription || 'غير محدد'}".\n\nأرجع النتيجة بصيغة JSON حصراً بالشكل التالي:\n{\n  "score": رقم من 0 إلى 100 يمثل مدى مطابقة المستند ومعايير ATS,\n  "matchedKeywords": ["كلمة مفتاحية 1", "كلمة مفتاحية 2"],\n  "missingKeywords": ["كلمة مفقودة مهمة 1", "كلمة مفقودة مهمة 2"],\n  "improvements": ["توصية 1 لرفع نسبة القبول", "توصية 2 لتحسين الهيكلية"]\n}\n\nالنص:\n"${letterContent}"`;
};

export const getPolishLetterPrompt = (letterContent: string, targetTone?: string, isEn?: boolean): string => {
  return isEn
    ? `Polish and rewrite the following letter to match a tone of "${targetTone || 'Professional & Courteous'}".\nKeep all core details, facts, names, and figures.\nOutput ONLY the polished final text directly without formatting tags or commentary.\n\nOriginal Text:\n"${letterContent}"`
    : `أنت كاتب وصانع خطابات رسمية دقيق جداً.\nقم بإعادة صياغة وتلميع هذا الخطاب ليكون بنبرة "${targetTone || 'رسمية ومحترفة'}".\nحافظ على كامل المعلومات الأساسية والأسماء والأرقام والجهات المسجلة في النص الأصلي.\nأرجع فقط النص المحسن النهائي مباشرة بدون أي تعليقات أو علامات تنسيق.\n\nالنص الأصلي:\n"${letterContent}"`;
};

export const getAnalyzeStylePrompt = (sampleText: string, isEn?: boolean): string => {
  return isEn
    ? `Analyze the writing style in the following sample text to extract the author's Brand Voice.\nReturn JSON strictly in this format:\n{\n  "voiceName": "Descriptive Voice Name (e.g. Concise Executive, Strict Legal)",\n  "characteristics": ["Feature 1", "Feature 2"],\n  "summaryPrompt": "Instruction summary to guide AI to write in the same voice"\n}\n\nSample:\n"${sampleText}"`
    : `حلل الأسلوب البلاغي والكتابي في النص العينة التالي لاستخلاص بصمة الكاتب (Brand Voice).\nأرجع النتيجة بصيغة JSON حصراً بهذا الشكل:\n{\n  "voiceName": "اسم وصفي لأسلوب الكاتب (مثال: أسلوب تنفيذي موجز، أسلوب قانوني صارم)",\n  "characteristics": ["ميزة 1 في الأسلوب", "ميزة 2 في اختيار الألفاظ"],\n  "summaryPrompt": "ملخص توجيهي يمكن إعطاؤه للذكاء الاصطناعي لاحقاً للكتابة بنفس الأسلوب والبصمة"\n}\n\nالنص:\n"${sampleText}"`;
};

export const getGenerateLetterPrompt = (params: GenerateLetterParams): { mainPrompt: string; correctionPrompt: string } => {
  const { sender, recipient, subject, details, type, subType, tone, lang, date, brandVoicePrompt, careerProfile } = params;
  const isEn = lang === 'en';

  let careerContext = "";
  if (careerProfile && (careerProfile.fullName || careerProfile.jobTitle || careerProfile.summary)) {
    careerContext = isEn
      ? `\n[Sender Professional Profile Context]\nName: ${careerProfile.fullName || ''}\nCurrent Title: ${careerProfile.jobTitle || ''}\nExperience & Skills Summary: ${careerProfile.summary || ''}\nKey Achievements: ${Array.isArray(careerProfile.keySkills) ? careerProfile.keySkills.join(', ') : ''}\nUse this context where relevant to highlight the sender's background in the letter.`
      : `\n[السياق المهني للمرسل]\nالاسم: ${careerProfile.fullName || ''}\nالمسمى الوظيفي: ${careerProfile.jobTitle || ''}\nالملخص المهني والخبرات: ${careerProfile.summary || ''}\nأبرز المهارات والإنجازات: ${Array.isArray(careerProfile.keySkills) ? careerProfile.keySkills.join('، ') : ''}\nاستفد من هذا السياق لإبراز خلفية وخبرة المرسل عند صياغة الخطاب بشكل ملائم.`;
  }

  let voiceContext = "";
  if (brandVoicePrompt) {
    voiceContext = isEn
      ? `\n[Sender Brand Voice Style Constraint]\nAdopt the following writing voice style: "${brandVoicePrompt}"`
      : `\n[بصمة أسلوب الكاتب الخاصة]\nالتزم باتباع نبرة وبصمة أسلوب الكتابة التالية: "${brandVoicePrompt}"`;
  }

  const mainPrompt = isEn
    ? `
Draft a highly professional official letter with the following criteria:
- Language: English
- Letter Category: ${type || 'Formal'} - Subtype: ${subType || 'General'}
- Tone: ${tone || 'Professional & Courteous'}
- Sender: ${sender || 'N/A'}
- Recipient: ${recipient || 'N/A'}
- Date of Letter: ${date || 'Current Date'}
- Subject/Topic: ${subject || 'N/A'}
- Core Details / Key Points to include:
"${details || 'N/A'}"
${careerContext}
${voiceContext}

Formatting Guidelines:
1. Include appropriate formal salutation and sign-off.
2. Structure in clear paragraphs (Opening, Purpose, Details/Action, Closing).
3. If a specific Date of Letter is provided, ensure it is written at the top of the letter exactly as provided.
4. Output ONLY the complete text of the letter. Do NOT include markdown styling (no # or **) or preamble explanations.
    `
    : `
قم بصياغة خطاب رسمي رفيع المستوى ومحكم الصياغة بناءً على البيانات التالية:
- اللغة: العربية الفصحى
- تصنيف الخطاب: ${type || 'إداري/رسمي'} - النوع الفرعي: ${subType || 'عام'}
- النبرة المطلوبة: ${tone || 'رسمية ومحترفة'}
- تاريخ الخطاب: ${date || 'تاريخ اليوم'}
- جهة/اسم المرسل: ${sender || 'غير محدد'}
- جهة/اسم المرسل إليه: ${recipient || 'غير محدد'}
- موضوع الخطاب: ${subject || 'غير محدد'}
- التفاصيل والنقاط الأساسية المراد تضمينها:
"${details || 'غير محدد'}"
${careerContext}
${voiceContext}

توجيهات الصياغة:
1. ابدأ بالتاريخ (تاريخ الخطاب المدخل) في أعلى الخطاب.
2. ابدأ بالتحية الرسمية المناسبة، واختم بالعبارة الختامية الرسمية الملائمة.
3. قسّم الخطاب إلى فقرات واضحة (الافتتاحية، الغرض الرئيسي، التفاصيل والمطالب، الخاتمة).
4. أرجع فقط نص الخطاب الكامل والجاهز للطباعة مباشرة دون أي علامات Markdown مثل (# أو **) ودون أي مقدمات أو شروحات جانبية.
    `;

  const correctionPrompt = (generatedText: string) => isEn
    ? `Proofread and polish the following letter text for grammar and spelling clarity. Keep all structure and details. Output ONLY the final text without Markdown tags.\n\nText:\n"${generatedText}"`
    : `قم بتدقيق النص التالي لغوياً وإملائياً وتصحيح أي أخطاء لغوية مع الحفاظ الكامل على نصه ومضمونه:\n1. أصلح الأخطاء الإملائية والنحوية الصريحة فقط.\n2. حافظ على هيكل الخطاب بالكامل، ونبرته، ومضمونه، ومعلوماته الحساسة دون أي تغيير أو حذف.\n3. أرجع النص المصحح والمنسق مباشرة بدون أي مقدمات أو شروحات أو علامات تنسيق Markdown (لا تستخدم ** أو #).\n\nالنص المراد تدقيقه:\n"${generatedText}"`;

  return { mainPrompt, correctionPrompt: correctionPrompt("") };
};
