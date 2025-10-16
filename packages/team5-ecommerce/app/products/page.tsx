'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCartStore, type Product } from '@/store/cartStore'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'cement', name: 'Cement' },
  { id: 'bricks', name: 'Bricks' },
  { id: 'steel', name: 'Steel' },
  { id: 'tiles', name: 'Tiles' },
  { id: 'paint', name: 'Paint' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'materials', name: 'Materials' },
]

const sortOptions = [
  { id: 'name', name: 'Name (A-Z)' },
  { id: 'price-asc', name: 'Price (Low to High)' },
  { id: 'price-desc', name: 'Price (High to Low)' },
  { id: 'stock', name: 'Stock (High to Low)' },
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const { addItem } = useCartStore()
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setSelectedCategory(category)
    }
  }, [searchParams])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8005/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products
    .filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'stock':
          return b.stock - a.stock
        default:
          return 0
      }
    })

  const handleAddToCart = (product: Product) => {
    addItem(product)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Building Materials Catalog</h1>
        <p className="text-gray-600">Browse our complete selection of quality construction materials</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Category Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-gray-600">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-400 mb-2">No products found</p>
          <p className="text-gray-600">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition">
              <Link href={`/products/${product.id}`}>
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center text-6xl cursor-pointer hover:opacity-80 transition">
                  📦
                </div>
              </Link>
              
              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 cursor-pointer">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description || 'Quality building material'}
                </p>

                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      Rp {product.price.toLocaleString('id-ID')}
                    </div>
                    <div className="text-xs text-gray-500">per {product.unit || 'unit'}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${product.stock > 50 ? 'text-green-600' : 'text-orange-600'}`}>
                      Stock: {product.stock}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{product.category}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <Link
                    href={`/products/${product.id}`}
                    className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More (if needed) */}
      {filteredProducts.length > 0 && filteredProducts.length < products.length && (
        <div className="text-center mt-8">
          <button className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">
            Load More Products
          </button>
        </div>
      )}
    </div>
  )
}
