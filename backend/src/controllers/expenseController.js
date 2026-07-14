const { validationResult } = require('express-validator');
const pool = require('../config/db');

const CATEGORIES = ['Travel', 'Food', 'Office Supplies', 'Equipment', 'Training', 'Other'];

const getExpenses = async (req, res) => {
  try {
    const {
      search = '',
      status,
      category,
      employee_id,
      sort = 'expense_date',
      order = 'DESC',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const allowedSort = ['expense_date', 'amount', 'created_at', 'title', 'status'];
    const sortCol = allowedSort.includes(sort) ? sort : 'expense_date';
    const sortOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const conditions = [];
    const params = [];

    if (req.user.role === 'employee') {
      conditions.push('e.employee_id = ?');
      params.push(req.user.id);
    } else if (employee_id) {
      conditions.push('e.employee_id = ?');
      params.push(employee_id);
    }

    if (search) {
      conditions.push('e.title LIKE ?');
      params.push(`%${search}%`);
    }
    if (status) {
      conditions.push('e.status = ?');
      params.push(status);
    }
    if (category) {
      conditions.push('e.category = ?');
      params.push(category);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM expenses e ${where}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT e.*, u.name AS employee_name, u.email AS employee_email
       FROM expenses e
       JOIN users u ON u.id = e.employee_id
       ${where}
       ORDER BY e.${sortCol} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      categories: CATEGORIES,
    });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, u.name AS employee_name, u.email AS employee_email
       FROM expenses e
       JOIN users u ON u.id = e.employee_id
       WHERE e.id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const expense = rows[0];
    if (req.user.role === 'employee' && expense.employee_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(expense);
  } catch (err) {
    console.error('Get expense error:', err);
    res.status(500).json({ message: 'Failed to fetch expense' });
  }
};

const createExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  if (req.user.role !== 'employee' && req.user.role !== 'admin') {
    // Managers typically don't submit; allow employee and admin for flexibility
  }
  if (req.user.role === 'manager') {
    return res.status(403).json({ message: 'Managers cannot submit expenses' });
  }

  const { title, category, amount, expense_date, description, receipt } = req.body;
  const receiptName = req.file ? req.file.originalname : receipt || null;

  try {
    const [result] = await pool.query(
      `INSERT INTO expenses
        (employee_id, title, category, amount, expense_date, description, receipt, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        req.user.id,
        title,
        category,
        amount,
        expense_date,
        description || null,
        receiptName,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Expense submitted', expense: rows[0] });
  } catch (err) {
    console.error('Create expense error:', err);
    res.status(500).json({ message: 'Failed to create expense' });
  }
};

const updateExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const expense = rows[0];
    if (expense.employee_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own expenses' });
    }
    if (expense.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending expenses can be edited' });
    }

    const { title, category, amount, expense_date, description, receipt } = req.body;
    const receiptName = req.file ? req.file.originalname : receipt !== undefined ? receipt : expense.receipt;

    await pool.query(
      `UPDATE expenses SET title = ?, category = ?, amount = ?, expense_date = ?,
       description = ?, receipt = ? WHERE id = ?`,
      [
        title ?? expense.title,
        category ?? expense.category,
        amount ?? expense.amount,
        expense_date ?? expense.expense_date,
        description !== undefined ? description : expense.description,
        receiptName,
        req.params.id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Expense updated', expense: updated[0] });
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ message: 'Failed to update expense' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const expense = rows[0];
    if (expense.employee_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (expense.status !== 'pending' && req.user.role === 'employee') {
      return res.status(400).json({ message: 'Only pending expenses can be cancelled' });
    }

    await pool.query(`UPDATE expenses SET status = 'cancelled' WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Expense cancelled' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ message: 'Failed to cancel expense' });
  }
};

const approveExpense = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const expense = rows[0];
    if (expense.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending expenses can be approved' });
    }

    const comment = req.body.manager_comments || req.body.comments || null;
    await pool.query(
      `UPDATE expenses SET status = 'approved', manager_comments = ? WHERE id = ?`,
      [comment, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Expense approved', expense: updated[0] });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ message: 'Failed to approve expense' });
  }
};

const rejectExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const expense = rows[0];
    if (expense.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending expenses can be rejected' });
    }

    const comment = req.body.manager_comments || req.body.comments;
    await pool.query(
      `UPDATE expenses SET status = 'rejected', manager_comments = ? WHERE id = ?`,
      [comment, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Expense rejected', expense: updated[0] });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ message: 'Failed to reject expense' });
  }
};

module.exports = {
  CATEGORIES,
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
};
