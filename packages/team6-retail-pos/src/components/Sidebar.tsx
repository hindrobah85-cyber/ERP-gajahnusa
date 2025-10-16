import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  CubeIcon, 
  BuildingStorefrontIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useStoreStore } from '../store/storeStore'

interface SidebarProps {
  onChangeStore: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onChangeStore }) => {
  const location = useLocation()
  const { currentStore, stores } = useStoreStore()
  
  const store = stores.find(s => s.id === currentStore)

  const menuItems = [
    { path: '/pos', icon: ShoppingCartIcon, label: 'POS Cashier', color: 'text-blue-600' },
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard', color: 'text-purple-600' },
    { path: '/warehouse', icon: CubeIcon, label: 'Local Warehouse', color: 'text-green-600' },
    { path: '/central-warehouse', icon: BuildingStorefrontIcon, label: 'Central Warehouse', color: 'text-orange-600' },
    { path: '/transactions', icon: DocumentTextIcon, label: 'Transactions', color: 'text-indigo-600' },
    { path: '/employees', icon: UsersIcon, label: 'Employees', color: 'text-pink-600' },
    { path: '/reports', icon: ChartBarIcon, label: 'Reports', color: 'text-red-600' },
  ]

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-purple-900 text-white flex flex-col">
      {/* Store Info */}
      <div className="p-6 border-b border-white/20">
        <div className="text-2xl font-bold mb-1">🏢 GAJAH NUSA</div>
        <div className="text-xs text-blue-200 mb-4">Retail POS System</div>
        
        {store && (
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{store.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm">{store.name}</div>
                <div className="text-xs text-blue-200">{store.code}</div>
              </div>
            </div>
            <button
              onClick={onChangeStore}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 bg-white/20 hover:bg-white/30 rounded-md text-xs font-medium transition"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Change Store
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive 
                  ? 'bg-white/20 border-l-4 border-white' 
                  : 'hover:bg-white/10 border-l-4 border-transparent'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-blue-200'}`} />
              <span className={`font-medium ${isActive ? 'text-white' : 'text-blue-100'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/20">
        <div className="text-xs text-blue-200">
          <div className="mb-1">Logged in as:</div>
          <div className="font-semibold text-white">Admin User</div>
          <div className="mt-2">{new Date().toLocaleDateString('id-ID')}</div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
