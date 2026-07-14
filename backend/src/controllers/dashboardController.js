const pool = require('../config/db');

const getStats = async (employeeFilter = null) => {
  let where = '';
  const params = [];
  if (employeeFilter) {
    where = 'WHERE employee_id = ?';
    params.push(employeeFilter);
  }

  const [rows] = await pool.query(
    `SELECT
      COUNT(*) AS total_submitted,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
      COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) AS total_reimbursement,
      COALESCE(SUM(amount), 0) AS total_amount
     FROM expenses ${where}`,
    params
  );

  return rows[0];
};

const employeeDashboard = async (req, res) => {
  try {
    const stats = await getStats(req.user.id);
    const [recent] = await pool.query(
      `SELECT * FROM expenses WHERE employee_id = ? ORDER BY created_at DESC LIMIT 5`,
      [req.user.id]
    );
    res.json({ stats, recent });
  } catch (err) {
    console.error('Employee dashboard error:', err);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};

const managerDashboard = async (req, res) => {
  try {
    const stats = await getStats();
    const [pending] = await pool.query(
      `SELECT e.*, u.name AS employee_name
       FROM expenses e
       JOIN users u ON u.id = e.employee_id
       WHERE e.status = 'pending'
       ORDER BY e.created_at ASC
       LIMIT 10`
    );
    res.json({ stats, pending });
  } catch (err) {
    console.error('Manager dashboard error:', err);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};

const adminDashboard = async (req, res) => {
  try {
    const stats = await getStats();

    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month,
              COUNT(*) AS count,
              COALESCE(SUM(amount), 0) AS total_amount,
              COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) AS approved_amount
       FROM expenses
       GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
       ORDER BY month DESC
       LIMIT 12`
    );

    const [byCategory] = await pool.query(
      `SELECT category, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
       FROM expenses
       GROUP BY category
       ORDER BY total DESC`
    );

    const [byStatus] = await pool.query(
      `SELECT status, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
       FROM expenses
       GROUP BY status`
    );

    const [userCount] = await pool.query(
      `SELECT
        COUNT(*) AS total_users,
        SUM(CASE WHEN role = 'employee' THEN 1 ELSE 0 END) AS employees,
        SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) AS managers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins
       FROM users`
    );

    res.json({
      stats,
      monthly,
      byCategory,
      byStatus,
      users: userCount[0],
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};

module.exports = { employeeDashboard, managerDashboard, adminDashboard };
