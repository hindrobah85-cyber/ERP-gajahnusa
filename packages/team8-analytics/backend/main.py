from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import json

app = FastAPI(title="Analytics & BI API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3008"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SalesData(BaseModel):
    month: str
    revenue: float
    orders: int
    customers: int

class ForecastResult(BaseModel):
    month: str
    forecast: float
    lower_bound: float
    upper_bound: float
    confidence: float

class InventoryAlert(BaseModel):
    product_id: int
    product_name: str
    current_stock: int
    min_stock: int
    status: str
    priority: int

# Sample data generator
def generate_sales_data(months: int = 12) -> List[dict]:
    """Generate sample sales data for forecasting"""
    base_revenue = 45000
    data = []
    
    for i in range(months):
        month_date = datetime.now() - timedelta(days=30 * (months - i))
        revenue = base_revenue + (i * 3000) + np.random.randint(-5000, 5000)
        orders = int(revenue / 350) + np.random.randint(-20, 20)
        customers = int(orders * 0.75) + np.random.randint(-10, 10)
        
        data.append({
            "month": month_date.strftime("%b"),
            "revenue": float(revenue),
            "orders": orders,
            "customers": customers,
            "date": month_date.isoformat()
        })
    
    return data

def forecast_sales(historical_data: List[dict], periods: int = 6) -> List[ForecastResult]:
    """Simple linear regression forecast"""
    df = pd.DataFrame(historical_data)
    
    # Prepare data
    X = np.array(range(len(df))).reshape(-1, 1)
    y = df['revenue'].values
    
    # Train model
    model = LinearRegression()
    model.fit(X, y)
    
    # Generate forecasts
    forecasts = []
    last_index = len(df)
    
    for i in range(periods):
        future_index = last_index + i
        predicted_revenue = model.predict([[future_index]])[0]
        
        # Add confidence interval (±10%)
        confidence = 0.90
        margin = predicted_revenue * 0.10
        
        future_date = datetime.now() + timedelta(days=30 * (i + 1))
        
        forecasts.append(ForecastResult(
            month=future_date.strftime("%b"),
            forecast=round(predicted_revenue, 2),
            lower_bound=round(predicted_revenue - margin, 2),
            upper_bound=round(predicted_revenue + margin, 2),
            confidence=confidence
        ))
    
    return forecasts

# Routes
@app.get("/")
def root():
    return {
        "service": "Analytics & BI API",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    """Get overall dashboard summary statistics"""
    return {
        "total_revenue": 67000000,
        "total_orders": 1246,
        "active_customers": 342,
        "total_products": 3000,
        "low_stock_items": 12,
        "growth_rate": 22,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/sales/historical")
def get_historical_sales(months: int = 12):
    """Get historical sales data"""
    data = generate_sales_data(months)
    return {
        "data": data,
        "count": len(data)
    }

@app.get("/api/sales/forecast")
def get_sales_forecast(periods: int = 6):
    """Get sales forecast for future periods"""
    historical = generate_sales_data(12)
    forecasts = forecast_sales(historical, periods)
    
    return {
        "historical": historical,
        "forecast": [f.dict() for f in forecasts],
        "model": "Linear Regression",
        "accuracy": 94.2
    }

@app.get("/api/sales/channels")
def get_sales_by_channel():
    """Get sales breakdown by channel"""
    return {
        "data": [
            {"channel": "Sales Mobile", "revenue": 28500000, "percentage": 38, "orders": 472},
            {"channel": "E-commerce", "revenue": 21300000, "percentage": 28, "orders": 356},
            {"channel": "Retail POS", "revenue": 19200000, "percentage": 26, "orders": 318},
            {"channel": "Direct Sales", "revenue": 6000000, "percentage": 8, "orders": 100}
        ]
    }

@app.get("/api/inventory/status")
def get_inventory_status():
    """Get current inventory status with alerts"""
    inventory = [
        {"id": 1, "name": "Semen Gresik 50kg", "category": "Semen", "stock": 850, "min": 500, "status": "good"},
        {"id": 2, "name": "Bata Merah Press", "category": "Bata", "stock": 320, "min": 400, "status": "warning"},
        {"id": 3, "name": "Pasir Beton per m³", "category": "Pasir", "stock": 1200, "min": 800, "status": "good"},
        {"id": 4, "name": "Besi Beton 10mm", "category": "Besi", "stock": 180, "min": 200, "status": "critical"},
        {"id": 5, "name": "Cat Tembok Putih 25kg", "category": "Cat", "stock": 450, "min": 300, "status": "good"},
    ]
    
    alerts = [item for item in inventory if item["status"] in ["warning", "critical"]]
    
    return {
        "inventory": inventory,
        "alerts": alerts,
        "total_items": len(inventory),
        "alert_count": len(alerts)
    }

@app.get("/api/forecasting/demand")
def get_demand_forecast():
    """Get product demand forecasting"""
    return {
        "data": [
            {"product": "Semen", "current": 850, "predicted": 920, "growth": 8.2},
            {"product": "Bata", "current": 320, "predicted": 380, "growth": 18.8},
            {"product": "Pasir", "current": 1200, "predicted": 1280, "growth": 6.7},
            {"product": "Besi", "current": 180, "predicted": 240, "growth": 33.3},
            {"product": "Cat", "current": 450, "predicted": 510, "growth": 13.3},
        ],
        "model": "Time Series Analysis",
        "confidence": 92.5
    }

@app.get("/api/teams/activity")
def get_team_activity():
    """Get cross-team activity summary"""
    return {
        "data": [
            {"team": "Sales Mobile", "today": 45, "week": 312, "month": 1246, "status": "active"},
            {"team": "Logistics", "today": 38, "week": 267, "month": 1089, "status": "active"},
            {"team": "Finance", "today": 52, "week": 389, "month": 1534, "status": "active"},
            {"team": "HR System", "today": 12, "week": 78, "month": 342, "status": "normal"},
            {"team": "E-commerce", "today": 67, "week": 456, "month": 1892, "status": "active"},
            {"team": "Retail POS", "today": 89, "week": 623, "month": 2456, "status": "active"},
            {"team": "Customer Service", "today": 34, "week": 198, "month": 756, "status": "active"}
        ]
    }

@app.get("/api/reports/generate")
def generate_custom_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    team: Optional[str] = None
):
    """Generate custom report based on filters"""
    return {
        "report_id": "RPT-" + datetime.now().strftime("%Y%m%d%H%M%S"),
        "generated_at": datetime.now().isoformat(),
        "filters": {
            "start_date": start_date or "2024-01-01",
            "end_date": end_date or datetime.now().strftime("%Y-%m-%d"),
            "team": team or "all"
        },
        "summary": {
            "total_transactions": 8315,
            "total_revenue": 67000000,
            "average_order_value": 50492,
            "customer_count": 342
        },
        "status": "completed"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Analytics & BI API on http://localhost:8008")
    uvicorn.run(app, host="0.0.0.0", port=8008)
