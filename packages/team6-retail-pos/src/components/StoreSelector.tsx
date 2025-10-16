import React from 'react'
import { useStoreStore } from '../store/storeStore'

interface StoreSelectorProps {
  onSelectStore: (storeId: number) => void
}

const StoreSelector: React.FC<StoreSelectorProps> = ({ onSelectStore }) => {
  const { stores } = useStoreStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏢 GAJAH NUSA RETAIL POS
          </h1>
          <p className="text-gray-600">Select your store to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => onSelectStore(store.id)}
              className="group relative bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 transform hover:scale-105"
            >
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  store.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {store.status === 'active' ? '✓ Active' : '✗ Inactive'}
                </span>
              </div>

              <div className="text-left">
                <div className="text-4xl mb-3">{store.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {store.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {store.address}
                </p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-gray-500 text-xs">Manager</div>
                    <div className="font-semibold text-gray-800">{store.manager}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-gray-500 text-xs">Phone</div>
                    <div className="font-semibold text-gray-800">{store.phone}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-blue-600 font-semibold group-hover:text-blue-800 transition-colors">
                Open Store POS →
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Multi-Store Retail Management System</p>
          <p className="mt-1">Each store operates independently with centralized integration</p>
        </div>
      </div>
    </div>
  )
}

export default StoreSelector
