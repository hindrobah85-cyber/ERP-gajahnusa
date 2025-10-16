# Team 8 - Analytics & Business Intelligence

📊 **Advanced Analytics and Business Intelligence Dashboard**

## 📋 Overview

Comprehensive analytics platform that aggregates and analyzes data from all Gajah Nusa ERP teams, providing actionable insights, forecasting, and custom reporting capabilities.

## 🎯 Key Features

### 1. 📊 Unified Dashboard
- Real-time KPI monitoring across all teams
- Cross-team activity summary
- Performance metrics and trends
- Visual data representations

### 2. 💰 Sales Analytics
- Revenue tracking and trends
- Channel performance analysis
- Order and customer metrics
- Growth rate calculations
- Historical comparison

### 3. 📦 Inventory Intelligence
- Real-time stock monitoring
- Low stock alerts
- Inventory value tracking
- Category-based analysis
- Restock recommendations

### 4. 🔮 Sales Forecasting
- AI-powered demand prediction
- 6-month revenue forecasting
- Product-specific forecasts
- Confidence intervals
- Trend analysis

### 5. 👥 Customer Insights
- Customer behavior analysis
- Segmentation and clustering
- Lifetime value calculations
- Churn prediction

### 6. 📈 Custom Reports
- Flexible report builder
- Date range filtering
- Team-specific reports
- Export to Excel/PDF
- Scheduled reports

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 + TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP**: Axios
- **Port**: 3008

### Backend
- **Language**: Python 3.11
- **Framework**: FastAPI
- **ML Libraries**: 
  - scikit-learn (forecasting)
  - pandas (data analysis)
  - numpy (numerical computing)
- **Database**: SQLite (demo) / PostgreSQL (production)
- **Port**: 8008

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- pip

### Automated Start (Recommended)

From root directory `Project_ERP`:

```bash
.\packages\team8-analytics\start-team8.bat
```

### Manual Start

**Terminal 1 - Backend:**
```bash
cd packages/team8-analytics/backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd packages/team8-analytics
npm install
npm run dev
```

## 📡 API Endpoints

Base URL: `http://localhost:8008`

### Dashboard
- `GET /api/dashboard/summary` - Overall dashboard statistics

### Sales Analytics
- `GET /api/sales/historical?months=12` - Historical sales data
- `GET /api/sales/forecast?periods=6` - Sales forecast
- `GET /api/sales/channels` - Sales breakdown by channel

### Inventory
- `GET /api/inventory/status` - Current inventory with alerts

### Forecasting
- `GET /api/forecasting/demand` - Product demand forecast

### Team Activity
- `GET /api/teams/activity` - Cross-team activity summary

### Reports
- `GET /api/reports/generate` - Generate custom report
  - Query params: `start_date`, `end_date`, `team`

## 📊 API Response Examples

### Dashboard Summary
```json
{
  "total_revenue": 67000000,
  "total_orders": 1246,
  "active_customers": 342,
  "total_products": 3000,
  "low_stock_items": 12,
  "growth_rate": 22
}
```

### Sales Forecast
```json
{
  "historical": [...],
  "forecast": [
    {
      "month": "Jul",
      "forecast": 72000,
      "lower_bound": 68000,
      "upper_bound": 76000,
      "confidence": 0.90
    }
  ],
  "model": "Linear Regression",
  "accuracy": 94.2
}
```

## 🎨 Dashboard Pages

1. **Dashboard (/)** 
   - Overall KPIs with trend indicators
   - Sales trend chart (6 months)
   - Team performance distribution
   - Monthly orders breakdown
   - Inventory status overview
   - Cross-team activity table

2. **Sales Analytics (/sales)**
   - Revenue trend line chart
   - Orders & customers trend
   - Sales by channel bar chart
   - Channel performance table
   - Growth metrics

3. **Inventory (/inventory)**
   - Stock summary cards
   - Detailed inventory table
   - Stock level indicators
   - Low stock alerts
   - Restock recommendations

4. **Forecasting (/forecasting)**
   - Historical vs forecast chart
   - Product demand predictions
   - Growth percentages
   - Confidence intervals
   - AI insights and recommendations

5. **Customers (/customers)**
   - Customer segmentation
   - Behavior analysis
   - Lifetime value metrics

6. **Custom Reports (/reports)**
   - Report builder interface
   - Filter options
   - Export functionality

## 🤖 Machine Learning Models

### Sales Forecasting
- **Algorithm**: Linear Regression
- **Features**: Historical sales, time series
- **Accuracy**: 94.2%
- **Horizon**: 6 months

### Demand Prediction
- **Algorithm**: Time Series Analysis
- **Features**: Product sales history, seasonality
- **Confidence**: 92.5%

## 📈 Data Integration

Team 8 aggregates data from:
- **Team 1**: Sales Mobile transactions
- **Team 2**: Logistics delivery data
- **Team 3**: Finance payment records
- **Team 4**: HR employee metrics
- **Team 5**: E-commerce online orders
- **Team 6**: Retail POS in-store sales
- **Team 7**: Customer service interactions

## 👨‍💻 Development

```bash
# Frontend
npm run dev      # Dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Lint code

# Backend
python main.py   # Start API server
```

## 🔧 Configuration

### Frontend Port
`package.json`:
```json
"scripts": {
  "dev": "next dev -p 3008"
}
```

### Backend Port
`backend/main.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8008)
```

### CORS Settings
Backend configured for: `http://localhost:3008`

## 📦 Dependencies

### Frontend
- next: ^14.0.4
- react: ^18.2.0
- recharts: ^2.10.3
- lucide-react: ^0.294.0
- axios: ^1.6.2

### Backend
- fastapi: 0.109.0
- pandas: 2.1.4
- scikit-learn: 1.4.0
- numpy: 1.26.3

## 🚀 Production Deployment

1. Build frontend: `npm run build`
2. Set environment variables
3. Configure production database
4. Deploy backend with gunicorn
5. Set up reverse proxy (nginx)
6. Enable HTTPS

## 📝 Sample Data

The system includes comprehensive sample data:
- 7 months historical sales data
- 6 months forecasted data
- 8 product categories
- 7 team activity metrics
- Multiple chart visualizations

---

**Built with ❤️ for Gajah Nusa - Team 8**
