"""
Demand Prediction Model
Machine Learning model untuk prediksi demand produk
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)

class DemandPredictor:
    """
    Simple demand prediction model menggunakan statistical methods
    """
    
    def __init__(self):
        self.seasonal_patterns = {}
        self.trend_coefficients = {}
        self.product_stats = {}
        self.is_trained = False
        
    def extract_features(self, historical_data: List[Dict]) -> Dict:
        """
        Extract features dari historical sales data
        """
        if not historical_data:
            return {}
        
        # Convert to DataFrame-like structure
        data = []
        for record in historical_data:
            data.append({
                'date': datetime.fromisoformat(record['date']),
                'product_id': record['product_id'],
                'quantity': record['quantity'],
                'amount': record['amount']
            })
        
        # Group by product
        product_data = {}
        for record in data:
            product_id = record['product_id']
            if product_id not in product_data:
                product_data[product_id] = []
            product_data[product_id].append(record)
        
        return product_data
    
    def calculate_seasonal_patterns(self, product_data: Dict) -> Dict:
        """
        Calculate seasonal patterns per product
        """
        patterns = {}
        
        for product_id, records in product_data.items():
            if len(records) < 12:  # Need at least 12 data points
                continue
                
            # Sort by date
            records.sort(key=lambda x: x['date'])
            
            # Calculate monthly averages
            monthly_sales = {}
            for record in records:
                month = record['date'].month
                if month not in monthly_sales:
                    monthly_sales[month] = []
                monthly_sales[month].append(record['quantity'])
            
            # Calculate seasonal factors
            monthly_averages = {}
            for month, sales in monthly_sales.items():
                monthly_averages[month] = np.mean(sales)
            
            overall_average = np.mean([avg for avg in monthly_averages.values()])
            
            seasonal_factors = {}
            for month, avg in monthly_averages.items():
                seasonal_factors[month] = avg / overall_average if overall_average > 0 else 1.0
            
            patterns[product_id] = seasonal_factors
        
        return patterns
    
    def calculate_trend(self, product_data: Dict) -> Dict:
        """
        Calculate trend coefficients
        """
        trends = {}
        
        for product_id, records in product_data.items():
            if len(records) < 6:  # Need at least 6 data points
                continue
                
            # Sort by date
            records.sort(key=lambda x: x['date'])
            
            # Simple linear trend calculation
            quantities = [r['quantity'] for r in records]
            x = list(range(len(quantities)))
            
            # Calculate trend using simple regression
            if len(x) > 1:
                x_mean = np.mean(x)
                y_mean = np.mean(quantities)
                
                numerator = sum((x[i] - x_mean) * (quantities[i] - y_mean) for i in range(len(x)))
                denominator = sum((x[i] - x_mean) ** 2 for i in range(len(x)))
                
                slope = numerator / denominator if denominator != 0 else 0
                trends[product_id] = slope
            else:
                trends[product_id] = 0
        
        return trends
    
    def train(self, historical_sales: List[Dict]):
        """
        Train demand prediction model
        """
        logger.info("Training demand prediction model...")
        
        product_data = self.extract_features(historical_sales)
        
        if not product_data:
            logger.warning("No data for training")
            return
        
        # Calculate seasonal patterns
        self.seasonal_patterns = self.calculate_seasonal_patterns(product_data)
        
        # Calculate trends
        self.trend_coefficients = self.calculate_trend(product_data)
        
        # Calculate product statistics
        for product_id, records in product_data.items():
            quantities = [r['quantity'] for r in records]
            self.product_stats[product_id] = {
                'mean': np.mean(quantities),
                'std': np.std(quantities),
                'min': min(quantities),
                'max': max(quantities),
                'last_value': quantities[-1] if quantities else 0
            }
        
        self.is_trained = True
        logger.info(f"Demand prediction training completed for {len(self.product_stats)} products")
    
    def predict_demand(self, product_id: str, target_date: datetime, context: Dict = None) -> Dict:
        """
        Predict demand untuk specific product dan date
        """
        if not self.is_trained or product_id not in self.product_stats:
            return {
                'predicted_quantity': 0,
                'confidence': 0.0,
                'factors': ['no_data']
            }
        
        base_demand = self.product_stats[product_id]['mean']
        
        # Apply seasonal factor
        month = target_date.month
        seasonal_factor = self.seasonal_patterns.get(product_id, {}).get(month, 1.0)
        
        # Apply trend
        trend = self.trend_coefficients.get(product_id, 0)
        days_ahead = (target_date - datetime.now()).days
        trend_adjustment = trend * days_ahead / 30  # Normalize to monthly trend
        
        # Calculate prediction
        predicted_demand = base_demand * seasonal_factor + trend_adjustment
        predicted_demand = max(0, predicted_demand)  # Cannot be negative
        
        # Calculate confidence based on data quality
        confidence = 0.5  # Base confidence
        if len(self.product_stats[product_id]) > 20:
            confidence += 0.2
        if abs(seasonal_factor - 1.0) < 0.2:
            confidence += 0.1
        if abs(trend) < self.product_stats[product_id]['std'] * 0.1:
            confidence += 0.2
        
        confidence = min(confidence, 1.0)
        
        factors = []
        if seasonal_factor > 1.2:
            factors.append('high_season')
        elif seasonal_factor < 0.8:
            factors.append('low_season')
        
        if trend > 0:
            factors.append('positive_trend')
        elif trend < 0:
            factors.append('negative_trend')
        
        return {
            'predicted_quantity': round(predicted_demand, 2),
            'confidence': round(confidence, 2),
            'factors': factors,
            'seasonal_factor': round(seasonal_factor, 2),
            'trend_adjustment': round(trend_adjustment, 2)
        }
    
    def predict_multiple_products(self, product_ids: List[str], target_date: datetime) -> Dict:
        """
        Predict demand untuk multiple products
        """
        predictions = {}
        
        for product_id in product_ids:
            predictions[product_id] = self.predict_demand(product_id, target_date)
        
        return predictions
    
    def recommend_reorder(self, product_id: str, current_stock: int, lead_time_days: int = 7) -> Dict:
        """
        Recommend reorder quantity dan timing
        """
        if not self.is_trained or product_id not in self.product_stats:
            return {
                'reorder_needed': False,
                'recommended_quantity': 0,
                'urgency': 'low'
            }
        
        # Predict demand for lead time period
        target_date = datetime.now() + timedelta(days=lead_time_days)
        demand_prediction = self.predict_demand(product_id, target_date)
        
        daily_demand = demand_prediction['predicted_quantity'] / 30  # Assume monthly prediction
        lead_time_demand = daily_demand * lead_time_days
        
        # Safety stock (20% of average demand)
        safety_stock = self.product_stats[product_id]['mean'] * 0.2
        
        # Calculate reorder point
        reorder_point = lead_time_demand + safety_stock
        
        reorder_needed = current_stock <= reorder_point
        
        if reorder_needed:
            # Calculate economic order quantity (simplified)
            monthly_demand = demand_prediction['predicted_quantity']
            recommended_quantity = max(monthly_demand, lead_time_demand * 2)
        else:
            recommended_quantity = 0
        
        # Determine urgency
        if current_stock <= lead_time_demand:
            urgency = 'high'
        elif current_stock <= reorder_point:
            urgency = 'medium'
        else:
            urgency = 'low'
        
        return {
            'reorder_needed': reorder_needed,
            'recommended_quantity': round(recommended_quantity),
            'urgency': urgency,
            'current_stock': current_stock,
            'reorder_point': round(reorder_point),
            'predicted_demand': demand_prediction,
            'days_of_stock': round(current_stock / daily_demand) if daily_demand > 0 else 999
        }
    
    def analyze_product_performance(self, product_id: str) -> Dict:
        """
        Analyze product performance dan trends
        """
        if not self.is_trained or product_id not in self.product_stats:
            return {'error': 'Product data not available'}
        
        stats = self.product_stats[product_id]
        seasonal = self.seasonal_patterns.get(product_id, {})
        trend = self.trend_coefficients.get(product_id, 0)
        
        # Determine performance categories
        performance = 'average'
        if stats['mean'] > stats['std'] * 2:
            performance = 'high'
        elif stats['mean'] < stats['std']:
            performance = 'low'
        
        volatility = 'stable'
        if stats['std'] > stats['mean'] * 0.5:
            volatility = 'high'
        elif stats['std'] < stats['mean'] * 0.2:
            volatility = 'low'
        
        return {
            'performance': performance,
            'volatility': volatility,
            'trend_direction': 'up' if trend > 0 else 'down' if trend < 0 else 'stable',
            'seasonal_variance': max(seasonal.values()) - min(seasonal.values()) if seasonal else 0,
            'statistics': stats,
            'recommendations': self._generate_recommendations(stats, trend, seasonal)
        }
    
    def _generate_recommendations(self, stats: Dict, trend: float, seasonal: Dict) -> List[str]:
        """
        Generate recommendations berdasarkan analysis
        """
        recommendations = []
        
        if trend > 0:
            recommendations.append("Consider increasing stock levels due to positive trend")
        elif trend < 0:
            recommendations.append("Monitor for potential stock reduction due to negative trend")
        
        if seasonal:
            max_season = max(seasonal.values())
            if max_season > 1.5:
                recommendations.append("Prepare for seasonal peaks - consider bulk ordering")
        
        if stats['std'] > stats['mean'] * 0.5:
            recommendations.append("High volatility detected - implement safety stock strategy")
        
        return recommendations
