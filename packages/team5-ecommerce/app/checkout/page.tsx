'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { ShoppingBagIcon, TruckIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface ShippingInfo {
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  province: string
  postalCode: string
  notes: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping')
  const [loading, setLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    notes: ''
  })
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash')

  const subtotal = getTotalPrice()
  const tax = subtotal * 0.11 // PPN 11%
  const shipping = items.length > 0 ? 50000 : 0
  const total = subtotal + tax + shipping

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    })
  }

  const validateShipping = () => {
    const required = ['fullName', 'phone', 'email', 'address', 'city', 'province', 'postalCode']
    for (const field of required) {
      if (!shippingInfo[field as keyof ShippingInfo]) {
        toast.error(`Please fill in ${field}`)
        return false
      }
    }
    
    if (!shippingInfo.email.includes('@')) {
      toast.error('Please enter a valid email')
      return false
    }
    
    if (shippingInfo.phone.length < 10) {
      toast.error('Please enter a valid phone number')
      return false
    }
    
    return true
  }

  const handleContinueToPayment = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      router.push('/cart')
      return
    }
    
    if (validateShipping()) {
      setStep('payment')
    }
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    
    try {
      // Create customer
      const customerResponse = await fetch('http://localhost:8005/api/customers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: shippingInfo.fullName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.province} ${shippingInfo.postalCode}`
        })
      })
      
      const customer = await customerResponse.json()
      
      // Create order
      const orderData = {
        customer_id: customer.id,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        tax,
        shipping,
        total,
        status: 'pending',
        payment_method: paymentMethod,
        shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.province} ${shippingInfo.postalCode}`,
        notes: shippingInfo.notes
      }
      
      const orderResponse = await fetch('http://localhost:8005/api/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      if (orderResponse.ok) {
        const order = await orderResponse.json()
        setOrderNumber(`ORD-${order.id.toString().padStart(6, '0')}`)
        setStep('confirmation')
        clearCart()
        toast.success('Order placed successfully!')
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Failed to place order:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBagIcon className="w-24 h-24 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-400 mb-4">Your cart is empty</h2>
        <button
          onClick={() => router.push('/products')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-blue-600' : step === 'payment' || step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'shipping' ? 'bg-blue-600 text-white' : step === 'payment' || step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {step === 'payment' || step === 'confirmation' ? '✓' : '1'}
              </div>
              <span className="font-semibold">Shipping</span>
            </div>
            
            <div className={`w-16 h-1 ${step === 'payment' || step === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-blue-600' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'payment' ? 'bg-blue-600 text-white' : step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {step === 'confirmation' ? '✓' : '2'}
              </div>
              <span className="font-semibold">Payment</span>
            </div>
            
            <div className={`w-16 h-1 ${step === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center gap-2 ${step === 'confirmation' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'confirmation' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="font-semibold">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Shipping Information */}
            {step === 'shipping' && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <TruckIcon className="w-8 h-8 text-blue-600" />
                  <h2 className="text-2xl font-bold">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 outline-none"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 outline-none"
                      placeholder="081234567890"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 outline-none"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-medium mb-2">Address *</label>
                    <textarea
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 outline-none"
                      placeholder="Street address, Building number, etc."
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 outline-none"
                      placeholder="Jakarta"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Province *</label>
                    <input
                      type="text"
                      name="province"
                      value={shippingInfo.province}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 outline-none"
                      placeholder="DKI Jakarta"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-medium mb-2">Postal Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 outline-none"
                      placeholder="12345"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-medium mb-2">Order Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={shippingInfo.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 outline-none"
                      placeholder="Special instructions for delivery..."
                    />
                  </div>
                </div>

                <button
                  onClick={handleContinueToPayment}
                  className="w-full mt-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Payment Method */}
            {step === 'payment' && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCardIcon className="w-8 h-8 text-blue-600" />
                  <h2 className="text-2xl font-bold">Payment Method</h2>
                </div>

                <div className="space-y-4 mb-8">
                  <label className={`flex items-center gap-4 p-6 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg">💵 Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when you receive the goods</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-6 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg">💳 Credit/Debit Card</div>
                      <div className="text-sm text-gray-600">Visa, Mastercard, JCB</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-6 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'transfer' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      checked={paymentMethod === 'transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg">🏦 Bank Transfer</div>
                      <div className="text-sm text-gray-600">BCA, Mandiri, BNI, BRI</div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('shipping')}
                    className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}

            {/* Order Confirmation */}
            {step === 'confirmation' && (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-5xl">✅</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Order Placed Successfully!</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Your order number is <span className="font-bold text-blue-600">{orderNumber}</span>
                </p>
                <div className="bg-blue-50 p-6 rounded-lg mb-8">
                  <p className="text-gray-700 mb-2">We'll send you an email confirmation to:</p>
                  <p className="font-semibold text-lg">{shippingInfo.email}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push('/products')}
                    className="flex-1 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center text-2xl">
                      📦
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-semibold">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (11%)</span>
                  <span className="font-semibold">Rp {tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Rp {shipping.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t-2">
                <span className="text-xl font-bold">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
