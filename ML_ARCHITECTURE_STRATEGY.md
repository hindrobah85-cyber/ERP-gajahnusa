# ML Architecture Strategy untuk ERP 7-Tim
## Hybrid ML: Centralized Hub + Domain-Specific Models

### 🧠 **ML HUB (Team ML - Tim ke-8)**

**Tech Stack:** Python + MLflow + Kubernetes + TensorFlow/PyTorch

```python
# ml-hub/core/model_registry.py
class ModelRegistry:
    """Central model registry untuk semua tim"""
    
    def __init__(self):
        self.mlflow_client = MlflowClient()
        self.model_store = ModelStore()
    
    def register_model(self, team_name, model_name, model_version, metadata):
        """Register model dari tim tertentu"""
        return self.mlflow_client.create_registered_model(
            name=f"{team_name}_{model_name}",
            tags={
                "team": team_name,
                "version": model_version,
                "created_by": metadata.get("created_by"),
                "model_type": metadata.get("model_type")
            }
        )
    
    def get_model_for_team(self, team_name, model_name):
        """Ambil model untuk tim tertentu"""
        return self.mlflow_client.get_registered_model(f"{team_name}_{model_name}")
    
    def deploy_model(self, team_name, model_name, environment="staging"):
        """Deploy model ke environment tertentu"""
        model_uri = f"models:/{team_name}_{model_name}/latest"
        return mlflow.deployments.deploy(
            name=f"{team_name}-{model_name}-{environment}",
            model_uri=model_uri,
            target_uri="kubernetes"
        )
```

**Services:**
- **Model Training Pipeline** (Port 9001)
- **Feature Store** (Port 9002)  
- **Model Serving** (Port 9003)
- **A/B Testing Engine** (Port 9004)
- **Data Quality Monitoring** (Port 9005)

---

### 🛒 **TEAM 1: SALES MOBILE ML**

```python
# packages/team1-sales-mobile/ml/recommendation_engine.py
class SalesRecommendationEngine:
    """ML untuk rekomendasi produk sales mobile"""
    
    def __init__(self):
        self.model_client = MLHubClient("team1")
        self.model = self.model_client.get_model("product_recommendation")
    
    def get_product_recommendations(self, customer_id, location, history):
        """Rekomendasi produk berdasarkan customer & lokasi"""
        features = self.prepare_features(customer_id, location, history)
        predictions = self.model.predict(features)
        return self.format_recommendations(predictions)
    
    def optimize_sales_route(self, sales_person_id, customer_list):
        """Optimasi rute sales berdasarkan ML"""
        route_model = self.model_client.get_model("route_optimization")
        optimized_route = route_model.predict({
            "salesperson": sales_person_id,
            "customers": customer_list,
            "constraints": self.get_constraints()
        })
        return optimized_route

# API Endpoints
@app.post("/api/ml/recommendations")
async def get_recommendations(request: RecommendationRequest):
    engine = SalesRecommendationEngine()
    recommendations = engine.get_product_recommendations(
        request.customer_id, 
        request.location, 
        request.history
    )
    return {"recommendations": recommendations}
```

**Tim 1 ML Features:**
- 🎯 Product recommendation berdasarkan customer history
- 🗺️ Route optimization untuk sales
- 📊 Sales performance prediction
- 📍 Location-based product suggestions

---

### 🚛 **TEAM 2: LOGISTICS ML**

