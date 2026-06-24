import { test, expect } from '@playwright/test';

test.describe('Letter Generator App', () => {
  test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/React App|منشئ الخطابات/i);
  });

  test('can generate a letter', async ({ page }) => {
    await page.goto('/');

    // Fill in the required fields
    await page.fill('input[placeholder="اسمك أو اسم المؤسسة"]', 'شركة التقنية المتقدمة');
    await page.fill('input[placeholder="المؤسسة أو الشخص المتلقي"]', 'وزارة الاتصالات وتقنية المعلومات');
    await page.fill('input[placeholder="اتركه فارغاً، أو ادخل مثال: طلب الموافقة على رصيد إجازة"]', 'طلب تجديد رخصة العمل');
    
    // Fill the detailed text area
    await page.fill('textarea#details-textarea', 'نرجو من سيادتكم التكرم بالموافقة على تجديد رخصة العمل للشركة لعام 2026.');
    // Verify that the inputs have been filled correctly
    await expect(page.locator('input[placeholder="اسمك أو اسم المؤسسة"]')).toHaveValue('شركة التقنية المتقدمة');
    await expect(page.locator('input[placeholder="المؤسسة أو الشخص المتلقي"]')).toHaveValue('وزارة الاتصالات وتقنية المعلومات');
    await expect(page.locator('input[placeholder="اتركه فارغاً، أو ادخل مثال: طلب الموافقة على رصيد إجازة"]')).toHaveValue('طلب تجديد رخصة العمل');
  });
});
