'use client'import Image from "next/image";



import Link from 'next/link'export default function Home() {

import { useCartStore, type Product } from '@/store/cartStore'  return (

import toast from 'react-hot-toast'    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

const featuredProducts: Product[] = [        <Image

  { id: 1, name: 'Portland Cement 50kg', price: 85000, image: '/products/cement.jpg', category: 'cement', stock: 500 },          className="dark:invert"

  { id: 2, name: 'Red Brick (Per 1000)', price: 750000, image: '/products/brick.jpg', category: 'bricks', stock: 200 },          src="/next.svg"

  { id: 3, name: 'Steel Rebar 10mm (12m)', price: 125000, image: '/products/rebar.jpg', category: 'steel', stock: 1000 },          alt="Next.js logo"

  { id: 4, name: 'Ceramic Tiles 40x40cm', price: 45000, image: '/products/tiles.jpg', category: 'tiles', stock: 800 },          width={180}

  { id: 5, name: 'White Paint 20L', price: 350000, image: '/products/paint.jpg', category: 'paint', stock: 300 },          height={38}

  { id: 6, name: 'PVC Pipe 3 inch (4m)', price: 95000, image: '/products/pipe.jpg', category: 'plumbing', stock: 450 },          priority

  { id: 7, name: 'Sand (1 Cubic Meter)', price: 180000, image: '/products/sand.jpg', category: 'materials', stock: 100 },        />

  { id: 8, name: 'Gravel (1 Cubic Meter)', price: 220000, image: '/products/gravel.jpg', category: 'materials', stock: 150 },        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">

]          <li className="mb-2 tracking-[-.01em]">

            Get started by editing{" "}

const categories = [            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">

  { name: 'Cement', icon: '🏗️', link: '/category/cement' },              app/page.tsx

  { name: 'Bricks', icon: '🧱', link: '/category/bricks' },            </code>

  { name: 'Steel', icon: '⚙️', link: '/category/steel' },            .

  { name: 'Tiles', icon: '◻️', link: '/category/tiles' },          </li>

  { name: 'Paint', icon: '🎨', link: '/category/paint' },          <li className="tracking-[-.01em]">

  { name: 'Tools', icon: '🔨', link: '/category/tools' },            Save and see your changes instantly.

  { name: 'Electrical', icon: '💡', link: '/category/electrical' },          </li>

  { name: 'Plumbing', icon: '🚰', link: '/category/plumbing' },        </ol>

]

        <div className="flex gap-4 items-center flex-col sm:flex-row">

export default function HomePage() {          <a

  const { addItem } = useCartStore()            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"

            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"

  const handleAddToCart = (product: Product) => {            target="_blank"

    addItem(product)            rel="noopener noreferrer"

    toast.success(`${product.name} added to cart!`)          >

  }            <Image

              className="dark:invert"

  return (              src="/vercel.svg"

    <div className="bg-gray-50">              alt="Vercel logomark"

      {/* Hero Banner */}              width={20}

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">              height={20}

        <div className="container mx-auto px-4 text-center">            />

          <h1 className="text-5xl font-bold mb-4">            Deploy now

            Build Your Dreams with Quality Materials          </a>

          </h1>          <a

          <p className="text-xl mb-8">            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"

            Premium building materials delivered to your doorstep            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"

          </p>            target="_blank"

          <div className="flex gap-4 justify-center">            rel="noopener noreferrer"

            <Link           >

              href="/products"             Read our docs

              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"          </a>

            >        </div>

              Shop Now      </main>

            </Link>      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">

            <Link         <a

              href="/deals"           className="flex items-center gap-2 hover:underline hover:underline-offset-4"

              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600"          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"

            >          target="_blank"

              View Deals          rel="noopener noreferrer"

            </Link>        >

          </div>          <Image

        </div>            aria-hidden

      </section>            src="/file.svg"

            alt="File icon"

      {/* Categories */}            width={16}

      <section className="container mx-auto px-4 py-12">            height={16}

        <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>          />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">          Learn

          {categories.map((category) => (        </a>

            <Link        <a

              key={category.name}          className="flex items-center gap-2 hover:underline hover:underline-offset-4"

              href={category.link}          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"

              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"          target="_blank"

            >          rel="noopener noreferrer"

              <div className="text-4xl mb-2">{category.icon}</div>        >

              <div className="font-semibold text-sm">{category.name}</div>          <Image

            </Link>            aria-hidden

          ))}            src="/window.svg"

        </div>            alt="Window icon"

      </section>            width={16}

            height={16}

      {/* Featured Products */}          />

      <section className="container mx-auto px-4 py-12">          Examples

        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>        </a>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">        <a

          {featuredProducts.map((product) => (          className="flex items-center gap-2 hover:underline hover:underline-offset-4"

            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-xl transition">          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"

              <div className="aspect-square bg-gray-200 rounded-t-lg flex items-center justify-center text-6xl">          target="_blank"

                {categories.find(c => c.name.toLowerCase().includes(product.category))?.icon || '📦'}          rel="noopener noreferrer"

              </div>        >

              <div className="p-4">          <Image

                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>            aria-hidden

                <div className="flex justify-between items-center mb-3">            src="/globe.svg"

                  <span className="text-2xl font-bold text-blue-600">            alt="Globe icon"

                    Rp {product.price.toLocaleString('id-ID')}            width={16}

                  </span>            height={16}

                  <span className="text-sm text-gray-500">Stock: {product.stock}</span>          />

                </div>          Go to nextjs.org →

                <button        </a>

                  onClick={() => handleAddToCart(product)}      </footer>

                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"    </div>

                >  );

                  Add to Cart}

                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Same-day delivery available for Jakarta area</p>
            </div>
            <div>
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-bold text-lg mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">100% authentic products from trusted suppliers</p>
            </div>
            <div>
              <div className="text-5xl mb-4">💰</div>
              <h3 className="font-bold text-lg mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive wholesale and retail pricing</p>
            </div>
            <div>
              <div className="text-5xl mb-4">📞</div>
              <h3 className="font-bold text-lg mb-2">24/7 Support</h3>
              <p className="text-gray-600">Customer service always ready to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Building?</h2>
          <p className="text-xl mb-8">Join thousands of satisfied customers</p>
          <Link 
            href="/register" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Create Account
          </Link>
        </div>
      </section>
    </div>
  )
}
