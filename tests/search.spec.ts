import { test, expect } from '@playwright/test';

test.describe('Digimon Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Evolution Tree' }).click();
  });

  test('shows search input in evolution view', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search Digimon...');
    await expect(searchInput).toBeVisible();
  });

  test('displays suggestions when typing a Digimon name', async ({ page }) => {
    await page.getByPlaceholder('Search Digimon...').fill('Agumon');

    const suggestions = page.getByTestId('search-suggestions');
    await expect(suggestions).toBeVisible();
    await expect(suggestions.getByText('Agumon', { exact: false }).first()).toBeVisible();
  });

  test('filters suggestions as user types', async ({ page }) => {
    await page.getByPlaceholder('Search Digimon...').fill('Greymon');

    const suggestions = page.getByTestId('search-suggestions');
    await expect(suggestions).toBeVisible();
    await expect(suggestions.getByText(/Greymon/i).first()).toBeVisible();
  });

  test('navigates the tree when a suggestion is selected', async ({ page }) => {
    await page.getByPlaceholder('Search Digimon...').fill('Gabumon');

    const suggestions = page.getByTestId('search-suggestions');
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Gabumon', { exact: false }).first().click();

    await expect(page.getByPlaceholder('Search Digimon...')).toHaveValue('');
    await expect(page).toHaveURL(/#evolution/);
  });

  test('shows no suggestions for unknown input', async ({ page }) => {
    await page.getByPlaceholder('Search Digimon...').fill('xyznotadigimon123');

    const suggestions = page.getByTestId('search-suggestions');
    const isVisible = await suggestions.isVisible().catch(() => false);
    if (isVisible) {
      await expect(suggestions).toBeEmpty();
    }
  });

  test('shows exclusive icons (Dawn/Dusk) for exclusive Digimon', async ({ page }) => {
    // Chibomon is Dawn-exclusive → Sun icon; Kuramon is Dusk-exclusive → Moon icon
    await page.getByPlaceholder('Search Digimon...').fill('Chibomon');
    let suggestions = page.getByTestId('search-suggestions');
    await expect(suggestions).toBeVisible();
    await expect(suggestions.getByRole('img', { name: 'Dawn exclusive' })).toBeVisible();

    await page.getByPlaceholder('Search Digimon...').fill('Kuramon');
    suggestions = page.getByTestId('search-suggestions');
    await expect(suggestions).toBeVisible();
    await expect(suggestions.getByRole('img', { name: 'Dusk exclusive' })).toBeVisible();
  });
});