```python
# packages/team2-logistics/ml/demand_forecasting.py
class DemandForecastingEngine:
    """ML untuk prediksi demand dan optimasi inventory"""
    
    def __init__(self):
        self.model_client = MLHubClient("team2")
        self.forecasting_model = self.model_client.get_model("demand_forecasting")
        self.optimization_model = self.model_client.get_model("inventory_optimization")
    
    def forecast_demand(self, product_id, warehouse_id, forecast_period):
        """Prediksi demand produk untuk periode tertentu"""
        features = self.prepare_demand_features(product_id, warehouse_id)
        forecast = self.forecasting_model.predict(features, periods=forecast_period)
        return {
            "product_id": product_id,
            "forecasted_demand": forecast,
            "confidence_interval": self.calculate_confidence(forecast)
        }
    
    def optimize_inventory_levels(self, warehouse_id):
        """Optimasi level inventory berdasarkan ML"""
        current_inventory = self.get_current_inventory(warehouse_id)
        demand_forecast = self.get_demand_forecast(warehouse_id)
        
        optimal_levels = self.optimization_model.predict({
            "current_inventory": current_inventory,
            "demand_forecast": demand_forecast,
            "lead_times": self.get_lead_times(),
            "costs": self.get_holding_costs()
        })
        
        return optimal_levels
    
    def predict_delivery_time(self, origin, destination, product_weight):
        """Prediksi waktu pengiriman berdasarkan ML"""
        delivery_model = self.model_client.get_model("delivery_prediction")
        prediction = delivery_model.predict({
            "origin": origin,
            "destination": destination,
            "weight": product_weight,
            "traffic_data": self.get_traffic_data(),
            "weather_data": self.get_weather_data()
        })
        return prediction

# API Endpoints  
@app.post("/api/ml/demand-forecast")
async def forecast_demand(request: DemandForecastRequest):
    engine = DemandForecastingEngine()
    forecast = engine.forecast_demand(
        request.product_id,
        request.warehouse_id, 
        request.forecast_period
    )
    return forecast

@app.post("/api/ml/optimize-inventory")
async def optimize_inventory(warehouse_id: str):
    engine = DemandForecastingEngine()
    optimization = engine.optimize_inventory_levels(warehouse_id)
    return {"optimization": optimization}
```

**Tim 2 ML Features:**
- 📈 Demand forecasting untuk inventory planning
- 📦 Inventory optimization dengan ML
- 🚚 Delivery time prediction
- 🛣️ Supply chain route optimization
- ⚠️ Anomaly detection untuk supply chain issues

---

### 💰 **TEAM 3: FINANCE ML**

```python
# packages/team3-finance/ml/fraud_detection.py
class FinanceFraudDetectionEngine:
    """ML untuk deteksi fraud dan analisis financial"""
    
    def __init__(self):
        self.model_client = MLHubClient("team3")
        self.fraud_model = self.model_client.get_model("fraud_detection")
        self.credit_model = self.model_client.get_model("credit_scoring")
        self.forecasting_model = self.model_client.get_model("cash_flow_forecast")
    
    def detect_transaction_fraud(self, transaction_data):
        """Deteksi fraud pada transaksi real-time"""
        features = self.prepare_fraud_features(transaction_data)
        fraud_score = self.fraud_model.predict_proba(features)[0][1]
        
        risk_level = "low"
        if fraud_score > 0.8:
            risk_level = "high"
        elif fraud_score > 0.5:
            risk_level = "medium"
            
        return {
            "transaction_id": transaction_data["id"],
            "fraud_score": fraud_score,
            "risk_level": risk_level,
            "recommendation": self.get_fraud_recommendation(risk_level)
        }
    
    def calculate_credit_score(self, customer_id):
        """Hitung credit score customer"""
        customer_data = self.get_customer_financial_data(customer_id)
        features = self.prepare_credit_features(customer_data)
        credit_score = self.credit_model.predict(features)[0]
        
        return {
            "customer_id": customer_id,
            "credit_score": credit_score,
            "credit_limit_recommendation": self.calculate_credit_limit(credit_score),
            "risk_category": self.categorize_risk(credit_score)
        }
    
    def forecast_cash_flow(self, company_id, forecast_months):
        """Prediksi cash flow perusahaan"""
        financial_data = self.get_financial_history(company_id)
        features = self.prepare_cashflow_features(financial_data)
        
        forecast = self.forecasting_model.predict(features, periods=forecast_months)
        
        return {
            "company_id": company_id,
            "forecast_period": forecast_months,
            "predicted_cash_flow": forecast,
            "confidence_interval": self.calculate_confidence(forecast),
            "recommendations": self.generate_financial_recommendations(forecast)
        }

# API Endpoints
@app.post("/api/ml/fraud-detection")
async def detect_fraud(transaction: TransactionData):
    engine = FinanceFraudDetectionEngine()
    fraud_analysis = engine.detect_transaction_fraud(transaction.dict())
    return fraud_analysis

@app.post("/api/ml/credit-scoring")  
async def calculate_credit(customer_id: str):
    engine = FinanceFraudDetectionEngine()
    credit_analysis = engine.calculate_credit_score(customer_id)
    return credit_analysis
```

