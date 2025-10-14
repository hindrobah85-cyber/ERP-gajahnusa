"""
Fraud Detection Model
Machine Learning model untuk mendeteksi fraud patterns
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import joblib
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

class FraudDetector:
    """
    Fraud Detection Model menggunakan ensemble methods
    """
    
    def __init__(self):
        self.isolation_forest = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        self.random_forest = RandomForestClassifier(
            n_estimators=200,
            random_state=42,
            class_weight='balanced'
        )
        self.scaler = StandardScaler()
        self.feature_columns = []
        self.is_trained = False
        
    def extract_features(self, user_data: Dict, transaction_data: Dict) -> Dict:
        """
        Extract features untuk fraud detection
        """
        features = {}
        
        # User behavior features
        features['avg_transaction_amount'] = user_data.get('avg_transaction_amount', 0)
        features['transaction_frequency'] = user_data.get('transaction_frequency', 0)
        features['late_payment_ratio'] = user_data.get('late_payment_ratio', 0)
        features['location_variance'] = user_data.get('location_variance', 0)
        features['device_changes'] = user_data.get('device_changes', 0)
        features['working_hours_ratio'] = user_data.get('working_hours_ratio', 1.0)
        
        # Transaction features
        features['amount'] = transaction_data.get('amount', 0)
        features['hour_of_day'] = transaction_data.get('hour_of_day', 12)
        features['day_of_week'] = transaction_data.get('day_of_week', 1)
        features['location_distance'] = transaction_data.get('location_distance', 0)
        features['time_since_last_transaction'] = transaction_data.get('time_since_last_transaction', 0)
        features['amount_deviation'] = transaction_data.get('amount_deviation', 0)
        
        # Calculated features
        features['amount_zscore'] = (
            (features['amount'] - features['avg_transaction_amount']) / 
            max(features['avg_transaction_amount'] * 0.1, 1)
        )
        features['is_weekend'] = 1 if features['day_of_week'] in [6, 7] else 0
        features['is_night'] = 1 if features['hour_of_day'] < 6 or features['hour_of_day'] > 22 else 0
        
        return features
    
    def prepare_training_data(self, fraud_cases: List[Dict], normal_cases: List[Dict]) -> tuple:
        """
        Prepare data untuk training
        """
        all_features = []
        labels = []
        
        # Process fraud cases
        for case in fraud_cases:
            features = self.extract_features(case['user_data'], case['transaction_data'])
            all_features.append(features)
            labels.append(1)  # Fraud
        
        # Process normal cases
        for case in normal_cases:
            features = self.extract_features(case['user_data'], case['transaction_data'])
            all_features.append(features)
            labels.append(0)  # Normal
        
        # Convert to DataFrame
        df = pd.DataFrame(all_features)
        self.feature_columns = df.columns.tolist()
        
        return df.values, np.array(labels)
    
    def train(self, fraud_cases: List[Dict], normal_cases: List[Dict]):
        """
        Train fraud detection models
        """
        logger.info("Training fraud detection models...")
        
        X, y = self.prepare_training_data(fraud_cases, normal_cases)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Isolation Forest (unsupervised)
        self.isolation_forest.fit(X_train_scaled)
        
        # Train Random Forest (supervised)
        self.random_forest.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred_rf = self.random_forest.predict(X_test_scaled)
        y_pred_iso = self.isolation_forest.predict(X_test_scaled)
        y_pred_iso = (y_pred_iso == -1).astype(int)  # Convert to 0/1
        
        logger.info("Random Forest Performance:")
        logger.info(classification_report(y_test, y_pred_rf))
        
        if len(np.unique(y_test)) > 1:
            rf_auc = roc_auc_score(y_test, self.random_forest.predict_proba(X_test_scaled)[:, 1])
            logger.info(f"Random Forest AUC: {rf_auc:.3f}")
        
        self.is_trained = True
        logger.info("Fraud detection training completed")
    
    def predict_fraud_score(self, user_data: Dict, transaction_data: Dict) -> float:
        """
        Predict fraud probability untuk single transaction
        """
        if not self.is_trained:
            logger.warning("Model not trained, returning default score")
            return 0.1
        
        features = self.extract_features(user_data, transaction_data)
        feature_vector = np.array([[features[col] for col in self.feature_columns]])
        
        # Scale features
        feature_vector_scaled = self.scaler.transform(feature_vector)
        
        # Get predictions from both models
        rf_prob = self.random_forest.predict_proba(feature_vector_scaled)[0, 1]
        iso_anomaly = self.isolation_forest.decision_function(feature_vector_scaled)[0]
        
        # Convert isolation forest score to probability
        iso_prob = max(0, min(1, (0.5 - iso_anomaly) * 2))
        
        # Ensemble prediction
        final_score = (rf_prob * 0.7) + (iso_prob * 0.3)
        
        return float(final_score)
    
    def analyze_payment_pattern(self, salesman_id: str, recent_payments: List[Dict]) -> Dict:
        """
        Analyze payment patterns untuk salesman
        """
        if not recent_payments:
            return {"fraud_score": 0.0, "risk_factors": []}
        
        risk_factors = []
        risk_score = 0.0
        
        # Calculate statistics
        amounts = [p['amount'] for p in recent_payments]
        deposit_delays = [p.get('deposit_delay_hours', 0) for p in recent_payments]
        
        # Check for unusual amounts
        if len(amounts) > 1:
            mean_amount = np.mean(amounts)
            std_amount = np.std(amounts)
            
            for amount in amounts[-5:]:  # Check last 5 payments
                if abs(amount - mean_amount) > 2 * std_amount:
                    risk_factors.append("unusual_amount")
                    risk_score += 0.1
        
        # Check for frequent late deposits
        late_count = sum(1 for delay in deposit_delays if delay > 24)
        if late_count > len(deposit_delays) * 0.3:  # More than 30% late
            risk_factors.append("frequent_late_deposits")
            risk_score += 0.2
        
        # Check for very late deposits
        very_late_count = sum(1 for delay in deposit_delays if delay > 72)
        if very_late_count > 0:
            risk_factors.append("very_late_deposits")
            risk_score += 0.3
        
        # Check for payment frequency anomalies
        payment_dates = [datetime.fromisoformat(p['created_at']) for p in recent_payments]
        payment_dates.sort()
        
        if len(payment_dates) > 3:
            intervals = [(payment_dates[i] - payment_dates[i-1]).days 
                        for i in range(1, len(payment_dates))]
            
            # Check for sudden increase in payment frequency
            recent_intervals = intervals[-3:]
            older_intervals = intervals[:-3] if len(intervals) > 3 else []
            
            if older_intervals and recent_intervals:
                recent_avg = np.mean(recent_intervals)
                older_avg = np.mean(older_intervals)
                
                if recent_avg < older_avg * 0.5:  # Sudden 50% increase in frequency
                    risk_factors.append("sudden_frequency_increase")
                    risk_score += 0.15
        
        # Cap the risk score
        risk_score = min(risk_score, 1.0)
        
        return {
            "fraud_score": risk_score,
            "risk_factors": list(set(risk_factors)),
            "analysis": {
                "total_payments": len(recent_payments),
                "late_payment_ratio": late_count / len(recent_payments) if recent_payments else 0,
                "avg_deposit_delay": np.mean(deposit_delays) if deposit_delays else 0
            }
        }
    
    def save_model(self, filepath: str):
        """
        Save trained model
        """
        model_data = {
            'isolation_forest': self.isolation_forest,
            'random_forest': self.random_forest,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'is_trained': self.is_trained,
            'trained_at': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """
        Load trained model
        """
        try:
            model_data = joblib.load(filepath)
            
            self.isolation_forest = model_data['isolation_forest']
            self.random_forest = model_data['random_forest']
            self.scaler = model_data['scaler']
            self.feature_columns = model_data['feature_columns']
            self.is_trained = model_data['is_trained']
            
            logger.info(f"Model loaded from {filepath}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            return False
