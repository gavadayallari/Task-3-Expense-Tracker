const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seeder] Connected to MongoDB');

    // Remove existing demo user and their data if present
    const demoEmail = 'demo@auspify.com';
    let demoUser = await User.findOne({ email: demoEmail });

    if (demoUser) {
      await Transaction.deleteMany({ userId: demoUser._id });
      await User.deleteOne({ _id: demoUser._id });
      console.log('[Seeder] Cleared previous demo user data');
    }

    // Create demo user
    demoUser = await User.create({
      name: 'Alex Morgan',
      email: demoEmail,
      password: 'password123',
      currency: 'INR'
    });
    console.log(`[Seeder] Created demo user: ${demoEmail} (password: password123)`);

    // Sample transaction dates across current and previous months
    const now = new Date();
    const d = (daysAgo) => {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      return date;
    };

    const sampleTransactions = [
      // Current Month Income
      {
        userId: demoUser._id,
        title: 'Monthly Tech Salary',
        amount: 85000,
        type: 'income',
        category: 'Salary',
        date: d(2),
        description: 'Direct deposit from Auspify Technologies'
      },
      {
        userId: demoUser._id,
        title: 'Full Stack Consulting',
        amount: 32000,
        type: 'income',
        category: 'Freelance',
        date: d(6),
        description: 'E-commerce React web app development milestone'
      },
      {
        userId: demoUser._id,
        title: 'Digital Asset Sales',
        amount: 14500,
        type: 'income',
        category: 'Business',
        date: d(12),
        description: 'SaaS template licenses'
      },

      // Current Month Expenses
      {
        userId: demoUser._id,
        title: 'Organic Groceries & Essentials',
        amount: 6450,
        type: 'expense',
        category: 'Food',
        date: d(1),
        description: 'Supermarket weekly shopping'
      },
      {
        userId: demoUser._id,
        title: 'Fiber Internet & Electric Bill',
        amount: 3200,
        type: 'expense',
        category: 'Bills',
        date: d(3),
        description: 'Monthly utility dues'
      },
      {
        userId: demoUser._id,
        title: 'Metro Commute Card Recharge',
        amount: 1800,
        type: 'expense',
        category: 'Travel',
        date: d(4),
        description: 'Monthly pass'
      },
      {
        userId: demoUser._id,
        title: 'Mechanical Keyboard & Desk Mat',
        amount: 7900,
        type: 'expense',
        category: 'Shopping',
        date: d(7),
        description: 'Home office ergonomic upgrades'
      },
      {
        userId: demoUser._id,
        title: 'Cloud Architecture Certification',
        amount: 9500,
        type: 'expense',
        category: 'Education',
        date: d(9),
        description: 'Exam voucher & study materials'
      },
      {
        userId: demoUser._id,
        title: 'Dinner at Bistro with Team',
        amount: 2400,
        type: 'expense',
        category: 'Food',
        date: d(11),
        description: 'Team celebration'
      },
      {
        userId: demoUser._id,
        title: 'Annual Health Checkup',
        amount: 3500,
        type: 'expense',
        category: 'Health',
        date: d(14),
        description: 'Preventive health screening'
      },

      // Previous Month (30-60 days ago)
      {
        userId: demoUser._id,
        title: 'Monthly Tech Salary',
        amount: 85000,
        type: 'income',
        category: 'Salary',
        date: d(32),
        description: 'Previous month salary'
      },
      {
        userId: demoUser._id,
        title: 'UI/UX Redesign Gig',
        amount: 24000,
        type: 'income',
        category: 'Freelance',
        date: d(38),
        description: 'Fintech mobile app wireframes'
      },
      {
        userId: demoUser._id,
        title: 'Apartment Maintenance & Rent',
        amount: 22000,
        type: 'expense',
        category: 'Bills',
        date: d(33),
        description: 'Monthly maintenance payment'
      },
      {
        userId: demoUser._id,
        title: 'Flight Tickets for Tech Conference',
        amount: 12500,
        type: 'expense',
        category: 'Travel',
        date: d(42),
        description: 'Round trip tickets'
      },
      {
        userId: demoUser._id,
        title: 'Dinner & Weekend Outing',
        amount: 4800,
        type: 'expense',
        category: 'Entertainment',
        date: d(45),
        description: 'Movie and restaurant'
      },
      {
        userId: demoUser._id,
        title: 'Gourmet Dining & Cafes',
        amount: 5100,
        type: 'expense',
        category: 'Food',
        date: d(50),
        description: 'Coffee and brunch'
      },

      // 2 Months Ago (60-90 days ago)
      {
        userId: demoUser._id,
        title: 'Monthly Tech Salary',
        amount: 85000,
        type: 'income',
        category: 'Salary',
        date: d(65),
        description: 'Base salary'
      },
      {
        userId: demoUser._id,
        title: 'Stock Dividend Payout',
        amount: 9800,
        type: 'income',
        category: 'Investments',
        date: d(72),
        description: 'Quarterly portfolio yield'
      },
      {
        userId: demoUser._id,
        title: 'Noise Cancelling Headphones',
        amount: 16500,
        type: 'expense',
        category: 'Shopping',
        date: d(68),
        description: 'Sony WH-1000XM5'
      },
      {
        userId: demoUser._id,
        title: 'Groceries & Household Supplies',
        amount: 7200,
        type: 'expense',
        category: 'Food',
        date: d(75),
        description: 'Pantry restocking'
      },

      // 3 Months Ago (90-120 days ago)
      {
        userId: demoUser._id,
        title: 'Monthly Tech Salary',
        amount: 82000,
        type: 'income',
        category: 'Salary',
        date: d(95),
        description: 'Base salary'
      },
      {
        userId: demoUser._id,
        title: 'API Integration Contract',
        amount: 28000,
        type: 'income',
        category: 'Freelance',
        date: d(105),
        description: 'Stripe & Webhook pipeline build'
      },
      {
        userId: demoUser._id,
        title: 'Vehicle Insurance & Service',
        amount: 11200,
        type: 'expense',
        category: 'Travel',
        date: d(100),
        description: 'Annual premium'
      },
      {
        userId: demoUser._id,
        title: 'Online Course Subscription',
        amount: 4500,
        type: 'expense',
        category: 'Education',
        date: d(110),
        description: 'Advanced MERN Stack specialization'
      }
    ];

    await Transaction.insertMany(sampleTransactions);
    console.log(`[Seeder] Successfully seeded ${sampleTransactions.length} sample transactions!`);

    await mongoose.connection.close();
    console.log('[Seeder] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();
