const express = require('express');
const router = express.Router();
const {
  getMonthlyReport,
  getCategoryReport,
  getAnalyticsOverview
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/monthly', getMonthlyReport);
router.get('/category', getCategoryReport);
router.get('/overview', getAnalyticsOverview);

module.exports = router;
