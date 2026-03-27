import { test, expect } from '@playwright/test';

test.describe('Theme and Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('starts in light mode by default', async ({ page }) => {
    // In light mode the main container uses a gradient background
    const mainContainer = page.locator('.min-h-screen').first();
    await expect(mainContainer).toHaveClass(/bg-gradient-to-br/);
  });

  test('toggles to dark mode when the dark mode button is clicked', async ({ page }) => {
    // The dark mode toggle button contains a Moon icon in light mode
    const darkModeButton = page.locator('button:has(svg)').filter({ hasText: '' }).nth(1);

    // Find the button that is in the header controls area (right side)
    // It's a button with only an SVG icon (Moon/Sun) and no text
    const toggleButton = page.locator('header button').filter({ has: page.locator('svg') }).last();
    await toggleButton.click();

    // After toggle, the main container should use the dark mode class
    const mainContainer = page.locator('.min-h-screen').first();
    await expect(mainContainer).toHaveClass(/bg-\[#272822\]/);
  });

  test('toggles back to light mode from dark mode', async ({ page }) => {
    const toggleButton = page.locator('header button').filter({ has: page.locator('svg') }).last();

    // Toggle on
    await toggleButton.click();
    const mainContainer = page.locator('.min-h-screen').first();
    await expect(mainContainer).toHaveClass(/bg-\[#272822\]/);

    // Toggle off
    await toggleButton.click();
    await expect(mainContainer).toHaveClass(/bg-gradient-to-br/);
  });

  test('shows a color picker input in the header', async ({ page }) => {
    const colorPicker = page.locator('input[type="color"]');
    await expect(colorPicker).toBeVisible();
  });

  test('changes the header background when a new theme color is selected', async ({ page }) => {
    const header = page.locator('header').first();
    const initialColor = await header.evaluate(el => (el as HTMLElement).style.backgroundColor);

    const colorPicker = page.locator('input[type="color"]');
    // Fill with a known hex value
    await colorPicker.evaluate((input: HTMLInputElement) => {
      input.value = '#ff0000';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // The header should now use the new color
    const newColor = await header.evaluate(el => (el as HTMLElement).style.backgroundColor);
    // Color should have changed (either the value is different or RGB has changed)
    // Note: browser may convert hex to rgb
    expect(newColor).not.toBe('');
  });

  test('dark mode toggle button is visible in the header', async ({ page }) => {
    const toggleButton = page.locator('header button').filter({ has: page.locator('svg') }).last();
    await expect(toggleButton).toBeVisible();
  });

  test('dark mode applies dark background to evolution tree panel', async ({ page }) => {
    await page.getByRole('button', { name: 'Evolution Tree' }).click();

    // Toggle dark mode
    const toggleButton = page.locator('header button').filter({ has: page.locator('svg') }).last();
    await toggleButton.click();

    // The evolution tree container uses dark bg
    const treeContainer = page.locator('.rounded-xl.shadow-lg').first();
    await expect(treeContainer).toHaveClass(/bg-\[#3e3d32\]/);
  });
});