**Tim 3 ML Features:**
- 🛡️ Real-time fraud detection
- 📊 Credit scoring & risk assessment
- 💹 Cash flow forecasting
- 📈 Financial trend analysis
- 🚨 Anomaly detection dalam transaksi

---

### 🌐 **TEAM 4: ONLINE SALES ML**

```python
# packages/team4-online-sales/ml/personalization_engine.py
class EcommercePersonalizationEngine:
    """ML untuk personalisasi e-commerce"""
    
    def __init__(self):
        self.model_client = MLHubClient("team4")
        self.recommendation_model = self.model_client.get_model("product_recommendation")
        self.pricing_model = self.model_client.get_model("dynamic_pricing")
        self.search_model = self.model_client.get_model("search_ranking")
    
    def get_personalized_products(self, user_id, session_data):
        """Rekomendasi produk personal untuk e-commerce"""
        user_profile = self.get_user_profile(user_id)
        browsing_history = self.get_browsing_history(user_id)
        
        features = self.prepare_recommendation_features(
            user_profile, browsing_history, session_data
        )
        
        recommendations = self.recommendation_model.predict(features)
        
        return {
            "user_id": user_id,
            "personalized_products": recommendations,
            "recommendation_reason": self.get_recommendation_reasons(recommendations),
            "confidence_scores": self.get_confidence_scores(recommendations)
        }
    
    def optimize_product_pricing(self, product_id, competitor_data, demand_data):
        """Dynamic pricing berdasarkan ML"""
        features = self.prepare_pricing_features(
            product_id, competitor_data, demand_data
        )
        
        optimal_price = self.pricing_model.predict(features)[0]
        
        return {
            "product_id": product_id,
            "current_price": self.get_current_price(product_id),
            "optimal_price": optimal_price,
            "price_change_percentage": self.calculate_price_change(product_id, optimal_price),
            "expected_demand_impact": self.predict_demand_impact(product_id, optimal_price)
        }
    
    def rank_search_results(self, query, user_id, products):
        """Ranking hasil search berdasarkan ML"""
        user_context = self.get_user_context(user_id)
        query_features = self.prepare_search_features(query, user_context)
        
        ranked_products = self.search_model.predict({
            "query_features": query_features,
            "products": products,
            "user_context": user_context
        })
        
        return {
            "query": query,
            "ranked_products": ranked_products,
            "personalization_applied": True,
            "search_insights": self.get_search_insights(query, ranked_products)
        }

# API Endpoints
@app.post("/api/ml/personalized-recommendations")
async def get_recommendations(request: PersonalizationRequest):
    engine = EcommercePersonalizationEngine()
    recommendations = engine.get_personalized_products(
        request.user_id, 
        request.session_data
    )
    return recommendations

@app.post("/api/ml/dynamic-pricing")
async def optimize_pricing(request: PricingRequest):
    engine = EcommercePersonalizationEngine()
    pricing = engine.optimize_product_pricing(
        request.product_id,
        request.competitor_data,
        request.demand_data
    )
    return pricing
```

**Tim 4 ML Features:**
- 🎯 Product personalization & recommendations
- 💲 Dynamic pricing optimization
- 🔍 Intelligent search ranking
- 📊 Customer behavior analysis
- 🛒 Shopping cart abandonment prediction

---

### 👥 **TEAM 6: CRM ML**

