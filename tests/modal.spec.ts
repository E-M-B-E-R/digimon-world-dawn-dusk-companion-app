import { test, expect } from '@playwright/test';

// More specific selector for Digimon node cards in the evolution tree
const DIGIMON_NODE = 'div.cursor-pointer.rounded-xl.border-4';

test.describe('Digimon Details Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Evolution Tree' }).click();
    // Wait for Digimon node cards to appear
    await page.waitForSelector(DIGIMON_NODE, { timeout: 10_000 });
  });

  test('opens the details modal when clicking a Digimon node', async ({ page }) => {
    await page.locator(DIGIMON_NODE).first().click();

    // The modal renders an "Evolutions" tab — verifies it is open
    await expect(page.getByRole('button', { name: 'Evolutions' })).toBeVisible();
  });

  test('displays Digimon name in the modal', async ({ page }) => {
    await page.locator(DIGIMON_NODE).first().click();

    // Modal header has an h2 with the Digimon's name
    const modalName = page.locator('h2.text-2xl').last();
    await expect(modalName).toBeVisible();
    const nameText = await modalName.textContent();
    expect(nameText?.trim()).not.toBe('');
  });

  test('closes the modal when clicking the X button', async ({ page }) => {
    await page.locator(DIGIMON_NODE).first().click();

    const evolutionsTab = page.getByRole('button', { name: 'Evolutions' });
    await expect(evolutionsTab).toBeVisible();

    // The close button is the absolute-positioned rounded-full button in the modal header
    const closeButton = page.locator('button.absolute.rounded-full').first();
    await closeButton.click();

    await expect(evolutionsTab).toBeHidden();
  });

  test('closes the modal when clicking the backdrop', async ({ page }) => {
    await page.locator(DIGIMON_NODE).first().click();

    const evolutionsTab = page.getByRole('button', { name: 'Evolutions' });
    await expect(evolutionsTab).toBeVisible();

    // Click the backdrop overlay (fixed overlay behind the modal)
    const backdrop = page.locator('.fixed.inset-0').first();
    await backdrop.click({ position: { x: 10, y: 10 } });

    await expect(evolutionsTab).toBeHidden();
  });

  test('shows the Evolutions tab by default', async ({ page }) => {
    await page.locator(DIGIMON_NODE).first().click();

    const evolutionsTab = page.getByRole('button', { name: 'Evolutions' });
    await expect(evolutionsTab).toBeVisible();
    // Active tab has the border-b-2 underline class
    await expect(evolutionsTab).toHaveClass(/border-b-2/);
  });

  test('switches to DNA Evolution tab when clicked', async ({ page }) => {
    // Omnimon has DNA data; navigate to its tree
    await page.getByPlaceholder('Search Digimon...').fill('Omnimon');
    const suggestions = page.locator('.absolute.top-full');
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Omnimon', { exact: false }).first().click();

    await page.waitForSelector(DIGIMON_NODE, { timeout: 10_000 });
    await page.locator(DIGIMON_NODE, { has: page.locator('text=Omnimon') }).first().click();

    const dnaTab = page.getByRole('button', { name: 'DNA Evolution' });
    await expect(dnaTab).toBeVisible();

    const isDisabled = await dnaTab.getAttribute('disabled');
    if (!isDisabled) {
      await dnaTab.click();
      await expect(dnaTab).toHaveClass(/border-b-2/);
    }
  });

  test('shows the Digimon image in the modal header', async ({ page }) => {
    await page.locator(DIGIMON_NODE).first().click();

    // Image inside the fixed overlay
    const modalImage = page.locator('.fixed img').first();
    await expect(modalImage).toBeVisible();

    const alt = await modalImage.getAttribute('alt');
    expect(alt?.trim()).not.toBe('');
  });
});

