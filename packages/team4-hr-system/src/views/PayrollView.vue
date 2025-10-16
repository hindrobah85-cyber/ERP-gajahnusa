<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { payrollAPI } from '@/services/api'

interface PayrollRecord {
  id: number
  employeeId: string
  employeeName: string
  month: string
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: string
}

const records = ref<PayrollRecord[]>([])
const loading = ref(false)
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const loadPayroll = async () => {
  loading.value = true
  try {
    const response = await payrollAPI.getAll()
    records.value = response.data.filter((r: PayrollRecord) => {
      return r.month === months[selectedMonth.value - 1] && r.year === selectedYear.value
    })
  } catch (error) {
    console.error('Failed to load payroll:', error)
  } finally {
    loading.value = false
  }
}

const generatePayroll = async () => {
  if (!confirm('Generate payroll for all employees?')) return
  
  try {
    await payrollAPI.generate(selectedMonth.value, selectedYear.value)
    alert('Payroll generated successfully!')
    loadPayroll()
  } catch (error) {
    alert('Failed to generate payroll!')
  }
}

const approvePayroll = async (id: number) => {
  try {
    await payrollAPI.approve(id)
    alert('Payroll approved!')
    loadPayroll()
  } catch (error) {
    alert('Failed to approve payroll!')
  }
}

const processPayment = async (id: number) => {
  if (!confirm('Process payment for this payroll?')) return
  
  try {
    await payrollAPI.process(id)
    alert('Payment processed!')
    loadPayroll()
  } catch (error) {
    alert('Failed to process payment!')
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount)
}

onMounted(() => {
  loadPayroll()
})
</script>

<template>
  <div class="payroll">
    <div class="page-header">
      <h1>Payroll Management</h1>
      <button @click="generatePayroll" class="btn-primary">
        💰 Generate Payroll
      </button>
    </div>

    <!-- Period Filter -->
    <div class="filters">
      <div class="period-selector">
        <select v-model="selectedMonth" @change="loadPayroll" class="filter-select">
          <option v-for="(month, index) in months" :key="month" :value="index + 1">
            {{ month }}
          </option>
        </select>
        <select v-model="selectedYear" @change="loadPayroll" class="filter-select">
          <option v-for="year in [2023, 2024, 2025]" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
    </div>

    <!-- Payroll Summary -->
    <div class="summary-cards">
      <div class="summary-card">
        <h3>Total Payroll</h3>
        <p class="amount">
          {{ formatCurrency(records.reduce((sum, r) => sum + r.netSalary, 0)) }}
        </p>
      </div>
      <div class="summary-card">
        <h3>Employees</h3>
        <p class="amount">{{ records.length }}</p>
      </div>
      <div class="summary-card">
        <h3>Pending Approval</h3>
        <p class="amount">
          {{ records.filter(r => r.status === 'pending').length }}
        </p>
      </div>
    </div>

    <!-- Payroll Table -->
    <div class="card">
      <div v-if="loading" class="loading">Loading payroll...</div>
      
      <div v-else>
        <table v-if="records.length > 0">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Basic Salary</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td>{{ record.employeeId }}</td>
              <td>{{ record.employeeName }}</td>
              <td>{{ formatCurrency(record.basicSalary) }}</td>
              <td>{{ formatCurrency(record.allowances) }}</td>
              <td>{{ formatCurrency(record.deductions) }}</td>
              <td><strong>{{ formatCurrency(record.netSalary) }}</strong></td>
              <td>
                <span :class="['status-badge', record.status]">
                  {{ record.status }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    v-if="record.status === 'pending'"
                    @click="approvePayroll(record.id)"
                    class="btn-action btn-approve"
                  >
                    Approve
                  </button>
                  <button
                    v-if="record.status === 'approved'"
                    @click="processPayment(record.id)"
                    class="btn-action btn-process"
                  >
                    Process
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="no-data">
          <p>No payroll records for this period</p>
          <button @click="generatePayroll" class="btn-generate">
            Generate Payroll Now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payroll {
  max-width: 1600px;
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
}

.filters {
  margin-bottom: 20px;
}

.period-selector {
  display: flex;
  gap: 15px;
}

.filter-select {
  padding: 12px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-card h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-card .amount {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
  margin: 0;
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

.status-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.processed {
  background: #d4edda;
  color: #155724;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 6px 12px;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
}

.btn-approve {
  background: #38b2ac;
}

.btn-approve:hover {
  background: #2c9a93;
}

.btn-process {
  background: #48bb78;
}

.btn-process:hover {
  background: #38a169;
}

.no-data {
  text-align: center;
  padding: 50px;
}

.no-data p {
  color: #999;
  margin-bottom: 20px;
}

.btn-generate {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
</style>