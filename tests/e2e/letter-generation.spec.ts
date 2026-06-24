import { test, expect } from '@playwright/test';

test.describe('Functionality Testing: Letter Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Close any onboarding or modals if they exist
  });

  test('should fill the form and generate a letter successfully', async ({ page }) => {
    // Mock the backend API response to avoid actual Gemini API calls
    await page.route('**/api/generate-letter', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ text: 'هذا خطاب تجريبي ومكتوب بواسطة الذكاء الاصطناعي.\n\nنشكركم على حسن تعاونكم.' }),
      });
    });

    // Fill in sender information
    await page.fill('input[placeholder="اسمك أو اسم المؤسسة"]', 'شركة التقنية المتقدمة');
    
    // Fill recipient information
    await page.fill('input[placeholder="المؤسسة أو الشخص المتلقي"]', 'وزارة الاتصالات وتقنية المعلومات');
    
    // Fill subject
    await page.fill('input[placeholder*="طلب الموافقة"]', 'طلب الموافقة على تجديد الترخيص');
    
    // Fill details textarea
    await page.fill('textarea#details-textarea', 'نأمل منكم التكرم بالموافقة على تجديد الترخيص السنوي الخاص بالشركة نظراً لاكتمال كافة المتطلبات والشروط اللازمة، وذلك لضمان استمرارية العمل بدون توقف.');
    
    // Click Generate Button
    const generateButton = page.locator('button:has-text("صياغة الخطاب بالذكاء الاصطناعي")');
    await generateButton.click();

    // Verify loading state or wait for AI to finish (assuming it shows in the preview area)
    // The preview textarea should not be empty after generation
    const previewArea = page.locator('textarea#preview-textarea');
    await expect(previewArea).not.toBeEmpty({ timeout: 15000 });
  });

  test('should allow changing the tone and formality', async ({ page }) => {
    // Wait for the page to be ready
    await expect(page.locator('button:has-text("صياغة الخطاب بالذكاء الاصطناعي")')).toBeVisible();
    
    // Change Tone to "ودود"
    await page.locator('button:has-text("ودود")').click();

    // Change Formality to "رسمي جداً"
    const formalitySelect = page.locator('button#formality-select');
    await formalitySelect.click();
    await page.locator('button:has-text("رسمي جداً")').click();

    // Verify selection changed
    await expect(page.locator('button:has-text("ودود")')).toHaveClass(/bg-brown-600/);
    await expect(formalitySelect).toHaveText(/رسمي جداً/);
  });
});
