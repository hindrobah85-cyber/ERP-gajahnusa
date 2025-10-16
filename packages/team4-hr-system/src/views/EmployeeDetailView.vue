<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { employeeAPI } from '@/services/api'

const route = useRoute()
const router = useRouter()

const employee = ref({
  id: 0,
  employeeId: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  joinDate: '',
  status: 'Active',
  salary: 0
})

const loading = ref(true)
const editing = ref(false)

onMounted(async () => {
  const id = route.params.id
  if (id === 'new') {
    editing.value = true
    loading.value = false
    return
  }

  try {
    const response = await employeeAPI.getById(Number(id))
    employee.value = response.data
  } catch (error) {
    console.error('Failed to load employee:', error)
    alert('Failed to load employee details')
  } finally {
    loading.value = false
  }
})

const saveEmployee = async () => {
  try {
    if (route.params.id === 'new') {
      await employeeAPI.create(employee.value)
      alert('Employee created successfully!')
    } else {
      await employeeAPI.update(employee.value.id, employee.value)
      alert('Employee updated successfully!')
    }
    router.push('/employees')
  } catch (error) {
    alert('Failed to save employee!')
  }
}

const deleteEmployee = async () => {
  if (!confirm('Are you sure you want to delete this employee?')) return
  
  try {
    await employeeAPI.delete(employee.value.id)
    alert('Employee deleted successfully!')
    router.push('/employees')
  } catch (error) {
    alert('Failed to delete employee!')
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount)
}
</script>

<template>
  <div class="employee-detail">
    <div class="page-header">
      <div class="header-left">
        <button @click="router.push('/employees')" class="btn-back">
          ← Back
        </button>
        <h1>{{ route.params.id === 'new' ? 'Add New Employee' : 'Employee Details' }}</h1>
      </div>
      <div class="header-actions">
        <button v-if="!editing && route.params.id !== 'new'" @click="editing = true" class="btn-secondary">
          ✏️ Edit
        </button>
        <button v-if="editing" @click="saveEmployee" class="btn-primary">
          💾 Save
        </button>
        <button v-if="!editing && route.params.id !== 'new'" @click="deleteEmployee" class="btn-danger">
          🗑️ Delete
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading employee details...</div>

    <div v-else class="content-grid">
      <!-- Personal Information -->
      <div class="card">
        <h2>Personal Information</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Employee ID *</label>
            <input 
              v-model="employee.employeeId" 
              :disabled="!editing"
              type="text" 
              class="form-input" 
            />
          </div>

          <div class="form-group">
            <label>Full Name *</label>
            <input 
              v-model="employee.name" 
              :disabled="!editing"
              type="text" 
              class="form-input" 
            />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input 
              v-model="employee.email" 
              :disabled="!editing"
              type="email" 
              class="form-input" 
            />
          </div>

          <div class="form-group">
            <label>Phone</label>
            <input 
              v-model="employee.phone" 
              :disabled="!editing"
              type="text" 
              class="form-input" 
            />
          </div>
        </div>
      </div>

      <!-- Employment Details -->
      <div class="card">
        <h2>Employment Details</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Department *</label>
            <select 
              v-model="employee.department" 
              :disabled="!editing"
              class="form-input"
            >
              <option value="">Select Department</option>
              <option value="Sales">Sales</option>
              <option value="Logistics">Logistics</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div class="form-group">
            <label>Position *</label>
            <input 
              v-model="employee.position" 
              :disabled="!editing"
              type="text" 
              class="form-input" 
            />
          </div>

          <div class="form-group">
            <label>Join Date *</label>
            <input 
              v-model="employee.joinDate" 
              :disabled="!editing"
              type="date" 
              class="form-input" 
            />
          </div>

          <div class="form-group">
            <label>Status</label>
            <select 
              v-model="employee.status" 
              :disabled="!editing"
              class="form-input"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Salary Information -->
      <div class="card">
        <h2>Salary Information</h2>
        
        <div class="form-group">
          <label>Monthly Salary *</label>
          <input 
            v-model.number="employee.salary" 
            :disabled="!editing"
            type="number" 
            class="form-input" 
            placeholder="0"
          />
          <p v-if="!editing" class="salary-display">
            {{ formatCurrency(employee.salary) }}
          </p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div v-if="route.params.id !== 'new'" class="card">
        <h2>Quick Stats</h2>
        
        <div class="stats-list">
          <div class="stat-row">
            <span class="stat-label">Working Days</span>
            <span class="stat-value">{{ Math.floor(Math.random() * 300) + 100 }} days</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Attendance Rate</span>
            <span class="stat-value">{{ Math.floor(Math.random() * 20) + 80 }}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Leave Balance</span>
            <span class="stat-value">{{ Math.floor(Math.random() * 10) + 5 }} days</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Performance Rating</span>
            <span class="stat-value">{{ (Math.random() * 2 + 3).toFixed(1) }} / 5</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employee-detail {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.btn-back {
  padding: 10px 20px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #667eea;
  color: white;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  padding: 12px 24px;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-danger {
  padding: 12px 24px;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-danger:hover {
  background: #e53e3e;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-input {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
}

.form-input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.form-input:focus:not(:disabled) {
  outline: none;
  border-color: #667eea;
}

.salary-display {
  margin-top: 5px;
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-label {
  font-weight: 600;
  color: #666;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>