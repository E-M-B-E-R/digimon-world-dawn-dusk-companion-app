import { test, expect } from '@playwright/test';

test.describe('Evolution Tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Evolution Tree' }).click();
    await page.waitForSelector('[data-testid="digimon-node"]', { timeout: 10_000 });
  });

  test('renders Digimon nodes in the evolution tree', async ({ page }) => {
    const nodes = page.getByTestId('digimon-node');
    await expect(nodes).not.toHaveCount(0);
  });

  test('displays the root Digimon name above the tree', async ({ page }) => {
    const rootName = page.locator('h2').filter({ hasText: /Agumon/i });
    await expect(rootName).toBeVisible();
  });

  test('renders Digimon images inside each node', async ({ page }) => {
    const nodeImages = page.getByTestId('digimon-node').locator('img');
    const count = await nodeImages.count();
    expect(count).toBeGreaterThan(0);
  });

  test('updates the tree when searching for a different Digimon', async ({ page }) => {
    await page.getByPlaceholder('Search Digimon...').fill('Gabumon');

    const suggestions = page.getByTestId('search-suggestions');
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Gabumon', { exact: true }).first().click();

    await page.waitForSelector('[data-testid="digimon-node"]', { timeout: 10_000 });
    const rootName = page.locator('h2').filter({ hasText: /Gabumon/i });
    await expect(rootName).toBeVisible();
  });

  test('shows collapse/expand buttons on nodes that have evolutions', async ({ page }) => {
    const collapseButtons = page.getByRole('button', { name: 'Collapse evolutions' });
    const count = await collapseButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('collapses a subtree when clicking the collapse button', async ({ page }) => {
    const initialNodes = await page.getByTestId('digimon-node').count();

    await page.getByRole('button', { name: 'Collapse evolutions' }).first().click();

    const collapsedNodes = await page.getByTestId('digimon-node').count();
    expect(collapsedNodes).toBeLessThan(initialNodes);
  });

  test('expands a collapsed subtree when clicking the expand button', async ({ page }) => {
    await page.getByRole('button', { name: 'Collapse evolutions' }).first().click();

    const collapsedCount = await page.getByTestId('digimon-node').count();

    await page.getByRole('button', { name: 'Expand evolutions' }).first().click();

    const expandedCount = await page.getByTestId('digimon-node').count();
    expect(expandedCount).toBeGreaterThan(collapsedCount);
  });
});
