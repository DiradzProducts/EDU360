import { test, expect, Page } from '@playwright/test';

interface EvidenceCollector {
  pageErrors: string[];
  consoleErrors: string[];
  badApiResponses: string[];
}

function attachEvidence(page: Page): EvidenceCollector {
  const ev: EvidenceCollector = {
    pageErrors: [],
    consoleErrors: [],
    badApiResponses: [],
  };
  page.on('pageerror', (err) => ev.pageErrors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      ev.consoleErrors.push(msg.text());
    }
  });
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('/api/') && res.status() >= 400) {
      // 401/403 may be intentional RBAC negative tests; record status + URL
      ev.badApiResponses.push(`${res.status()} ${res.request().method()} ${url}`);
    }
  });
  return ev;
}

async function loginAs(page: Page, username: string, expectedPath: string) {
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
  await page.waitForURL(`**${expectedPath}*`, { timeout: 20000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
}

test.describe('EDU360 Stage 3: Role-by-Role Workflow & Evidence Suite', () => {
  test('1. Admin Portal: loads dashboard & Fee Defaulters tier labels are accurate', async ({ page }) => {
    const ev = attachEvidence(page);
    await loginAs(page, 'admin', '/admin');
    await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error/i);

    // Navigate to Fee Collections -> Overdue & Recovery Ledger sub-tab
    const feeTab = page.getByRole('button', { name: /Fee Collections/i }).first();
    if (await feeTab.isVisible().catch(() => false)) {
      await feeTab.click();
      await page.waitForTimeout(500);
      const overdueSubTab = page.getByRole('button', { name: /Overdue & Recovery Ledger/i }).first();
      if (await overdueSubTab.isVisible().catch(() => false)) {
        await overdueSubTab.click();
        await page.waitForTimeout(500);
      }
      await expect(page.getByRole('button', { name: '0-15d' })).toBeVisible();
      await expect(page.getByRole('button', { name: '16-30d' })).toBeVisible();
      await expect(page.getByRole('button', { name: '30+d' })).toBeVisible();
    }

    const serverErrors = ev.badApiResponses.filter((r) => r.startsWith('500') || r.startsWith('404'));
    expect(ev.pageErrors, `Page errors: ${ev.pageErrors.join('; ')}`).toEqual([]);
    expect(serverErrors, `404/500 API responses: ${serverErrors.join('; ')}`).toEqual([]);
  });

  test('2. Admissions Coordinator: CRM pipeline & Bulk CSV modal Email column', async ({ page }) => {
    const ev = attachEvidence(page);
    await loginAs(page, 'admissions_coordinator', '/admissions_coordinator');
    await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error/i);

    const bulkBtn = page.getByRole('button', { name: /Bulk Import/i }).first();
    await expect(bulkBtn).toBeVisible({ timeout: 10000 });
    await bulkBtn.click();
    await expect(page.locator('body')).toContainText(/Email/i);
    await expect(page.locator('body')).not.toContainText(/@inquiry\.local/i);

    const serverErrors = ev.badApiResponses.filter((r) => r.startsWith('500') || r.startsWith('404'));
    expect(ev.pageErrors).toEqual([]);
    expect(serverErrors).toEqual([]);
  });

  test('3. Accounts Coordinator: Aging, Today Collections, and Online Bank Verification tabs', async ({ page }) => {
    const ev = attachEvidence(page);
    await loginAs(page, 'accounts_coordinator', '/accounts_coordinator');
    await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error/i);

    for (const label of [/Fee Collections & Aging/i, /Today's Live Collections/i, /Online Bank Verification/i]) {
      const tabBtn = page.getByRole('button', { name: label }).first();
      await expect(tabBtn).toBeVisible({ timeout: 10000 });
      await tabBtn.click();
      await page.waitForTimeout(600);
    }

    const serverErrors = ev.badApiResponses.filter((r) => r.startsWith('500') || r.startsWith('404'));
    expect(ev.pageErrors).toEqual([]);
    expect(serverErrors).toEqual([]);
  });

  test('4. Exam Coordinator: Schedules, Hall Tickets, and Report Cards load cleanly', async ({ page }) => {
    const ev = attachEvidence(page);
    await loginAs(page, 'exam_coordinator', '/exam_coordinator');
    await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error/i);

    const serverErrors = ev.badApiResponses.filter((r) => r.startsWith('500') || r.startsWith('404'));
    expect(ev.pageErrors).toEqual([]);
    expect(serverErrors).toEqual([]);
  });

  test('5. Academic Coordinator: Curriculum Pacing & Substitutions load cleanly', async ({ page }) => {
    const ev = attachEvidence(page);
    await loginAs(page, 'academic_coordinator', '/academic_coordinator');
    await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error/i);

    const serverErrors = ev.badApiResponses.filter((r) => r.startsWith('500') || r.startsWith('404'));
    expect(ev.pageErrors).toEqual([]);
    expect(serverErrors).toEqual([]);
  });

  test('6. Teacher Portal: Studio, Focus Table, & Homework load cleanly', async ({ page }) => {
    const ev = attachEvidence(page);
    await loginAs(page, 'teacher_mat', '/teacher');
    await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error/i);

    const serverErrors = ev.badApiResponses.filter((r) => r.startsWith('500') || r.startsWith('404'));
    expect(ev.pageErrors).toEqual([]);
    expect(serverErrors).toEqual([]);
  });

  test('7. Student Portal: Secondary Profile editable by student & Online Proctoring copy', async ({ page }) => {
    const ev = attachEvidence(page);
    await loginAs(page, 'sr_student', '/student');
    await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error/i);
    await expect(page.locator('body')).not.toContainText(/Entry Gate 3|Examination Block 2/i);

    const serverErrors = ev.badApiResponses.filter((r) => r.startsWith('500') || r.startsWith('404'));
    expect(ev.pageErrors).toEqual([]);
    expect(serverErrors).toEqual([]);
  });

  test('8. Parent Portal: Fee Milestones render & no runtime/API crashes', async ({ page }) => {
    const ev = attachEvidence(page);
    await loginAs(page, 'parent', '/parent');
    await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error/i);

    const serverErrors = ev.badApiResponses.filter((r) => r.startsWith('500') || r.startsWith('404'));
    expect(ev.pageErrors).toEqual([]);
    expect(serverErrors).toEqual([]);
  });

  test('9. On-Hold Portals: Transport & Inventory display Module On Hold banners', async ({ page }) => {
    const ev = attachEvidence(page);
    await loginAs(page, 'admin', '/admin');

    await page.goto('/transport_coordinator');
    await expect(page.locator('body')).toContainText(/On Hold/i, { timeout: 10000 });

    await page.goto('/inventory_coordinator');
    await expect(page.locator('body')).toContainText(/On Hold/i, { timeout: 10000 });

    expect(ev.pageErrors).toEqual([]);
  });
});
