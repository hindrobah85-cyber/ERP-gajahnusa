import React, { useState } from 'react'
import { ChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useStoreStore } from '../store/storeStore'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Reports: React.FC = () => {
  const { currentStore, stores } = useStoreStore()
  const store = stores.find(s => s.id === currentStore)
  
  const [reportType, setReportType] = useState('sales')
  const [period, setPeriod] = useState('monthly')

  const monthlySalesData = [
    { month: 'Jan', sales: 125000000, target: 120000000 },
    { month: 'Feb', sales: 142000000, target: 130000000 },
    { month: 'Mar', sales: 158000000, target: 140000000 },
    { month: 'Apr', sales: 171000000, target: 150000000 },
    { month: 'May', sales: 189000000, target: 160000000 },
    { month: 'Jun', sales: 195000000, target: 170000000 }
  ]

  const categoryBreakdown = [
    { name: 'Cement', value: 35, amount: 875000000, color: '#3B82F6' },
    { name: 'Bricks', value: 25, amount: 625000000, color: '#8B5CF6' },
    { name: 'Steel', value: 20, amount: 500000000, color: '#10B981' },
    { name: 'Tiles', value: 12, amount: 300000000, color: '#F59E0B' },
    { name: 'Others', value: 8, amount: 200000000, color: '#EF4444' }
  ]

  const topCustomers = [
    { name: 'PT Konstruksi Jaya', purchases: 45, revenue: 125000000 },
    { name: 'CV Bangun Sejahtera', purchases: 38, revenue: 98000000 },
    { name: 'PT Mega Proyek', purchases: 32, revenue: 87000000 },
    { name: 'Walk-in Customers', purchases: 456, revenue: 245000000 }
  ]

  const inventoryTurnover = [
    { product: 'Semen Gajah', turnover: 12.5, stock: 120, avgSold: 150 },
    { product: 'Bata Merah', turnover: 8.3, stock: 5000, avgSold: 4200 },
    { product: 'Besi Beton', turnover: 6.8, stock: 45, avgSold: 35 }
  ]

  const exportReport = () => {
    alert('Exporting report to PDF...')
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Reports & Analytics</h1>
        <p className="text-gray-600">{store?.name}</p>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block font-semibold mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
            >
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="financial">Financial Report</option>
              <option value="customer">Customer Report</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block font-semibold mb-2">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition whitespace-nowrap"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-sm opacity-80 mb-2">Total Sales (6 months)</div>
          <div className="text-3xl font-bold">Rp 980M</div>
          <div className="text-sm mt-2 opacity-90">+18.5% from last period</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-sm opacity-80 mb-2">Gross Profit</div>
          <div className="text-3xl font-bold">Rp 245M</div>
          <div className="text-sm mt-2 opacity-90">25% margin</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-sm opacity-80 mb-2">Total Transactions</div>
          <div className="text-3xl font-bold">2,847</div>
          <div className="text-sm mt-2 opacity-90">474 per month avg</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-sm opacity-80 mb-2">Avg Transaction</div>
          <div className="text-3xl font-bold">Rp 344K</div>
          <div className="text-sm mt-2 opacity-90">+8.2% increase</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📈 Monthly Sales Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `Rp ${(value / 1000000).toFixed(0)}M`} />
              <Legend />
              <Bar dataKey="sales" fill="#3B82F6" name="Actual Sales" />
              <Bar dataKey="target" fill="#10B981" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">🎯 Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categoryBreakdown.map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }}></div>
                  <span className="font-medium">{cat.name}</span>
                </div>
                <span className="text-sm font-semibold">
                  Rp {(cat.amount / 1000000).toFixed(0)}M
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">👥 Top Customers</h2>
          <div className="space-y-3">
            {topCustomers.map((customer, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    i === 0 ? 'bg-yellow-500' :
                    i === 1 ? 'bg-gray-400' :
                    i === 2 ? 'bg-orange-600' :
                    'bg-blue-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{customer.name}</div>
                    <div className="text-sm text-gray-600">{customer.purchases} purchases</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">
                    Rp {(customer.revenue / 1000000).toFixed(0)}M
                  </div>
                  <div className="text-xs text-gray-500">total revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Turnover */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">🔄 Inventory Turnover</h2>
          <div className="space-y-4">
            {inventoryTurnover.map((item, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{item.product}</div>
                  <div className="text-xl font-bold text-green-600">
                    {item.turnover}x
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500">Current Stock</div>
                    <div className="font-semibold">{item.stock}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500">Avg Monthly Sales</div>
                    <div className="font-semibold">{item.avgSold}</div>
                  </div>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-full"
                    style={{ width: `${Math.min((item.turnover / 15) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">📋 Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-blue-600">98.5%</div>
            <div className="text-gray-600">Target Achievement</div>
          </div>

          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-green-600">4.8/5.0</div>
            <div className="text-gray-600">Customer Satisfaction</div>
          </div>

          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="text-4xl mb-2">📦</div>
            <div className="text-2xl font-bold text-purple-600">95.2%</div>
            <div className="text-gray-600">Order Fulfillment Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
