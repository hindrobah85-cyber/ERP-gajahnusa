<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { employeeAPI } from '@/services/api'

interface Employee {
  id: number
  employeeId: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  joinDate: string
  status: string
}

const router = useRouter()
const employees = ref<Employee[]>([])
const loading = ref(true)
const searchQuery = ref('')
const selectedDepartment = ref('')

const departments = ['Sales', 'Logistics', 'Finance', 'HR', 'IT', 'Operations']

const filteredEmployees = computed(() => {
  return employees.value.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         emp.employeeId.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesDepartment = !selectedDepartment.value || emp.department === selectedDepartment.value
    return matchesSearch && matchesDepartment
  })
})

onMounted(async () => {
  try {
    const response = await employeeAPI.getAll()
    employees.value = response.data
  } catch (error) {
    console.error('Failed to load employees:', error)
  } finally {
    loading.value = false
  }
})

const viewEmployee = (id: number) => {
  router.push(`/employees/${id}`)
}

const addEmployee = () => {
  router.push('/employees/new')
}
</script>

<script lang="ts">
import { computed } from 'vue'
export default {
  name: 'EmployeesView'
}
</script>

<template>
  <div class="employees">
    <div class="page-header">
      <h1>Employees</h1>
      <button @click="addEmployee" class="btn-primary">
        <span>➕</span> Add Employee
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or ID..."
          class="search-input"
        />
      </div>
      <select v-model="selectedDepartment" class="filter-select">
        <option value="">All Departments</option>
        <option v-for="dept in departments" :key="dept" :value="dept">
          {{ dept }}
        </option>
      </select>
    </div>

    <!-- Employee Table -->
    <div class="card">
      <div v-if="loading" class="loading">Loading employees...</div>
      
      <div v-else>
        <table v-if="filteredEmployees.length > 0">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in filteredEmployees" :key="emp.id">
              <td>{{ emp.employeeId }}</td>
              <td>
                <div class="employee-name">
                  <div class="avatar">{{ emp.name.charAt(0) }}</div>
                  <strong>{{ emp.name }}</strong>
                </div>
              </td>
              <td>{{ emp.email }}</td>
              <td>{{ emp.department }}</td>
              <td>{{ emp.position }}</td>
              <td>{{ emp.joinDate }}</td>
              <td>
                <span :class="['status-badge', emp.status.toLowerCase()]">
                  {{ emp.status }}
                </span>
              </td>
              <td>
                <button @click="viewEmployee(emp.id)" class="btn-action">
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="no-data">
          <p>No employees found</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employees {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.filter-select {
  padding: 12px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  min-width: 200px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
}

th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
  white-space: nowrap;
}

td {
  padding: 16px;
  border-top: 1px solid #e9ecef;
  color: #666;
}

.employee-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.btn-action {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-action:hover {
  background: #5568d3;
}

.no-data {
  text-align: center;
  padding: 50px;
  color: #999;
}
</style>