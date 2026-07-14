const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const pool = require('../config/db');

const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { name, email, password, role } = req.body;
  const allowed = ['admin', 'manager', 'employee'];
  if (!allowed.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role]
    );

    res.status(201).json({
      message: 'User created',
      user: { id: result.insertId, name, email, role },
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

const updateUser = async (req, res) => {
  const { name, email, role, password } = req.body;
  const userId = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowed = ['admin', 'manager', 'employee'];
    if (role && !allowed.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (email && email !== rows[0].email) {
      const [dup] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [
        email,
        userId,
      ]);
      if (dup.length) {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }

    const newName = name ?? rows[0].name;
    const newEmail = email ?? rows[0].email;
    const newRole = role ?? rows[0].role;
    let newPassword = rows[0].password;
    if (password) {
      newPassword = await bcrypt.hash(password, 10);
    }

    await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?',
      [newName, newEmail, newRole, newPassword, userId]
    );

    res.json({
      message: 'User updated',
      user: { id: Number(userId), name: newName, email: newEmail, role: newRole },
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

const listEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email FROM users WHERE role = 'employee' ORDER BY name`
    );
    res.json(rows);
  } catch (err) {
    console.error('List employees error:', err);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, listEmployees };
