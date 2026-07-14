import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'screenshots');
const BASE = 'http://127.0.0.1:5173';
const TOKEN = 'mock-jwt-token';

const USERS = {
  employee: { id: 3, name: 'Sam Employee', email: 'employee@expense.com', role: 'employee' },
  manager: { id: 2, name: 'Alex Manager', email: 'manager@expense.com', role: 'manager' },
  admin: { id: 1, name: 'System Admin', email: 'admin@expense.com', role: 'admin' },
};

const expenses = [
  {
    id: 1, employee_id: 3, employee_name: 'Sam Employee', employee_email: 'employee@expense.com',
    title: 'Client Visit Travel', category: 'Travel', amount: 245.5, expense_date: '2026-06-12',
    description: 'Train tickets to client site', receipt: 'train-receipt.pdf', status: 'pending',
    manager_comments: null, created_at: '2026-06-12T10:00:00',
  },
  {
    id: 2, employee_id: 3, employee_name: 'Sam Employee', employee_email: 'employee@expense.com',
    title: 'Team Lunch', category: 'Food', amount: 86, expense_date: '2026-06-18',
    description: 'Lunch with project team', receipt: 'lunch.jpg', status: 'approved',
    manager_comments: 'Approved — within policy', created_at: '2026-06-18T12:00:00',
  },
  {
    id: 3, employee_id: 3, employee_name: 'Sam Employee', employee_email: 'employee@expense.com',
    title: 'Monitor Stand', category: 'Equipment', amount: 120, expense_date: '2026-05-22',
    description: 'Ergonomic stand for WFH', receipt: 'stand-receipt.pdf', status: 'rejected',
    manager_comments: 'Please use IT procurement', created_at: '2026-05-22T09:00:00',
  },
  {
    id: 4, employee_id: 4, employee_name: 'Jordan Lee', employee_email: 'jordan@expense.com',
    title: 'Conference Registration', category: 'Training', amount: 499, expense_date: '2026-07-01',
    description: 'Annual tech conference fee', receipt: 'conference.pdf', status: 'pending',
    manager_comments: null, created_at: '2026-07-01T11:00:00',
  },
  {
    id: 5, employee_id: 4, employee_name: 'Jordan Lee', employee_email: 'jordan@expense.com',
    title: 'Office Stationery', category: 'Office Supplies', amount: 34.75, expense_date: '2026-06-28',
    description: 'Notebooks and pens', receipt: 'stationery.pdf', status: 'approved',
    manager_comments: 'OK', created_at: '2026-06-28T15:00:00',
  },
  {
    id: 6, employee_id: 3, employee_name: 'Sam Employee', employee_email: 'employee@expense.com',
    title: 'Taxi to Airport', category: 'Travel', amount: 55, expense_date: '2026-07-05',
    description: 'Airport transfer for offsite', receipt: 'taxi.jpg', status: 'pending',
    manager_comments: null, created_at: '2026-07-05T08:00:00',
  },
];

const statsAll = {
  total_submitted: 6, pending: 3, approved: 2, rejected: 1, cancelled: 0,
  total_reimbursement: 120.75, total_amount: 1040.25,
};
const statsEmployee = {
  total_submitted: 4, pending: 2, approved: 1, rejected: 1, cancelled: 0,
  total_reimbursement: 86, total_amount: 506.5,
};

function fulfill(route, data, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify(data),
  });
}

