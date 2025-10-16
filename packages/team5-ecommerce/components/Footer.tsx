import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">🏢 GAJAH NUSA</h3>
            <p className="text-sm mb-4">
              Your trusted partner for quality building materials since 2010.
              Serving construction needs across Indonesia.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">📘</a>
              <a href="#" className="hover:text-white">📷</a>
              <a href="#" className="hover:text-white">🐦</a>
              <a href="#" className="hover:text-white">📍</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/stores" className="hover:text-white">Store Locations</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link href="/shipping" className="hover:text-white">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-white">Returns & Refunds</Link></li>
              <li><Link href="/track" className="hover:text-white">Track Order</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Jl. Raya Industri No. 123<br />Jakarta 12345, Indonesia</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>0800-GAJAH-NUSA</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span>
                <span>info@gajahnusa.com</span>
              </li>
              <li className="flex items-center gap-2">
                <span>⏰</span>
                <span>Mon-Sat: 8:00 - 18:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; 2025 Gajah Nusa. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-white">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
