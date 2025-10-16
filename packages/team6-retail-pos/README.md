# Team 6 - Retail POS System# Getting Started with Create React App



🏬 **Sistem Point of Sale (POS) Multi-Store untuk Gajah Nusa**This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).



## 📋 Overview## Available Scripts



Sistem POS terintegrasi untuk 4 toko retail Gajah Nusa yang tersebar di Jakarta, Bandung, Surabaya, dan Semarang. Setiap toko memiliki manajemen independent (stock, karyawan, transaksi) dengan integrasi ke warehouse pusat untuk pengadaan barang.In the project directory, you can run:



## 🎯 Key Features### `npm start`



### 1. 🏪 Multi-Store ManagementRuns the app in the development mode.\

- 4 toko independent dengan data terpisahOpen [http://localhost:3000](http://localhost:3000) to view it in the browser.

- Store selector dengan info manager & lokasi

- Real-time switch antar tokoThe page will reload if you make edits.\

You will also see any lint errors in the console.

### 2. 💰 POS Cashier Interface

- Product search & filter by category### `npm test`

- Shopping cart dengan quantity control

- 3 payment methods: Cash 💵, Card 💳, Transfer 🏦Launches the test runner in the interactive watch mode.\

- Cash calculator dengan kembalian otomatisSee the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

- Receipt generation

### `npm run build`

### 3. 📊 Dashboard & Analytics

- Today's sales statisticsBuilds the app for production to the `build` folder.\

- Weekly sales bar chartIt correctly bundles React in production mode and optimizes the build for the best performance.

- Category distribution pie chart

- Top 5 selling productsThe build is minified and the filenames include the hashes.\

- Recent transactionsYour app is ready to be deployed!



### 4. 📦 Local Warehouse ManagementSee the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

- Store inventory tracking

- Stock In/Out/Adjust operations### `npm run eject`

- Low stock alerts

- Location-based storage (A1-01, B2-01, etc.)**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

- Min/Max stock monitoring

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

### 5. 🏭 Central Warehouse Integration

- Read-only view of HQ central warehouseInstead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

- Purchase Order (PO) submission to HQ

- Reserved vs Available stock trackingYou don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

- PO status: Pending → Approved → Shipped → Received

- Supplier information## Learn More



### 6. 💳 Transaction ManagementYou can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

- Transaction history dengan filters

- Search by transaction code or customerTo learn React, check out the [React documentation](https://reactjs.org/).

- Filter by payment method
- Date range filtering
- Transaction details dengan items list

### 7. 👥 Employee Management
- Employee cards dengan photo
- Department filtering
- Contact information
- Status tracking (Active/Inactive)
- Join date & employment details

### 8. 📈 Reports & Analytics
- Monthly sales performance vs target
- Category breakdown with pie chart
- Top customers ranking
- Inventory turnover analysis
- Performance summary (target achievement, satisfaction, fulfillment rate)
- Export to PDF functionality

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with persist)
- **Routing**: React Router DOM v6
- **Charts**: Recharts
- **Icons**: Heroicons React
- **Port**: 3006

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (planned)
- **Port**: 8006

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Port 3006 and 8006 available

### 1. Automated Start (Recommended)

Dari root directory `Project_ERP`:

```bash
.\packages\team6-retail-pos\start-team6.bat
```

Script ini akan:
1. ✅ Check dan install dependencies (frontend & backend)
2. ✅ Start backend API di port 8006
3. ✅ Start frontend Vite dev server di port 3006
4. ✅ Auto-open browser ke http://localhost:3006

### 2. Manual Start

**Terminal 1 - Backend:**
```bash
cd packages/team6-retail-pos/backend
npm install
npm run init-db      # First time only
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd packages/team6-retail-pos
npm install
npm run dev
```

### 3. Database Setup

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gajahnusa_pos
DB_USER=postgres
DB_PASSWORD=your_password
```

Initialize database:
```bash
cd backend
npm run init-db
```

## 🏪 Sample Data

### Stores (4)
1. **JKT-01** - Gajah Nusa Jakarta Pusat 🏢
2. **BDG-01** - Gajah Nusa Bandung 🏪
3. **SBY-01** - Gajah Nusa Surabaya 🏬
4. **SMG-01** - Gajah Nusa Semarang 🏭

### Products
15 items across 8 categories (Cement, Bricks, Steel, Tiles, Paint, Tools, Electrical, Plumbing)

### Employees
6 employees across 3 stores

## 📡 API Endpoints

Base URL: `http://localhost:8006`

- `GET /health` - Health check
- `GET /api/stores` - All stores
- `GET /api/products` - All products
- `GET /api/inventory/store/:storeId` - Store inventory
- `POST /api/transactions` - Create transaction
- `POST /api/purchase-orders` - Create PO
- `GET /api/dashboard/store/:storeId` - Dashboard stats

Full API documentation: `backend/README.md`

## 📝 Available Scripts

### Frontend
```bash
npm run dev          # Start development server (port 3006)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend
```bash
npm start            # Start production server
npm run dev          # Start with nodemon (auto-reload)
npm run init-db      # Initialize database
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
netstat -ano | findstr :3006
taskkill /PID <PID> /F
```

### Database Connection Error
- Pastikan PostgreSQL running
- Check credentials di `backend/.env`
- Run `npm run init-db` untuk re-initialize

## 👨‍💻 Development Team

**Gajah Nusa - Team 6**
Multi-Store POS System with Central Warehouse Integration

---

**Built with ❤️ for Gajah Nusa**
