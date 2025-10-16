'use client';

import { DollarSign, TrendingUp, ShoppingBag, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', revenue: 45000, orders: 120, customers: 89 },
  { month: 'Feb', revenue: 52000, orders: 145, customers: 102 },
  { month: 'Mar', revenue: 48000, orders: 132, customers: 95 },
  { month: 'Apr', revenue: 61000, orders: 168, customers: 124 },
  { month: 'May', revenue: 55000, orders: 152, customers: 110 },
  { month: 'Jun', revenue: 67000, orders: 189, customers: 142 },
  { month: 'Jul', revenue: 72000, orders: 203, customers: 156 },
];

const channelData = [
  { channel: 'Sales Mobile', revenue: 28500, percentage: 38 },
  { channel: 'E-commerce', revenue: 21300, percentage: 28 },
  { channel: 'Retail POS', revenue: 19200, percentage: 26 },
  { channel: 'Direct Sales', revenue: 6000, percentage: 8 },
];

export default function SalesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Sales Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive sales performance across all channels</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-10 h-10 text-blue-500" />
            <span className="text-green-600 text-sm font-semibold">+22%</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">Rp 72,000,000</div>
          <div className="text-sm text-gray-600 mt-1">Total Revenue (Jul)</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag className="w-10 h-10 text-green-500" />
            <span className="text-green-600 text-sm font-semibold">+15%</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">1,426</div>
          <div className="text-sm text-gray-600 mt-1">Total Orders</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10 text-orange-500" />
            <span className="text-green-600 text-sm font-semibold">+12%</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">818</div>
          <div className="text-sm text-gray-600 mt-1">Active Customers</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-10 h-10 text-purple-500" />
            <span className="text-green-600 text-sm font-semibold">+8%</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">Rp 50,492</div>
          <div className="text-sm text-gray-600 mt-1">Avg Order Value</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend (7 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Orders & Customers Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="customers" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales by Channel */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales by Channel</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={channelData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="channel" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Channel Performance Details</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Channel</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Percentage</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Growth</th>
            </tr>
          </thead>
          <tbody>
            {channelData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{item.channel}</td>
                <td className="text-right py-3 px-4">Rp {item.revenue.toLocaleString()}</td>
                <td className="text-right py-3 px-4">{item.percentage}%</td>
                <td className="text-right py-3 px-4">
                  <span className="text-green-600">+{Math.floor(Math.random() * 20 + 5)}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
