'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, TrendingUp, Users, Package, DollarSign, FileText, Settings } from 'lucide-react';

const menuItems = [
  { path: '/', icon: BarChart3, label: 'Dashboard' },
  { path: '/sales', icon: DollarSign, label: 'Sales Analytics' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/forecasting', icon: TrendingUp, label: 'Forecasting' },
  { path: '/reports', icon: FileText, label: 'Custom Reports' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white flex flex-col">
      <div className="p-6 border-b border-indigo-700">
        <h1 className="text-2xl font-bold">📊 Analytics</h1>
        <p className="text-sm text-indigo-300 mt-1">Business Intelligence</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-indigo-700">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium">Admin User</div>
            <div className="text-xs text-indigo-300">BI Analyst</div>
          </div>
        </div>
      </div>
    </div>
  );
}
