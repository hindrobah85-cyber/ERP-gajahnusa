"""
ML Engine Main Application
FastAPI microservice untuk machine learning predictions
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import logging
import os
from datetime import datetime

# Import ML modules (these will be created)
from models.fraud_detector import FraudDetector
from models.demand_predictor import DemandPredictor
from models.route_optimizer import RouteOptimizer
from inference.prediction_service import PredictionService
from training.model_trainer import ModelTrainer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="GAJAH NUSA ML Engine",
    description="Machine Learning microservice for ERP Anti-Fraud System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML services
fraud_detector = FraudDetector()
demand_predictor = DemandPredictor()
route_optimizer = RouteOptimizer()
prediction_service = PredictionService()
model_trainer = ModelTrainer()

# Pydantic models for API requests/responses
class FraudDetectionRequest(BaseModel):
    transaction_id: str
    customer_id: str
    amount: float
    payment_method: str
    location: Optional[Dict[str, float]] = None
    timestamp: datetime
    additional_features: Optional[Dict[str, Any]] = None

class FraudDetectionResponse(BaseModel):
    transaction_id: str
    fraud_probability: float
    is_fraud: bool
    risk_factors: List[str]
    recommendation: str

class DemandPredictionRequest(BaseModel):
    product_id: str
    prediction_days: int = 30
    historical_data: Optional[Dict[str, Any]] = None

class DemandPredictionResponse(BaseModel):
    product_id: str
    predicted_demand: List[float]
    confidence_interval: Dict[str, List[float]]
    seasonal_factors: Dict[str, float]

class RouteOptimizationRequest(BaseModel):
    driver_id: str
    delivery_points: List[Dict[str, Any]]
    vehicle_capacity: float
    start_location: Dict[str, float]
    constraints: Optional[Dict[str, Any]] = None

class RouteOptimizationResponse(BaseModel):
    driver_id: str
    optimized_route: List[Dict[str, Any]]
    estimated_distance: float
    estimated_time: float
    fuel_savings: float

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "fraud_detector": fraud_detector.is_loaded(),
            "demand_predictor": demand_predictor.is_loaded(),
            "route_optimizer": route_optimizer.is_loaded()
        }
    }

# Fraud Detection Endpoints
@app.post("/predict/fraud", response_model=FraudDetectionResponse)
async def predict_fraud(request: FraudDetectionRequest):
    """
    Detect potential fraud in transactions using ML models
    """
    try:
        result = await fraud_detector.predict(
            transaction_id=request.transaction_id,
            customer_id=request.customer_id,
            amount=request.amount,
            payment_method=request.payment_method,
            location=request.location,
            timestamp=request.timestamp,
            additional_features=request.additional_features
        )
        
        return FraudDetectionResponse(**result)
    
    except Exception as e:
        logger.error(f"Fraud detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fraud detection failed: {str(e)}")

# Demand Prediction Endpoints
@app.post("/predict/demand", response_model=DemandPredictionResponse)
async def predict_demand(request: DemandPredictionRequest):
    """
    Predict product demand using time series forecasting
    """
    try:
        result = await demand_predictor.predict(
            product_id=request.product_id,
            prediction_days=request.prediction_days,
            historical_data=request.historical_data
        )
        
        return DemandPredictionResponse(**result)
    
    except Exception as e:
        logger.error(f"Demand prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Demand prediction failed: {str(e)}")

# Route Optimization Endpoints
@app.post("/optimize/route", response_model=RouteOptimizationResponse)
async def optimize_route(request: RouteOptimizationRequest):
    """
    Optimize delivery routes using genetic algorithm and ML
    """
    try:
        result = await route_optimizer.optimize(
            driver_id=request.driver_id,
            delivery_points=request.delivery_points,
            vehicle_capacity=request.vehicle_capacity,
            start_location=request.start_location,
            constraints=request.constraints
        )
        
        return RouteOptimizationResponse(**result)
    
    except Exception as e:
        logger.error(f"Route optimization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Route optimization failed: {str(e)}")

# Model Training Endpoints
@app.post("/train/fraud-model")
async def train_fraud_model(background_tasks: BackgroundTasks):
    """
    Trigger fraud detection model training
    """
    background_tasks.add_task(model_trainer.train_fraud_model)
    return {"message": "Fraud model training started", "status": "in_progress"}

@app.post("/train/demand-model")
async def train_demand_model(background_tasks: BackgroundTasks):
    """
    Trigger demand prediction model training
    """
    background_tasks.add_task(model_trainer.train_demand_model)
    return {"message": "Demand model training started", "status": "in_progress"}

# Model Information Endpoints
@app.get("/models/info")
async def get_models_info():
    """
    Get information about loaded models
    """
    return {
        "fraud_detector": fraud_detector.get_model_info(),
        "demand_predictor": demand_predictor.get_model_info(),
        "route_optimizer": route_optimizer.get_model_info(),
        "last_updated": datetime.now().isoformat()
    }

# Batch Prediction Endpoints
@app.post("/predict/batch/fraud")
async def batch_fraud_prediction(transactions: List[FraudDetectionRequest]):
    """
    Batch fraud detection for multiple transactions
    """
    try:
        results = []
        for transaction in transactions:
            result = await fraud_detector.predict(
                transaction_id=transaction.transaction_id,
                customer_id=transaction.customer_id,
                amount=transaction.amount,
                payment_method=transaction.payment_method,
                location=transaction.location,
                timestamp=transaction.timestamp,
                additional_features=transaction.additional_features
            )
            results.append(FraudDetectionResponse(**result))
        
        return {"results": results, "total_processed": len(results)}
    
    except Exception as e:
        logger.error(f"Batch fraud detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch processing failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("ML_ENGINE_PORT", "8001")),
        reload=True,
        log_level="info"
    )
