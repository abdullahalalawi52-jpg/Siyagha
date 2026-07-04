# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: modal-typing.spec.ts >> test career profile modal typing
- Location: tests\e2e\modal-typing.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button').filter({ has: locator('svg.lucide-user') }).first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "تجاوز إلى المحتوى الرئيسي" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8] [cursor=pointer]:
          - img [ref=e10]
          - heading "صياغة" [level=1] [ref=e15]
        - generic [ref=e16]:
          - img [ref=e17]
          - generic [ref=e21]: متصل
      - generic [ref=e22]:
        - paragraph [ref=e23]: خطابات رسمية واحترافية
        - button "من نحن" [ref=e25] [cursor=pointer]:
          - img [ref=e26]
          - generic [ref=e28]: من نحن
        - button "تغيير اللغة" [ref=e30] [cursor=pointer]: EN
        - button "الوضع الداكن" [ref=e32] [cursor=pointer]:
          - img [ref=e34]
        - button "الأرشيف" [ref=e37] [cursor=pointer]:
          - img [ref=e38]
          - generic [ref=e41]: الأرشيف
        - button "تسجيل الدخول باستخدام جوجل" [ref=e43] [cursor=pointer]:
          - img [ref=e44]
          - generic [ref=e47]: دخول
  - main [ref=e48]:
    - generic [ref=e49]:
      - generic [ref=e50]:
        - heading "نماذج الاستخدام السريع" [level=2] [ref=e51]: نماذج الاستخدام السريع
        - generic [ref=e53]:
          - button "إحصائياتي" [ref=e54] [cursor=pointer]:
            - img [ref=e55]
            - text: إحصائياتي
          - button "مكتبة القوالب" [ref=e57] [cursor=pointer]:
            - img [ref=e58]
            - text: مكتبة القوالب
      - list [ref=e60]:
        - button "خطاب تغطية (Cover Letter) توظيف وتطوير مهني" [ref=e61]:
          - img [ref=e63]
          - generic:
            - generic: خطاب تغطية (Cover Letter)
            - generic: توظيف وتطوير مهني
        - button "رسالة تواصل LinkedIn توظيف وتطوير مهني" [ref=e66]:
          - img [ref=e68]
          - generic:
            - generic: رسالة تواصل LinkedIn
            - generic: توظيف وتطوير مهني
        - button "رسالة شكر بعد المقابلة توظيف وتطوير مهني" [ref=e71]:
          - img [ref=e73]
          - generic:
            - generic: رسالة شكر بعد المقابلة
            - generic: توظيف وتطوير مهني
        - button "طلب وظيفة شركات خاصة" [ref=e75]:
          - img [ref=e77]
          - generic:
            - generic: طلب وظيفة
            - generic: شركات خاصة
    - generic [ref=e80]:
      - generic [ref=e82]:
        - heading "التخصيص والتفاصيل" [level=2] [ref=e84]:
          - img [ref=e86]
          - text: التخصيص والتفاصيل
        - generic [ref=e88]:
          - button "بيانات الخطاب" [ref=e89] [cursor=pointer]
          - button "الهوية والترويسة" [ref=e90] [cursor=pointer]
          - button "التوقيع والختم" [ref=e91] [cursor=pointer]
        - generic [ref=e94]:
          - generic [ref=e95]:
            - generic [ref=e96]:
              - generic [ref=e97]: نوع الخطاب
              - button "إداري/رسمي" [ref=e98]:
                - generic [ref=e99]:
                  - img [ref=e100]
                  - generic [ref=e104]: إداري/رسمي
                - img [ref=e105]
            - generic [ref=e107]:
              - generic [ref=e109]:
                - generic [ref=e110]: التصنيف
                - button "إضافة للمفضلة" [ref=e111] [cursor=pointer]:
                  - img [ref=e112]
              - button "خطاب طلب (وظيفة، إجازة، مساعدة)" [ref=e114]:
                - generic [ref=e115]:
                  - img [ref=e116]
                  - generic [ref=e119]: خطاب طلب (وظيفة، إجازة، مساعدة)
                - img [ref=e120]
          - generic [ref=e122]:
            - generic [ref=e123]:
              - generic [ref=e124] [cursor=pointer]:
                - img [ref=e125]
                - text: بصمة الأسلوب اللغوي الخاص
              - generic [ref=e128]:
                - button "الملف المهني" [ref=e129] [cursor=pointer]:
                  - img [ref=e130]
                  - text: الملف المهني
                - button "إدارة البصمات" [ref=e133] [cursor=pointer]:
                  - img [ref=e134]
                  - text: إدارة البصمات
            - button "بصمة الأسلوب اللغوي الخاص" [ref=e138]:
              - generic [ref=e140]: توليد تلقائي افتراضي (Default)
              - img [ref=e141]
          - generic [ref=e143]:
            - generic [ref=e144] [cursor=pointer]: تفعيل وضع الرد الذكي على خطاب وارد
            - checkbox "تفعيل وضع الرد الذكي على خطاب وارد" [ref=e145] [cursor=pointer]
          - separator [ref=e146]
          - generic [ref=e147]:
            - generic [ref=e148]:
              - generic [ref=e149]: تاريخ الخطاب
              - textbox "تاريخ الخطاب" [ref=e150]: 2026-07-04
            - generic [ref=e152]:
              - generic [ref=e153]: لغة الخطاب (Language)
              - button "العربية (Arabic)" [ref=e154]:
                - generic [ref=e156]: العربية (Arabic)
                - img [ref=e157]
          - separator [ref=e159]
          - generic [ref=e160]:
            - generic [ref=e161]:
              - text: اسم المرسل
              - generic [ref=e162]: "*"
            - textbox "اسم المرسل *" [ref=e163]:
              - /placeholder: اسمك أو اسم المؤسسة
          - generic [ref=e164]:
            - generic [ref=e165]:
              - generic [ref=e166]: رقم الهاتف
              - textbox "رقم الهاتف" [ref=e167]:
                - /placeholder: "مثال: 0501234567"
            - generic [ref=e168]:
              - generic [ref=e169]: البريد الإلكتروني
              - textbox "البريد الإلكتروني" [ref=e170]:
                - /placeholder: name@example.com
          - generic [ref=e171]:
            - generic [ref=e172]:
              - generic [ref=e173]:
                - text: اسم الموجه إليه
                - generic [ref=e174]: "*"
              - textbox "اسم الموجه إليه *" [ref=e175]:
                - /placeholder: المؤسسة أو الشخص المتلقي
            - generic [ref=e176]:
              - generic [ref=e177]: صفة الموجه إليه
              - textbox "صفة الموجه إليه" [ref=e178]:
                - /placeholder: مدير الموارد البشرية
          - separator [ref=e179]
          - generic [ref=e180]:
            - generic [ref=e181]:
              - generic [ref=e182]:
                - text: موضوع الخطاب / عنوانه
                - generic [ref=e183]: "*"
              - button "اقتراح عنوان ذكي" [ref=e184] [cursor=pointer]:
                - img [ref=e185]
                - text: اقتراح عنوان ذكي
            - textbox "موضوع الخطاب / عنوانه *" [ref=e188]:
              - /placeholder: "اتركه فارغاً، أو ادخل مثال: طلب الموافقة على رصيد إجازة"
          - separator [ref=e189]
          - generic [ref=e190]:
            - generic [ref=e191]: نبرة الخطاب (بنقرة زر)
            - group "نبرة الخطاب (بنقرة زر)" [ref=e192]:
              - button "رسمي" [ref=e193] [cursor=pointer]
              - button "مهني جداً" [ref=e194] [cursor=pointer]
              - button "ودود" [ref=e195] [cursor=pointer]
              - button "حماسي" [ref=e196] [cursor=pointer]
              - button "إقناعي" [ref=e197] [cursor=pointer]
              - button "حازم" [ref=e198] [cursor=pointer]
          - separator [ref=e199]
          - generic [ref=e202]:
            - generic [ref=e203]: مستوى الرسمية
            - button "رسمي" [ref=e204]:
              - generic [ref=e206]: رسمي
              - img [ref=e207]
          - generic [ref=e209]:
            - generic [ref=e210]:
              - generic [ref=e211]: "الصياغة الذكية: تفاصيل الخطاب / المبررات"
              - generic [ref=e212]:
                - button "صوت" [ref=e213] [cursor=pointer]:
                  - img [ref=e214]
                  - text: صوت
                - button "OCR" [ref=e217] [cursor=pointer]:
                  - img [ref=e218]
                  - text: OCR
            - 'textbox "الصياغة الذكية: تفاصيل الخطاب / المبررات" [ref=e221]':
              - /placeholder: اكتب الغرض، وبعض نقاط القوة أو المبررات ليقوم الذكاء الاصطناعي بكتابة وتنسيق الخطاب بالكامل لك...
          - generic [ref=e222]:
            - generic [ref=e223]:
              - generic [ref=e224] [cursor=pointer]: توليد الخطاب تلقائياً أثناء الكتابة
              - checkbox "توليد الخطاب تلقائياً أثناء الكتابة" [ref=e225] [cursor=pointer]
            - button "صياغة الخطاب بالذكاء الاصطناعي" [disabled] [ref=e226]:
              - img [ref=e227]
              - generic [ref=e230]: صياغة الخطاب بالذكاء الاصطناعي
            - button "حفظ كقالب مخصص" [ref=e232] [cursor=pointer]:
              - img [ref=e233]
              - text: حفظ كقالب مخصص
      - generic [ref=e238]:
        - generic [ref=e239]:
          - heading "الخطاب الناتج" [level=2] [ref=e240]
          - generic [ref=e241]:
            - generic [ref=e242]:
              - button "تراجع" [disabled] [ref=e243]:
                - img [ref=e244]
              - button "إعادة" [disabled] [ref=e247]:
                - img [ref=e248]
            - button "مساعد الذكاء الاصطناعي" [disabled] [ref=e251]:
              - img [ref=e252]
              - generic [ref=e255]: مساعد الذكاء الاصطناعي
            - button "حفظ الخطاب" [ref=e257] [cursor=pointer]:
              - img [ref=e258]
              - generic [ref=e262]: حفظ الخطاب
              - img [ref=e263]
            - button "تنزيل وتصدير" [disabled] [ref=e266]:
              - img [ref=e267]
              - generic [ref=e270]: تنزيل وتصدير
              - img [ref=e271]
            - button "مشاركة الخطاب" [disabled] [ref=e274]:
              - img [ref=e275]
              - generic [ref=e281]: مشاركة الخطاب
              - img [ref=e282]
        - generic [ref=e286]:
          - img [ref=e288]
          - paragraph [ref=e291]: لا يوجد خطاب بعد
          - paragraph [ref=e292]: املأ التفاصيل واضغط على زر الإنشاء لتحصل على صياغة رسمية جاهزة للاستخدام.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('test career profile modal typing', async ({ page }) => {
  4  |   await page.goto('http://localhost:3000');
  5  |   
  6  |   // Open career profile modal
  7  |   const button = page.locator('button', { has: page.locator('svg.lucide-user') }).first();
> 8  |   await button.click();
     |                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  9  | 
  10 |   // wait for modal
  11 |   const input = page.locator('input[type="text"]').first();
  12 |   await input.waitFor();
  13 | 
  14 |   // Try typing using keyboard events to simulate user exactly
  15 |   await input.focus();
  16 |   await page.keyboard.type('test typing', { delay: 100 });
  17 |   
  18 |   // wait a bit and check value
  19 |   await page.waitForTimeout(1000);
  20 |   const val = await input.inputValue();
  21 |   console.log('Value after typing:', val);
  22 |   
  23 |   expect(val).toBe('test typing');
  24 | });
  25 | 
```