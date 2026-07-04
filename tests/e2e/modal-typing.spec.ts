import { test, expect } from '@playwright/test';

test('test career profile modal typing', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Open career profile modal
  const button = page.locator('button', { has: page.locator('svg.lucide-user') }).first();
  await button.click();

  // wait for modal
  const input = page.locator('input[type="text"]').first();
  await input.waitFor();

  // Try typing using keyboard events to simulate user exactly
  await input.focus();
  await page.keyboard.type('test typing', { delay: 100 });
  
  // wait a bit and check value
  await page.waitForTimeout(1000);
  const val = await input.inputValue();
  console.log('Value after typing:', val);
  
  expect(val).toBe('test typing');
});
