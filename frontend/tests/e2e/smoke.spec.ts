import { test, expect, Page } from '@playwright/test';

const ROLE_LOGINS = [
  { username: 'admin', expectedPath: '/admin' },
  { username: 'academic_coordinator', expectedPath: '/academic_coordinator' },
  { username: 'exam_coordinator', expectedPath: '/exam_coordinator' },
  { username: 'accounts_coordinator', expectedPath: '/accounts_coordinator' },
  { username: 'admissions_coordinator', expectedPath: '/admissions_coordinator' },
  { username: 'teacher_mat', expectedPath: '/teacher' },
  { username: 'sr_student', expectedPath: '/student' },
  { username: 'junior', expectedPath: '/junior' },
  { username: 'parent', expectedPath: '/parent' },
];

async function loginAs(page: Page, username: string) {
  await page.goto('/login');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/login');
  const inputs = page.locator('form input');
  await inputs.nth(1).fill(username);
  await inputs.nth(2).fill('Password123');
  await page.locator('form button[type="submit"]').click();
}

test.describe('EDU360 Public & Role Portal Smoke Suite', () => {
  test('public landing, login, and register pages render without runtime errors', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));

    for (const route of ['/', '/login', '/register']) {
      await page.goto(route);
      await expect(page.locator('body')).not.toBeEmpty();
      await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error/i);
    }

    expect(pageErrors).toEqual([]);
  });

  for (const { username, expectedPath } of ROLE_LOGINS) {
    test(`role login & portal load: ${username} -> ${expectedPath}`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (err) => pageErrors.push(String(err)));

      await loginAs(page, username);
      await page.waitForURL(`**${expectedPath}*`, { timeout: 15000 });
      await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error/i);

      expect(pageErrors).toEqual([]);
    });
  }
});
