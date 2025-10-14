import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GajahNusaLogo } from '../components/GajahNusaLogo';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-600 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <GajahNusaLogo size={40} showText={true} />
            
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                <span>Selamat datang, </span>
                <span className="font-semibold">{user?.name || user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center p-3 rounded-lg bg-green-100 text-green-800 font-medium">
                  <span className="mr-3">📊</span>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <span className="mr-3">👥</span>
                  Pelanggan
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <span className="mr-3">📦</span>
                  Pesanan
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <span className="mr-3">💰</span>
                  Pembayaran
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <span className="mr-3">🚚</span>
                  Pengiriman
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <span className="mr-3">🔍</span>
                  Deteksi Fraud
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <span className="mr-3">📈</span>
                  Laporan
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Ringkasan aktivitas ERP GAJAH NUSA</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📦</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pesanan Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900">56</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendapatan Bulan Ini</p>
                  <p className="text-2xl font-bold text-gray-900">Rp 45.2M</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">⚠️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Deteksi Fraud</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pesanan Terbaru</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order #{1000 + item}</p>
                        <p className="text-sm text-gray-500">Customer {item}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Rp {(Math.random() * 5000000).toFixed(0)}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Diproses
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Status Sistem</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Backend</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🟢 Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🟢 Terhubung
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ML Engine</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🟢 Aktif
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mobile App Sync</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      🟡 Sinkronisasi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
