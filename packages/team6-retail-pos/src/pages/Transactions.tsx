import React, { useState } from 'react'
import { DocumentTextIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { useStoreStore } from '../store/storeStore'
import { usePOSStore } from '../store/posStore'

const Transactions: React.FC = () => {
  const { currentStore, stores } = useStoreStore()
  const { transactions } = usePOSStore()
  const store = stores.find(s => s.id === currentStore)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Sample transactions
  const sampleTransactions = [
    {
      id: 'TRX-001',
      date: '2025-01-16',
      time: '09:15:30',
      customer: 'Budi Santoso',
      items: 5,
      subtotal: 1250000,
      tax: 137500,
      total: 1387500,
      payment: 'cash',
      cashier: 'Admin User',
      status: 'completed'
    },
    {
      id: 'TRX-002',
      date: '2025-01-16',
      time: '10:30:45',
      customer: 'Walk-in Customer',
      items: 3,
      subtotal: 850000,
      tax: 93500,
      total: 943500,
      payment: 'card',
      cashier: 'Admin User',
      status: 'completed'
    },
    {
      id: 'TRX-003',
      date: '2025-01-16',
      time: '11:45:20',
      customer: 'Siti Rahayu',
      items: 8,
      subtotal: 2450000,
      tax: 269500,
      total: 2719500,
      payment: 'transfer',
      cashier: 'Admin User',
      status: 'completed'
    },
    {
      id: 'TRX-004',
      date: '2025-01-15',
      time: '14:20:15',
      customer: 'Ahmad Yani',
      items: 4,
      subtotal: 1680000,
      tax: 184800,
      total: 1864800,
      payment: 'cash',
      cashier: 'Admin User',
      status: 'completed'
    },
    {
      id: 'TRX-005',
      date: '2025-01-15',
      time: '16:10:30',
      customer: 'Walk-in Customer',
      items: 2,
      subtotal: 580000,
      tax: 63800,
      total: 643800,
      payment: 'card',
      cashier: 'Admin User',
      status: 'completed'
    }
  ]

  const paymentMethodConfig = {
    cash: { bg: 'bg-green-100', text: 'text-green-700', label: '💵 Cash' },
    card: { bg: 'bg-blue-100', text: 'text-blue-700', label: '💳 Card' },
    transfer: { bg: 'bg-purple-100', text: 'text-purple-700', label: '🏦 Transfer' }
  }

  const totalRevenue = sampleTransactions.reduce((sum, t) => sum + t.total, 0)
  const totalTransactions = sampleTransactions.length
  const avgTransaction = totalRevenue / totalTransactions

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📄 Transactions History</h1>
        <p className="text-gray-600">{store?.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold mb-1">
            Rp {(totalRevenue / 1000000).toFixed(1)}M
          </div>
          <div className="text-blue-100">Total Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold mb-1">{totalTransactions}</div>
          <div className="text-purple-100">Total Transactions</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold mb-1">
            Rp {(avgTransaction / 1000).toFixed(0)}K
          </div>
          <div className="text-green-100">Avg Transaction</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-4 py-2 border-2 rounded-lg focus:border-blue-500 outline-none"
          >
            <option value="all">All Payments</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="transfer">Transfer</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From Date"
            className="px-4 py-2 border-2 rounded-lg focus:border-blue-500 outline-none"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To Date"
            className="px-4 py-2 border-2 rounded-lg focus:border-blue-500 outline-none"
          />

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <tr>
                <th className="text-left py-4 px-4">Transaction ID</th>
                <th className="text-left py-4 px-4">Date & Time</th>
                <th className="text-left py-4 px-4">Customer</th>
                <th className="text-center py-4 px-4">Items</th>
                <th className="text-right py-4 px-4">Subtotal</th>
                <th className="text-right py-4 px-4">Tax</th>
                <th className="text-right py-4 px-4">Total</th>
                <th className="text-center py-4 px-4">Payment</th>
                <th className="text-left py-4 px-4">Cashier</th>
                <th className="text-center py-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleTransactions.map((trx, index) => {
                const paymentConfig = paymentMethodConfig[trx.payment as keyof typeof paymentMethodConfig]
                
                return (
                  <tr key={trx.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-bold text-blue-600">{trx.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{trx.date}</div>
                      <div className="text-xs text-gray-500">{trx.time}</div>
                    </td>
                    <td className="py-3 px-4">{trx.customer}</td>
                    <td className="py-3 px-4 text-center font-semibold">{trx.items}</td>
                    <td className="py-3 px-4 text-right">
                      Rp {trx.subtotal.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      Rp {trx.tax.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600 text-lg">
                      Rp {trx.total.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${paymentConfig.bg} ${paymentConfig.text}`}>
                        {paymentConfig.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{trx.cashier}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        ✓ {trx.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Transactions
