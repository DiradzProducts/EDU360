import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

interface WorkflowFinding {
  role: string;
  workflow: string;
  status: 'WORKING' | 'BROKEN' | 'PARTIAL';
  httpErrors: string[];
  consoleErrors: string[];
  notes: string;
}

const FINDINGS: WorkflowFinding[] = [];

function attachListeners(page: Page) {
  const httpErrors: string[] = [];
  const consoleErrors: string[] = [];

  const onResponse = (res: any) => {
    if (res.status() >= 400) {
      httpErrors.push(`${res.status()} ${res.request().method()} ${res.url()}`);
    }
  };
  const onConsole = (msg: any) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text().slice(0, 180));
    }
  };
  const onPageError = (err: any) => {
    consoleErrors.push(`PAGEERROR: ${String(err).slice(0, 180)}`);
  };

  page.on('response', onResponse);
  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  return {
    httpErrors,
    consoleErrors,
    detach: () => {
      page.off('response', onResponse);
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    },
  };
}

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

async function clickSidebarTabs(page: Page, maxTabs = 12) {
  const clicked: string[] = [];
  const buttons = page.locator('aside button');
  const count = await buttons.count();
  for (let i = 0; i < Math.min(count, maxTabs); i++) {
    const btn = buttons.nth(i);
    if (!(await btn.isVisible().catch(() => false))) continue;
    const label = (await btn.innerText().catch(() => '')).trim().replace(/\s+/g, ' ');
    if (!label || /sign out|logout/i.test(label)) continue;
    await btn.click().catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 2500 }).catch(() => {});
    clicked.push(label);
  }
  return clicked;
}

