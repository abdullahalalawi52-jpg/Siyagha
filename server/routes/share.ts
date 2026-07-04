import { Router } from "express";
import crypto from "crypto";
import { shareLimiter } from "../middleware.js";
import { isFirebaseConfigured, firebaseConfig, hashPassword, verifyPassword, esc } from "../config.js";

const router = Router();

router.post("/api/share", shareLimiter, async (req, res) => {
  try {
    const { subject, content, branding, signatureImage, sealImage, language, password } = req.body;
    const token = crypto.randomBytes(16).toString("hex");
    
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

router.all("/share/:token", async (req, res) => {
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

  const password = req.body?.password || req.query?.password;
  const isPasswordAttempt = !!password;
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
          <form method="POST">
            <input type="password" name="password" placeholder="أدخل كلمة المرور" required />
            ${isPasswordAttempt ? '<div class="error">\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629\u060c \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b</div>' : ''}
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

export default router;
