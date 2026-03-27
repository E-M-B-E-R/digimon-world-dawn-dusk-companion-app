import { test, expect } from '@playwright/test';

test.describe('Evolution Tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Evolution Tree' }).click();
    await page.waitForSelector('.cursor-pointer', { timeout: 10_000 });
  });

  test('renders Digimon nodes in the evolution tree', async ({ page }) => {
    const nodes = page.locator('.cursor-pointer');
    await expect(nodes).not.toHaveCount(0);
  });

  test('displays the root Digimon name above the tree', async ({ page }) => {
    // The root Digimon name (Agumon by default) appears as a heading above the tree
    const rootName = page.locator('h2').filter({ hasText: /Agumon/i });
    await expect(rootName).toBeVisible();
  });

  test('renders Digimon images inside each node', async ({ page }) => {
    // Each node should have an img element
    const nodeImages = page.locator('.cursor-pointer img');
    const count = await nodeImages.count();
    expect(count).toBeGreaterThan(0);
  });

  test('updates the tree when searching for a different Digimon', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search Digimon...');
    await searchInput.fill('Gabumon');

    const suggestions = page.locator('.absolute.top-full');
    await expect(suggestions).toBeVisible();
    await suggestions.getByText('Gabumon', { exact: false }).first().click();

    // Tree should now show Gabumon as root
    await page.waitForSelector('.cursor-pointer', { timeout: 10_000 });
    const rootName = page.locator('h2').filter({ hasText: /Gabumon/i });
    await expect(rootName).toBeVisible();
  });

  test('shows collapse/expand buttons on nodes that have evolutions', async ({ page }) => {
    // Nodes with evolutions have a circular +/- button
    const collapseButtons = page.locator('.cursor-pointer button').filter({ has: page.locator('span') });
    const count = await collapseButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('collapses a subtree when clicking the collapse button', async ({ page }) => {
    const initialNodes = await page.locator('.cursor-pointer').count();

    // Find a collapse button (the "-" button on nodes with sub-evolutions)
    const collapseButton = page.locator('button').filter({ hasText: '-' }).first();
    await collapseButton.click();

    // After collapsing, there should be fewer nodes visible
    const collapsedNodes = await page.locator('.cursor-pointer').count();
    expect(collapsedNodes).toBeLessThan(initialNodes);
  });

  test('expands a collapsed subtree when clicking the expand button', async ({ page }) => {
    // Collapse first
    const collapseButton = page.locator('button').filter({ hasText: '-' }).first();
    await collapseButton.click();

    const collapsedCount = await page.locator('.cursor-pointer').count();

    // Expand by clicking "+"
    const expandButton = page.locator('button').filter({ hasText: '+' }).first();
    await expandButton.click();

    const expandedCount = await page.locator('.cursor-pointer').count();
    expect(expandedCount).toBeGreaterThan(collapsedCount);
  });
});
