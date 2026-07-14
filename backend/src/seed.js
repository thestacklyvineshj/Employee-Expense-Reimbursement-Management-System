/**
 * Seed script: creates tables (if needed) and inserts demo users + sample expenses.
 * Run: npm run seed  (from backend folder, after schema.sql and .env are configured)
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
  await connection.query(schema);
  console.log('Schema applied.');

  await connection.changeUser({ database: process.env.DB_NAME || 'expense_reimbursement' });

  const users = [
    { name: 'System Admin', email: 'admin@expense.com', password: 'Admin@123', role: 'admin' },
    { name: 'Alex Manager', email: 'manager@expense.com', password: 'Manager@123', role: 'manager' },
    { name: 'Sam Employee', email: 'employee@expense.com', password: 'Employee@123', role: 'employee' },
    { name: 'Jordan Lee', email: 'jordan@expense.com', password: 'Employee@123', role: 'employee' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await connection.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), password = VALUES(password), role = VALUES(role)`,
      [u.name, u.email, hash, u.role]
    );
  }
  console.log('Users seeded.');

  const [empRows] = await connection.query(
    `SELECT id, email FROM users WHERE role = 'employee'`
  );
  const empByEmail = Object.fromEntries(empRows.map((r) => [r.email, r.id]));

  await connection.query('DELETE FROM expenses');

  const samples = [
    {
      email: 'employee@expense.com',
      title: 'Client Visit Travel',
      category: 'Travel',
      amount: 245.5,
      expense_date: '2026-06-12',
      description: 'Train tickets to client site',
      receipt: 'train-receipt.pdf',
      status: 'pending',
    },
    {
      email: 'employee@expense.com',
      title: 'Team Lunch',
      category: 'Food',
      amount: 86.0,
      expense_date: '2026-06-18',
      description: 'Lunch with project team',
      receipt: 'lunch.jpg',
      status: 'approved',
      manager_comments: 'Approved — within policy',
    },
    {
      email: 'employee@expense.com',
      title: 'Monitor Stand',
      category: 'Equipment',
      amount: 120.0,
      expense_date: '2026-05-22',
      description: 'Ergonomic stand for WFH',
      receipt: 'stand-receipt.pdf',
      status: 'rejected',
      manager_comments: 'Please use IT procurement for hardware',
    },
    {
      email: 'jordan@expense.com',
      title: 'Conference Registration',
      category: 'Training',
      amount: 499.0,
      expense_date: '2026-07-01',
      description: 'Annual tech conference fee',
      receipt: 'conference.pdf',
      status: 'pending',
    },
    {
      email: 'jordan@expense.com',
      title: 'Office Stationery',
      category: 'Office Supplies',
      amount: 34.75,
      expense_date: '2026-06-28',
      description: 'Notebooks and pens',
      receipt: 'stationery.pdf',
      status: 'approved',
      manager_comments: 'OK',
    },
    {
      email: 'employee@expense.com',
      title: 'Taxi to Airport',
      category: 'Travel',
      amount: 55.0,
      expense_date: '2026-07-05',
      description: 'Airport transfer for offsite',
      receipt: 'taxi.jpg',
      status: 'pending',
    },
  ];

  for (const s of samples) {
    const employeeId = empByEmail[s.email];
    if (!employeeId) continue;
    await connection.query(
      `INSERT INTO expenses
        (employee_id, title, category, amount, expense_date, description, receipt, status, manager_comments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        s.title,
        s.category,
        s.amount,
        s.expense_date,
        s.description,
        s.receipt,
        s.status,
        s.manager_comments || null,
      ]
    );
  }

  console.log('Sample expenses seeded.');
  await connection.end();
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
