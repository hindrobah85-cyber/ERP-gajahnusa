"""
Model Trainer
Service untuk training dan updating ML models
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio
import json

# Import ML models
from models.fraud_detector import FraudDetector
from models.demand_predictor import DemandPredictor

logger = logging.getLogger(__name__)

class ModelTrainer:
    """
    Service untuk training dan managing ML models
    """
    
    def __init__(self):
        self.fraud_detector = FraudDetector()
        self.demand_predictor = DemandPredictor()
        self.training_history = []
        
    async def train_fraud_detection_model(self, training_data: Dict) -> Dict:
        """
        Train fraud detection model dengan comprehensive data
        """
        try:
            logger.info("Starting fraud detection model training...")
            
            fraud_cases = training_data.get("fraud_cases", [])
            normal_cases = training_data.get("normal_cases", [])
            
            if len(fraud_cases) < 10 or len(normal_cases) < 50:
                return {
                    "status": "error",
                    "message": "Insufficient training data. Need at least 10 fraud cases and 50 normal cases",
                    "fraud_cases": len(fraud_cases),
                    "normal_cases": len(normal_cases)
                }
            
            # Prepare training data
            await asyncio.to_thread(
                self.fraud_detector.train,
                fraud_cases,
                normal_cases
            )
            
            # Save model
            model_path = f"models/fraud_detector_{datetime.now().strftime('%Y%m%d_%H%M%S')}.joblib"
            self.fraud_detector.save_model(model_path)
            
            # Record training history
            training_record = {
                "model_type": "fraud_detection",
                "timestamp": datetime.now().isoformat(),
                "fraud_cases": len(fraud_cases),
                "normal_cases": len(normal_cases),
                "model_path": model_path,
                "status": "completed"
            }
            self.training_history.append(training_record)
            
            logger.info("Fraud detection model training completed")
            
            return {
                "status": "success",
                "message": "Fraud detection model trained successfully",
                "training_data": {
                    "fraud_cases": len(fraud_cases),
                    "normal_cases": len(normal_cases)
                },
                "model_path": model_path,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error training fraud detection model: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def train_demand_prediction_model(self, historical_sales: List[Dict]) -> Dict:
        """
        Train demand prediction model dengan historical sales data
        """
        try:
            logger.info("Starting demand prediction model training...")
            
            if len(historical_sales) < 100:
                return {
                    "status": "error",
                    "message": "Insufficient historical data. Need at least 100 sales records",
                    "data_points": len(historical_sales)
                }
            
            # Validate data format
            required_fields = ['date', 'product_id', 'quantity', 'amount']
            for i, record in enumerate(historical_sales[:5]):  # Check first 5 records
                missing_fields = [field for field in required_fields if field not in record]
                if missing_fields:
                    return {
                        "status": "error",
                        "message": f"Missing required fields in record {i}: {missing_fields}",
                        "required_fields": required_fields
                    }
            
            # Train model
            await asyncio.to_thread(
                self.demand_predictor.train,
                historical_sales
            )
            
            # Record training history
            training_record = {
                "model_type": "demand_prediction",
                "timestamp": datetime.now().isoformat(),
                "data_points": len(historical_sales),
                "products_trained": len(self.demand_predictor.product_stats),
                "status": "completed"
            }
            self.training_history.append(training_record)
            
            logger.info("Demand prediction model training completed")
            
            return {
                "status": "success",
                "message": "Demand prediction model trained successfully",
                "training_data": {
                    "total_records": len(historical_sales),
                    "unique_products": len(self.demand_predictor.product_stats),
                    "date_range": self._get_date_range(historical_sales)
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error training demand prediction model: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def incremental_fraud_training(self, new_fraud_cases: List[Dict], new_normal_cases: List[Dict]) -> Dict:
        """
        Incremental training untuk fraud model dengan new cases
        """
        try:
            logger.info("Starting incremental fraud model training...")
            
            if not self.fraud_detector.is_trained:
                return {
                    "status": "error",
                    "message": "Base model not trained yet. Use full training first."
                }
            
            # For now, retrain with new data
            # In production, implement true incremental learning
            total_fraud = len(new_fraud_cases)
            total_normal = len(new_normal_cases)
            
            if total_fraud > 0 or total_normal > 0:
                # Load existing training data if available
                # For now, just train with new data
                self.fraud_detector.train(new_fraud_cases, new_normal_cases)
                
                # Save updated model
                model_path = f"models/fraud_detector_incremental_{datetime.now().strftime('%Y%m%d_%H%M%S')}.joblib"
                self.fraud_detector.save_model(model_path)
                
                training_record = {
                    "model_type": "fraud_detection_incremental",
                    "timestamp": datetime.now().isoformat(),
                    "new_fraud_cases": total_fraud,
                    "new_normal_cases": total_normal,
                    "model_path": model_path,
                    "status": "completed"
                }
                self.training_history.append(training_record)
                
                return {
                    "status": "success",
                    "message": "Incremental fraud model training completed",
                    "new_data": {
                        "fraud_cases": total_fraud,
                        "normal_cases": total_normal
                    },
                    "model_path": model_path,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "status": "error",
                    "message": "No new training data provided"
                }
                
        except Exception as e:
            logger.error(f"Error in incremental fraud training: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def evaluate_model_performance(self, model_type: str, test_data: List[Dict]) -> Dict:
        """
        Evaluate model performance dengan test data
        """
        try:
            if model_type == "fraud_detection":
                return await self._evaluate_fraud_model(test_data)
            elif model_type == "demand_prediction":
                return await self._evaluate_demand_model(test_data)
            else:
                return {
                    "status": "error",
                    "message": f"Unknown model type: {model_type}"
                }
                
        except Exception as e:
            logger.error(f"Error evaluating model performance: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _evaluate_fraud_model(self, test_cases: List[Dict]) -> Dict:
        """
        Evaluate fraud detection model
        """
        if not self.fraud_detector.is_trained:
            return {
                "status": "error",
                "message": "Fraud model not trained"
            }
        
        correct_predictions = 0
        total_predictions = 0
        fraud_detected = 0
        actual_fraud = 0
        
        for case in test_cases:
            user_data = case.get("user_data", {})
            transaction_data = case.get("transaction_data", {})
            actual_label = case.get("is_fraud", False)
            
            fraud_score = self.fraud_detector.predict_fraud_score(user_data, transaction_data)
            predicted_fraud = fraud_score > 0.5
            
            if predicted_fraud == actual_label:
                correct_predictions += 1
            
            if predicted_fraud:
                fraud_detected += 1
            
            if actual_label:
                actual_fraud += 1
            
            total_predictions += 1
        
        accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
        precision = correct_predictions / fraud_detected if fraud_detected > 0 else 0
        recall = correct_predictions / actual_fraud if actual_fraud > 0 else 0
        
        return {
            "model_type": "fraud_detection",
            "performance": {
                "accuracy": round(accuracy, 3),
                "precision": round(precision, 3),
                "recall": round(recall, 3),
                "total_cases": total_predictions,
                "fraud_cases": actual_fraud,
                "fraud_detected": fraud_detected
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def _evaluate_demand_model(self, test_cases: List[Dict]) -> Dict:
        """
        Evaluate demand prediction model
        """
        if not self.demand_predictor.is_trained:
            return {
                "status": "error",
                "message": "Demand model not trained"
            }
        
        total_error = 0
        total_cases = 0
        product_errors = {}
        
        for case in test_cases:
            product_id = case.get("product_id")
            actual_demand = case.get("actual_demand", 0)
            target_date = datetime.fromisoformat(case.get("date"))
            
            prediction = self.demand_predictor.predict_demand(product_id, target_date)
            predicted_demand = prediction.get("predicted_quantity", 0)
            
            error = abs(actual_demand - predicted_demand)
            relative_error = error / max(actual_demand, 1)
            
            total_error += relative_error
            total_cases += 1
            
            if product_id not in product_errors:
                product_errors[product_id] = []
            product_errors[product_id].append(relative_error)
        
        mean_error = total_error / total_cases if total_cases > 0 else 0
        
        # Calculate per-product performance
        product_performance = {}
        for product_id, errors in product_errors.items():
            product_performance[product_id] = {
                "mean_error": round(sum(errors) / len(errors), 3),
                "cases": len(errors)
            }
        
        return {
            "model_type": "demand_prediction",
            "performance": {
                "mean_absolute_error": round(mean_error, 3),
                "total_cases": total_cases,
                "products_evaluated": len(product_errors)
            },
            "product_performance": product_performance,
            "timestamp": datetime.now().isoformat()
        }
    
    async def schedule_retraining(self, model_type: str, schedule_config: Dict) -> Dict:
        """
        Schedule automatic retraining untuk models
        """
        try:
            # In production, implement actual scheduling with celery or similar
            logger.info(f"Scheduling retraining for {model_type}")
            
            schedule_record = {
                "model_type": model_type,
                "schedule": schedule_config,
                "created_at": datetime.now().isoformat(),
                "status": "scheduled"
            }
            
            return {
                "status": "success",
                "message": f"Retraining scheduled for {model_type}",
                "schedule": schedule_record,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error scheduling retraining: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def get_training_history(self) -> List[Dict]:
        """
        Get history dari semua training sessions
        """
        return sorted(
            self.training_history,
            key=lambda x: x.get("timestamp", ""),
            reverse=True
        )
    
    def get_model_versions(self) -> Dict:
        """
        Get information tentang model versions
        """
        fraud_history = [h for h in self.training_history if "fraud" in h.get("model_type", "")]
        demand_history = [h for h in self.training_history if "demand" in h.get("model_type", "")]
        
        return {
            "fraud_detection": {
                "total_trainings": len(fraud_history),
                "latest_training": fraud_history[0] if fraud_history else None,
                "is_trained": self.fraud_detector.is_trained
            },
            "demand_prediction": {
                "total_trainings": len(demand_history),
                "latest_training": demand_history[0] if demand_history else None,
                "is_trained": self.demand_predictor.is_trained
            },
            "timestamp": datetime.now().isoformat()
        }
    
    def _get_date_range(self, sales_data: List[Dict]) -> Dict:
        """
        Get date range dari sales data
        """
        try:
            dates = [datetime.fromisoformat(record["date"]) for record in sales_data if "date" in record]
            if dates:
                return {
                    "start_date": min(dates).isoformat(),
                    "end_date": max(dates).isoformat(),
                    "total_days": (max(dates) - min(dates)).days
                }
            else:
                return {"start_date": None, "end_date": None, "total_days": 0}
        except:
            return {"start_date": None, "end_date": None, "total_days": 0}
    
    async def export_model_config(self, model_type: str) -> Dict:
        """
        Export model configuration untuk backup/deployment
        """
        try:
            if model_type == "fraud_detection":
                return {
                    "model_type": "fraud_detection",
                    "is_trained": self.fraud_detector.is_trained,
                    "feature_columns": self.fraud_detector.feature_columns,
                    "config": {
                        "contamination": 0.1,
                        "n_estimators": 100
                    },
                    "exported_at": datetime.now().isoformat()
                }
            elif model_type == "demand_prediction":
                return {
                    "model_type": "demand_prediction",
                    "is_trained": self.demand_predictor.is_trained,
                    "products_count": len(self.demand_predictor.product_stats),
                    "seasonal_patterns": len(self.demand_predictor.seasonal_patterns),
                    "exported_at": datetime.now().isoformat()
                }
            else:
                return {
                    "status": "error",
                    "message": f"Unknown model type: {model_type}"
                }
                
        except Exception as e:
            logger.error(f"Error exporting model config: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
