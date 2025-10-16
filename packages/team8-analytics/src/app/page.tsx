'use client';

import { BarChart3, TrendingUp, Users, Package, DollarSign, ShoppingCart, Ticket, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const salesData = [
  { month: 'Jan', sales: 45000, orders: 120, profit: 12000 },
  { month: 'Feb', sales: 52000, orders: 145, profit: 15000 },
  { month: 'Mar', sales: 48000, orders: 132, profit: 13500 },
  { month: 'Apr', sales: 61000, orders: 168, profit: 18000 },
  { month: 'May', sales: 55000, orders: 152, profit: 16000 },
  { month: 'Jun', sales: 67000, orders: 189, profit: 20000 },
];

const teamPerformance = [
  { name: 'Sales Mobile', value: 28, color: '#0ea5e9' },
  { name: 'E-commerce', value: 24, color: '#10b981' },
  { name: 'Retail POS', value: 22, color: '#f59e0b' },
  { name: 'Finance', value: 15, color: '#8b5cf6' },
  { name: 'HR', value: 11, color: '#ec4899' },
];

const inventoryStatus = [
  { category: 'Semen', stock: 850, min: 500, status: 'good' },
  { category: 'Bata', stock: 320, min: 400, status: 'warning' },
  { category: 'Pasir', stock: 1200, min: 800, status: 'good' },
  { category: 'Besi', stock: 180, min: 200, status: 'critical' },
  { category: 'Cat', stock: 450, min: 300, status: 'good' },
];

export default function HomePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics & Business Intelligence</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights across all Gajah Nusa teams</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <span className="text-sm opacity-90">This Month</span>
          </div>
          <div className="text-3xl font-bold mb-1">Rp 67,000,000</div>
          <div className="text-sm opacity-90">Total Revenue</div>
          <div className="mt-2 text-sm">
            <span className="text-green-300">↑ 22%</span> from last month
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="w-8 h-8" />
            <span className="text-sm opacity-90">This Month</span>
          </div>
          <div className="text-3xl font-bold mb-1">1,246</div>
          <div className="text-sm opacity-90">Total Orders</div>
          <div className="mt-2 text-sm">
            <span className="text-green-300">↑ 15%</span> from last month
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8" />
            <span className="text-sm opacity-90">Active</span>
          </div>
          <div className="text-3xl font-bold mb-1">342</div>
          <div className="text-sm opacity-90">Total Customers</div>
          <div className="mt-2 text-sm">
            <span className="text-green-300">↑ 8%</span> new this month
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8" />
            <span className="text-sm opacity-90">In Stock</span>
          </div>
          <div className="text-3xl font-bold mb-1">3,000</div>
          <div className="text-sm opacity-90">Total Products</div>
          <div className="mt-2 text-sm">
            <span className="text-yellow-300">⚠ 12</span> low stock items
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Sales Trend (6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
              <Area type="monotone" dataKey="profit" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
            Team Performance Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={teamPerformance}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {teamPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-orange-500" />
            Monthly Orders Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-purple-500" />
            Inventory Status
          </h3>
          <div className="space-y-4">
            {inventoryStatus.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-32 font-medium text-gray-700">{item.category}</div>
                <div className="flex-1">
                  <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute h-full rounded-full ${
                        item.status === 'good' ? 'bg-green-500' :
                        item.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(item.stock / item.min) * 50}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                      {item.stock} / {item.min} (min)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Ticket className="w-5 h-5 mr-2 text-blue-500" />
          Cross-Team Activity Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Team</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Today</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">This Week</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">This Month</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">Sales Mobile</td>
                <td className="text-right py-3 px-4">45</td>
                <td className="text-right py-3 px-4">312</td>
                <td className="text-right py-3 px-4">1,246</td>
                <td className="text-right py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">Active</span>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">Logistics</td>
                <td className="text-right py-3 px-4">38</td>
                <td className="text-right py-3 px-4">267</td>
                <td className="text-right py-3 px-4">1,089</td>
                <td className="text-right py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">Active</span>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">Finance</td>
                <td className="text-right py-3 px-4">52</td>
                <td className="text-right py-3 px-4">389</td>
                <td className="text-right py-3 px-4">1,534</td>
                <td className="text-right py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">Active</span>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">HR System</td>
                <td className="text-right py-3 px-4">12</td>
                <td className="text-right py-3 px-4">78</td>
                <td className="text-right py-3 px-4">342</td>
                <td className="text-right py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Normal</span>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">E-commerce</td>
                <td className="text-right py-3 px-4">67</td>
                <td className="text-right py-3 px-4">456</td>
                <td className="text-right py-3 px-4">1,892</td>
                <td className="text-right py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">Active</span>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">Retail POS</td>
                <td className="text-right py-3 px-4">89</td>
                <td className="text-right py-3 px-4">623</td>
                <td className="text-right py-3 px-4">2,456</td>
                <td className="text-right py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">Active</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4">Customer Service</td>
                <td className="text-right py-3 px-4">34</td>
                <td className="text-right py-3 px-4">198</td>
                <td className="text-right py-3 px-4">756</td>
                <td className="text-right py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">Active</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
