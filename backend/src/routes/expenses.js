const { body } = require('express-validator');
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
} = require('../controllers/expenseController');

const router = require('express').Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const expenseValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('expense_date').isISO8601().withMessage('Valid expense date is required'),
];

router.use(authenticate);

router.get('/', getExpenses);
router.post('/', authorize('employee', 'admin'), upload.single('receipt'), expenseValidators, createExpense);

router.put('/:id/approve', authorize('manager', 'admin'), approveExpense);
router.put(
  '/:id/reject',
  authorize('manager', 'admin'),
  [
    body('manager_comments').optional().trim(),
    body('comments').optional().trim(),
    body().custom((_, { req }) => {
      const comment = req.body.manager_comments || req.body.comments;
      if (!comment || !String(comment).trim()) {
        throw new Error('Rejection comment is required');
      }
      return true;
    }),
  ],
  rejectExpense
);

router.get('/:id', getExpenseById);
router.put('/:id', authorize('employee', 'admin'), upload.single('receipt'), expenseValidators, updateExpense);
router.delete('/:id', authorize('employee', 'admin'), deleteExpense);

module.exports = router;
