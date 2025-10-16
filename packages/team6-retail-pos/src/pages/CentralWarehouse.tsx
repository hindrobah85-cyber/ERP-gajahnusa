import React, { useState } from 'react'
import { 
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useStoreStore } from '../store/storeStore'

interface CentralWarehouseItem {
  id: number
  code: string
  name: string
  category: string
  stock: number
  reserved: number
  available: number
  unit: string
  price: number
  supplier: string
}

interface PurchaseOrder {
  id: number
  orderNumber: string
  storeId: number
  storeName: string
  items: { productId: number, productName: string, quantity: number, price: number }[]
  total: number
  status: 'pending' | 'approved' | 'shipped' | 'received'
  createdAt: string
}

const CentralWarehouse: React.FC = () => {
  const { currentStore, stores } = useStoreStore()
  const store = stores.find(s => s.id === currentStore)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showPOModal, setShowPOModal] = useState(false)
  const [poCart, setPOCart] = useState<{ item: CentralWarehouseItem, quantity: number }[]>([])
  const [poNotes, setPONotes] = useState('')

  // Sample central warehouse data
  const [centralInventory] = useState<CentralWarehouseItem[]>([
    { id: 1, code: 'CEM-001', name: 'Semen Gajah', category: 'cement', stock: 5000, reserved: 800, available: 4200, unit: 'sak', price: 62000, supplier: 'PT Semen Indonesia' },
    { id: 2, code: 'CEM-002', name: 'Semen Merah Putih', category: 'cement', stock: 6000, reserved: 900, available: 5100, unit: 'sak', price: 60000, supplier: 'PT Semen Indonesia' },
    { id: 3, code: 'BRK-001', name: 'Bata Merah Press', category: 'bricks', stock: 50000, reserved: 8000, available: 42000, unit: 'pcs', price: 1100, supplier: 'CV Bata Jaya' },
    { id: 4, code: 'BRK-002', name: 'Batako Abu-abu', category: 'bricks', stock: 30000, reserved: 5000, available: 25000, unit: 'pcs', price: 3300, supplier: 'CV Bata Jaya' },
    { id: 5, code: 'STL-001', name: 'Besi Beton 12mm', category: 'steel', stock: 2000, reserved: 300, available: 1700, unit: 'batang', price: 140000, supplier: 'PT Krakatau Steel' },
    { id: 6, code: 'STL-002', name: 'Besi Hollow 4x4', category: 'steel', stock: 1500, reserved: 200, available: 1300, unit: 'batang', price: 82000, supplier: 'PT Krakatau Steel' },
    { id: 7, code: 'TIL-001', name: 'Keramik Lantai 40x40', category: 'tiles', stock: 8000, reserved: 1200, available: 6800, unit: 'm2', price: 52000, supplier: 'PT Keramik Mulia' },
    { id: 8, code: 'TIL-002', name: 'Keramik Dinding 25x40', category: 'tiles', stock: 10000, reserved: 1500, available: 8500, unit: 'm2', price: 46000, supplier: 'PT Keramik Mulia' },
    { id: 9, code: 'PNT-001', name: 'Cat Tembok Putih 5kg', category: 'paint', stock: 3000, reserved: 400, available: 2600, unit: 'kaleng', price: 180000, supplier: 'PT Cat Sejahtera' },
    { id: 10, code: 'PNT-002', name: 'Cat Kayu & Besi', category: 'paint', stock: 2500, reserved: 350, available: 2150, unit: 'liter', price: 92000, supplier: 'PT Cat Sejahtera' },
  ])

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 1,
      orderNumber: 'PO-2025-001',
      storeId: currentStore || 1,
      storeName: store?.name || '',
      items: [
        { productId: 1, productName: 'Semen Gajah', quantity: 100, price: 62000 },
        { productId: 3, productName: 'Bata Merah Press', quantity: 1000, price: 1100 }
      ],
      total: 7300000,
      status: 'approved',
      createdAt: '2025-01-10'
    }
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

  const filteredInventory = centralInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToPOCart = (item: CentralWarehouseItem) => {
    const existing = poCart.find(c => c.item.id === item.id)
    if (existing) {
      setPOCart(poCart.map(c => 
        c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ))
    } else {
      setPOCart([...poCart, { item, quantity: 1 }])
    }
  }

  const updatePOQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      setPOCart(poCart.filter(c => c.item.id !== itemId))
    } else {
      setPOCart(poCart.map(c => 
        c.item.id === itemId ? { ...c, quantity } : c
      ))
    }
  }

  const calculatePOTotal = () => {
    return poCart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0)
  }

  const submitPurchaseOrder = () => {
    if (poCart.length === 0) {
      alert('Please add items to purchase order')
      return
    }

    const newPO: PurchaseOrder = {
      id: purchaseOrders.length + 1,
      orderNumber: `PO-2025-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      storeId: currentStore || 1,
      storeName: store?.name || '',
      items: poCart.map(c => ({
        productId: c.item.id,
        productName: c.item.name,
        quantity: c.quantity,
        price: c.item.price
      })),
      total: calculatePOTotal(),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    }

    setPurchaseOrders([newPO, ...purchaseOrders])
    setPOCart([])
    setPONotes('')
    setShowPOModal(false)
    alert(`Purchase Order ${newPO.orderNumber} submitted successfully!\nTotal: Rp ${newPO.total.toLocaleString('id-ID')}\nStatus: Pending Approval`)
  }

  const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: '⏳' },
    approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Approved', icon: '✅' },
    shipped: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Shipped', icon: '🚚' },
    received: { bg: 'bg-green-100', text: 'text-green-700', label: 'Received', icon: '📦' }
  }

  const totalAvailable = centralInventory.reduce((sum, item) => sum + item.available, 0)
  const totalValue = centralInventory.reduce((sum, item) => sum + (item.stock * item.price), 0)

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🏢 Central Warehouse</h1>
        <p className="text-gray-600">View-Only Access | Submit Purchase Orders to HQ</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded-lg">
        <div className="flex items-start gap-3">
          <BuildingStorefrontIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-blue-800 mb-1">Central Distribution Center</h3>
            <p className="text-blue-700 text-sm">
              This is a read-only view of the central warehouse inventory managed by HQ. 
              You can view stock levels and submit purchase orders to request products for your store.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-gray-800">{centralInventory.length}</div>
          <div className="text-gray-600 text-sm">Total Products</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-green-600">{totalAvailable.toLocaleString('id-ID')}</div>
          <div className="text-gray-600 text-sm">Available Units</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-blue-600">
            Rp {(totalValue / 1000000000).toFixed(1)}B
          </div>
          <div className="text-gray-600 text-sm">Total Value</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-purple-600">{purchaseOrders.length}</div>
          <div className="text-gray-600 text-sm">Purchase Orders</div>
        </div>
      </div>

      {/* Filters & Create PO Button */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search central warehouse..."
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
          <button
            onClick={() => setShowPOModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition whitespace-nowrap"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            Create Purchase Order ({poCart.length})
          </button>
        </div>
      </div>

      {/* Central Inventory Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4">
          <h2 className="text-xl font-bold">📦 Central Warehouse Inventory (Read-Only)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4">Code</th>
                <th className="text-left py-3 px-4">Product Name</th>
                <th className="text-left py-3 px-4">Supplier</th>
                <th className="text-right py-3 px-4">Total Stock</th>
                <th className="text-right py-3 px-4">Reserved</th>
                <th className="text-right py-3 px-4">Available</th>
                <th className="text-right py-3 px-4">Unit Price</th>
                <th className="text-center py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item, index) => (
                <tr key={item.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm font-semibold">{item.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{item.category}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{item.supplier}</td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {item.stock.toLocaleString('id-ID')} <span className="text-xs text-gray-500">{item.unit}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-orange-600 font-semibold">
                    {item.reserved.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right text-green-600 font-bold text-lg">
                    {item.available.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    Rp {item.price.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => addToPOCart(item)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                    >
                      + Add to PO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Orders History */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
          <h2 className="text-xl font-bold">📋 Your Purchase Orders</h2>
        </div>
        <div className="p-6">
          {purchaseOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ClockIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No purchase orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseOrders.map(po => {
                const config = statusConfig[po.status]
                return (
                  <div key={po.id} className="border-2 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{po.orderNumber}</h3>
                        <p className="text-sm text-gray-600">{po.createdAt}</p>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${config.bg} ${config.text}`}>
                        <span>{config.icon}</span>
                        {config.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-600">Items</div>
                        <div className="font-semibold">{po.items.length} products</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total Amount</div>
                        <div className="text-xl font-bold text-blue-600">
                          Rp {po.total.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold">
                        View Items
                      </summary>
                      <div className="mt-2 space-y-1 pl-4">
                        {po.items.map((item, i) => (
                          <div key={i} className="flex justify-between py-1">
                            <span>{item.productName}</span>
                            <span>{item.quantity} × Rp {item.price.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create PO Modal */}
      {showPOModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <h2 className="text-2xl font-bold">📝 Create Purchase Order</h2>
              <p className="text-sm opacity-90">Request products from central warehouse</p>
            </div>

            <div className="p-6">
              {poCart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No items added yet</p>
                  <p className="text-sm">Add items from the inventory table above</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {poCart.map(c => (
                      <div key={c.item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold">{c.item.name}</div>
                          <div className="text-sm text-gray-600">{c.item.code}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updatePOQuantity(c.item.id, c.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded border hover:bg-gray-100"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={c.quantity}
                            onChange={(e) => updatePOQuantity(c.item.id, parseInt(e.target.value))}
                            className="w-20 text-center border rounded py-1"
                            min="1"
                          />
                          <button
                            onClick={() => updatePOQuantity(c.item.id, c.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded border hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">
                            Rp {(c.item.price * c.quantity).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6">
                    <label className="block font-semibold mb-2">Notes (Optional)</label>
                    <textarea
                      value={poNotes}
                      onChange={(e) => setPONotes(e.target.value)}
                      placeholder="Add notes for this purchase order..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-3xl font-bold text-blue-600">
                        Rp {calculatePOTotal().toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPOModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPurchaseOrder}
                  disabled={poCart.length === 0}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Purchase Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CentralWarehouse