async function setupMocks(page, role = 'employee') {
  const profile = USERS[role];

  await page.route(/http:\/\/(localhost|127\.0\.0\.1):5000\/api\/.*/, async (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const u = new URL(req.url());
    const p = u.pathname.replace(/\/+$/, '');
    const method = req.method();

    if (p.endsWith('/login') && method === 'POST') {
      const body = JSON.parse(req.postData() || '{}');
      const matched = Object.values(USERS).find((x) => x.email === body.email) || profile;
      return fulfill(route, { message: 'Login successful', token: TOKEN, user: matched });
    }
    if (p.endsWith('/profile')) return fulfill(route, profile);
    if (p.endsWith('/dashboard/employee')) {
      return fulfill(route, {
        stats: statsEmployee,
        recent: expenses.filter((e) => e.employee_id === 3).slice(0, 5),
      });
    }
    if (p.endsWith('/dashboard/manager')) {
      return fulfill(route, {
        stats: statsAll,
        pending: expenses.filter((e) => e.status === 'pending'),
      });
    }
    if (p.endsWith('/dashboard/admin')) {
      return fulfill(route, {
        stats: statsAll,
        monthly: [
          { month: '2026-05', count: 1, total_amount: 120, approved_amount: 0 },
          { month: '2026-06', count: 3, total_amount: 366.25, approved_amount: 120.75 },
          { month: '2026-07', count: 2, total_amount: 554, approved_amount: 0 },
        ],
        byCategory: [
          { category: 'Travel', count: 2, total: 300.5 },
          { category: 'Training', count: 1, total: 499 },
          { category: 'Equipment', count: 1, total: 120 },
          { category: 'Food', count: 1, total: 86 },
          { category: 'Office Supplies', count: 1, total: 34.75 },
        ],
        byStatus: [
          { status: 'pending', count: 3, total: 799.5 },
          { status: 'approved', count: 2, total: 120.75 },
          { status: 'rejected', count: 1, total: 120 },
        ],
        users: { total_users: 4, employees: 2, managers: 1, admins: 1 },
      });
    }
    if (p.endsWith('/users/employees')) {
      return fulfill(route, [
        { id: 3, name: 'Sam Employee', email: 'employee@expense.com' },
        { id: 4, name: 'Jordan Lee', email: 'jordan@expense.com' },
      ]);
    }
    if (p.endsWith('/users') && method === 'GET') {
      return fulfill(route, [
        USERS.admin, USERS.manager, USERS.employee,
        { id: 4, name: 'Jordan Lee', email: 'jordan@expense.com', role: 'employee' },
      ]);
    }
    if (/\/expenses\/\d+$/.test(p) && method === 'GET') {
      const id = Number(p.split('/').pop());
      return fulfill(route, expenses.find((e) => e.id === id) || expenses[0]);
    }
    if (p.endsWith('/expenses') && method === 'GET') {
      let list = [...expenses];
      if (role === 'employee') list = list.filter((e) => e.employee_id === 3);
      const status = u.searchParams.get('status');
      if (status) list = list.filter((e) => e.status === status);
      return fulfill(route, {
        data: list,
        pagination: { page: 1, limit: 10, total: list.length, totalPages: 1 },
        categories: ['Travel', 'Food', 'Office Supplies', 'Equipment', 'Training', 'Other'],
      });
    }
    return fulfill(route, { message: 'ok' });
  });
}

async function shot(page, name, waitText) {
  await page.getByText(waitText, { exact: false }).first().waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
  console.log('Captured:', name);
}

async function openAs(browser, role) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await setupMocks(page, role);
  await page.addInitScript(
    ({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    { token: TOKEN, user: USERS[role] }
  );
  return { context, page };
}

function isServerUp() {
  return new Promise((resolve) => {
    const req = http.get(BASE, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureServer() {
  if (await isServerUp()) {
    console.log('Using existing frontend server');
    return null;
  }
  console.log('Starting frontend server...');
  const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'], {
    cwd: path.join(ROOT, 'frontend'),
    shell: true,
    stdio: 'pipe',
  });
  for (let i = 0; i < 60; i++) {
    if (await isServerUp()) {
      // Extra settle time for Vite transform cache
      await new Promise((r) => setTimeout(r, 2000));
      return server;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  server.kill();
  throw new Error('Frontend server did not start');
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const server = await ensureServer();

  try {
    const browser = await chromium.launch({ headless: true });

    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await setupMocks(page, 'employee');
      await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
      await shot(page, '01-login.png', 'Sign in');
      await context.close();
    }

    {
      const { context, page } = await openAs(browser, 'employee');
      await page.goto(`${BASE}/employee`, { waitUntil: 'networkidle' });
      await shot(page, '02-employee-dashboard.png', 'Your overview');
      await context.close();
    }

    {
      const { context, page } = await openAs(browser, 'employee');
      await page.goto(`${BASE}/employee/submit`, { waitUntil: 'networkidle' });
      await page.getByText('Submit expense').first().waitFor({ state: 'visible' });
      await page.locator('form input').nth(0).fill('Client Dinner Meeting');
      await page.locator('input[type="number"]').fill('1850');
      await page.locator('input[type="date"]').fill('2026-07-10');
      await page.locator('textarea').fill('Business dinner with client stakeholders after kickoff.');
      await shot(page, '03-expense-submission.png', 'Submit Expense');
      await context.close();
    }

    {
      const { context, page } = await openAs(browser, 'manager');
      await page.goto(`${BASE}/manager/approvals`, { waitUntil: 'networkidle' });
      await shot(page, '04-manager-approvals.png', 'Manager approvals');
      await context.close();
    }

    {
      const { context, page } = await openAs(browser, 'admin');
      await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
      await shot(page, '05-admin-dashboard.png', 'Admin dashboard');
      await context.close();
    }

    {
      const { context, page } = await openAs(browser, 'admin');
      await page.goto(`${BASE}/admin/reports`, { waitUntil: 'networkidle' });
      await shot(page, '06-admin-reports.png', 'Monthly reports');
      await context.close();
    }

    await browser.close();
    console.log('All screenshots saved to docs/screenshots/');
  } finally {
    if (server) server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
