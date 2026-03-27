import { test, expect } from '@playwright/test';

test.describe('My Team', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so each test starts with an empty team
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('digimon-team');
      localStorage.removeItem('digimon-team-name');
    });
    await page.reload();
  });

  test('shows 6 empty team slots on first load', async ({ page }) => {
    // Should be on My Team view by default
    const slots = page.locator('div[role="button"]');
    await expect(slots).toHaveCount(6);
  });

  test('selects a slot when clicked', async ({ page }) => {
    const firstSlot = page.locator('div[role="button"]').first();
    await firstSlot.click();

    // After clicking a slot, a search bar should appear for team selection
    // The placeholder changes to indicate slot selection
    const teamSearchInput = page.locator('input[type="text"]').last();
    await expect(teamSearchInput).toBeVisible();
  });

  test('adds a Digimon to the team via search', async ({ page }) => {
    // Click the first empty slot to activate it
    const firstSlot = page.locator('div[role="button"]').first();
    await firstSlot.click();

    // Find the search bar inside MyTeam (should appear at bottom)
    const teamSearchInput = page.locator('input[type="text"]').last();
    await teamSearchInput.fill('Agumon');

    // Wait for suggestions and click the first match
    const suggestions = page.locator('.absolute.top-full');
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Agumon', { exact: false }).first().click();

    // The slot should now show Agumon (no longer an empty plus-icon slot)
    // Verify team now has a Digimon by checking for remove button
    await expect(page.locator('button.bg-red-600').first()).toBeVisible();
  });

  test('removes a Digimon from the team', async ({ page }) => {
    // First add a Digimon
    const firstSlot = page.locator('div[role="button"]').first();
    await firstSlot.click();

    const teamSearchInput = page.locator('input[type="text"]').last();
    await teamSearchInput.fill('Agumon');

    const suggestions = page.locator('.absolute.top-full');
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Agumon', { exact: false }).first().click();

    // Hover over the slot to reveal the remove button
    const filledSlot = page.locator('div[role="button"]').first();
    await filledSlot.hover();

    // Click the remove button (red X)
    const removeButton = page.locator('button.bg-red-600').first();
    await expect(removeButton).toBeVisible();
    await removeButton.click();

    // The slot should be empty again (remove button gone)
    await expect(page.locator('button.bg-red-600')).toHaveCount(0);
  });

  test('displays the team name header', async ({ page }) => {
    // Default team name should be displayed
    const teamName = page.getByRole('heading', { level: 2 });
    await expect(teamName).toBeVisible();
  });

  test('allows editing the team name', async ({ page }) => {
    const teamName = page.getByRole('heading', { level: 2 });
    await teamName.click();

    // Should switch to an input field for editing
    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toBeFocused();

    // Type a new name and confirm
    await nameInput.clear();
    await nameInput.fill('My Dragon Team');
    await nameInput.press('Enter');

    // Heading should update with the new name
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

    // Should revert to original name
    await expect(page.getByRole('heading', { name: originalName! })).toBeVisible();
  });

  test('persists team to localStorage', async ({ page }) => {
    // Add a Digimon to the team
    const firstSlot = page.locator('div[role="button"]').first();
    await firstSlot.click();

    const teamSearchInput = page.locator('input[type="text"]').last();
    await teamSearchInput.fill('Agumon');

    const suggestions = page.locator('.absolute.top-full');
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Agumon', { exact: false }).first().click();

    // Reload the page and verify the team is still there
    await page.reload();

    await expect(page.locator('button.bg-red-600').first()).toBeVisible();
  });

  test('navigates to evolution tree when clicking a filled team slot', async ({ page }) => {
    // Add a Digimon first
    const firstSlot = page.locator('div[role="button"]').first();
    await firstSlot.click();

    const teamSearchInput = page.locator('input[type="text"]').last();
    await teamSearchInput.fill('Agumon');

    const suggestions = page.locator('.absolute.top-full');
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Agumon', { exact: false }).first().click();

    // Click the filled slot (avoid the remove/switch buttons)
    const filledSlot = page.locator('div[role="button"]').first();
    await filledSlot.click();

    // Should navigate to evolution view
    await expect(page).toHaveURL(/#evolution/);
  });
});
