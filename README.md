# FinFlow — Modern Full Stack Expense Tracker Web Application

[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Security-JWT_%26_Bcrypt-black?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

**Task 3: Expense Tracker Web Application**  
*Built for Full Stack Development Internship at Auspify Technologies.*

FinFlow is an enterprise-grade, responsive, full-stack personal finance and expense tracking web application. It empowers users to take full control of their cash flow with granular income and expense logging, real-time balance calculations, multi-criteria filtering, and rich data visual analytics powered by Recharts.

---

## 1. Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 & Vite | Fast, modern client SPA architecture |
| **Styling** | Tailwind CSS v3 | Clean fintech design system, responsive layouts & micro-animations |
| **Icons** | Lucide React | Modern, lightweight financial iconography |
| **Charts** | Recharts | Interactive monthly comparison bar charts, category donut charts, and savings area charts |
| **Backend** | Node.js & Express.js | High-throughput REST API with robust controllers & routing |
| **Database** | MongoDB & Mongoose | Object modeling, validation schemas, and indexed aggregation pipelines |
| **Authentication**| JWT & Bcrypt.js | Stateless bearer authentication with 10-round salted password hashing |
| **API Testing** | Postman | Exported collection with pre-request scripts and automated token persistence |

---

## 2. Key Features

### 🔐 User Authentication & Authorization
- User registration and login with encrypted password storage (`bcryptjs`).
- Secure stateless JWT bearer token authentication.
- Strict data isolation: Users can only view, create, edit, or delete **their own** financial records.
- Session expiration detection and 1-click **Demo Account Auto-Fill** (`demo@auspify.com` / `password123`) for effortless testing.

### 📊 Financial Dashboard
- **Current Net Balance**: Automatically calculated (`Total Income - Total Expenses`).
- **Total Income & Total Expenses**: Aggregated live from MongoDB.
- **Savings Rate Percentage**: Real-time margin calculation with health indicator badges.
- **Monthly Inflow & Outflow**: Current month snapshot vs all-time balance.
- **Interactive Visualizations**: Monthly comparison bar chart & category expense donut chart.
- **Recent Transactions Feed**: Fast inspection of latest financial entries with 1-click edit/delete.

### 💰 Income Management
- Complete CRUD operations: Add, Edit, View, and Delete income items.
- Fields: Title, Amount, Category, Date, and Description.
- Categories: `Salary`, `Freelance`, `Business`, `Investments`, and `Other`.
- Dedicated analytics: Total income, average deposit size, and top revenue source.

### 💳 Expense Management
- Complete CRUD operations: Add, Edit, View, and Delete expense items.
- Fields: Title, Amount, Category, Date, and Description.
- Categories: `Food`, `Travel`, `Shopping`, `Bills`, `Education`, `Health`, `Entertainment`, and `Other`.
- Dedicated analytics: Total spend, average purchase value, and highest recorded expense.

### 🔎 Search, Filter & Transaction Management
- Global ledger containing both income and expense transactions.
- Multi-criteria real-time filtering:
  - Search by transaction title or description memo.
  - Filter by type (`Income` vs `Expense`).
  - Filter by Category.
  - Date range filters (`startDate` to `endDate`).
  - Dual sorting by **Date** (newest/oldest) and **Amount** (highest/lowest).
- **Export to CSV**: Download transaction records directly to Excel/CSV for offline audits.

### 📈 Reports & Deep Analytics
- **Monthly Income vs Expense Chart**: 3, 6, or 12-month comparative bar visualization.
- **Category-wise Donut Chart**: Proportional expense/income distribution with percentages and item counts.
- **Net Savings Trajectory**: Gradient Area Chart showing monthly surplus trends.
- **Key Outlier Diagnostics**: Automatic identification of largest single expense and peak income milestone.

---

## 3. Database Schema Design

### `User` Collection (`models/User.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required, Trim, Max 50 | User full name |
| `email` | String | Required, Unique, Lowercase, Trim, Regex | User email address |
| `password` | String | Required, Min 6, Select: false | Salted bcrypt hash |
| `currency` | String | Default: `INR`, Enum: `INR`, `USD`, `EUR`, `GBP` | User preferred currency |
| `createdAt` | Date | Auto Timestamp | Account creation date |
| `updatedAt` | Date | Auto Timestamp | Last account update |

### `Transaction` Collection (`models/Transaction.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `userId` | ObjectId | Ref: `'User'`, Required, Index: true | User ownership reference |
| `title` | String | Required, Trim, Max 100 | Transaction name/title |
| `amount` | Number | Required, Min: 0.01 | Positive transaction amount |
| `type` | String | Required, Enum: `['income', 'expense']` | Transaction direction |
| `category` | String | Required, Enum validated per type | Category classification |
| `date` | Date | Required, Default: `Date.now` | Transaction date |
| `description` | String | Optional, Trim, Max 500 | Additional notes or memo |
| `createdAt` | Date | Auto Timestamp | Record creation date |
| `updatedAt` | Date | Auto Timestamp | Last record modification |

**Indexes created**:
- Compound index `{ userId: 1, date: -1 }` for high-performance timeline queries.
- Compound index `{ userId: 1, type: 1 }` and `{ userId: 1, category: 1 }` for instant aggregations.

---

## 4. REST API Documentation

Base URL: `http://localhost:5000/api`

### 🔑 Authentication Routes (`/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new user with name, email, password, currency |
| `POST` | `/auth/login` | Public | Authenticate user, verify password, return JWT token |
| `GET` | `/auth/me` | Private | Retrieve authenticated user profile |
| `PUT` | `/auth/profile` | Private | Update user profile or password |

### 💳 Transaction Routes (`/transactions`)
| Method | Endpoint | Access | Query Parameters / Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/transactions/dashboard` | Private | None | Aggregated summary, balances, recent transactions |
| `POST` | `/transactions` | Private | Body: `title, amount, type, category, date, description` | Create new income or expense |
| `GET` | `/transactions` | Private | `type, category, search, startDate, endDate, sortBy, order` | Get filtered, sorted transactions |
| `GET` | `/transactions/:id` | Private | Path param: `id` | Get single transaction by ID |
| `PUT` | `/transactions/:id` | Private | Path param: `id`, Body: updated fields | Update transaction (with ownership check) |
| `DELETE`| `/transactions/:id` | Private | Path param: `id` | Delete transaction (with ownership check) |

### 📊 Report Routes (`/reports`)
| Method | Endpoint | Access | Query Parameters | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/reports/monthly` | Private | `months=6` | Aggregated monthly income vs expense trends |
| `GET` | `/reports/category` | Private | `type=expense&startDate=&endDate=` | Category distribution with percentages |
| `GET` | `/reports/overview` | Private | `startDate=&endDate=` | Financial diagnostics, net savings, highest entries |

---

## 5. Getting Started & Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v22.16.0)
- **MongoDB**: Local MongoDB Community Server running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI.

---

### Step 1: Backend Setup & Seeding

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd expense-tracker/backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Review the environment configuration in `.env` (pre-created):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker
   JWT_SECRET=auspify_expense_tracker_super_secure_jwt_secret_key_2026
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:5173
   ```

4. **Seed sample data** (Creates demo user + 24 realistic multi-month income & expense transactions):
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *The backend will be running at `http://localhost:5000`.*

---

### Step 2: Frontend Setup

1. Open a second terminal and navigate to the frontend folder:
   ```bash
   cd expense-tracker/frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The application will open at `http://localhost:5173`.*

---

### Step 3: Log In and Test

1. Open `http://localhost:5173` in your browser.
2. Click the **"Fill Demo"** button on the login screen (or type):
   - **Email**: `demo@auspify.com`
   - **Password**: `password123`
3. Click **"Sign In"** to experience the full financial dashboard with pre-populated graphs, recent transactions, and category breakdowns!
4. Or click **"Create Account"** to register a brand-new user with a completely fresh, isolated financial balance.

---

## 6. Testing APIs with Postman

A comprehensive Postman Collection is included in the project under:
`expense-tracker/postman/Expense_Tracker_API.postman_collection.json`

### How to Import & Run in Postman:
1. Open **Postman**.
2. Click **Import** (top-left) and drag & drop `postman/Expense_Tracker_API.postman_collection.json`.
3. In the collection, run the **"Authentication > Login User (Demo Account)"** request.
   - The test script will **automatically extract and store the JWT bearer token** into the collection variable `{{token}}`.
4. Now test any endpoint (e.g. `Get Dashboard Summary`, `Create Income Transaction`, `Get Monthly Trends`). The token is automatically attached to all requests in the header!

---

## 7. Project Folder Structure

```
expense-tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection using Mongoose
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login & profile
│   │   │   ├── transactionController.js # CRUD & dashboard aggregation
│   │   │   └── reportController.js   # Monthly & category analytics
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verification & route protection
│   │   │   └── errorMiddleware.js    # 404 & Centralized error handler
│   │   ├── models/
│   │   │   ├── User.js               # User schema with bcrypt hashing
│   │   │   └── Transaction.js        # Transaction schema & validation
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth routes
│   │   │   ├── transactionRoutes.js  # /api/transactions routes
│   │   │   └── reportRoutes.js       # /api/reports routes
│   │   ├── utils/
│   │   │   └── seeder.js             # 1-click database population script
│   │   └── server.js                 # Express app initialization & CORS
│   ├── .env                          # Local environment variables
│   ├── .env.example                  # Environment template
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   ├── CategoryPieChart.jsx # Donut chart of expenses
│   │   │   │   ├── MonthlyBarChart.jsx  # Inflow vs outflow bar chart
│   │   │   │   └── TrendAreaChart.jsx   # Savings trajectory chart
│   │   │   ├── common/
│   │   │   │   ├── ConfirmDialog.jsx    # Delete verification modal
│   │   │   │   ├── Modal.jsx            # Reusable accessible dialog
│   │   │   │   ├── Navbar.jsx           # Responsive top bar & quick actions
│   │   │   │   ├── Sidebar.jsx          # Desktop & mobile navigation drawer
│   │   │   │   └── StatCard.jsx         # Metric card with visual badges
│   │   │   └── transactions/
│   │   │       ├── TransactionFilters.jsx # Search, sort & date range
│   │   │       ├── TransactionFormModal.jsx # Add/edit income & expense
│   │   │       └── TransactionTable.jsx     # Responsive data table
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth provider, tokens & currency
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Executive finance dashboard
│   │   │   ├── Expenses.jsx          # Expense management & metrics
│   │   │   ├── Income.jsx            # Income management & sources
│   │   │   ├── Login.jsx             # Login with 1-click demo filler
│   │   │   ├── Register.jsx          # Register with currency selection
│   │   │   ├── Reports.jsx           # Financial analytics & highlights
│   │   │   └── Transactions.jsx      # All records & CSV export
│   │   ├── services/
│   │   │   ├── api.js                # Axios client with interceptors
│   │   │   ├── authService.js        # Auth API calls
│   │   │   └── transactionService.js # Transaction & report API calls
│   │   ├── App.jsx                   # Layout, router & modal management
│   │   ├── index.css                 # Tailwind directives & aesthetics
│   │   └── main.jsx                  # React mount
│   ├── index.html                    # SEO meta tags, title & Inter font
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
├── postman/
│   └── Expense_Tracker_API.postman_collection.json # Exported API tests
└── README.md
```

---

## 8. Security & Error Handling

- **Password Encryption**: All passwords undergo salted one-way hashing with `bcrypt` (10 rounds).
- **Data Privacy**: Transactions are filtered by `userId: req.user._id` across all queries, updates, and deletions, guaranteeing that no user can inspect or tamper with another user's financial data.
- **Input Sanitization & Validation**: Non-numeric or negative transaction amounts are rejected with 400 Bad Request.
- **Central Error Handler**: Clean JSON responses with error messages for duplicates, CastErrors, and token expiry.
- **Session Auto-Recovery & Interceptor**: If a JWT expires, the frontend clears stale credentials and redirects gracefully to the login page.

---

*Developed for the Full Stack Development Internship at Auspify Technologies.*
