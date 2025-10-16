import React, { useState } from 'react'
import { UsersIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useStoreStore } from '../store/storeStore'

interface Employee {
  id: number
  employeeId: string
  name: string
  position: string
  department: string
  phone: string
  email: string
  joinDate: string
  status: 'active' | 'inactive'
  photo: string
}

const Employees: React.FC = () => {
  const { currentStore, stores } = useStoreStore()
  const store = stores.find(s => s.id === currentStore)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')

  const employees: Employee[] = [
    {
      id: 1,
      employeeId: 'EMP-001',
      name: 'Budi Santoso',
      position: 'Store Manager',
      department: 'Management',
      phone: '0812-3456-7890',
      email: 'budi.santoso@gajahnusa.com',
      joinDate: '2023-01-15',
      status: 'active',
      photo: '👨‍💼'
    },
    {
      id: 2,
      employeeId: 'EMP-002',
      name: 'Siti Rahayu',
      position: 'Cashier',
      department: 'Sales',
      phone: '0813-4567-8901',
      email: 'siti.rahayu@gajahnusa.com',
      joinDate: '2023-03-20',
      status: 'active',
      photo: '👩‍💼'
    },
    {
      id: 3,
      employeeId: 'EMP-003',
      name: 'Ahmad Yani',
      position: 'Warehouse Staff',
      department: 'Warehouse',
      phone: '0814-5678-9012',
      email: 'ahmad.yani@gajahnusa.com',
      joinDate: '2023-05-10',
      status: 'active',
      photo: '👨‍🔧'
    },
    {
      id: 4,
      employeeId: 'EMP-004',
      name: 'Dewi Kusuma',
      position: 'Sales Associate',
      department: 'Sales',
      phone: '0815-6789-0123',
      email: 'dewi.kusuma@gajahnusa.com',
      joinDate: '2023-07-01',
      status: 'active',
      photo: '👩'
    },
    {
      id: 5,
      employeeId: 'EMP-005',
      name: 'Eko Prasetyo',
      position: 'Delivery Driver',
      department: 'Logistics',
      phone: '0816-7890-1234',
      email: 'eko.prasetyo@gajahnusa.com',
      joinDate: '2024-01-05',
      status: 'active',
      photo: '👨‍✈️'
    },
    {
      id: 6,
      employeeId: 'EMP-006',
      name: 'Rina Wijaya',
      position: 'Cashier',
      department: 'Sales',
      phone: '0817-8901-2345',
      email: 'rina.wijaya@gajahnusa.com',
      joinDate: '2024-03-15',
      status: 'active',
      photo: '👩‍💼'
    }
  ]

  const departments = ['all', 'Management', 'Sales', 'Warehouse', 'Logistics']
  
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment
    return matchesSearch && matchesDepartment
  })

  const activeEmployees = employees.filter(e => e.status === 'active').length

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">👥 Employees</h1>
        <p className="text-gray-600">{store?.name} - Staff Management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold mb-1">{employees.length}</div>
          <div className="text-blue-100">Total Employees</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold mb-1">{activeEmployees}</div>
          <div className="text-green-100">Active</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold mb-1">{departments.length - 1}</div>
          <div className="text-purple-100">Departments</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold mb-1">8</div>
          <div className="text-orange-100">On Duty Today</div>
        </div>
      </div>

      {/* Filters & Add Button */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
          >
            <option value="all">All Departments</option>
            {departments.slice(1).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition whitespace-nowrap">
            <PlusIcon className="w-5 h-5" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => (
          <div key={employee.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{employee.photo}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{employee.name}</h3>
                  <p className="text-sm text-blue-100">{employee.position}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  employee.status === 'active' 
                    ? 'bg-green-400 text-green-900' 
                    : 'bg-red-400 text-red-900'
                }`}>
                  {employee.status}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">ID:</span>
                  <span className="font-mono font-semibold">{employee.employeeId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Department:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {employee.department}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Phone:</span>
                  <span className="font-medium">{employee.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Email:</span>
                  <span className="text-sm text-blue-600">{employee.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Join Date:</span>
                  <span className="font-medium">{employee.joinDate}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                  View Details
                </button>
                <button className="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm font-semibold">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Employees