```python
# packages/team6-crm/ml/crm_intelligence.py
class CRMIntelligenceEngine:
    """ML untuk CRM analytics dan predictions"""
    
    def __init__(self):
        self.model_client = MLHubClient("team6")
        self.lead_scoring_model = self.model_client.get_model("lead_scoring")
        self.churn_model = self.model_client.get_model("churn_prediction")
        self.sentiment_model = self.model_client.get_model("sentiment_analysis")
        self.ltv_model = self.model_client.get_model("customer_ltv")
    
    def score_lead_quality(self, lead_data):
        """Score kualitas lead berdasarkan ML"""
        features = self.prepare_lead_features(lead_data)
        lead_score = self.lead_scoring_model.predict_proba(features)[0][1]
        
        priority = "low"
        if lead_score > 0.8:
            priority = "high"
        elif lead_score > 0.5:
            priority = "medium"
            
        return {
            "lead_id": lead_data["id"],
            "lead_score": lead_score,
            "priority": priority,
            "conversion_probability": lead_score,
            "recommended_actions": self.get_lead_recommendations(lead_score, lead_data)
        }
    
    def predict_customer_churn(self, customer_id):
        """Prediksi kemungkinan customer churn"""
        customer_data = self.get_customer_engagement_data(customer_id)
        features = self.prepare_churn_features(customer_data)
        
        churn_probability = self.churn_model.predict_proba(features)[0][1]
        
        return {
            "customer_id": customer_id,
            "churn_probability": churn_probability,
            "risk_level": self.categorize_churn_risk(churn_probability),
            "key_risk_factors": self.identify_risk_factors(features, customer_data),
            "retention_recommendations": self.get_retention_strategies(churn_probability)
        }
    
    def analyze_customer_sentiment(self, customer_feedback):
        """Analisis sentiment dari feedback customer"""
        sentiment_scores = []
        
        for feedback in customer_feedback:
            sentiment = self.sentiment_model.predict([feedback["text"]])[0]
            sentiment_scores.append({
                "feedback_id": feedback["id"],
                "text": feedback["text"][:100] + "...",  # Preview
                "sentiment": sentiment,
                "confidence": self.sentiment_model.predict_proba([feedback["text"]])[0].max()
            })
        
        overall_sentiment = self.calculate_overall_sentiment(sentiment_scores)
        
        return {
            "individual_sentiments": sentiment_scores,
            "overall_sentiment": overall_sentiment,
            "sentiment_trend": self.analyze_sentiment_trend(customer_feedback),
            "action_recommendations": self.get_sentiment_recommendations(overall_sentiment)
        }
    
    def calculate_customer_ltv(self, customer_id):
        """Hitung Customer Lifetime Value"""
        customer_data = self.get_customer_transaction_history(customer_id)
        features = self.prepare_ltv_features(customer_data)
        
        predicted_ltv = self.ltv_model.predict(features)[0]
        
        return {
            "customer_id": customer_id,
            "predicted_ltv": predicted_ltv,
            "ltv_category": self.categorize_ltv(predicted_ltv),
            "investment_recommendation": self.get_investment_recommendation(predicted_ltv),
            "factors_influencing_ltv": self.get_ltv_factors(features)
        }

# API Endpoints
@app.post("/api/ml/lead-scoring")
async def score_lead(lead: LeadData):
    engine = CRMIntelligenceEngine()
    score = engine.score_lead_quality(lead.dict())
    return score

@app.post("/api/ml/churn-prediction")
async def predict_churn(customer_id: str):
    engine = CRMIntelligenceEngine()
    churn_analysis = engine.predict_customer_churn(customer_id)
    return churn_analysis

@app.post("/api/ml/sentiment-analysis")
async def analyze_sentiment(feedback_data: List[FeedbackData]):
    engine = CRMIntelligenceEngine()
    sentiment_analysis = engine.analyze_customer_sentiment([f.dict() for f in feedback_data])
    return sentiment_analysis
```

**Tim 6 ML Features:**
- 🎯 Lead scoring & qualification
- ⚠️ Customer churn prediction
- 😊 Sentiment analysis dari feedback
- 💎 Customer Lifetime Value prediction
- 📈 Customer segmentation otomatis

---

## 🏗️ **ML INFRASTRUCTURE SETUP**

### **Central ML Hub Configuration**

```yaml
# ml-hub/docker-compose.yml
version: '3.8'
services:
  mlflow-server:
    image: mlflow/mlflow:latest
    ports: ["9001:5000"]
    environment:
      - MLFLOW_BACKEND_STORE_URI=postgresql://mlflow:password@postgres:5432/mlflow
      - MLFLOW_DEFAULT_ARTIFACT_ROOT=s3://mlflow-artifacts
    depends_on: [postgres, minio]
    
  feature-store:
    image: feast-dev/feature-store:latest
    ports: ["9002:6566"]
    environment:
      - FEAST_CORE_URL=jdbc:postgresql://postgres:5432/feast
    
  model-serving:
    image: tensorflow/serving:latest
    ports: ["9003:8501"]
    volumes: ["./models:/models"]
    environment:
      - MODEL_NAME=multi_tenant_serving
    
  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=mlflow
      - POSTGRES_USER=mlflow
      - POSTGRES_PASSWORD=password
    volumes: ["postgres_data:/var/lib/postgresql/data"]
      
  minio:
    image: minio/minio:latest
    ports: ["9004:9000", "9005:9001"]
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes: ["minio_data:/data"]

volumes:
  postgres_data:
  minio_data:
```

