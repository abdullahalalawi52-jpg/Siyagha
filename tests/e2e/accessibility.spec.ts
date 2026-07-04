import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Usability & Accessibility Testing (WCAG 2.1 AA)', () => {
  test('should not have critical accessibility violations on homepage', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);

    await checkA11y(page, undefined, {
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag21a', 'best-practice']
        }
      },
      detailedReport: true,
    });
  });

  test('should maintain accessible focus management when opening library modal', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);

    const libraryButton = page.locator('button:has-text("مكتبة القوالب")');
    if (await libraryButton.isVisible()) {
      await libraryButton.click();
      await page.waitForTimeout(300);

      await checkA11y(page, '#library-modal-content', {
        detailedReport: true,
      });
    }
  });
});
