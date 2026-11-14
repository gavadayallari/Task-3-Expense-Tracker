const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Dashboard summary route
router.get('/dashboard', getDashboardSummary);

// CRUD routes
router.route('/')
  .post(createTransaction)
  .get(getTransactions);

router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