### **Shared ML Library**

```python
# shared/ml-common/ml_client.py
class MLHubClient:
    """Client untuk mengakses ML Hub dari setiap tim"""
    
    def __init__(self, team_name):
        self.team_name = team_name
        self.mlflow_client = MlflowClient("http://mlhub:9001")
        self.feature_store = FeatureStore("http://mlhub:9002")
    
    def get_model(self, model_name):
        """Ambil model dari registry"""
        model_uri = f"models:/{self.team_name}_{model_name}/latest"
        return mlflow.pyfunc.load_model(model_uri)
    
    def log_prediction(self, model_name, input_data, prediction, metadata=None):
        """Log prediction untuk monitoring"""
        with mlflow.start_run():
            mlflow.log_param("team", self.team_name)
            mlflow.log_param("model", model_name)
            mlflow.log_dict(input_data, "input.json")
            mlflow.log_dict({"prediction": prediction}, "output.json")
            if metadata:
                mlflow.log_dict(metadata, "metadata.json")
    
    def get_features(self, feature_set_name, entity_ids):
        """Ambil features dari feature store"""
        return self.feature_store.get_online_features(
            features=[f"{self.team_name}:{feature_set_name}"],
            entity_rows=[{"entity_id": eid} for eid in entity_ids]
        )
```

---

## 📊 **ML DEPLOYMENT STRATEGY**

### **1. Model Versioning & Registry**
```python
# Setiap tim register model mereka
mlflow.register_model(
    model_uri="runs:/abc123/model",
    name="team1_product_recommendation",
    tags={"team": "team1", "version": "v1.0", "stage": "production"}
)
```

### **2. A/B Testing Framework** 
```python
# A/B testing untuk ML models
@app.post("/api/ml/ab-test")
async def ab_test_prediction(request: PredictionRequest):
    if ab_test_manager.should_use_model_b(request.user_id):
        model = ml_client.get_model("recommendation_v2")
    else:
        model = ml_client.get_model("recommendation_v1")
    
    prediction = model.predict(request.features)
    ab_test_manager.log_prediction(request.user_id, model.version, prediction)
    return prediction
```

### **3. Model Monitoring**
```python
# Monitoring model performance per tim
@app.middleware("http")
async def monitor_ml_predictions(request: Request, call_next):
    if "/api/ml/" in str(request.url):
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Log metrics
        ml_metrics.log_prediction_latency(duration)
        ml_metrics.log_model_usage(request.headers.get("team"))
        
        return response
    return await call_next(request)
```

---

## ✅ **ML IMPLEMENTATION CHECKLIST**

### **Phase 1: ML Infrastructure (Week 1-2)**
- [ ] Setup ML Hub dengan MLflow + Feature Store
- [ ] Deploy model serving infrastructure  
- [ ] Setup monitoring & logging
- [ ] Create shared ML libraries

### **Phase 2: Domain Models (Week 3-6)**  
- [ ] Tim 1: Sales recommendation engine
- [ ] Tim 2: Demand forecasting system
- [ ] Tim 3: Fraud detection system
- [ ] Tim 4: Personalization engine
- [ ] Tim 6: CRM intelligence system

### **Phase 3: Integration & Optimization (Week 7-8)**
- [ ] Cross-team model integration
- [ ] A/B testing implementation
- [ ] Performance optimization
- [ ] Production monitoring setup

---

## 🎯 **REKOMENDASI AKHIR**

**BEST APPROACH**: **Hybrid ML Architecture** dengan:

1. **Central ML Hub** (Tim ML/Data Science) untuk infrastructure
2. **Domain-specific models** per tim sesuai kebutuhan bisnis
3. **Shared libraries** untuk common ML operations
4. **Standardized APIs** untuk konsistensi across teams

**Keuntungan:**
- ✅ Expertise terfokus per domain
- ✅ Shared infrastructure & best practices  
- ✅ Independent development per tim
- ✅ Consistent ML operations
- ✅ Easy model sharing & reuse

Apakah Anda setuju dengan strategi ML ini? Atau ada aspek tertentu yang ingin dimodifikasi?