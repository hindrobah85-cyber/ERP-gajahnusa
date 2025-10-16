import { create } from 'zustand'

export interface POSProduct {
  id: number
  code: string
  name: string
  category: string
  price: number
  stock: number
  unit: string
}

export interface POSCartItem extends POSProduct {
  quantity: number
}

export interface POSTransaction {
  id: string
  storeId: number
  storeName: string
  items: POSCartItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'card' | 'transfer'
  cashReceived?: number
  change?: number
  cashier: string
  timestamp: string
}

interface POSState {
  cart: POSCartItem[]
  currentTransaction: POSTransaction | null
  transactions: POSTransaction[]
  
  addToCart: (product: POSProduct, quantity?: number) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  
  calculateSubtotal: () => number
  calculateTax: () => number
  calculateTotal: () => number
  
  completeTransaction: (paymentMethod: string, cashReceived?: number) => POSTransaction
  getTransactionHistory: () => POSTransaction[]
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  currentTransaction: null,
  transactions: [],

  addToCart: (product, quantity = 1) => {
    const cart = get().cart
    const existingItem = cart.find(item => item.id === product.id)

    if (existingItem) {
      set({
        cart: cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, item.stock) }
            : item
        )
      })
    } else {
      set({
        cart: [...cart, { ...product, quantity: Math.min(quantity, product.stock) }]
      })
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter(item => item.id !== productId) })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
      return
    }

    set({
      cart: get().cart.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    })
  },

  clearCart: () => {
    set({ cart: [], currentTransaction: null })
  },

  getTotal: () => {
    return get().cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  },

  calculateSubtotal: () => {
    return get().cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  },

  calculateTax: () => {
    return get().calculateSubtotal() * 0.11 // 11% PPN
  },

  calculateTotal: () => {
    return get().calculateSubtotal() + get().calculateTax()
  },

  completeTransaction: (paymentMethod, cashReceived) => {
    const cart = get().cart
    const subtotal = get().calculateSubtotal()
    const tax = get().calculateTax()
    const total = get().calculateTotal()

    const transaction: POSTransaction = {
      id: `TRX-${Date.now()}`,
      storeId: 1, // Will be set from store context
      storeName: 'Store Name', // Will be set from store context
      items: [...cart],
      subtotal,
      tax,
      discount: 0,
      total,
      paymentMethod: paymentMethod as any,
      cashReceived,
      change: cashReceived ? cashReceived - total : 0,
      cashier: 'Cashier Name', // Will be set from auth context
      timestamp: new Date().toISOString()
    }

    set({
      currentTransaction: transaction,
      transactions: [...get().transactions, transaction],
      cart: []
    })

    return transaction
  },

  getTransactionHistory: () => {
    return get().transactions
  }
}))
