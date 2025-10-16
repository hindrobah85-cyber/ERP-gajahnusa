import React, { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  ShoppingCartIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline'
import { useStoreStore } from '../store/storeStore'
import { usePOSStore } from '../store/posStore'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard: React.FC = () => {
  const { currentStore, stores } = useStoreStore()
  const { transactions } = usePOSStore()
  
  const store = stores.find(s => s.id === currentStore)
  
  // Sample data
  const [stats, setStats] = useState({
    todaySales: 125750000,
    todayTransactions: 87,
    todayCustomers: 65,
    avgTransaction: 1445402,
    monthSales: 3456789000,
    monthGrowth: 12.5
  })

  const salesData = [
    { day: 'Mon', sales: 15000000, transactions: 42 },
    { day: 'Tue', sales: 18500000, transactions: 56 },
    { day: 'Wed', sales: 22000000, transactions: 68 },
    { day: 'Thu', sales: 19500000, transactions: 51 },
    { day: 'Fri', sales: 28000000, transactions: 84 },
    { day: 'Sat', sales: 35000000, transactions: 102 },
    { day: 'Sun', sales: 12000000, transactions: 38 }
  ]

  const categoryData = [
    { name: 'Cement', value: 35, color: '#3B82F6' },
    { name: 'Bricks', value: 25, color: '#8B5CF6' },
    { name: 'Steel', value: 20, color: '#10B981' },
    { name: 'Tiles', value: 12, color: '#F59E0B' },
    { name: 'Others', value: 8, color: '#EF4444' }
  ]

  const topProducts = [
    { name: 'Semen Gajah', sold: 145, revenue: 9425000 },
    { name: 'Bata Merah Press', sold: 3500, revenue: 4200000 },
    { name: 'Besi Beton 12mm', sold: 28, revenue: 4060000 },
    { name: 'Keramik Lantai 40x40', sold: 65, revenue: 3575000 },
    { name: 'Cat Tembok Putih', sold: 18, revenue: 3330000 }
  ]

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Store Dashboard</h1>
        <p className="text-gray-600">
          {store?.name} | {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <CurrencyDollarIcon className="w-8 h-8 opacity-80" />
            <TrendingUpIcon className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-1">
            Rp {(stats.todaySales / 1000000).toFixed(1)}M
          </div>
          <div className="text-blue-100">Today's Sales</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCartIcon className="w-8 h-8 opacity-80" />
            <span className="text-2xl">🛒</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.todayTransactions}</div>
          <div className="text-purple-100">Transactions Today</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <UsersIcon className="w-8 h-8 opacity-80" />
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.todayCustomers}</div>
          <div className="text-green-100">Customers Today</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <ChartBarIcon className="w-8 h-8 opacity-80" />
            <span className="text-lg font-semibold">+{stats.monthGrowth}%</span>
          </div>
          <div className="text-3xl font-bold mb-1">
            Rp {(stats.avgTransaction / 1000).toFixed(0)}K
          </div>
          <div className="text-orange-100">Avg Transaction</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Weekly Sales Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`}
              />
              <Legend />
              <Bar dataKey="sales" fill="#3B82F6" name="Sales (Rp)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">🏆 Top Selling Products</h2>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.sold} units sold</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">
                    Rp {(product.revenue / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-xs text-gray-500">revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📈 Quick Stats</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Month to Date</div>
              <div className="text-2xl font-bold text-blue-600">
                Rp {(stats.monthSales / 1000000000).toFixed(2)}B
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                <TrendingUpIcon className="w-4 h-4" />
                <span>+{stats.monthGrowth}% vs last month</span>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Stock Status</div>
              <div className="text-2xl font-bold text-purple-600">1,247</div>
              <div className="text-sm text-gray-600 mt-1">Items in stock</div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Low Stock Alert</div>
              <div className="text-2xl font-bold text-orange-600">12</div>
              <div className="text-sm text-gray-600 mt-1">Items need reorder</div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Staff On Duty</div>
              <div className="text-2xl font-bold text-orange-600">8</div>
              <div className="text-sm text-gray-600 mt-1">Active employees</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">🕒 Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2">
                <th className="text-left py-3 px-4">Time</th>
                <th className="text-left py-3 px-4">Transaction ID</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Items</th>
                <th className="text-left py-3 px-4">Payment</th>
                <th className="text-right py-3 px-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">
                    {new Date(Date.now() - i * 1800000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 font-mono text-sm">TRX-{1000 + i}</td>
                  <td className="py-3 px-4">Walk-in Customer</td>
                  <td className="py-3 px-4 text-center">{Math.floor(Math.random() * 5) + 1}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Cash
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    Rp {((Math.random() * 5 + 1) * 1000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
