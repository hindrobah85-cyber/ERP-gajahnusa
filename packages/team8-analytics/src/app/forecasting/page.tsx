'use client';

import { TrendingUp, Calendar, Target, Activity } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const historicalData = [
  { month: 'Jan', actual: 45000, forecast: 43000 },
  { month: 'Feb', actual: 52000, forecast: 49000 },
  { month: 'Mar', actual: 48000, forecast: 51000 },
  { month: 'Apr', actual: 61000, forecast: 58000 },
  { month: 'May', actual: 55000, forecast: 60000 },
  { month: 'Jun', actual: 67000, forecast: 64000 },
];

const forecastData = [
  { month: 'Jul', forecast: 72000, lower: 68000, upper: 76000 },
  { month: 'Aug', forecast: 78000, lower: 73000, upper: 83000 },
  { month: 'Sep', forecast: 74000, lower: 69000, upper: 79000 },
  { month: 'Oct', forecast: 82000, lower: 76000, upper: 88000 },
  { month: 'Nov', forecast: 88000, lower: 82000, upper: 94000 },
  { month: 'Dec', forecast: 95000, lower: 88000, upper: 102000 },
];

const productForecast = [
  { product: 'Semen', currentDemand: 850, predictedDemand: 920, growth: 8 },
  { product: 'Bata', currentDemand: 320, predictedDemand: 380, growth: 19 },
  { product: 'Pasir', currentDemand: 1200, predictedDemand: 1280, growth: 7 },
  { product: 'Besi', currentDemand: 180, predictedDemand: 240, growth: 33 },
  { product: 'Cat', currentDemand: 450, predictedDemand: 510, growth: 13 },
];

export default function ForecastingPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Sales Forecasting & Prediction</h1>
        <p className="text-gray-600 mt-2">AI-powered demand forecasting and trend analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-10 h-10 text-blue-500" />
            <span className="text-green-600 text-sm font-semibold">+18%</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">Rp 82M</div>
          <div className="text-sm text-gray-600 mt-1">Predicted Revenue (Oct)</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-10 h-10 text-green-500" />
            <span className="text-green-600 text-sm font-semibold">+12%</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">94.2%</div>
          <div className="text-sm text-gray-600 mt-1">Forecast Accuracy</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-10 h-10 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">6 Months</div>
          <div className="text-sm text-gray-600 mt-1">Forecast Horizon</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-10 h-10 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">Rp 95M</div>
          <div className="text-sm text-gray-600 mt-1">Year-End Projection</div>
        </div>
      </div>

      {/* Historical vs Forecast Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Historical Performance vs Forecast</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={[...historicalData, ...forecastData]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#0ea5e9" strokeWidth={2} name="Actual Sales" />
            <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
            <Line type="monotone" dataKey="upper" stroke="#22c55e" strokeWidth={1} strokeDasharray="3 3" name="Upper Bound" />
            <Line type="monotone" dataKey="lower" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" name="Lower Bound" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Product Demand Forecast */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Demand Forecast (Next Month)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Current Demand</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Predicted Demand</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Growth %</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Trend</th>
              </tr>
            </thead>
            <tbody>
              {productForecast.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.product}</td>
                  <td className="text-right py-3 px-4">{item.currentDemand}</td>
                  <td className="text-right py-3 px-4 font-semibold">{item.predictedDemand}</td>
                  <td className="text-right py-3 px-4">
                    <span className={`font-semibold ${item.growth > 15 ? 'text-green-600' : 'text-blue-600'}`}>
                      +{item.growth}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center">
                      <TrendingUp className={`w-5 h-5 ${item.growth > 15 ? 'text-green-500' : 'text-blue-500'}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-3">📊 Key Insights</h4>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• Revenue expected to grow 18% in October</li>
            <li>• Besi (iron) shows highest growth potential (33%)</li>
            <li>• Year-end target: Rp 95M (on track)</li>
            <li>• Current forecast accuracy: 94.2%</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h4 className="font-semibold text-green-900 mb-3">💡 Recommendations</h4>
          <ul className="space-y-2 text-green-800 text-sm">
            <li>• Increase Besi inventory by 30% for next month</li>
            <li>• Focus marketing on Bata products (19% growth)</li>
            <li>• Prepare for Q4 peak season (Dec: Rp 95M)</li>
            <li>• Monitor Semen stock levels closely</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
