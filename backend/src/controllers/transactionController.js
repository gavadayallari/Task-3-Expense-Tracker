const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, type, and category'
      });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than 0'
      });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      title: title.trim(),
      amount: Number(amount),
      type,
      category: category.trim(),
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions for current user with filtering, search & sorting
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, search, sortBy = 'date', order = 'desc', limit = 100, page = 1 } = req.query;

    const query = { userId: req.user._id };

    // Filter by type (income / expense)
    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      query.type = type.toLowerCase();
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by title or description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sorting
    const sortField = ['date', 'amount', 'title'].includes(sortBy) ? sortBy : 'date';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Ensure transaction belongs to authenticated user
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Ensure transaction belongs to user
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this transaction'
      });
    }

    const { title, amount, type, category, date, description } = req.body;

    if (amount !== undefined && (isNaN(amount) || Number(amount) <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than 0'
      });
    }

    if (title) transaction.title = title.trim();
    if (amount !== undefined) transaction.amount = Number(amount);
    if (type) transaction.type = type;
    if (category) transaction.category = category.trim();
    if (date) transaction.date = new Date(date);
    if (description !== undefined) transaction.description = description.trim();

    const updated = await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Ensure transaction belongs to user
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this transaction'
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary totals, recent transactions and high-level metrics
// @route   GET /api/transactions/dashboard
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate totals for income and expenses
    const totals = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    totals.forEach(item => {
      if (item._id === 'income') {
        totalIncome = item.totalAmount;
        incomeCount = item.count;
      } else if (item._id === 'expense') {
        totalExpense = item.totalAmount;
        expenseCount = item.count;
      }
    });

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

    // Current Month Summary
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthTotals = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    let thisMonthIncome = 0;
    let thisMonthExpense = 0;
    monthTotals.forEach(item => {
      if (item._id === 'income') thisMonthIncome = item.totalAmount;
      if (item._id === 'expense') thisMonthExpense = item.totalAmount;
    });

    // Recent 5 transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        savingsRate: Number(savingsRate),
        transactionCounts: {
          income: incomeCount,
          expense: expenseCount,
          total: incomeCount + expenseCount
        },
        thisMonth: {
          income: thisMonthIncome,
          expense: thisMonthExpense,
          balance: thisMonthIncome - thisMonthExpense
        },
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary
};
