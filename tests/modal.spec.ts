import { test, expect } from '@playwright/test';

const DIGIMON_NODE = '[data-testid="digimon-node"]';

test.describe('Digimon Details Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Evolution Tree' }).click();
    await page.waitForSelector(DIGIMON_NODE, { timeout: 10_000 });
  });

  test('opens the details modal when clicking a Digimon node', async ({ page }) => {
    await page.locator(DIGIMON_NODE).first().click();

    await expect(page.getByRole('button', { name: /^Evolutions$/ })).toBeVisible();
  });

  test('displays Digimon name in the modal', async ({ page }) => {
    await page.locator(DIGIMON_NODE).first().click();

    const modal = page.getByTestId('modal-backdrop');
    await expect(modal).toBeVisible();
    const modalName = modal.locator('h2').first();
    await expect(modalName).toBeVisible();
    const nameText = await modalName.textContent();
    expect(nameText?.trim()).not.toBe('');
  });

  test('closes the modal when clicking the X button', async ({ page }) => {
    await page.locator(DIGIMON_NODE).first().click();

    const evolutionsTab = page.getByRole('button', { name: /^Evolutions$/ });
    await expect(evolutionsTab).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();

    await expect(evolutionsTab).toBeHidden();
  });

  test('closes the modal when clicking the backdrop', async ({ page }) => {
    await page.locator(DIGIMON_NODE).first().click();

    const evolutionsTab = page.getByRole('button', { name: /^Evolutions$/ });
    await expect(evolutionsTab).toBeVisible();

    await page.getByTestId('modal-backdrop').click({ position: { x: 10, y: 10 } });

    await expect(evolutionsTab).toBeHidden();
  });

  test('shows the Evolutions tab by default', async ({ page }) => {
    await page.locator(DIGIMON_NODE).first().click();

    const evolutionsTab = page.getByRole('button', { name: /^Evolutions$/ });
    await expect(evolutionsTab).toBeVisible();
    await expect(evolutionsTab).toHaveClass(/border-b-2/);
  });

  test('switches to DNA Evolution tab when clicked', async ({ page }) => {
    await page.getByPlaceholder('Search Digimon...').fill('Omnimon');
    const suggestions = page.getByTestId('search-suggestions');
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Omnimon', { exact: true }).first().click();

    await page.waitForSelector(DIGIMON_NODE, { timeout: 10_000 });
    await page.locator(DIGIMON_NODE, { has: page.locator('text=Omnimon') }).first().click();

    const modal = page.getByTestId('modal-backdrop');
    await expect(modal).toBeVisible();

    const dnaTab = modal.getByRole('button', { name: 'DNA Evolution' });
    await expect(dnaTab).toBeVisible();
    await expect(dnaTab).toBeEnabled();
    await dnaTab.click();
    await expect(dnaTab).toHaveClass(/border-b-2/);
  });

  test('shows the Digimon image in the modal header', async ({ page }) => {
    await page.locator(DIGIMON_NODE).first().click();

    const modalImage = page.locator('.fixed img').first();
    await expect(modalImage).toBeVisible();

    const alt = await modalImage.getAttribute('alt');
    expect(alt?.trim()).not.toBe('');
  });
});

