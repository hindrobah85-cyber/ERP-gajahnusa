'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore()

  const handleRemoveItem = (id: number, name: string) => {
    removeItem(id)
    toast.success(`${name} removed from cart`)
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart()
      toast.success('Cart cleared')
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some building materials to get started!</p>
        <Link 
          href="/" 
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button
          onClick={handleClearCart}
          className="text-red-600 hover:text-red-800 font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-6 flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-4xl shrink-0">
                📦
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-2">Stock: {item.stock} available</p>
                <p className="text-blue-600 font-bold text-xl">
                  Rp {item.price.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 border rounded hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 border rounded hover:bg-gray-100"
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>

                <p className="font-bold text-lg">
                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">
                  Rp {getTotalPrice().toLocaleString('id-ID')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>

              <div className="flex justify-between">
                <span>Tax (11%)</span>
                <span className="font-semibold">
                  Rp {(getTotalPrice() * 0.11).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-blue-600">
                  Rp {(getTotalPrice() * 1.11).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 text-center block mb-3"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/"
              className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 text-center block"
            >
              Continue Shopping
            </Link>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>💳 Payment Methods:</strong><br />
                Bank Transfer, Credit Card, COD
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
