import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright'; // Usually we use axe-playwright or @axe-core/playwright

test.describe('Usability & Accessibility Testing', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    // Inject axe-core into the page
    await injectAxe(page);
    
    // Check accessibility
    // We use checkA11y to assert that there are no violations
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });
});
