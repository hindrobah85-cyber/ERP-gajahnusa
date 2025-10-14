"""
Prediction Service
Service untuk menjalankan ML predictions
"""

from typing import Dict, List, Any, Optional
import logging
from datetime import datetime, timedelta
import asyncio

# Import ML models
from models.fraud_detector import FraudDetector
from models.demand_predictor import DemandPredictor
from models.route_optimizer import RouteOptimizer

logger = logging.getLogger(__name__)

class PredictionService:
    """
    Central service untuk semua ML predictions
    """
    
    def __init__(self):
        self.fraud_detector = FraudDetector()
        self.demand_predictor = DemandPredictor()
        self.route_optimizer = RouteOptimizer()
        self.models_loaded = False
        
    async def initialize_models(self):
        """
        Initialize dan load semua ML models
        """
        try:
            logger.info("Initializing ML models...")
            
            # Try to load pre-trained models
            fraud_loaded = self.fraud_detector.load_model("models/fraud_detector.joblib")
            if not fraud_loaded:
                logger.info("No pre-trained fraud model found, will train on first use")
            
            # Demand predictor and route optimizer don't need pre-trained models
            
            self.models_loaded = True
            logger.info("ML models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing models: {str(e)}")
            self.models_loaded = False
    
    async def predict_fraud_score(self, user_data: Dict, transaction_data: Dict) -> Dict:
        """
        Predict fraud score untuk transaction
        """
        try:
            if not self.models_loaded:
                await self.initialize_models()
            
            fraud_score = self.fraud_detector.predict_fraud_score(user_data, transaction_data)
            
            # Determine risk level
            if fraud_score > 0.8:
                risk_level = "high"
            elif fraud_score > 0.5:
                risk_level = "medium"
            else:
                risk_level = "low"
            
            return {
                "fraud_score": round(fraud_score, 3),
                "risk_level": risk_level,
                "timestamp": datetime.now().isoformat(),
                "model_version": "1.0"
            }
            
        except Exception as e:
            logger.error(f"Error in fraud prediction: {str(e)}")
            return {
                "fraud_score": 0.1,
                "risk_level": "unknown",
                "error": str(e)
            }
    
    async def analyze_payment_pattern(self, salesman_id: str, recent_payments: List[Dict]) -> Dict:
        """
        Analyze payment patterns untuk salesman
        """
        try:
            if not self.models_loaded:
                await self.initialize_models()
            
            analysis = self.fraud_detector.analyze_payment_pattern(salesman_id, recent_payments)
            
            return {
                "salesman_id": salesman_id,
                "analysis": analysis,
                "timestamp": datetime.now().isoformat(),
                "recommendations": self._generate_fraud_recommendations(analysis)
            }
            
        except Exception as e:
            logger.error(f"Error in payment pattern analysis: {str(e)}")
            return {
                "salesman_id": salesman_id,
                "analysis": {"fraud_score": 0.0, "risk_factors": []},
                "error": str(e)
            }
    
    async def predict_demand(self, product_id: str, target_date: str, context: Dict = None) -> Dict:
        """
        Predict demand untuk specific product
        """
        try:
            if not self.models_loaded:
                await self.initialize_models()
            
            target_dt = datetime.fromisoformat(target_date)
            prediction = self.demand_predictor.predict_demand(product_id, target_dt, context)
            
            return {
                "product_id": product_id,
                "target_date": target_date,
                "prediction": prediction,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in demand prediction: {str(e)}")
            return {
                "product_id": product_id,
                "target_date": target_date,
                "prediction": {"predicted_quantity": 0, "confidence": 0.0},
                "error": str(e)
            }
    
    async def predict_multiple_demands(self, product_ids: List[str], target_date: str) -> Dict:
        """
        Predict demand untuk multiple products
        """
        try:
            if not self.models_loaded:
                await self.initialize_models()
            
            target_dt = datetime.fromisoformat(target_date)
            predictions = self.demand_predictor.predict_multiple_products(product_ids, target_dt)
            
            return {
                "target_date": target_date,
                "predictions": predictions,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in multiple demand prediction: {str(e)}")
            return {
                "target_date": target_date,
                "predictions": {},
                "error": str(e)
            }
    
    async def recommend_reorder(self, product_id: str, current_stock: int, lead_time_days: int = 7) -> Dict:
        """
        Recommend reorder untuk product
        """
        try:
            if not self.models_loaded:
                await self.initialize_models()
            
            recommendation = self.demand_predictor.recommend_reorder(
                product_id, current_stock, lead_time_days
            )
            
            return {
                "product_id": product_id,
                "recommendation": recommendation,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in reorder recommendation: {str(e)}")
            return {
                "product_id": product_id,
                "recommendation": {"reorder_needed": False, "recommended_quantity": 0},
                "error": str(e)
            }
    
    async def optimize_route(self, salesman_location: Dict, customers: List[Dict], days: int = 1) -> Dict:
        """
        Optimize route untuk salesman
        """
        try:
            if not self.models_loaded:
                await self.initialize_models()
            
            if days == 1:
                optimization = self.route_optimizer.optimize_single_day_route(
                    salesman_location, customers
                )
            else:
                optimization = self.route_optimizer.optimize_multi_day_route(
                    salesman_location, customers, days
                )
            
            return {
                "salesman_location": salesman_location,
                "optimization": optimization,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in route optimization: {str(e)}")
            return {
                "salesman_location": salesman_location,
                "optimization": {"route": [], "total_distance": 0, "feasible": False},
                "error": str(e)
            }
    
    async def suggest_visit_sequence(self, salesman_id: str, pending_customers: List[Dict]) -> Dict:
        """
        Suggest optimal visit sequence
        """
        try:
            if not self.models_loaded:
                await self.initialize_models()
            
            suggestions = self.route_optimizer.suggest_optimal_visit_sequence(
                salesman_id, pending_customers
            )
            
            return {
                "salesman_id": salesman_id,
                "suggestions": suggestions,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in visit sequence suggestion: {str(e)}")
            return {
                "salesman_id": salesman_id,
                "suggestions": {"suggestions": [], "reasoning": "Error occurred"},
                "error": str(e)
            }
    
    async def train_fraud_model(self, fraud_cases: List[Dict], normal_cases: List[Dict]) -> Dict:
        """
        Train fraud detection model dengan new data
        """
        try:
            logger.info("Training fraud detection model...")
            
            self.fraud_detector.train(fraud_cases, normal_cases)
            
            # Save trained model
            self.fraud_detector.save_model("models/fraud_detector.joblib")
            
            return {
                "status": "success",
                "message": "Fraud detection model trained successfully",
                "fraud_cases": len(fraud_cases),
                "normal_cases": len(normal_cases),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error training fraud model: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def train_demand_model(self, historical_sales: List[Dict]) -> Dict:
        """
        Train demand prediction model dengan historical data
        """
        try:
            logger.info("Training demand prediction model...")
            
            self.demand_predictor.train(historical_sales)
            
            return {
                "status": "success",
                "message": "Demand prediction model trained successfully",
                "data_points": len(historical_sales),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error training demand model: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def get_model_status(self) -> Dict:
        """
        Get status dari semua ML models
        """
        return {
            "models_loaded": self.models_loaded,
            "fraud_detector": {
                "trained": self.fraud_detector.is_trained,
                "features": len(self.fraud_detector.feature_columns)
            },
            "demand_predictor": {
                "trained": self.demand_predictor.is_trained,
                "products": len(self.demand_predictor.product_stats)
            },
            "route_optimizer": {
                "available": True,
                "max_visits_per_day": self.route_optimizer.optimization_params['max_visits_per_day']
            },
            "timestamp": datetime.now().isoformat()
        }
    
    def _generate_fraud_recommendations(self, analysis: Dict) -> List[str]:
        """
        Generate recommendations berdasarkan fraud analysis
        """
        recommendations = []
        fraud_score = analysis.get("fraud_score", 0)
        risk_factors = analysis.get("risk_factors", [])
        
        if fraud_score > 0.8:
            recommendations.append("Immediate review required - suspend account temporarily")
        elif fraud_score > 0.5:
            recommendations.append("Enhanced monitoring recommended")
        
        if "frequent_late_deposits" in risk_factors:
            recommendations.append("Implement daily deposit verification")
        
        if "very_late_deposits" in risk_factors:
            recommendations.append("Require supervisor approval for new transactions")
        
        if "unusual_amount" in risk_factors:
            recommendations.append("Verify transaction amounts with customers")
        
        if "sudden_frequency_increase" in risk_factors:
            recommendations.append("Investigate reason for increased activity")
        
        if not recommendations:
            recommendations.append("Continue normal monitoring")
        
        return recommendations
    
    async def batch_predict(self, requests: List[Dict]) -> List[Dict]:
        """
        Process multiple prediction requests
        """
        results = []
        
        for request in requests:
            try:
                prediction_type = request.get("type")
                
                if prediction_type == "fraud":
                    result = await self.predict_fraud_score(
                        request["user_data"], 
                        request["transaction_data"]
                    )
                elif prediction_type == "demand":
                    result = await self.predict_demand(
                        request["product_id"], 
                        request["target_date"],
                        request.get("context")
                    )
                elif prediction_type == "route":
                    result = await self.optimize_route(
                        request["salesman_location"],
                        request["customers"],
                        request.get("days", 1)
                    )
                else:
                    result = {"error": f"Unknown prediction type: {prediction_type}"}
                
                result["request_id"] = request.get("id")
                results.append(result)
                
            except Exception as e:
                results.append({
                    "request_id": request.get("id"),
                    "error": str(e)
                })
        
        return results