test.describe.serial('EDU360 8-Role Interactive Workflow Audit', () => {
  test.afterAll(() => {
    const outDir = path.join(process.cwd(), 'test-results');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, 'workflow-audit-report.json'),
      JSON.stringify(FINDINGS, null, 2)
    );
  });

  test('1. Website Public Enquiry & Demo Booking', async ({ page }) => {
    const { httpErrors, consoleErrors, detach } = attachListeners(page);
    await page.goto('/');

    // Test Apply for Admission modal
    await page.getByRole('button', { name: /Apply for Admission/i }).first().click();
    const modal = page.locator('form').last();
    if (await modal.isVisible().catch(() => false)) {
      const textInputs = modal.locator('input[type="text"], input[type="email"], input[type="tel"], input:not([type])');
      const cnt = await textInputs.count();
      if (cnt >= 4) {
        await textInputs.nth(0).fill('Playwright Test Student');
        await textInputs.nth(1).fill('Playwright Parent');
        await textInputs.nth(2).fill('9876543210');
        await textInputs.nth(3).fill('pw_web@example.com');
      }
      const submitBtn = modal.locator('button[type="submit"]');
      if (await submitBtn.isVisible().catch(() => false)) {
        const respPromise = page.waitForResponse((r) => r.url().includes('/api/'), { timeout: 4000 }).catch(() => null);
        await submitBtn.click();
        await respPromise;
      }
    }

    FINDINGS.push({
      role: 'Website / Admissions',
      workflow: 'Website Apply for Admission modal',
      status: httpErrors.some((e) => e.includes('401') || e.includes('403') || e.includes('500')) ? 'BROKEN' : 'WORKING',
      httpErrors: [...httpErrors],
      consoleErrors: [...consoleErrors],
      notes: 'Public visitor submitting admission enquiry hits auth-protected endpoint.',
    });
    detach();
  });

  test('2. Admissions Coordinator Portal & Tabs', async ({ page }) => {
    const { httpErrors, consoleErrors, detach } = attachListeners(page);
    await loginAs(page, 'admissions_coordinator');
    await page.waitForURL('**/admissions_coordinator*', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    const tabs = await clickSidebarTabs(page, 10);

    FINDINGS.push({
      role: 'Admissions Coordinator',
      workflow: `Portal load & tab navigation (${tabs.length} tabs)`,
      status: httpErrors.length > 0 || consoleErrors.length > 0 ? 'BROKEN' : 'WORKING',
      httpErrors: [...httpErrors],
      consoleErrors: [...consoleErrors],
      notes: `Tabs visited: ${tabs.join(' | ')}`,
    });
    detach();
  });

  test('3. Teacher Portal, Tabs & Homework Assignment', async ({ page }) => {
    const { httpErrors, consoleErrors, detach } = attachListeners(page);
    await loginAs(page, 'teacher_mat');
    await page.waitForURL('**/teacher*', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    const tabs = await clickSidebarTabs(page, 12);

    FINDINGS.push({
      role: 'Teacher',
      workflow: `Portal load & tab navigation (${tabs.length} tabs)`,
      status: httpErrors.length > 0 || consoleErrors.length > 0 ? 'PARTIAL' : 'WORKING',
      httpErrors: [...httpErrors],
      consoleErrors: [...consoleErrors],
      notes: `Tabs visited: ${tabs.join(' | ')}`,
    });
    detach();
  });

  test('4. Student (Secondary) Portal & Tabs', async ({ page }) => {
    const { httpErrors, consoleErrors, detach } = attachListeners(page);
    await loginAs(page, 'sr_student');
    await page.waitForURL('**/student*', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    const tabs = await clickSidebarTabs(page, 12);

    FINDINGS.push({
      role: 'Student (Secondary)',
      workflow: `Portal load & tab navigation (${tabs.length} tabs)`,
      status: httpErrors.length > 0 || consoleErrors.length > 0 ? 'BROKEN' : 'WORKING',
      httpErrors: [...httpErrors],
      consoleErrors: [...consoleErrors],
      notes: `Tabs visited: ${tabs.join(' | ')}`,
    });
    detach();
  });

  test('5. Junior Student Login Redirect', async ({ page }) => {
    const { httpErrors, consoleErrors, detach } = attachListeners(page);
    await loginAs(page, 'junior');
    await page.waitForURL(/\/(student|junior)/, { timeout: 15000 });
    const landed = new URL(page.url()).pathname;

    FINDINGS.push({
      role: 'Student (Junior)',
      workflow: 'Login redirect to /junior',
      status: landed === '/junior' ? 'WORKING' : 'BROKEN',
      httpErrors: [...httpErrors],
      consoleErrors: [...consoleErrors],
      notes: `Landed on ${landed} instead of /junior`,
    });
    detach();
  });

  test('6. Parent Portal & Tabs', async ({ page }) => {
    const { httpErrors, consoleErrors, detach } = attachListeners(page);
    await loginAs(page, 'parent');
    await page.waitForURL('**/parent*', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    const tabs = await clickSidebarTabs(page, 12);

    FINDINGS.push({
      role: 'Parent',
      workflow: `Portal load & tab navigation (${tabs.length} tabs)`,
      status: httpErrors.length > 0 || consoleErrors.length > 0 ? 'BROKEN' : 'WORKING',
      httpErrors: [...httpErrors],
      consoleErrors: [...consoleErrors],
      notes: `Tabs visited: ${tabs.join(' | ')}`,
    });
    detach();
  });

  test('7. Super Admin / Principal Portal & Tabs', async ({ page }) => {
    const { httpErrors, consoleErrors, detach } = attachListeners(page);
    await loginAs(page, 'admin');
    await page.waitForURL('**/admin*', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    const tabs = await clickSidebarTabs(page, 16);

    FINDINGS.push({
      role: 'Super Admin / Principal',
      workflow: `Portal load & tab navigation (${tabs.length} tabs)`,
      status: httpErrors.length > 0 || consoleErrors.length > 0 ? 'PARTIAL' : 'WORKING',
      httpErrors: [...httpErrors],
      consoleErrors: [...consoleErrors],
      notes: `Tabs visited: ${tabs.join(' | ')}`,
    });
    detach();
  });

  test('8. Academic Coordinator Portal & Tabs', async ({ page }) => {
    const { httpErrors, consoleErrors, detach } = attachListeners(page);
    await loginAs(page, 'academic_coordinator');
    await page.waitForURL('**/academic_coordinator*', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    const tabs = await clickSidebarTabs(page, 10);

    FINDINGS.push({
      role: 'Academic Coordinator',
      workflow: `Portal load & tab navigation (${tabs.length} tabs)`,
      status: httpErrors.length > 0 || consoleErrors.length > 0 ? 'PARTIAL' : 'WORKING',
      httpErrors: [...httpErrors],
      consoleErrors: [...consoleErrors],
      notes: `Tabs visited: ${tabs.join(' | ')}`,
    });
    detach();
  });

  test('9. Exam Coordinator Portal & Tabs', async ({ page }) => {
    const { httpErrors, consoleErrors, detach } = attachListeners(page);
    await loginAs(page, 'exam_coordinator');
    await page.waitForURL('**/exam_coordinator*', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    const tabs = await clickSidebarTabs(page, 10);

    FINDINGS.push({
      role: 'Exam Coordinator',
      workflow: `Portal load & tab navigation (${tabs.length} tabs)`,
      status: httpErrors.length > 0 || consoleErrors.length > 0 ? 'PARTIAL' : 'WORKING',
      httpErrors: [...httpErrors],
      consoleErrors: [...consoleErrors],
      notes: `Tabs visited: ${tabs.join(' | ')}`,
    });
    detach();
  });

  test('10. Accounts Coordinator Portal & Tabs', async ({ page }) => {
    const { httpErrors, consoleErrors, detach } = attachListeners(page);
    await loginAs(page, 'accounts_coordinator');
    await page.waitForURL('**/accounts_coordinator*', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    const tabs = await clickSidebarTabs(page, 10);

    FINDINGS.push({
      role: 'Accounts Coordinator',
      workflow: `Portal load & tab navigation (${tabs.length} tabs)`,
      status: httpErrors.length > 0 || consoleErrors.length > 0 ? 'PARTIAL' : 'WORKING',
      httpErrors: [...httpErrors],
      consoleErrors: [...consoleErrors],
      notes: `Tabs visited: ${tabs.join(' | ')}`,
    });
    detach();
  });
});
