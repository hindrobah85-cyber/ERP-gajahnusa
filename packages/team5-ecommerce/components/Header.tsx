'use client'

import Link from 'next/link'
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '@/store/cartStore'

export default function Header() {
  const { items } = useCartStore()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center py-3 border-b border-white/20">
          <div className="text-sm">
            📞 Customer Service: 0800-GAJAH-NUSA
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/about" className="hover:underline">About Us</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/help" className="hover:underline">Help</Link>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-3xl font-bold">
              🏢 GAJAH NUSA
            </div>
            <div className="text-xs">
              Building Materials
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for cement, bricks, steel..."
                className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-700 px-6 py-2 rounded-md">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <Link href="/orders" className="flex flex-col items-center hover:opacity-80">
              <UserIcon className="w-6 h-6" />
              <span className="text-xs">Orders</span>
            </Link>

            <Link href="/cart" className="flex flex-col items-center hover:opacity-80 relative">
              <ShoppingCartIcon className="w-6 h-6" />
              <span className="text-xs">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-6 py-3 text-sm border-t border-white/20">
          <Link href="/category/cement" className="hover:underline">Cement</Link>
          <Link href="/category/bricks" className="hover:underline">Bricks & Blocks</Link>
          <Link href="/category/steel" className="hover:underline">Steel & Iron</Link>
          <Link href="/category/tiles" className="hover:underline">Tiles</Link>
          <Link href="/category/paint" className="hover:underline">Paint</Link>
          <Link href="/category/tools" className="hover:underline">Tools</Link>
          <Link href="/category/electrical" className="hover:underline">Electrical</Link>
          <Link href="/category/plumbing" className="hover:underline">Plumbing</Link>
          <Link href="/deals" className="text-yellow-300 font-semibold hover:underline">⚡ Deals</Link>
        </nav>
      </div>
    </header>
  )
}
