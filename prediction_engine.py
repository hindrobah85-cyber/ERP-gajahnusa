# backend/app/ml/prediction_engine.py
"""
Machine Learning Engine untuk ERP GAJAH NUSA
Prediksi permintaan, analisis fraud, optimasi rute, dan customer analytics
Terintegrasi dengan database models dan services
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

# TensorFlow imports commented out - using scikit-learn alternatives
# from tensorflow.keras.models import Sequential, load_model
# from tensorflow.keras.layers import LSTM, Dense, Dropout
# from tensorflow.keras.optimizers import Adam
TENSORFLOW_AVAILABLE = False

import joblib
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Import dari file-file sebelumnya
from backend.app.models.database import (
    SessionLocal, User, Customer, Order, OrderItem, 
    Payment, SalesVisit, Product, Delivery, FraudDetectionLog
)
from sqlalchemy import func, and_, or_
import json
import logging

logger = logging.getLogger(__name__)

# ============= FRAUD DETECTION ENGINE =============
class FraudDetectionML:
    """
    Advanced Fraud Detection using Multiple ML Models
    """
    
    def __init__(self):
        self.payment_fraud_model = None
        self.visit_fraud_model = None
        self.behavior_model = None
        self.isolation_forest = None
        self.scaler = StandardScaler()
        self.load_or_train_models()
    
    def load_or_train_models(self):
        """Load existing models or train new ones"""
        try:
            # Try to load existing models
            self.payment_fraud_model = joblib.load('models/payment_fraud_model.pkl')
            self.visit_fraud_model = joblib.load('models/visit_fraud_model.pkl')
            self.isolation_forest = joblib.load('models/isolation_forest.pkl')
            self.scaler = joblib.load('models/fraud_scaler.pkl')
            logger.info("Fraud detection models loaded successfully")
        except:
            logger.info("Training new fraud detection models")
            self.train_fraud_models()
    
    def train_fraud_models(self):
        """Train all fraud detection models"""
        db = SessionLocal()
        
        try:
            # ========== PAYMENT FRAUD MODEL ==========
            # Get payment data with features
            payments_query = db.query(
                Payment.id,
                Payment.amount,
                Payment.payment_method,
                Payment.late_deposit_hours,
                Payment.fraud_flag,
                Payment.salesman_id,
                func.count(Payment.id).over(partition_by=Payment.salesman_id).label('salesman_payment_count'),
                func.avg(Payment.late_deposit_hours).over(partition_by=Payment.salesman_id).label('avg_delay'),
                func.extract('hour', Payment.created_at).label('hour_of_day'),
                func.extract('dow', Payment.created_at).label('day_of_week')
            ).all()
            
            if payments_query:
                # Prepare payment fraud features
                payment_df = pd.DataFrame([{
                    'amount': p.amount,
                    'is_cash': 1 if p.payment_method == 'cash' else 0,
                    'late_hours': p.late_deposit_hours or 0,
                    'salesman_payment_count': p.salesman_payment_count,
                    'avg_delay': p.avg_delay or 0,
                    'hour_of_day': p.hour_of_day,
                    'day_of_week': p.day_of_week,
                    'fraud': 1 if p.fraud_flag else 0
                } for p in payments_query])
                
                # Train Random Forest for payment fraud
                X = payment_df.drop('fraud', axis=1)
                y = payment_df['fraud']
                
                X_scaled = self.scaler.fit_transform(X)
                
                self.payment_fraud_model = RandomForestClassifier(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
                self.payment_fraud_model.fit(X_scaled, y)
                
                # Train Isolation Forest for anomaly detection
                self.isolation_forest = IsolationForest(
                    contamination=0.1,
                    random_state=42
                )
                self.isolation_forest.fit(X_scaled)
                
                logger.info(f"Payment fraud model trained with {len(payment_df)} samples")
            
            # ========== VISIT FRAUD MODEL ==========
            # Get visit data with location features
            visits_query = db.query(
                SalesVisit.id,
                SalesVisit.gps_accuracy,
                SalesVisit.duration_minutes,
                SalesVisit.qr_fraud_attempt,
                SalesVisit.location_valid,
                SalesVisit.salesman_id,
                func.count(SalesVisit.id).over(partition_by=SalesVisit.salesman_id).label('visit_count'),
                func.avg(SalesVisit.duration_minutes).over(partition_by=SalesVisit.salesman_id).label('avg_duration')
            ).all()
            
            if visits_query:
                # Prepare visit fraud features
                visit_df = pd.DataFrame([{
                    'gps_accuracy': v.gps_accuracy or 0,
                    'duration': v.duration_minutes or 0,
                    'visit_count': v.visit_count,
                    'avg_duration': v.avg_duration or 0,
                    'location_valid': 1 if v.location_valid else 0,
                    'fraud': 1 if v.qr_fraud_attempt else 0
                } for v in visits_query])
                
                X_visit = visit_df.drop('fraud', axis=1)
                y_visit = visit_df['fraud']
                
                self.visit_fraud_model = RandomForestClassifier(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
                self.visit_fraud_model.fit(X_visit, y_visit)
                
                logger.info(f"Visit fraud model trained with {len(visit_df)} samples")
            
            # Save models
            self.save_models()
            
        except Exception as e:
            logger.error(f"Error training fraud models: {str(e)}")
        finally:
            db.close()
    
    def detect_payment_fraud(self, payment_data: dict) -> dict:
        """
        Detect fraud in payment transaction
        Returns fraud score and risk level
        """
        try:
            # Prepare features
            features = np.array([[
                payment_data.get('amount', 0),
                1 if payment_data.get('payment_method') == 'cash' else 0,
                payment_data.get('late_hours', 0),
                payment_data.get('salesman_payment_count', 0),
                payment_data.get('avg_delay', 0),
                payment_data.get('hour_of_day', datetime.now().hour),
                payment_data.get('day_of_week', datetime.now().weekday())
            ]])
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Get fraud probability
            fraud_prob = self.payment_fraud_model.predict_proba(features_scaled)[0][1]
            
            # Check for anomaly
            anomaly_score = self.isolation_forest.decision_function(features_scaled)[0]
            is_anomaly = self.isolation_forest.predict(features_scaled)[0] == -1
            
            # Combine scores
            final_score = (fraud_prob * 0.7) + (abs(anomaly_score) * 0.3 if is_anomaly else 0)
            
            # Determine risk level
            if final_score > 0.8:
                risk_level = 'HIGH'
            elif final_score > 0.5:
                risk_level = 'MEDIUM'
            else:
                risk_level = 'LOW'
            
            return {
                'fraud_score': float(final_score),
                'risk_level': risk_level,
                'is_anomaly': bool(is_anomaly),
                'fraud_probability': float(fraud_prob),
                'anomaly_score': float(anomaly_score),
                'recommendations': self.get_fraud_recommendations(risk_level)
            }
            
        except Exception as e:
            logger.error(f"Error detecting payment fraud: {str(e)}")
            return {'fraud_score': 0, 'risk_level': 'LOW', 'error': str(e)}
    
    def detect_location_fraud(self, visit_data: dict) -> dict:
        """
        Detect location-based fraud in sales visits
        """
        try:
            # Calculate distance from expected location
            distance = visit_data.get('gps_accuracy', 0)
            
            # Check time patterns
            visit_hour = visit_data.get('hour', datetime.now().hour)
            is_unusual_time = visit_hour < 7 or visit_hour > 20
            
            # Check visit duration
            duration = visit_data.get('duration_minutes', 0)
            is_too_short = duration < 5
            is_too_long = duration > 120
            
            # Calculate fraud score
            fraud_score = 0
            reasons = []
            
            if distance > 100:  # More than 100 meters from store
                fraud_score += 0.4
                reasons.append('Location mismatch')
            
            if is_unusual_time:
                fraud_score += 0.2
                reasons.append('Unusual visit time')
            
            if is_too_short:
                fraud_score += 0.3
                reasons.append('Visit duration too short')
            elif is_too_long:
                fraud_score += 0.1
                reasons.append('Visit duration unusually long')
            
            # Use ML model if available
            if self.visit_fraud_model:
                features = np.array([[
                    distance,
                    duration,
                    visit_data.get('visit_count', 0),
                    visit_data.get('avg_duration', 30),
                    1 if distance <= 100 else 0
                ]])
                
                ml_fraud_prob = self.visit_fraud_model.predict_proba(features)[0][1]
                fraud_score = (fraud_score + ml_fraud_prob) / 2
            
            return {
                'fraud_score': float(min(fraud_score, 1.0)),
                'risk_level': 'HIGH' if fraud_score > 0.7 else 'MEDIUM' if fraud_score > 0.4 else 'LOW',
                'reasons': reasons,
                'location_valid': distance <= 100,
                'distance_from_store': float(distance)
            }
            
        except Exception as e:
            logger.error(f"Error detecting location fraud: {str(e)}")
            return {'fraud_score': 0, 'risk_level': 'LOW', 'error': str(e)}
    
    def analyze_user_behavior(self, user_id: str, db) -> dict:
        """
        Analyze overall user behavior for fraud patterns
        """
        try:
            # Get user's payment history
            payments = db.query(Payment).filter(
                Payment.salesman_id == user_id,
                Payment.created_at >= datetime.utcnow() - timedelta(days=30)
            ).all()
            
            # Get user's visit history
            visits = db.query(SalesVisit).filter(
                SalesVisit.salesman_id == user_id,
                SalesVisit.check_in >= datetime.utcnow() - timedelta(days=30)
            ).all()
            
            # Calculate behavior metrics
            total_payments = len(payments)
            late_deposits = sum(1 for p in payments if p.late_deposit_hours > 24)
            cash_payments = sum(1 for p in payments if p.payment_method == 'cash')
            
            total_visits = len(visits)
            invalid_locations = sum(1 for v in visits if not v.location_valid)
            
            # Calculate risk indicators
            late_deposit_rate = late_deposits / total_payments if total_payments > 0 else 0
            cash_payment_rate = cash_payments / total_payments if total_payments > 0 else 0
            invalid_location_rate = invalid_locations / total_visits if total_visits > 0 else 0
            
            # Calculate overall fraud score
            fraud_score = (
                late_deposit_rate * 0.4 +
                cash_payment_rate * 0.2 +
                invalid_location_rate * 0.4
            )
            
            return {
                'user_id': user_id,
                'fraud_score': float(fraud_score),
                'risk_level': 'HIGH' if fraud_score > 0.6 else 'MEDIUM' if fraud_score > 0.3 else 'LOW',
                'metrics': {
                    'total_payments': total_payments,
                    'late_deposit_rate': float(late_deposit_rate),
                    'cash_payment_rate': float(cash_payment_rate),
                    'invalid_location_rate': float(invalid_location_rate)
                },
                'recommendations': self.get_user_recommendations(fraud_score)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing user behavior: {str(e)}")
            return {'fraud_score': 0, 'risk_level': 'LOW', 'error': str(e)}
    
    def get_fraud_recommendations(self, risk_level: str) -> list:
        """Get recommendations based on risk level"""
        recommendations = {
            'HIGH': [
                'Immediate supervisor review required',
                'Suspend payment processing temporarily',
                'Require additional verification',
                'Conduct field audit'
            ],
            'MEDIUM': [
                'Monitor closely for next 7 days',
                'Require photo evidence for all transactions',
                'Daily supervisor check-ins'
            ],
            'LOW': [
                'Continue standard monitoring',
                'Regular weekly reviews'
            ]
        }
        return recommendations.get(risk_level, [])
    
    def get_user_recommendations(self, fraud_score: float) -> list:
        """Get user-specific recommendations"""
        if fraud_score > 0.6:
            return [
                'Require daily deposit verification',
                'Limit cash transaction authority',
                'Implement GPS tracking for all visits',
                'Mandatory retraining on compliance'
            ]
        elif fraud_score > 0.3:
            return [
                'Weekly performance review',
                'Random spot checks',
                'Refresher training recommended'
            ]
        else:
            return ['Continue current monitoring level']
    
    def save_models(self):
        """Save trained models to disk"""
        try:
            if self.payment_fraud_model:
                joblib.dump(self.payment_fraud_model, 'models/payment_fraud_model.pkl')
            if self.visit_fraud_model:
                joblib.dump(self.visit_fraud_model, 'models/visit_fraud_model.pkl')
            if self.isolation_forest:
                joblib.dump(self.isolation_forest, 'models/isolation_forest.pkl')
            if self.scaler:
                joblib.dump(self.scaler, 'models/fraud_scaler.pkl')
            logger.info("Models saved successfully")
        except Exception as e:
            logger.error(f"Error saving models: {str(e)}")

# ============= DEMAND PREDICTION ENGINE =============
class DemandPredictionML:
    """
    Predict product demand using LSTM and time series analysis
    """
    
    def __init__(self):
        self.lstm_model = None
        self.scaler = StandardScaler()
        self.load_or_train_model()
    
    def load_or_train_model(self):
        """Load existing model or train new one"""
        try:
            if TENSORFLOW_AVAILABLE:
                # self.lstm_model = load_model('models/demand_lstm_model.h5')
                pass
            else:
                self.lstm_model = joblib.load('models/demand_model.pkl')
            self.scaler = joblib.load('models/demand_scaler.pkl')
            logger.info("Demand prediction model loaded successfully")
        except:
            logger.info("Training new demand prediction model")
            self.train_demand_model()
    
    def train_demand_model(self):
        """Train LSTM model for demand prediction"""
        db = SessionLocal()
        
        try:
            # Get historical order data
            orders_query = db.query(
                OrderItem.product_id,
                Product.name,
                func.date(Order.created_at).label('date'),
                func.sum(OrderItem.quantity).label('total_quantity')
            ).join(
                Order, OrderItem.order_id == Order.id
            ).join(
                Product, OrderItem.product_id == Product.id
            ).group_by(
                OrderItem.product_id,
                Product.name,
                func.date(Order.created_at)
            ).all()
            
            if not orders_query:
                logger.warning("No historical order data available")
                return
            
            # Prepare data for LSTM
            df = pd.DataFrame([{
                'product_id': o.product_id,
                'product_name': o.name,
                'date': o.date,
                'quantity': o.total_quantity
            } for o in orders_query])
            
            # Create time series for top products
            top_products = df.groupby('product_id')['quantity'].sum().nlargest(10).index
            
            for product_id in top_products:
                product_df = df[df['product_id'] == product_id].copy()
                product_df = product_df.sort_values('date')
                
                # Create sequences for LSTM
                sequence_length = 7  # Use 7 days to predict next day
                X, y = self.create_sequences(product_df['quantity'].values, sequence_length)
                
                if len(X) > 0:
                    # Build and train LSTM model
                    model = self.build_lstm_model(sequence_length)
                    
                    # Scale data
                    X_scaled = self.scaler.fit_transform(X.reshape(-1, 1)).reshape(X.shape)
                    y_scaled = self.scaler.transform(y.reshape(-1, 1))
                    
                    # Train model
                    model.fit(X_scaled, y_scaled, epochs=50, batch_size=32, verbose=0)
                    
                    # Save model for this product
                    model.save(f'models/demand_lstm_{product_id}.h5')
            
            logger.info("Demand prediction models trained successfully")
            
        except Exception as e:
            logger.error(f"Error training demand model: {str(e)}")
        finally:
            db.close()
    
    def build_lstm_model(self, sequence_length: int):
        """Build time series model architecture - using scikit-learn fallback"""
        if TENSORFLOW_AVAILABLE:
            # TensorFlow LSTM model would go here
            pass
        else:
            # Use GradientBoostingRegressor as fallback
            model = GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42
            )
        
        return model
        return model
    
    def create_sequences(self, data, sequence_length):
        """Create sequences for LSTM training"""
        X, y = [], []
        for i in range(len(data) - sequence_length):
            X.append(data[i:i + sequence_length])
            y.append(data[i + sequence_length])
        return np.array(X), np.array(y)
    
    def predict_demand(self, product_id: str, days_ahead: int = 7) -> dict:
        """
        Predict demand for a product for the next N days
        """
        db = SessionLocal()
        
        try:
            # Get recent sales data
            recent_orders = db.query(
                func.date(Order.created_at).label('date'),
                func.sum(OrderItem.quantity).label('quantity')
            ).join(
                OrderItem, Order.id == OrderItem.order_id
            ).filter(
                OrderItem.product_id == product_id,
                Order.created_at >= datetime.utcnow() - timedelta(days=30)
            ).group_by(
                func.date(Order.created_at)
            ).order_by(
                func.date(Order.created_at)
            ).all()
            
            if len(recent_orders) < 7:
                # Not enough data for LSTM, use simple average
                avg_daily = sum(o.quantity for o in recent_orders) / len(recent_orders) if recent_orders else 10
                predictions = [avg_daily] * days_ahead
            else:
                # Use advanced model if available
                try:
                    if TENSORFLOW_AVAILABLE:
                        # model = load_model(f'models/demand_lstm_{product_id}.h5')
                        pass
                    else:
                        # Use joblib to load scikit-learn model
                        model = joblib.load(f'models/demand_gb_{product_id}.pkl')
                    
                    # Prepare last 7 days of data for prediction
                    recent_quantities = [o.quantity for o in recent_orders[-7:]]
                    if len(recent_quantities) >= 7:
                        X = np.array(recent_quantities[-7:]).reshape(1, -1)
                        X_scaled = self.scaler.transform(X)
                    else:
                        # Not enough data, use current approach
                        raise FileNotFoundError("Not enough historical data")
                    
                    predictions = []
                    current_sequence = X_scaled.copy()
                    
                    for _ in range(days_ahead):
                        pred = model.predict(current_sequence, verbose=0)
                        predictions.append(self.scaler.inverse_transform(pred)[0][0])
                        
                        # Update sequence for next prediction
                        current_sequence = np.roll(current_sequence, -1, axis=1)
                        current_sequence[0, -1, 0] = pred[0, 0]
                    
                except:
                    # Fallback to moving average
                    avg_daily = sum(o.quantity for o in recent_orders) / len(recent_orders)
                    predictions = [avg_daily * (1 + np.random.normal(0, 0.1)) for _ in range(days_ahead)]
            
            # Calculate confidence intervals
            std_dev = np.std([o.quantity for o in recent_orders]) if recent_orders else 5
            
            return {
                'product_id': product_id,
                'predictions': [
                    {
                        'date': (datetime.now() + timedelta(days=i+1)).strftime('%Y-%m-%d'),
                        'predicted_quantity': float(predictions[i]),
                        'confidence_interval': {
                            'lower': float(max(0, predictions[i] - 1.96 * std_dev)),
                            'upper': float(predictions[i] + 1.96 * std_dev)
                        }
                    }
                    for i in range(days_ahead)
                ],
                'total_predicted': float(sum(predictions)),
                'average_daily': float(np.mean(predictions)),
                'recommendation': self.get_stock_recommendation(predictions, product_id, db)
            }
            
        except Exception as e:
            logger.error(f"Error predicting demand: {str(e)}")
            return {'error': str(e)}
        finally:
            db.close()
    
    def get_stock_recommendation(self, predictions: list, product_id: str, db) -> dict:
        """Get stock recommendations based on predictions"""
        # Get current stock
        product = db.query(Product).filter(Product.id == product_id).first()
        current_stock = product.stock_warehouse if product else 0
        
        total_predicted = sum(predictions)
        
        if current_stock < total_predicted * 0.5:
            return {
                'action': 'URGENT_RESTOCK',
                'quantity': int(total_predicted * 1.5 - current_stock),
                'message': 'Stock critically low based on demand forecast'
            }
        elif current_stock < total_predicted:
            return {
                'action': 'RESTOCK',
                'quantity': int(total_predicted * 1.2 - current_stock),
                'message': 'Consider restocking soon'
            }
        else:
            return {
                'action': 'SUFFICIENT',
                'quantity': 0,
                'message': 'Current stock sufficient for predicted demand'
            }

# ============= CUSTOMER ANALYTICS ENGINE =============
class CustomerAnalyticsML:
    """
    Analyze customer behavior and predict churn
    """
    
    def __init__(self):
        self.churn_model = None
        self.segmentation_model = None
        self.load_or_train_models()
    
    def load_or_train_models(self):
        """Load or train customer analytics models"""
        try:
            self.churn_model = joblib.load('models/churn_model.pkl')
            self.segmentation_model = joblib.load('models/segmentation_model.pkl')
            logger.info("Customer analytics models loaded successfully")
        except:
            logger.info("Training new customer analytics models")
            self.train_customer_models()
    
    def train_customer_models(self):
        """Train customer churn and segmentation models"""
        db = SessionLocal()
        
        try:
            # Get customer features
            customers_data = db.query(
                Customer.id,
                Customer.credit_limit,
                func.count(Order.id).label('order_count'),
                func.sum(Order.total_amount).label('total_spent'),
                func.avg(Order.total_amount).label('avg_order_value'),
                func.max(Order.created_at).label('last_order_date'),
                func.count(Payment.id).label('payment_count'),
                func.avg(Payment.late_deposit_hours).label('avg_payment_delay')
            ).outerjoin(
                Order, Customer.id == Order.customer_id
            ).outerjoin(
                Payment, Customer.id == Payment.customer_id
            ).group_by(Customer.id).all()
            
            if customers_data:
                # Prepare features
                df = pd.DataFrame([{
                    'customer_id': c.id,
                    'credit_limit': c.credit_limit,
                    'credit_utilization': (c.total_spent or 0) / c.credit_limit if c.credit_limit > 0 else 0,
                    'order_count': c.order_count or 0,
                    'total_spent': c.total_spent or 0,
                    'avg_order_value': c.avg_order_value or 0,
                    'days_since_last_order': (datetime.now() - c.last_order_date).days if c.last_order_date else 999,
                    'payment_count': c.payment_count or 0,
                    'avg_payment_delay': c.avg_payment_delay or 0
                } for c in customers_data])
                
                # Define churn (no order in last 60 days)
                df['churned'] = df['days_since_last_order'] > 60
                
                # Train churn prediction model
                features = ['credit_utilization', 'order_count', 'total_spent', 
                           'avg_order_value', 'days_since_last_order', 'avg_payment_delay']
                
                X = df[features]
                y = df['churned']
                
                self.churn_model = GradientBoostingRegressor(
                    n_estimators=100,
                    learning_rate=0.1,
                    max_depth=5,
                    random_state=42
                )
                self.churn_model.fit(X, y)
                
                # Save models
                joblib.dump(self.churn_model, 'models/churn_model.pkl')
                
                logger.info(f"Customer models trained with {len(df)} customers")
                
        except Exception as e:
            logger.error(f"Error training customer models: {str(e)}")
        finally:
            db.close()
    
    def analyze_customer(self, customer_id: str, db) -> dict:
        """
        Comprehensive customer analysis
        """
        try:
            # Get customer data
            customer = db.query(Customer).filter(Customer.id == customer_id).first()
            if not customer:
                return {'error': 'Customer not found'}
            
            # Get order history
            orders = db.query(Order).filter(Order.customer_id == customer_id).all()
            
            # Get payment history
            payments = db.query(Payment).filter(Payment.customer_id == customer_id).all()
            
            # Calculate metrics
            total_orders = len(orders)
            total_spent = sum(o.total_amount for o in orders)
            avg_order_value = total_spent / total_orders if total_orders > 0 else 0
            
            # Recent activity
            recent_orders = [o for o in orders if o.created_at >= datetime.utcnow() - timedelta(days=30)]
            
            # Payment behavior
            on_time_payments = sum(1 for p in payments if p.late_deposit_hours <= 24)
            payment_reliability = on_time_payments / len(payments) if payments else 1.0
            
            # Calculate customer value score
            value_score = self.calculate_customer_value(
                total_spent, total_orders, payment_reliability
            )
            
            # Predict churn probability
            churn_prob = self.predict_churn(customer, orders, payments)
            
            return {
                'customer_id': customer_id,
                'customer_name': customer.store_name,
                'metrics': {
                    'total_orders': total_orders,
                    'total_spent': float(total_spent),
                    'avg_order_value': float(avg_order_value),
                    'recent_orders_30d': len(recent_orders),
                    'payment_reliability': float(payment_reliability),
                    'credit_utilization': float(total_spent / customer.credit_limit) if customer.credit_limit > 0 else 0
                },
                'value_score': value_score,
                'churn_probability': churn_prob,
                'segment': self.get_customer_segment(value_score, churn_prob),
                'recommendations': self.get_customer_recommendations(value_score, churn_prob)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing customer: {str(e)}")
            return {'error': str(e)}
    
    def calculate_customer_value(self, total_spent: float, order_count: int, reliability: float) -> str:
        """Calculate customer lifetime value category"""
        score = (
            (total_spent / 1000000) * 0.5 +  # Weight spending
            (order_count / 10) * 0.3 +        # Weight frequency
            reliability * 0.2                  # Weight reliability
        )
        
        if score > 0.7:
            return 'HIGH'
        elif score > 0.4:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def predict_churn(self, customer, orders, payments) -> float:
        """Predict customer churn probability"""
        if not self.churn_model or not orders:
            return 0.0
        
        try:
            # Calculate features
            last_order = max(orders, key=lambda o: o.created_at)
            days_since_last = (datetime.now() - last_order.created_at).days
            total_spent = sum(o.total_amount for o in orders)
            
            features = np.array([[
                total_spent / customer.credit_limit if customer.credit_limit > 0 else 0,
                len(orders),
                total_spent,
                total_spent / len(orders),
                days_since_last,
                np.mean([p.late_deposit_hours for p in payments]) if payments else 0
            ]])
            
            churn_prob = self.churn_model.predict(features)[0]
            return float(min(max(churn_prob, 0), 1))
            
        except Exception as e:
            logger.error(f"Error predicting churn: {str(e)}")
            return 0.0
    
    def get_customer_segment(self, value_score: str, churn_prob: float) -> str:
        """Segment customers based on value and churn risk"""
        if value_score == 'HIGH' and churn_prob < 0.3:
            return 'CHAMPIONS'
        elif value_score == 'HIGH' and churn_prob >= 0.3:
            return 'AT_RISK_HIGH_VALUE'
        elif value_score == 'MEDIUM' and churn_prob < 0.3:
            return 'LOYAL_CUSTOMERS'
        elif value_score == 'MEDIUM' and churn_prob >= 0.3:
            return 'AT_RISK'
        elif value_score == 'LOW' and churn_prob < 0.3:
            return 'PROMISING'
        else:
            return 'NEEDS_ATTENTION'
    
    def get_customer_recommendations(self, value_score: str, churn_prob: float) -> list:
        """Get actionable recommendations for customer management"""
        recommendations = []
        
        if churn_prob > 0.6:
            recommendations.append('Urgent: Schedule retention call within 3 days')
            recommendations.append('Offer special discount or payment terms')
        elif churn_prob > 0.3:
            recommendations.append('Monitor closely and increase engagement')
            recommendations.append('Send personalized offers')
        
        if value_score == 'HIGH':
            recommendations.append('Assign dedicated account manager')
            recommendations.append('Provide priority support')
        elif value_score == 'LOW':
            recommendations.append('Encourage larger orders with volume discounts')
            recommendations.append('Cross-sell complementary products')
        
        return recommendations

# ============= ROUTE OPTIMIZATION ENGINE =============
class RouteOptimizationML:
    """
    Optimize delivery routes using ML and algorithms
    """
    
    def __init__(self):
        self.distance_matrix = {}
    
    def optimize_delivery_route(self, delivery_points: list, start_point: dict) -> dict:
        """
        Optimize delivery route using nearest neighbor algorithm
        Enhanced with traffic prediction
        """
        try:
            if not delivery_points:
                return {'error': 'No delivery points provided'}
            
            # Start from warehouse
            current_point = start_point
            unvisited = delivery_points.copy()
            route = [current_point]
            total_distance = 0
            
            while unvisited:
                # Find nearest unvisited point
                nearest = min(unvisited, key=lambda p: self.calculate_distance(current_point, p))
                distance = self.calculate_distance(current_point, nearest)
                
                total_distance += distance
                route.append(nearest)
                unvisited.remove(nearest)
                current_point = nearest
            
            # Return to start
            total_distance += self.calculate_distance(current_point, start_point)
            route.append(start_point)
            
            # Estimate time based on traffic patterns
            estimated_time = self.estimate_delivery_time(route, datetime.now())
            
            return {
                'optimized_route': route,
                'total_distance_km': float(total_distance),
                'estimated_time_minutes': float(estimated_time),
                'delivery_sequence': [
                    {
                        'sequence': i,
                        'location': point.get('name', f'Point {i}'),
                        'address': point.get('address', ''),
                        'estimated_arrival': (
                            datetime.now() + timedelta(minutes=estimated_time * i/len(route))
                        ).strftime('%H:%M')
                    }
                    for i, point in enumerate(route[1:-1], 1)
                ],
                'efficiency_score': self.calculate_route_efficiency(total_distance, len(delivery_points))
            }
            
        except Exception as e:
            logger.error(f"Error optimizing route: {str(e)}")
            return {'error': str(e)}
    
    def calculate_distance(self, point1: dict, point2: dict) -> float:
        """Calculate distance between two points using Haversine formula"""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Earth's radius in kilometers
        
        lat1, lon1 = radians(point1['lat']), radians(point1['lng'])
        lat2, lon2 = radians(point2['lat']), radians(point2['lng'])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    def estimate_delivery_time(self, route: list, start_time: datetime) -> float:
        """Estimate delivery time considering traffic patterns"""
        base_time = len(route) * 15  # 15 minutes per stop average
        
        # Add traffic factor based on time of day
        hour = start_time.hour
        if 7 <= hour <= 9 or 17 <= hour <= 19:  # Rush hours
            traffic_factor = 1.5
        elif 10 <= hour <= 16:  # Normal hours
            traffic_factor = 1.0
        else:  # Off-peak
            traffic_factor = 0.8
        
        return base_time * traffic_factor
    
    def calculate_route_efficiency(self, distance: float, num_stops: int) -> float:
        """Calculate route efficiency score"""
        # Ideal distance per stop (benchmark)
        ideal_distance_per_stop = 2.0  # km
        actual_distance_per_stop = distance / num_stops if num_stops > 0 else 0
        
        efficiency = (ideal_distance_per_stop / actual_distance_per_stop) if actual_distance_per_stop > 0 else 0
        return min(efficiency * 100, 100)  # Cap at 100%

# ============= MAIN ML SERVICE =============
class MLService:
    """
    Main ML service that coordinates all ML engines
    """
    
    def __init__(self):
        self.fraud_detector = FraudDetectionML()
        self.demand_predictor = DemandPredictionML()
        self.customer_analytics = CustomerAnalyticsML()
        self.route_optimizer = RouteOptimizationML()
    
    async def analyze_payment(self, payment_data: dict) -> dict:
        """Analyze payment for fraud"""
        return self.fraud_detector.detect_payment_fraud(payment_data)
    
    async def analyze_visit(self, visit_data: dict) -> dict:
        """Analyze sales visit for fraud"""
        return self.fraud_detector.detect_location_fraud(visit_data)
    
    async def predict_product_demand(self, product_id: str, days: int = 7) -> dict:
        """Predict product demand"""
        return self.demand_predictor.predict_demand(product_id, days)
    
    async def analyze_customer_profile(self, customer_id: str, db) -> dict:
        """Analyze customer profile"""
        return self.customer_analytics.analyze_customer(customer_id, db)
    
    async def optimize_route(self, delivery_points: list, start_point: dict) -> dict:
        """Optimize delivery route"""
        return self.route_optimizer.optimize_delivery_route(delivery_points, start_point)
    
    async def get_system_insights(self, db) -> dict:
        """
        Get overall system insights and recommendations
        """
        try:
            # Fraud insights
            recent_frauds = db.query(FraudDetectionLog).filter(
                FraudDetectionLog.created_at >= datetime.utcnow() - timedelta(days=7)
            ).all()
            
            # Sales insights
            recent_sales = db.query(
                func.sum(Order.total_amount).label('total'),
                func.count(Order.id).label('count')
            ).filter(
                Order.created_at >= datetime.utcnow() - timedelta(days=7)
            ).first()
            
            # Top products needing restock
            low_stock_products = db.query(Product).filter(
                Product.stock_warehouse < Product.stock_minimum
            ).all()
            
            return {
                'timestamp': datetime.now().isoformat(),
                'fraud_metrics': {
                    'alerts_last_7_days': len(recent_frauds),
                    'high_risk_count': sum(1 for f in recent_frauds if f.fraud_score > 0.7),
                    'most_common_type': max(set([f.fraud_type for f in recent_frauds]), 
                                           key=[f.fraud_type for f in recent_frauds].count) if recent_frauds else None
                },
                'sales_metrics': {
                    'revenue_last_7_days': float(recent_sales.total) if recent_sales.total else 0,
                    'orders_last_7_days': recent_sales.count if recent_sales.count else 0
                },
                'inventory_alerts': [
                    {
                        'product_id': p.id,
                        'product_name': p.name,
                        'current_stock': p.stock_warehouse,
                        'minimum_required': p.stock_minimum
                    }
                    for p in low_stock_products[:5]
                ],
                'recommendations': [
                    'Review high-risk fraud alerts immediately',
                    f'Restock {len(low_stock_products)} products running low',
                    'Schedule training for users with high fraud scores'
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting system insights: {str(e)}")
            return {'error': str(e)}

# Initialize ML Service
ml_service = MLService()

# Export for use in FastAPI endpoints
__all__ = ['ml_service', 'MLService']