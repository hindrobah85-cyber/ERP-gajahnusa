"""
Route Optimization Model
Algoritma untuk optimasi rute sales visit
"""

import numpy as np
from typing import Dict, List, Tuple, Any
from datetime import datetime, timedelta
import logging
import math

logger = logging.getLogger(__name__)

class RouteOptimizer:
    """
    Route optimization menggunakan heuristic algorithms
    """
    
    def __init__(self):
        self.distance_matrix = {}
        self.customer_locations = {}
        self.optimization_params = {
            'max_distance_per_day': 200,  # km
            'max_visits_per_day': 8,
            'working_hours': 8,
            'travel_speed': 40,  # km/h
            'visit_duration': 45  # minutes
        }
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate haversine distance between two points
        """
        R = 6371  # Earth's radius in kilometers
        
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def build_distance_matrix(self, locations: List[Dict]) -> Dict:
        """
        Build distance matrix untuk semua locations
        """
        matrix = {}
        
        for i, loc1 in enumerate(locations):
            matrix[loc1['id']] = {}
            for j, loc2 in enumerate(locations):
                if i == j:
                    matrix[loc1['id']][loc2['id']] = 0
                else:
                    distance = self.calculate_distance(
                        loc1['latitude'], loc1['longitude'],
                        loc2['latitude'], loc2['longitude']
                    )
                    matrix[loc1['id']][loc2['id']] = distance
        
        return matrix
    
    def nearest_neighbor_tsp(self, start_location: str, locations: List[str], distance_matrix: Dict) -> List[str]:
        """
        Solve TSP menggunakan nearest neighbor heuristic
        """
        if not locations:
            return []
        
        if start_location not in distance_matrix:
            return locations
        
        unvisited = set(locations)
        route = [start_location]
        current = start_location
        
        while unvisited:
            nearest = min(
                unvisited,
                key=lambda x: distance_matrix.get(current, {}).get(x, float('inf'))
            )
            route.append(nearest)
            unvisited.remove(nearest)
            current = nearest
        
        return route[1:]  # Remove start location
    
    def optimize_single_day_route(self, salesman_location: Dict, customers: List[Dict]) -> Dict:
        """
        Optimize route untuk single day
        """
        if not customers:
            return {
                'route': [],
                'total_distance': 0,
                'total_time': 0,
                'feasible': True
            }
        
        # Build locations list
        locations = [salesman_location] + customers
        customer_ids = [c['id'] for c in customers]
        
        # Build distance matrix
        distance_matrix = self.build_distance_matrix(locations)
        
        # Find optimal route using nearest neighbor
        route_ids = self.nearest_neighbor_tsp(
            salesman_location['id'], 
            customer_ids, 
            distance_matrix
        )
        
        # Calculate total distance and time
        total_distance = 0
        total_travel_time = 0
        current_id = salesman_location['id']
        
        for customer_id in route_ids:
            distance = distance_matrix[current_id][customer_id]
            total_distance += distance
            travel_time = (distance / self.optimization_params['travel_speed']) * 60  # minutes
            total_travel_time += travel_time
            current_id = customer_id
        
        # Add return trip
        return_distance = distance_matrix[current_id][salesman_location['id']]
        total_distance += return_distance
        total_travel_time += (return_distance / self.optimization_params['travel_speed']) * 60
        
        # Calculate total time including visits
        visit_time = len(route_ids) * self.optimization_params['visit_duration']
        total_time = total_travel_time + visit_time
        
        # Check feasibility
        feasible = (
            total_distance <= self.optimization_params['max_distance_per_day'] and
            len(route_ids) <= self.optimization_params['max_visits_per_day'] and
            total_time <= self.optimization_params['working_hours'] * 60
        )
        
        # Build detailed route
        detailed_route = []
        current_time = datetime.now().replace(hour=8, minute=0, second=0, microsecond=0)
        current_location = salesman_location
        
        for customer_id in route_ids:
            customer = next(c for c in customers if c['id'] == customer_id)
            
            # Calculate travel time to this customer
            distance = distance_matrix[current_location['id']][customer_id]
            travel_time = (distance / self.optimization_params['travel_speed']) * 60
            
            # Update current time
            current_time += timedelta(minutes=travel_time)
            
            detailed_route.append({
                'customer_id': customer_id,
                'customer_name': customer.get('name', ''),
                'arrival_time': current_time.strftime('%H:%M'),
                'departure_time': (current_time + timedelta(minutes=self.optimization_params['visit_duration'])).strftime('%H:%M'),
                'distance_from_previous': round(distance, 2),
                'travel_time_minutes': round(travel_time),
                'location': {
                    'latitude': customer['latitude'],
                    'longitude': customer['longitude']
                }
            })
            
            current_time += timedelta(minutes=self.optimization_params['visit_duration'])
            current_location = customer
        
        return {
            'route': detailed_route,
            'total_distance': round(total_distance, 2),
            'total_time': round(total_time),
            'total_travel_time': round(total_travel_time),
            'total_visit_time': visit_time,
            'feasible': feasible,
            'efficiency_score': self._calculate_efficiency_score(total_distance, total_time, len(route_ids))
        }
    
    def optimize_multi_day_route(self, salesman_location: Dict, customers: List[Dict], days: int = 5) -> Dict:
        """
        Optimize route untuk multiple days
        """
        if not customers:
            return {'daily_routes': [], 'total_customers': 0}
        
        # Sort customers by priority (if available)
        sorted_customers = sorted(
            customers,
            key=lambda x: x.get('priority', 1),
            reverse=True
        )
        
        daily_routes = []
        remaining_customers = sorted_customers.copy()
        
        for day in range(days):
            if not remaining_customers:
                break
            
            # Select customers for this day using greedy approach
            day_customers = self._select_customers_for_day(
                salesman_location,
                remaining_customers
            )
            
            if not day_customers:
                break
            
            # Optimize route for this day
            day_route = self.optimize_single_day_route(salesman_location, day_customers)
            
            daily_routes.append({
                'day': day + 1,
                'date': (datetime.now() + timedelta(days=day)).strftime('%Y-%m-%d'),
                'route': day_route
            })
            
            # Remove visited customers
            visited_ids = {c['customer_id'] for c in day_route['route']}
            remaining_customers = [c for c in remaining_customers if c['id'] not in visited_ids]
        
        return {
            'daily_routes': daily_routes,
            'total_customers': len(customers),
            'customers_scheduled': len(customers) - len(remaining_customers),
            'unscheduled_customers': len(remaining_customers)
        }
    
    def _select_customers_for_day(self, salesman_location: Dict, customers: List[Dict]) -> List[Dict]:
        """
        Select optimal customers untuk single day
        """
        if not customers:
            return []
        
        selected = []
        remaining = customers.copy()
        current_location = salesman_location
        total_distance = 0
        total_time = 0
        
        while remaining and len(selected) < self.optimization_params['max_visits_per_day']:
            # Find nearest customer that fits constraints
            best_customer = None
            best_distance = float('inf')
            
            for customer in remaining:
                distance = self.calculate_distance(
                    current_location['latitude'], current_location['longitude'],
                    customer['latitude'], customer['longitude']
                )
                
                # Calculate time for this addition
                travel_time = (distance / self.optimization_params['travel_speed']) * 60
                additional_time = travel_time + self.optimization_params['visit_duration']
                
                # Check if this customer fits
                if (total_distance + distance <= self.optimization_params['max_distance_per_day'] and
                    total_time + additional_time <= self.optimization_params['working_hours'] * 60 and
                    distance < best_distance):
                    
                    best_customer = customer
                    best_distance = distance
            
            if best_customer is None:
                break
            
            # Add customer to selection
            selected.append(best_customer)
            remaining.remove(best_customer)
            current_location = best_customer
            total_distance += best_distance
            total_time += (best_distance / self.optimization_params['travel_speed']) * 60 + self.optimization_params['visit_duration']
        
        return selected
    
    def _calculate_efficiency_score(self, total_distance: float, total_time: float, num_visits: int) -> float:
        """
        Calculate efficiency score untuk route
        """
        if num_visits == 0:
            return 0.0
        
        # Distance efficiency (lower is better)
        distance_efficiency = 1 - min(total_distance / self.optimization_params['max_distance_per_day'], 1.0)
        
        # Time efficiency (lower is better)
        time_efficiency = 1 - min(total_time / (self.optimization_params['working_hours'] * 60), 1.0)
        
        # Visit density (higher is better)
        visit_density = num_visits / self.optimization_params['max_visits_per_day']
        
        # Combined score
        efficiency_score = (distance_efficiency * 0.3 + time_efficiency * 0.3 + visit_density * 0.4)
        
        return round(efficiency_score, 3)
    
    def suggest_optimal_visit_sequence(self, salesman_id: str, pending_customers: List[Dict]) -> Dict:
        """
        Suggest optimal visit sequence berdasarkan berbagai factors
        """
        if not pending_customers:
            return {'suggestions': [], 'reasoning': 'No pending customers'}
        
        # Score each customer based on multiple factors
        scored_customers = []
        
        for customer in pending_customers:
            score = 0
            factors = []
            
            # Priority factor
            priority = customer.get('priority', 1)
            score += priority * 20
            if priority > 2:
                factors.append('high_priority')
            
            # Last visit factor
            last_visit = customer.get('last_visit_date')
            if last_visit:
                days_since_visit = (datetime.now() - datetime.fromisoformat(last_visit)).days
                if days_since_visit > 30:
                    score += 15
                    factors.append('overdue_visit')
                elif days_since_visit > 14:
                    score += 10
                    factors.append('due_visit')
            else:
                score += 25
                factors.append('never_visited')
            
            # Credit limit utilization
            credit_used = customer.get('credit_used', 0)
            credit_limit = customer.get('credit_limit', 1)
            utilization = credit_used / credit_limit if credit_limit > 0 else 0
            
            if utilization > 0.8:
                score += 15
                factors.append('high_credit_usage')
            elif utilization > 0.5:
                score += 10
                factors.append('medium_credit_usage')
            
            # Payment history
            payment_score = customer.get('payment_score', 0.5)
            if payment_score < 0.3:
                score += 20
                factors.append('payment_issues')
            
            # Order potential
            avg_order_value = customer.get('avg_order_value', 0)
            if avg_order_value > 1000000:  # 1M IDR
                score += 15
                factors.append('high_value_potential')
            
            scored_customers.append({
                'customer': customer,
                'score': score,
                'factors': factors
            })
        
        # Sort by score (highest first)
        scored_customers.sort(key=lambda x: x['score'], reverse=True)
        
        # Generate suggestions
        suggestions = []
        for i, item in enumerate(scored_customers[:10]):  # Top 10
            suggestions.append({
                'rank': i + 1,
                'customer_id': item['customer']['id'],
                'customer_name': item['customer'].get('name', ''),
                'score': item['score'],
                'factors': item['factors'],
                'recommended_action': self._get_recommended_action(item['factors'])
            })
        
        return {
            'suggestions': suggestions,
            'total_customers': len(pending_customers),
            'reasoning': 'Ranked by priority, visit frequency, credit usage, and payment history'
        }
    
    def _get_recommended_action(self, factors: List[str]) -> str:
        """
        Get recommended action berdasarkan factors
        """
        if 'payment_issues' in factors:
            return 'Collect payment and discuss credit terms'
        elif 'high_credit_usage' in factors:
            return 'Collect payment before new orders'
        elif 'overdue_visit' in factors:
            return 'Priority visit - check customer status'
        elif 'never_visited' in factors:
            return 'Introduction visit and relationship building'
        elif 'high_value_potential' in factors:
            return 'Sales opportunity - present new products'
        else:
            return 'Regular visit and order taking'
    
    def analyze_route_performance(self, completed_routes: List[Dict]) -> Dict:
        """
        Analyze performance dari completed routes
        """
        if not completed_routes:
            return {'error': 'No route data available'}
        
        total_routes = len(completed_routes)
        total_distance = sum(route.get('total_distance', 0) for route in completed_routes)
        total_customers = sum(len(route.get('route', [])) for route in completed_routes)
        total_time = sum(route.get('total_time', 0) for route in completed_routes)
        
        avg_distance_per_route = total_distance / total_routes
        avg_customers_per_route = total_customers / total_routes
        avg_time_per_route = total_time / total_routes
        
        efficiency_scores = [route.get('efficiency_score', 0) for route in completed_routes]
        avg_efficiency = np.mean(efficiency_scores) if efficiency_scores else 0
        
        return {
            'summary': {
                'total_routes': total_routes,
                'total_distance': round(total_distance, 2),
                'total_customers_visited': total_customers,
                'total_time_hours': round(total_time / 60, 2)
            },
            'averages': {
                'distance_per_route': round(avg_distance_per_route, 2),
                'customers_per_route': round(avg_customers_per_route, 1),
                'time_per_route': round(avg_time_per_route / 60, 2),
                'efficiency_score': round(avg_efficiency, 3)
            },
            'recommendations': self._generate_route_recommendations(avg_efficiency, avg_customers_per_route, avg_distance_per_route)
        }
    
    def _generate_route_recommendations(self, efficiency: float, customers_per_route: float, distance_per_route: float) -> List[str]:
        """
        Generate recommendations untuk route improvement
        """
        recommendations = []
        
        if efficiency < 0.5:
            recommendations.append("Consider grouping customers by geographical proximity")
        
        if customers_per_route < 5:
            recommendations.append("Try to visit more customers per route to improve efficiency")
        
        if distance_per_route > self.optimization_params['max_distance_per_day'] * 0.8:
            recommendations.append("Routes approaching distance limit - consider area redistribution")
        
        if customers_per_route > 7:
            recommendations.append("High customer density - consider splitting into multiple days")
        
        return recommendations
