const mongoose = require('mongoose');

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investments', 'Other'];
const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Health', 'Entertainment', 'Other'];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['income', 'expense'],
        message: '{VALUE} is not a valid transaction type (must be income or expense)'
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      validate: {
        validator: function (val) {
          if (this.type === 'income') {
            return INCOME_CATEGORIES.includes(val);
          }
          if (this.type === 'expense') {
            return EXPENSE_CATEGORIES.includes(val);
          }
          return true;
        },
        message: props => `${props.value} is not a valid category for ${props.type || 'this transaction'}`
      }
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fast queries by user and date
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
module.exports.INCOME_CATEGORIES = INCOME_CATEGORIES;
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
