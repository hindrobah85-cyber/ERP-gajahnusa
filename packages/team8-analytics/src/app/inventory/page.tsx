'use client';

import { Package, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';

const inventoryData = [
  { id: 1, name: 'Semen Gresik 50kg', category: 'Semen', stock: 850, min: 500, max: 1000, status: 'good', price: 65000 },
  { id: 2, name: 'Bata Merah Press', category: 'Bata', stock: 320, min: 400, max: 800, status: 'warning', price: 800 },
  { id: 3, name: 'Pasir Beton per m³', category: 'Pasir', stock: 1200, min: 800, max: 1500, status: 'good', price: 250000 },
  { id: 4, name: 'Besi Beton 10mm', category: 'Besi', stock: 180, min: 200, max: 500, status: 'critical', price: 12500 },
  { id: 5, name: 'Cat Tembok Putih 25kg', category: 'Cat', stock: 450, min: 300, max: 600, status: 'good', price: 385000 },
  { id: 6, name: 'Keramik 40x40', category: 'Keramik', stock: 280, min: 350, max: 700, status: 'warning', price: 55000 },
  { id: 7, name: 'Pipa PVC 3 inch', category: 'Pipa', stock: 520, min: 400, max: 800, status: 'good', price: 42000 },
  { id: 8, name: 'Semen Tiga Roda 40kg', category: 'Semen', stock: 150, min: 300, max: 600, status: 'critical', price: 54000 },
];

export default function InventoryPage() {
  const totalStock = inventoryData.reduce((sum, item) => sum + item.stock, 0);
  const lowStockItems = inventoryData.filter(item => item.status === 'warning' || item.status === 'critical').length;
  const totalValue = inventoryData.reduce((sum, item) => sum + (item.stock * item.price), 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <p className="text-gray-600 mt-2">Real-time inventory tracking and stock alerts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-10 h-10 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{totalStock}</div>
          <div className="text-sm text-gray-600 mt-1">Total Stock Units</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-10 h-10 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{lowStockItems}</div>
          <div className="text-sm text-gray-600 mt-1">Low Stock Alerts</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-10 h-10 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{inventoryData.length}</div>
          <div className="text-sm text-gray-600 mt-1">Product Categories</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="w-10 h-10 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">Rp {(totalValue / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-gray-600 mt-1">Total Inventory Value</div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Stock Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Current Stock</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Min Stock</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Stock Level</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((item) => {
                const stockPercentage = (item.stock / item.max) * 100;
                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-gray-600">{item.category}</td>
                    <td className="text-right py-3 px-4">{item.stock}</td>
                    <td className="text-right py-3 px-4 text-gray-600">{item.min}</td>
                    <td className="text-right py-3 px-4">Rp {item.price.toLocaleString()}</td>
                    <td className="text-center py-3 px-4">
                      {item.status === 'good' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">Good</span>
                      )}
                      {item.status === 'warning' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">Low</span>
                      )}
                      {item.status === 'critical' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm">Critical</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.status === 'good' ? 'bg-green-500' :
                            item.status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${stockPercentage}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Generate Restock Report
        </button>
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Export to Excel
        </button>
      </div>
    </div>
  );
}
