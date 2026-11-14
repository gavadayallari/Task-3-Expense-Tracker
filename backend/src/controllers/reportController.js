const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// @desc    Get monthly income vs expense analytics (last 6 or 12 months)
// @route   GET /api/reports/monthly
// @access  Private
const getMonthlyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const monthsBack = parseInt(req.query.months, 10) || 6;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (monthsBack - 1));
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Build standard month array for consistent visualization
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthLabel = `${monthNames[month - 1]} ${year.toString().slice(-2)}`;

      const incomeItem = monthlyData.find(
        m => m._id.year === year && m._id.month === month && m._id.type === 'income'
      );
      const expenseItem = monthlyData.find(
        m => m._id.year === year && m._id.month === month && m._id.type === 'expense'
      );

      const income = incomeItem ? incomeItem.total : 0;
      const expense = expenseItem ? expenseItem.total : 0;
      const savings = income - expense;

      result.push({
        month: monthLabel,
        year,
        monthIndex: month,
        income,
        expense,
        savings
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise expense and income breakdown
// @route   GET /api/reports/category
// @access  Private
const getCategoryReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type = 'expense', startDate, endDate } = req.query;

    const matchQuery = {
      userId: new mongoose.Types.ObjectId(userId),
      type: type === 'income' ? 'income' : 'expense'
    };

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchQuery.date.$lte = end;
      }
    }

    const categoryData = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const overallTotal = categoryData.reduce((acc, curr) => acc + curr.total, 0);

    const formattedData = categoryData.map(item => ({
      category: item._id,
      amount: item.total,
      count: item.count,
      percentage: overallTotal > 0 ? Number(((item.total / overallTotal) * 100).toFixed(1)) : 0
    }));

    res.status(200).json({
      success: true,
      type: matchQuery.type,
      totalAmount: overallTotal,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get full analytical overview & savings metrics
// @route   GET /api/reports/overview
// @access  Private
const getAnalyticsOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    const matchQuery = { userId: new mongoose.Types.ObjectId(userId) };

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchQuery.date.$lte = end;
      }
    }

    const summary = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' }
        }
      }
    ]);

    let income = 0;
    let expense = 0;
    let incomeCount = 0;
    let expenseCount = 0;
    let avgExpense = 0;
    let avgIncome = 0;

    summary.forEach(item => {
      if (item._id === 'income') {
        income = item.total;
        incomeCount = item.count;
        avgIncome = item.avg;
      }
      if (item._id === 'expense') {
        expense = item.total;
        expenseCount = item.count;
        avgExpense = item.avg;
      }
    });

    const netSavings = income - expense;
    const savingsRatio = income > 0 ? Number(((netSavings / income) * 100).toFixed(1)) : 0;

    // Largest expense
    const highestExpense = await Transaction.findOne({
      userId,
      type: 'expense'
    }).sort({ amount: -1 });

    // Largest income
    const highestIncome = await Transaction.findOne({
      userId,
      type: 'income'
    }).sort({ amount: -1 });

    res.status(200).json({
      success: true,
      data: {
        totalIncome: income,
        totalExpense: expense,
        netSavings,
        savingsRatio,
        incomeCount,
        expenseCount,
        avgIncome: Number(avgIncome.toFixed(2)),
        avgExpense: Number(avgExpense.toFixed(2)),
        highestExpense: highestExpense
          ? { title: highestExpense.title, amount: highestExpense.amount, category: highestExpense.category, date: highestExpense.date }
          : null,
        highestIncome: highestIncome
          ? { title: highestIncome.title, amount: highestIncome.amount, category: highestIncome.category, date: highestIncome.date }
          : null
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlyReport,
  getCategoryReport,
  getAnalyticsOverview
};
