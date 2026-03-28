import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads with My Team view active by default', async ({ page }) => {
    await expect(page).toHaveTitle(/Digimon/);

    // My Team tab should be active (has bg-white/20 class indicating active state)
    const myTeamButton = page.getByRole('button', { name: 'My Team' });
    await expect(myTeamButton).toBeVisible();
    await expect(myTeamButton).toHaveClass(/bg-white\/20/);
  });

  test('switches to Evolution Tree view when clicking tab', async ({ page }) => {
    await page.getByRole('button', { name: 'Evolution Tree' }).click();

    // Evolution Tree tab should become active
    const evolutionButton = page.getByRole('button', { name: 'Evolution Tree' });
    await expect(evolutionButton).toHaveClass(/bg-white\/20/);

    // Search bar should be visible (it only shows in evolution view)
    await expect(page.getByPlaceholder('Search Digimon...')).toBeVisible();
  });

  test('shows search bar only in Evolution Tree view', async ({ page }) => {
    // My Team view (default) should not have the search bar in the header
    const searchInput = page.getByPlaceholder('Search Digimon...');
    await expect(searchInput).toBeHidden();

    // Switch to Evolution Tree view
    await page.getByRole('button', { name: 'Evolution Tree' }).click();

    // Search bar should now be visible in the header
    await expect(searchInput).toBeVisible();
  });

  test('switches back to My Team view from Evolution Tree', async ({ page }) => {
    // Go to Evolution view first
    await page.getByRole('button', { name: 'Evolution Tree' }).click();
    await expect(page.getByPlaceholder('Search Digimon...')).toBeVisible();

    // Switch back to My Team
    await page.getByRole('button', { name: 'My Team' }).click();

    const myTeamButton = page.getByRole('button', { name: 'My Team' });
    await expect(myTeamButton).toHaveClass(/bg-white\/20/);

    // Search bar should be hidden in My Team view
    await expect(page.getByPlaceholder('Search Digimon...')).toBeHidden();
  });

  test('displays the app title in the header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Digimon Evolution Tree/ })).toBeVisible();
  });
});
