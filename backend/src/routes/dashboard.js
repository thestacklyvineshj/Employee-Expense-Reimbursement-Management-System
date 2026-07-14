const { authenticate, authorize } = require('../middleware/auth');
const {
  employeeDashboard,
  managerDashboard,
  adminDashboard,
} = require('../controllers/dashboardController');

const router = require('express').Router();

router.use(authenticate);

router.get('/employee', authorize('employee'), employeeDashboard);
router.get('/manager', authorize('manager', 'admin'), managerDashboard);
router.get('/admin', authorize('admin'), adminDashboard);

module.exports = router;
