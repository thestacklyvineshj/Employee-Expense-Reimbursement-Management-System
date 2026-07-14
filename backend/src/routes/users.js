const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  listEmployees,
} = require('../controllers/userController');

const router = require('express').Router();

router.use(authenticate);

router.get('/employees', authorize('manager', 'admin'), listEmployees);

router.get('/', authorize('admin'), getUsers);
router.post(
  '/',
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'manager', 'employee']).withMessage('Invalid role'),
  ],
  createUser
);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
