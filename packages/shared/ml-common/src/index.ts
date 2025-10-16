// Shared ML Utilities for ERP System

export interface MLPredictionInput {
  modelName: string;
  teamName: string;
  inputData: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface MLPredictionOutput {
  prediction: any;
  confidence?: number;
  modelVersion: string;
  timestamp: Date;
  executionTime?: number;
}

export interface MLModelInfo {
  name: string;
  version: string;
  team: string;
  type: 'classification' | 'regression' | 'clustering' | 'recommendation' | 'forecasting';
  status: 'training' | 'testing' | 'deployed' | 'deprecated';
  accuracy?: number;
  lastTrained: Date;
  deployedAt?: Date;
}

// Feature Engineering Utilities
export class FeatureEngineering {
  // Normalize numerical features
  static normalize(values: number[]): number[] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    if (range === 0) return values.map(() => 0);
    
    return values.map(val => (val - min) / range);
  }

  // Standardize features (z-score normalization)
  static standardize(values: number[]): number[] {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return values.map(() => 0);
    
    return values.map(val => (val - mean) / stdDev);
  }

  // One-hot encoding for categorical variables
  static oneHotEncode(categories: string[], allCategories: string[]): number[] {
    return allCategories.map(cat => categories.includes(cat) ? 1 : 0);
  }

  // Create time-based features
  static extractTimeFeatures(date: Date): Record<string, number> {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      dayOfWeek: date.getDay(),
      dayOfMonth: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6 ? 1 : 0,
      quarter: Math.floor(date.getMonth() / 3) + 1
    };
  }

  // Calculate moving averages
  static movingAverage(values: number[], windowSize: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = values.slice(start, i + 1);
      const average = window.reduce((sum, val) => sum + val, 0) / window.length;
      result.push(average);
    }
    
    return result;
  }

  // Calculate lag features
  static createLagFeatures(values: number[], lags: number[]): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    
    lags.forEach(lag => {
      result[`lag_${lag}`] = [
        ...Array(lag).fill(null),
        ...values.slice(0, -lag)
      ];
    });
    
    return result;
  }
}

// Data Preprocessing Utilities
export class DataPreprocessing {
  // Handle missing values
  static fillMissing(data: (number | null)[], strategy: 'mean' | 'median' | 'mode' | 'forward' | 'backward' = 'mean'): number[] {
    const validData = data.filter(val => val !== null && !isNaN(val)) as number[];
    
    let fillValue: number;
    
    switch (strategy) {
      case 'mean':
        fillValue = validData.reduce((sum, val) => sum + val, 0) / validData.length;
        break;
      case 'median':
        const sorted = [...validData].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        fillValue = sorted.length % 2 === 0 
          ? (sorted[mid - 1] + sorted[mid]) / 2 
          : sorted[mid];
        break;
      case 'mode':
        const counts: Record<number, number> = {};
        validData.forEach(val => counts[val] = (counts[val] || 0) + 1);
        fillValue = Number(Object.keys(counts).reduce((a, b) => counts[Number(a)] > counts[Number(b)] ? a : b));
        break;
      default:
        fillValue = validData[0] || 0;
    }
    
    return data.map(val => val !== null && !isNaN(val) ? val : fillValue);
  }

  // Remove outliers using IQR method
  static removeOutliers(data: number[], multiplier: number = 1.5): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - (multiplier * iqr);
    const upperBound = q3 + (multiplier * iqr);
    
    return data.filter(val => val >= lowerBound && val <= upperBound);
  }

  // Split data into train/test sets
  static trainTestSplit<T>(data: T[], testSize: number = 0.2, shuffle: boolean = true): {
    trainX: T[];
    testX: T[];
  } {
    const indices = Array.from({ length: data.length }, (_, i) => i);
    
    if (shuffle) {
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
    }
    
    const splitIndex = Math.floor(data.length * (1 - testSize));
    const trainIndices = indices.slice(0, splitIndex);
    const testIndices = indices.slice(splitIndex);
    
    return {
      trainX: trainIndices.map(i => data[i]),
      testX: testIndices.map(i => data[i])
    };
  }
}

// Model Evaluation Utilities
export class ModelEvaluation {
  // Calculate Mean Absolute Error
  static mae(actual: number[], predicted: number[]): number {
    if (actual.length !== predicted.length) {
      throw new Error('Arrays must have the same length');
    }
    
    const sum = actual.reduce((acc, val, i) => acc + Math.abs(val - predicted[i]), 0);
    return sum / actual.length;
  }

