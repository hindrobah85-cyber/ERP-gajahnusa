import React, { useState } from 'react'
import { 
  CubeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  PencilIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useStoreStore } from '../store/storeStore'

interface InventoryItem {
  id: number
  code: string
  name: string
  category: string
  stock: number
  minStock: number
  maxStock: number
  unit: string
  price: number
  location: string
  lastUpdated: string
}

const Warehouse: React.FC = () => {
  const { currentStore, stores } = useStoreStore()
  const store = stores.find(s => s.id === currentStore)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out' | 'adjust'>('in')
  const [adjustmentQty, setAdjustmentQty] = useState('')
  const [adjustmentReason, setAdjustmentReason] = useState('')

  // Sample inventory data
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 1, code: 'CEM-001', name: 'Semen Gajah', category: 'cement', stock: 120, minStock: 50, maxStock: 200, unit: 'sak', price: 65000, location: 'A1-01', lastUpdated: '2025-01-15' },
    { id: 2, code: 'CEM-002', name: 'Semen Merah Putih', category: 'cement', stock: 150, minStock: 50, maxStock: 200, unit: 'sak', price: 63000, location: 'A1-02', lastUpdated: '2025-01-15' },
    { id: 3, code: 'BRK-001', name: 'Bata Merah Press', category: 'bricks', stock: 5000, minStock: 2000, maxStock: 10000, unit: 'pcs', price: 1200, location: 'B2-01', lastUpdated: '2025-01-14' },
    { id: 4, code: 'BRK-002', name: 'Batako Abu-abu', category: 'bricks', stock: 3000, minStock: 1000, maxStock: 5000, unit: 'pcs', price: 3500, location: 'B2-02', lastUpdated: '2025-01-14' },
    { id: 5, code: 'STL-001', name: 'Besi Beton 12mm', category: 'steel', stock: 45, minStock: 50, maxStock: 300, unit: 'batang', price: 145000, location: 'C3-01', lastUpdated: '2025-01-13' },
    { id: 6, code: 'STL-002', name: 'Besi Hollow 4x4', category: 'steel', stock: 150, minStock: 50, maxStock: 200, unit: 'batang', price: 85000, location: 'C3-02', lastUpdated: '2025-01-15' },
    { id: 7, code: 'TIL-001', name: 'Keramik Lantai 40x40', category: 'tiles', stock: 800, minStock: 300, maxStock: 1500, unit: 'm2', price: 55000, location: 'D4-01', lastUpdated: '2025-01-14' },
    { id: 8, code: 'TIL-002', name: 'Keramik Dinding 25x40', category: 'tiles', stock: 1000, minStock: 300, maxStock: 1500, unit: 'm2', price: 48000, location: 'D4-02', lastUpdated: '2025-01-14' },
    { id: 9, code: 'PNT-001', name: 'Cat Tembok Putih 5kg', category: 'paint', stock: 300, minStock: 100, maxStock: 500, unit: 'kaleng', price: 185000, location: 'E5-01', lastUpdated: '2025-01-15' },
    { id: 10, code: 'PNT-002', name: 'Cat Kayu & Besi', category: 'paint', stock: 250, minStock: 100, maxStock: 400, unit: 'liter', price: 95000, location: 'E5-02', lastUpdated: '2025-01-15' },
  ])

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'cement', name: 'Cement' },
    { id: 'bricks', name: 'Bricks' },
    { id: 'steel', name: 'Steel' },
    { id: 'tiles', name: 'Tiles' },
    { id: 'paint', name: 'Paint' },
    { id: 'tools', name: 'Tools' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'plumbing', name: 'Plumbing' }
  ]

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const lowStockItems = inventory.filter(item => item.stock < item.minStock)
  const totalItems = inventory.reduce((sum, item) => sum + item.stock, 0)
  const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.price), 0)

  const handleOpenAdjustment = (item: InventoryItem, type: 'in' | 'out' | 'adjust') => {
    setSelectedItem(item)
    setAdjustmentType(type)
    setAdjustmentQty('')
    setAdjustmentReason('')
    setShowAdjustModal(true)
  }

  const handleSaveAdjustment = () => {
    if (!selectedItem || !adjustmentQty || !adjustmentReason) {
      alert('Please fill all fields')
      return
    }

    const qty = parseInt(adjustmentQty)
    let newStock = selectedItem.stock

    if (adjustmentType === 'in') {
      newStock += qty
    } else if (adjustmentType === 'out') {
      newStock -= qty
    } else {
      newStock = qty
    }

    if (newStock < 0) {
      alert('Stock cannot be negative')
      return
    }

    setInventory(inventory.map(item => 
      item.id === selectedItem.id 
        ? { ...item, stock: newStock, lastUpdated: new Date().toISOString().split('T')[0] }
        : item
    ))

    alert(`Stock ${adjustmentType === 'in' ? 'added' : adjustmentType === 'out' ? 'removed' : 'adjusted'} successfully!`)
    setShowAdjustModal(false)
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📦 Local Warehouse</h1>
        <p className="text-gray-600">{store?.name} - Warehouse Management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <CubeIcon className="w-8 h-8 text-blue-600" />
            <span className="text-3xl">📊</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{inventory.length}</div>
          <div className="text-gray-600 text-sm">Total SKUs</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <CubeIcon className="w-8 h-8 text-green-600" />
            <span className="text-3xl">📈</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{totalItems.toLocaleString('id-ID')}</div>
          <div className="text-gray-600 text-sm">Total Units</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <CubeIcon className="w-8 h-8 text-purple-600" />
            <span className="text-3xl">💰</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            Rp {(totalValue / 1000000000).toFixed(1)}B
          </div>
          <div className="text-gray-600 text-sm">Total Value</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            <span className="text-3xl">⚠️</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
          <div className="text-gray-600 text-sm">Low Stock Alerts</div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            <h3 className="font-bold text-red-800">Low Stock Alert!</h3>
          </div>
          <p className="text-red-700 text-sm">
            {lowStockItems.length} item(s) below minimum stock level. Please reorder soon.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name or code..."
              className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <tr>
                <th className="text-left py-4 px-4">Code</th>
                <th className="text-left py-4 px-4">Product Name</th>
                <th className="text-left py-4 px-4">Category</th>
                <th className="text-center py-4 px-4">Location</th>
                <th className="text-right py-4 px-4">Stock</th>
                <th className="text-right py-4 px-4">Min/Max</th>
                <th className="text-right py-4 px-4">Unit Price</th>
                <th className="text-right py-4 px-4">Total Value</th>
                <th className="text-center py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item, index) => {
                const isLowStock = item.stock < item.minStock
                const isOverStock = item.stock > item.maxStock
                
                return (
                  <tr key={item.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-semibold">{item.code}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">Updated: {item.lastUpdated}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-sm">{item.location}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className={`font-bold text-lg ${
                        isLowStock ? 'text-red-600' :
                        isOverStock ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {item.stock.toLocaleString('id-ID')}
                      </div>
                      <div className="text-xs text-gray-500">{item.unit}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600">
                      {item.minStock} / {item.maxStock}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      Rp {item.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600">
                      Rp {(item.stock * item.price).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenAdjustment(item, 'in')}
                          className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition"
                          title="Stock In"
                        >
                          <ArrowUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenAdjustment(item, 'out')}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                          title="Stock Out"
                        >
                          <ArrowDownIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenAdjustment(item, 'adjust')}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
                          title="Adjust"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className={`p-6 rounded-t-2xl ${
              adjustmentType === 'in' ? 'bg-gradient-to-r from-green-600 to-green-700' :
              adjustmentType === 'out' ? 'bg-gradient-to-r from-red-600 to-red-700' :
              'bg-gradient-to-r from-blue-600 to-blue-700'
            } text-white`}>
              <h2 className="text-2xl font-bold">
                {adjustmentType === 'in' ? '📈 Stock In' :
                 adjustmentType === 'out' ? '📉 Stock Out' :
                 '✏️ Adjust Stock'}
              </h2>
              <p className="text-sm opacity-90">{selectedItem.name}</p>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="font-bold text-xl">{selectedItem.stock} {selectedItem.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Min Stock:</span>
                  <span>{selectedItem.minStock}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Stock:</span>
                  <span>{selectedItem.maxStock}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block font-semibold mb-2">
                  {adjustmentType === 'adjust' ? 'New Stock Quantity' : 'Quantity'}
                </label>
                <input
                  type="number"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  placeholder={adjustmentType === 'adjust' ? 'Enter new stock' : 'Enter quantity'}
                  className="w-full px-4 py-3 border-2 rounded-lg text-xl focus:border-blue-500 outline-none"
                  min="0"
                />
                {adjustmentQty && adjustmentType !== 'adjust' && (
                  <div className="mt-2 text-sm">
                    New stock will be: <span className="font-bold">
                      {adjustmentType === 'in' 
                        ? selectedItem.stock + parseInt(adjustmentQty)
                        : selectedItem.stock - parseInt(adjustmentQty)
                      } {selectedItem.unit}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block font-semibold mb-2">Reason</label>
                <textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Enter reason for adjustment..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAdjustment}
                  className={`flex-1 py-3 text-white rounded-lg font-semibold ${
                    adjustmentType === 'in' ? 'bg-green-600 hover:bg-green-700' :
                    adjustmentType === 'out' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Warehouse
