import React, { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  BanknotesIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import { usePOSStore } from '../store/posStore'
import { useStoreStore } from '../store/storeStore'

interface Product {
  id: number
  code: string
  name: string
  category: string
  price: number
  stock: number
  unit: string
}

const POSCashier: React.FC = () => {
  const { currentStore, stores } = useStoreStore()
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotal } = usePOSStore()
  
  const store = stores.find(s => s.id === currentStore)
  
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash')
  const [cashAmount, setCashAmount] = useState('')
  const [customerName, setCustomerName] = useState('')

  const categories = [
    { id: 'all', name: 'All Products', icon: '📦' },
    { id: 'cement', name: 'Cement', icon: '🧱' },
    { id: 'bricks', name: 'Bricks', icon: '🟫' },
    { id: 'steel', name: 'Steel', icon: '⚙️' },
    { id: 'tiles', name: 'Tiles', icon: '🔲' },
    { id: 'paint', name: 'Paint', icon: '🎨' },
    { id: 'tools', name: 'Tools', icon: '🔨' },
    { id: 'electrical', name: 'Electrical', icon: '⚡' },
    { id: 'plumbing', name: 'Plumbing', icon: '🚿' }
  ]

  // Sample products
  useEffect(() => {
    const sampleProducts: Product[] = [
      { id: 1, code: 'CEM-001', name: 'Semen Gajah', category: 'cement', price: 65000, stock: 120, unit: 'sak' },
      { id: 2, code: 'CEM-002', name: 'Semen Merah Putih', category: 'cement', price: 63000, stock: 150, unit: 'sak' },
      { id: 3, code: 'BRK-001', name: 'Bata Merah Press', category: 'bricks', price: 1200, stock: 5000, unit: 'pcs' },
      { id: 4, code: 'BRK-002', name: 'Batako Abu-abu', category: 'bricks', price: 3500, stock: 3000, unit: 'pcs' },
      { id: 5, code: 'STL-001', name: 'Besi Beton 12mm', category: 'steel', price: 145000, stock: 200, unit: 'batang' },
      { id: 6, code: 'STL-002', name: 'Besi Hollow 4x4', category: 'steel', price: 85000, stock: 150, unit: 'batang' },
      { id: 7, code: 'TIL-001', name: 'Keramik Lantai 40x40', category: 'tiles', price: 55000, stock: 800, unit: 'm2' },
      { id: 8, code: 'TIL-002', name: 'Keramik Dinding 25x40', category: 'tiles', price: 48000, stock: 1000, unit: 'm2' },
      { id: 9, code: 'PNT-001', name: 'Cat Tembok Putih 5kg', category: 'paint', price: 185000, stock: 300, unit: 'kaleng' },
      { id: 10, code: 'PNT-002', name: 'Cat Kayu & Besi', category: 'paint', price: 95000, stock: 250, unit: 'liter' },
      { id: 11, code: 'TOL-001', name: 'Sekop Beton', category: 'tools', price: 145000, stock: 80, unit: 'pcs' },
      { id: 12, code: 'TOL-002', name: 'Cangkul Baja', category: 'tools', price: 95000, stock: 100, unit: 'pcs' },
      { id: 13, code: 'ELC-001', name: 'Kabel NYM 2x2.5', category: 'electrical', price: 18500, stock: 2000, unit: 'meter' },
      { id: 14, code: 'ELC-002', name: 'Stop Kontak 4 Lubang', category: 'electrical', price: 45000, stock: 500, unit: 'pcs' },
      { id: 15, code: 'PLB-001', name: 'Pipa PVC 3 inch', category: 'plumbing', price: 85000, stock: 400, unit: 'batang' },
    ]
    setProducts(sampleProducts)
  }, [])

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const total = getTotal()
  const change = cashAmount ? (parseFloat(cashAmount) - total) : 0

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty!')
      return
    }
    setShowPayment(true)
  }

  const handleCompleteSale = () => {
    if (paymentMethod === 'cash' && change < 0) {
      alert('Insufficient cash amount!')
      return
    }

    const transaction = {
      id: Date.now(),
      storeId: currentStore,
      storeName: store?.name || '',
      items: cart,
      total,
      paymentMethod,
      cashAmount: paymentMethod === 'cash' ? parseFloat(cashAmount) : total,
      change: paymentMethod === 'cash' ? change : 0,
      customerName: customerName || 'Walk-in Customer',
      timestamp: new Date().toISOString(),
      status: 'completed'
    }

    console.log('Transaction completed:', transaction)
    
    // Here you would save to backend
    alert(`Transaction completed!\nTotal: Rp ${total.toLocaleString('id-ID')}\n${
      paymentMethod === 'cash' ? `Cash: Rp ${parseFloat(cashAmount).toLocaleString('id-ID')}\nChange: Rp ${change.toLocaleString('id-ID')}` : 
      paymentMethod === 'card' ? 'Payment: Credit/Debit Card' : 
      'Payment: Bank Transfer'
    }`)

    // Clear cart and reset
    clearCart()
    setShowPayment(false)
    setCustomerName('')
    setCashAmount('')
    setPaymentMethod('cash')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🛒 POS Cashier</h1>
            <p className="text-sm text-gray-600">
              {store?.name} | {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Cashier</div>
              <div className="font-semibold">Admin User</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Products */}
        <div className="flex-1 flex flex-col p-6">
          {/* Search & Categories */}
          <div className="mb-4">
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or code..."
                className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition text-left"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs text-gray-500 font-mono">{product.code}</div>
                    <div className={`text-xs font-semibold px-2 py-1 rounded ${
                      product.stock > 50 ? 'bg-green-100 text-green-700' :
                      product.stock > 0 ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.stock} {product.unit}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xl font-bold text-blue-600">
                        Rp {product.price.toLocaleString('id-ID')}
                      </div>
                      <div className="text-xs text-gray-500">per {product.unit}</div>
                    </div>
                    <PlusIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="w-96 bg-white shadow-xl flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCartIcon className="w-6 h-6" />
              <h2 className="text-xl font-bold">Shopping Cart</h2>
            </div>
            <p className="text-sm text-blue-100">{cart.length} items</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Cart is empty</p>
                <p className="text-sm">Add products to start</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.code}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded border hover:bg-gray-100"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded border hover:bg-gray-100"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {item.quantity} × Rp {item.price.toLocaleString('id-ID')}
                        </div>
                        <div className="font-bold text-blue-600">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t p-4 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-blue-600 text-2xl">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Proceed to Payment
              </button>
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="w-full py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Payment</h2>
              <button
                onClick={() => setShowPayment(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Customer Name */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Customer Name (Optional)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in Customer"
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-500 outline-none"
                />
              </div>

              {/* Total */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                <div className="text-3xl font-bold text-blue-600">
                  Rp {total.toLocaleString('id-ID')}
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block font-semibold mb-3">Payment Method</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                      paymentMethod === 'cash'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <BanknotesIcon className="w-6 h-6 text-green-600" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Cash</div>
                      <div className="text-sm text-gray-600">Pay with cash</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCardIcon className="w-6 h-6 text-blue-600" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Credit/Debit Card</div>
                      <div className="text-sm text-gray-600">Card payment</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('transfer')}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                      paymentMethod === 'transfer'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">🏦</span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Bank Transfer</div>
                      <div className="text-sm text-gray-600">Transfer payment</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Cash Input */}
              {paymentMethod === 'cash' && (
                <div className="mb-6">
                  <label className="block font-semibold mb-2">Cash Amount</label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="Enter cash amount"
                    className="w-full px-4 py-3 border-2 rounded-lg text-xl focus:border-blue-500 outline-none"
                  />
                  {cashAmount && (
                    <div className={`mt-2 text-lg font-semibold ${
                      change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Change: Rp {change.toLocaleString('id-ID')}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSale}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Complete Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default POSCashier