  // Calculate Mean Squared Error
  static mse(actual: number[], predicted: number[]): number {
    if (actual.length !== predicted.length) {
      throw new Error('Arrays must have the same length');
    }
    
    const sum = actual.reduce((acc, val, i) => acc + Math.pow(val - predicted[i], 2), 0);
    return sum / actual.length;
  }

  // Calculate Root Mean Squared Error
  static rmse(actual: number[], predicted: number[]): number {
    return Math.sqrt(this.mse(actual, predicted));
  }

  // Calculate R-squared
  static r2Score(actual: number[], predicted: number[]): number {
    const actualMean = actual.reduce((sum, val) => sum + val, 0) / actual.length;
    
    const totalSumSquares = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
    const residualSumSquares = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    
    return 1 - (residualSumSquares / totalSumSquares);
  }

  // Calculate accuracy for classification
  static accuracy(actual: string[], predicted: string[]): number {
    if (actual.length !== predicted.length) {
      throw new Error('Arrays must have the same length');
    }
    
    const correct = actual.filter((val, i) => val === predicted[i]).length;
    return correct / actual.length;
  }

  // Calculate confusion matrix
  static confusionMatrix(actual: string[], predicted: string[]): Record<string, Record<string, number>> {
    const matrix: Record<string, Record<string, number>> = {};
    const classes = Array.from(new Set([...actual, ...predicted]));
    
    // Initialize matrix
    classes.forEach(actualClass => {
      matrix[actualClass] = {};
      classes.forEach(predictedClass => {
        matrix[actualClass][predictedClass] = 0;
      });
    });
    
    // Fill matrix
    actual.forEach((actualClass, i) => {
      const predictedClass = predicted[i];
      matrix[actualClass][predictedClass]++;
    });
    
    return matrix;
  }
}

// ML Client for team-specific models
export class TeamMLClient {
  private teamName: string;
  private baseUrl: string;

  constructor(teamName: string, baseUrl: string = 'http://localhost:9000') {
    this.teamName = teamName;
    this.baseUrl = baseUrl;
  }

  async predict(modelName: string, inputData: Record<string, any>): Promise<MLPredictionOutput> {
    try {
      // This would typically make an HTTP request to ML Hub
      // For now, returning a mock response
      return {
        prediction: this.mockPredict(modelName, inputData),
        confidence: Math.random(),
        modelVersion: '1.0.0',
        timestamp: new Date(),
        executionTime: Math.random() * 100
      };
    } catch (error) {
      throw new Error(`ML prediction failed: ${error}`);
    }
  }

  private mockPredict(modelName: string, inputData: Record<string, any>): any {
    // Mock predictions based on model type
    switch (modelName) {
      case 'product_recommendation':
        return {
          recommendedProducts: ['PROD-001', 'PROD-002', 'PROD-003'],
          scores: [0.95, 0.87, 0.73]
        };
      case 'demand_forecasting':
        return {
          forecastedDemand: 150,
          confidenceInterval: [120, 180]
        };
      case 'fraud_detection':
        return {
          isFraud: Math.random() > 0.9,
          riskScore: Math.random()
        };
      case 'lead_scoring':
        return {
          score: Math.random(),
          priority: Math.random() > 0.7 ? 'high' : 'medium'
        };
      default:
        return { result: Math.random() };
    }
  }
}

// Utility functions for common ML operations
export class MLUtils {
  // Generate synthetic data for testing
  static generateSyntheticData(numSamples: number, numFeatures: number): number[][] {
    const data: number[][] = [];
    
    for (let i = 0; i < numSamples; i++) {
      const sample: number[] = [];
      for (let j = 0; j < numFeatures; j++) {
        sample.push(Math.random());
      }
      data.push(sample);
    }
    
    return data;
  }

  // Simple similarity calculation (cosine similarity)
  static cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length');
    }
    
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Calculate correlation coefficient
  static correlationCoefficient(x: number[], y: number[]): number {
    if (x.length !== y.length) {
      throw new Error('Arrays must have the same length');
    }
    
    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    const numerator = x.reduce((sum, val, i) => sum + (val - meanX) * (y[i] - meanY), 0);
    const denomX = Math.sqrt(x.reduce((sum, val) => sum + Math.pow(val - meanX, 2), 0));
    const denomY = Math.sqrt(y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0));
    
    return numerator / (denomX * denomY);
  }
}