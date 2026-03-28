import { test, expect } from '@playwright/test';

test.describe('My Team', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('digimon-team');
      localStorage.removeItem('digimon-team-name');
    });
    await page.reload();
  });

  test('shows 6 empty team slots on first load', async ({ page }) => {
    const slots = page.locator('div[role="button"]');
    await expect(slots).toHaveCount(6);
  });

  test('selects a slot when clicked', async ({ page }) => {
    await page.locator('div[role="button"]').first().click();

    const teamSearchInput = page.locator('input[type="text"]').last();
    await expect(teamSearchInput).toBeVisible();
  });

  test('adds a Digimon to the team via search', async ({ page }) => {
    await page.locator('div[role="button"]').first().click();

    const teamSearchInput = page.locator('input[type="text"]').last();
    await teamSearchInput.fill('Agumon');

    const suggestions = page.getByTestId('search-suggestions');
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Agumon', { exact: true }).first().click();

    await expect(page.getByRole('button', { name: 'Remove from team' }).first()).toBeVisible();
  });

  test('removes a Digimon from the team', async ({ page }) => {
    await page.locator('div[role="button"]').first().click();

    const teamSearchInput = page.locator('input[type="text"]').last();
    await teamSearchInput.fill('Agumon');

    const suggestions = page.getByTestId('search-suggestions');
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Agumon', { exact: true }).first().click();

    await page.locator('div[role="button"]').first().hover();

    const removeButton = page.getByRole('button', { name: 'Remove from team' }).first();
    await expect(removeButton).toBeVisible();
    await removeButton.click();

    await expect(page.getByRole('button', { name: 'Remove from team' })).toHaveCount(0);
  });

  test('displays the team name header', async ({ page }) => {
    const teamName = page.getByRole('heading', { level: 2 });
    await expect(teamName).toBeVisible();
  });

  test('allows editing the team name', async ({ page }) => {
    const teamName = page.getByRole('heading', { level: 2 });
    await teamName.click();

    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toBeFocused();

    await nameInput.clear();
    await nameInput.fill('My Dragon Team');
    await nameInput.press('Enter');

    await expect(page.getByRole('heading', { name: 'My Dragon Team' })).toBeVisible();
  });

  test('cancels team name edit on Escape key', async ({ page }) => {
    const teamName = page.getByRole('heading', { level: 2 });
    const originalName = await teamName.textContent();

    await teamName.click();

    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill('Temp Name');
    await nameInput.press('Escape');

    await expect(page.getByRole('heading', { name: originalName! })).toBeVisible();
  });

  test('persists team to localStorage', async ({ page }) => {
    await page.locator('div[role="button"]').first().click();

    const teamSearchInput = page.locator('input[type="text"]').last();
    await teamSearchInput.fill('Agumon');

    const suggestions = page.getByTestId('search-suggestions');
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Agumon', { exact: true }).first().click();

    await page.reload();

    await expect(page.getByRole('button', { name: 'Remove from team' }).first()).toBeVisible();
  });

  test('navigates to evolution tree when clicking a filled team slot', async ({ page }) => {
    await page.locator('div[role="button"]').first().click();

    const teamSearchInput = page.locator('input[type="text"]').last();
    await teamSearchInput.fill('Agumon');

    const suggestions = page.getByTestId('search-suggestions');
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Agumon', { exact: true }).first().click();

    await page.locator('div[role="button"]').first().click();

    await expect(page).toHaveURL(/#evolution/);
  });
});
