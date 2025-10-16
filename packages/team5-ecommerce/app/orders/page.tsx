'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBagIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface OrderItem {
  product_id: number
  product_name?: string
  quantity: number
  price: number
}

interface Order {
  id: number
  order_number: string
  customer_id: number
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_method: string
  shipping_address: string
  notes?: string
  created_at: string
  updated_at: string
}

const statusConfig = {
  pending: { icon: ClockIcon, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  confirmed: { icon: CheckCircleIcon, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Confirmed' },
  processing: { icon: TruckIcon, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Processing' },
  shipped: { icon: TruckIcon, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Shipped' },
  delivered: { icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  cancelled: { icon: XCircleIcon, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' }
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)

  useEffect(() => {
    const savedEmail = localStorage.getItem('customerEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setSearchEmail(savedEmail)
      loadOrders(savedEmail)
    } else {
      setLoading(false)
    }
  }, [])

  const loadOrders = async (customerEmail: string) => {
    setLoading(true)
    try {
      // First, get customer by email
      const customerResponse = await fetch(`http://localhost:8005/api/customers/email/${customerEmail}`)
      if (customerResponse.ok) {
        const customer = await customerResponse.json()
        
        // Then get orders for this customer
        const ordersResponse = await fetch(`http://localhost:8005/api/orders/customer/${customer.id}`)
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          setOrders(ordersData.sort((a: Order, b: Order) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ))
          localStorage.setItem('customerEmail', customerEmail)
          setEmail(customerEmail)
        }
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchEmail) {
      loadOrders(searchEmail)
    }
  }

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBagIcon className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold">My Orders</h1>
        </div>

        {/* Email Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Enter your email to track orders"
              className="flex-1 px-4 py-3 border-2 rounded-lg focus:border-blue-600 outline-none"
              required
            />
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Track Orders
            </button>
          </form>
          {email && (
            <p className="mt-3 text-sm text-gray-600">
              Showing orders for: <span className="font-semibold">{email}</span>
            </p>
          )}
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <ShoppingBagIcon className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">
              {email ? 'You haven\'t placed any orders yet' : 'Enter your email to track your orders'}
            </p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon
              const isExpanded = expandedOrder === order.id
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          Order #{order.order_number || `ORD-${order.id.toString().padStart(6, '0')}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusConfig[order.status].bg}`}>
                        <StatusIcon className={`w-6 h-6 ${statusConfig[order.status].color}`} />
                        <span className={`font-semibold ${statusConfig[order.status].color}`}>
                          {statusConfig[order.status].label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                        <p className="font-semibold capitalize">
                          {order.payment_method === 'cash' ? '💵 Cash on Delivery' : 
                           order.payment_method === 'card' ? '💳 Credit/Debit Card' : 
                           '🏦 Bank Transfer'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Items</p>
                        <p className="font-semibold">{order.items.length} item(s)</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-blue-600">
                          Rp {order.total.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Shipping Address</p>
                      <p className="font-medium">{order.shipping_address}</p>
                    </div>

                    {/* Toggle Details Button */}
                    <button
                      onClick={() => toggleOrderDetails(order.id)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      {isExpanded ? '▲ Hide Details' : '▼ Show Details'}
                    </button>

                    {/* Order Details (Expandable) */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-bold mb-4">Order Items</h4>
                        <div className="space-y-3 mb-6">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center text-3xl">
                                📦
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold">{item.product_name || `Product #${item.product_id}`}</p>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">Rp {item.price.toLocaleString('id-ID')}</p>
                                <p className="text-sm text-gray-600">per unit</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-blue-600">
                                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                </p>
                                <p className="text-sm text-gray-600">subtotal</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal</span>
                              <span className="font-semibold">Rp {order.subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax (11%)</span>
                              <span className="font-semibold">Rp {order.tax.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping</span>
                              <span className="font-semibold">Rp {order.shipping.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t-2">
                              <span className="text-xl font-bold">Total</span>
                              <span className="text-2xl font-bold text-blue-600">
                                Rp {order.total.toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-1">Order Notes</p>
                            <p className="p-3 bg-yellow-50 border border-yellow-200 rounded">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="p-6 bg-gray-50 border-t flex gap-4">
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => router.push('/products')}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                      >
                        Order Again
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button className="flex-1 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50">
                        Cancel Order
                      </button>
                    )}
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Print Invoice
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
