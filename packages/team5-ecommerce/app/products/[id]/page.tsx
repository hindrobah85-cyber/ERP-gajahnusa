'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore, type Product } from '@/store/cartStore'
import { ShoppingCartIcon, TruckIcon, ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCartStore()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  useEffect(() => {
    if (params.id) {
      loadProduct(Number(params.id))
    }
  }, [params.id])

  const loadProduct = async (id: number) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8005/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        loadRelatedProducts(data.category, id)
      } else {
        toast.error('Product not found')
        router.push('/products')
      }
    } catch (error) {
      console.error('Failed to load product:', error)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const loadRelatedProducts = async (category: string, excludeId: number) => {
    try {
      const response = await fetch(`http://localhost:8005/api/products?category=${category}`)
      const data = await response.json()
      setRelatedProducts(data.filter((p: Product) => p.id !== excludeId).slice(0, 4))
    } catch (error) {
      console.error('Failed to load related products:', error)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem(product)
      }
      toast.success(`${quantity}x ${product.name} added to cart!`)
    }
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/cart')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-2xl text-gray-400 mb-4">Product not found</p>
        <Link href="/products" className="text-blue-600 hover:underline">
          Back to Products
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link>
          <span className="text-gray-400">/</span>
          <Link href="/products" className="text-gray-600 hover:text-blue-600">Products</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium capitalize">{product.category}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>

        {/* Back Button */}
        <Link 
          href="/products"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Products
        </Link>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg p-8 mb-12">
          {/* Product Image */}
          <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-9xl">
            📦
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium capitalize">
                {product.category}
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-4 mb-6">
              <div className="text-4xl font-bold text-blue-600">
                Rp {product.price.toLocaleString('id-ID')}
              </div>
              <div className="text-gray-600">per {product.unit || 'unit'}</div>
            </div>

            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                product.stock > 50 ? 'bg-green-100 text-green-700' : 
                product.stock > 0 ? 'bg-orange-100 text-orange-700' : 
                'bg-red-100 text-red-700'
              }`}>
                <span className="font-semibold">Stock: {product.stock} {product.unit || 'units'}</span>
                {product.stock > 0 ? '✅ Available' : '❌ Out of Stock'}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description || 'High quality building material suitable for construction projects. Premium grade with guaranteed durability and strength.'}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border-2 rounded-lg hover:bg-gray-100 font-semibold"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                  className="w-20 text-center border-2 rounded-lg py-2 font-semibold"
                  min="1"
                  max={product.stock}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 border-2 rounded-lg hover:bg-gray-100 font-semibold"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
                <span className="text-gray-600">Max: {product.stock}</span>
              </div>
            </div>

            {/* Subtotal */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Subtotal ({quantity} items):</span>
                <span className="text-2xl font-bold text-blue-600">
                  Rp {(product.price * quantity).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <TruckIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Fast Delivery</p>
                <p className="text-xs text-gray-600">Same day</p>
              </div>
              <div className="text-center">
                <ShieldCheckIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Quality Guaranteed</p>
                <p className="text-xs text-gray-600">100% Authentic</p>
              </div>
              <div className="text-center">
                <span className="text-4xl mb-2 block">💰</span>
                <p className="text-sm font-medium">Best Price</p>
                <p className="text-xs text-gray-600">Competitive</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition"
                >
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center text-6xl">
                    📦
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                    <div className="text-xl font-bold text-blue-600">
                      Rp {relatedProduct.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
