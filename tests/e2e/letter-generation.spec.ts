import { test, expect } from '@playwright/test';

test.describe('Functionality Testing: Letter Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Close any onboarding or modals if they exist
  });

  test('should fill the form and generate a letter successfully', async ({ page }) => {
    // Fill in sender information
    await page.fill('input[placeholder="اسمك أو اسم المؤسسة"]', 'شركة التقنية المتقدمة');
    
    // Fill recipient information
    await page.fill('input[placeholder="مثال: أحمد محمد"]', 'وزارة الاتصالات وتقنية المعلومات');
    
    // Fill subject
    await page.fill('input[placeholder*="مثال: طلب الموافقة"]', 'طلب الموافقة على تجديد الترخيص');
    
    // Fill details textarea
    await page.fill('textarea', 'نأمل منكم التكرم بالموافقة على تجديد الترخيص السنوي الخاص بالشركة نظراً لاكتمال كافة المتطلبات والشروط اللازمة، وذلك لضمان استمرارية العمل بدون توقف.');
    
    // Click Generate Button
    const generateButton = page.locator('button:has-text("توليد الخطاب الآن")');
    await generateButton.click();

    // Verify loading state or wait for AI to finish (assuming it shows in the preview area)
    // The preview textarea should not be empty after generation
    const previewArea = page.locator('textarea.w-full');
    await expect(previewArea).not.toBeEmpty({ timeout: 15000 });
  });

  test('should allow changing the tone and formality', async ({ page }) => {
    // Test selecting a different tone from the dropdowns
    // Depending on the implementation of CustomSelect, it might be a button click followed by an option click
    
    // Wait for the form to be ready
    await expect(page.locator('button:has-text("نبرة رسمية ومهنية")').first()).toBeVisible();
    
    // Change Tone
    await page.locator('button:has-text("نبرة رسمية ومهنية")').first().click();
    await page.locator('button:has-text("نبرة ودية وإيجابية")').click();

    // Change Formality
    await page.locator('button:has-text("رسمي (الافتراضي)")').first().click();
    await page.locator('button:has-text("رسمي جداً")').click();

    // Verify selection changed
    await expect(page.locator('button:has-text("نبرة ودية وإيجابية")')).toBeVisible();
    await expect(page.locator('button:has-text("رسمي جداً")')).toBeVisible();
  });
});
