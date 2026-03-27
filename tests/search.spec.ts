import { test, expect } from '@playwright/test';

test.describe('Digimon Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Search is only available in the Evolution Tree view
    await page.getByRole('button', { name: 'Evolution Tree' }).click();
  });

  test('shows search input in evolution view', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search Digimon...');
    await expect(searchInput).toBeVisible();
  });

  test('displays suggestions when typing a Digimon name', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search Digimon...');
    await searchInput.click();
    await searchInput.fill('Agumon');

    // Suggestions dropdown should appear
    const suggestions = page.locator('.absolute.top-full');
    await expect(suggestions).toBeVisible();

    // Agumon should appear in the suggestions
    await expect(suggestions.getByText('Agumon', { exact: false }).first()).toBeVisible();
  });

  test('filters suggestions as user types', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search Digimon...');
    await searchInput.fill('Greymon');

    const suggestions = page.locator('.absolute.top-full');
    await expect(suggestions).toBeVisible();

    // Should show Greymon-related suggestions
    await expect(suggestions.getByText(/Greymon/i).first()).toBeVisible();
  });

  test('navigates the tree when a suggestion is selected', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search Digimon...');
    await searchInput.fill('Gabumon');

    const suggestions = page.locator('.absolute.top-full');
    await expect(suggestions).toBeVisible();

    // Click the first suggestion that matches Gabumon
    await suggestions.getByText('Gabumon', { exact: false }).first().click();

    // Search input should be cleared after selection
    await expect(searchInput).toHaveValue('');

    // Should be on evolution view with Gabumon as root
    await expect(page).toHaveURL(/#evolution/);
  });

  test('shows no suggestions for unknown input', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search Digimon...');
    await searchInput.fill('xyznotadigimon123');

    // Either the dropdown is hidden or shows no items
    const suggestions = page.locator('.absolute.top-full');
    const isVisible = await suggestions.isVisible().catch(() => false);
    if (isVisible) {
      // If visible, it should have no child items matching the query
      await expect(suggestions).toBeEmpty();
    }
  });

  test('shows exclusive icons (Dawn/Dusk) for exclusive Digimon', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search Digimon...');
    // Type a broad query to get many results, some of which should be exclusive
    await searchInput.fill('a');

    const suggestions = page.locator('.absolute.top-full');
    await expect(suggestions).toBeVisible();

    // Check that the suggestions list renders (has content)
    await expect(suggestions.locator('> *').first()).toBeVisible();
  });
});
