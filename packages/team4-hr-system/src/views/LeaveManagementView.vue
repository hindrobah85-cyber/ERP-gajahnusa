<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { leaveAPI } from '@/services/api'

interface LeaveRequest {
  id: number
  employeeId: string
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  status: string
}

const leaves = ref<LeaveRequest[]>([])
const loading = ref(false)
const showModal = ref(false)
const statusFilter = ref('all')

const newLeave = ref({
  employeeId: '',
  leaveType: 'Annual',
  startDate: '',
  endDate: '',
  reason: ''
})

const leaveTypes = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid']

const filteredLeaves = computed(() => {
  if (statusFilter.value === 'all') return leaves.value
  return leaves.value.filter(l => l.status === statusFilter.value)
})

const loadLeaves = async () => {
  loading.value = true
  try {
    const response = await leaveAPI.getAll()
    leaves.value = response.data
  } catch (error) {
    console.error('Failed to load leave requests:', error)
  } finally {
    loading.value = false
  }
}

const createLeave = async () => {
  if (!newLeave.value.employeeId || !newLeave.value.startDate || !newLeave.value.endDate) {
    alert('Please fill all required fields')
    return
  }

  try {
    await leaveAPI.create(newLeave.value)
    alert('Leave request created successfully!')
    showModal.value = false
    resetForm()
    loadLeaves()
  } catch (error) {
    alert('Failed to create leave request!')
  }
}

const approveLeave = async (id: number) => {
  if (!confirm('Approve this leave request?')) return
  
  try {
    await leaveAPI.approve(id)
    alert('Leave request approved!')
    loadLeaves()
  } catch (error) {
    alert('Failed to approve leave!')
  }
}

const rejectLeave = async (id: number) => {
  if (!confirm('Reject this leave request?')) return
  
  try {
    await leaveAPI.reject(id)
    alert('Leave request rejected!')
    loadLeaves()
  } catch (error) {
    alert('Failed to reject leave!')
  }
}

const resetForm = () => {
  newLeave.value = {
    employeeId: '',
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    reason: ''
  }
}

const calculateDays = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

onMounted(() => {
  loadLeaves()
})
</script>

<script lang="ts">
import { computed } from 'vue'
export default {
  name: 'LeaveManagementView'
}
</script>

<template>
  <div class="leave-management">
    <div class="page-header">
      <h1>Leave Management</h1>
      <button @click="showModal = true" class="btn-primary">
        ➕ New Leave Request
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <label>Status:</label>
        <select v-model="statusFilter" class="filter-select">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>

    <!-- Leave Summary -->
    <div class="summary-cards">
      <div class="summary-card">
        <h3>Pending Requests</h3>
        <p class="amount">{{ leaves.filter(l => l.status === 'pending').length }}</p>
      </div>
      <div class="summary-card">
        <h3>Approved This Month</h3>
        <p class="amount">{{ leaves.filter(l => l.status === 'approved').length }}</p>
      </div>
      <div class="summary-card">
        <h3>Total Requests</h3>
        <p class="amount">{{ leaves.length }}</p>
      </div>
    </div>

    <!-- Leave Table -->
    <div class="card">
      <div v-if="loading" class="loading">Loading leave requests...</div>
      
      <div v-else>
        <table v-if="filteredLeaves.length > 0">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="leave in filteredLeaves" :key="leave.id">
              <td>{{ leave.employeeId }}</td>
              <td>{{ leave.employeeName }}</td>
              <td>
                <span class="leave-type-badge">{{ leave.leaveType }}</span>
              </td>
              <td>{{ leave.startDate }}</td>
              <td>{{ leave.endDate }}</td>
              <td>{{ calculateDays(leave.startDate, leave.endDate) }} days</td>
              <td>{{ leave.reason }}</td>
              <td>
                <span :class="['status-badge', leave.status]">
                  {{ leave.status }}
                </span>
              </td>
              <td>
                <div class="action-buttons" v-if="leave.status === 'pending'">
                  <button @click="approveLeave(leave.id)" class="btn-action btn-approve">
                    ✓
                  </button>
                  <button @click="rejectLeave(leave.id)" class="btn-action btn-reject">
                    ✗
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="no-data">
          <p>No leave requests found</p>
        </div>
      </div>
    </div>

    <!-- Create Leave Modal -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal" @click.stop>
        <h2>New Leave Request</h2>
        
        <div class="form-group">
          <label>Employee ID *</label>
          <input v-model="newLeave.employeeId" type="text" placeholder="e.g. EMP001" class="form-input" />
        </div>

        <div class="form-group">
          <label>Leave Type *</label>
          <select v-model="newLeave.leaveType" class="form-input">
            <option v-for="type in leaveTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Start Date *</label>
            <input v-model="newLeave.startDate" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label>End Date *</label>
            <input v-model="newLeave.endDate" type="date" class="form-input" />
          </div>
        </div>

        <div class="form-group">
          <label>Reason</label>
          <textarea v-model="newLeave.reason" rows="3" placeholder="Enter reason..." class="form-input"></textarea>
        </div>

        <div class="modal-actions">
          <button @click="showModal = false; resetForm()" class="btn-secondary">
            Cancel
          </button>
          <button @click="createLeave" class="btn-primary">
            Submit Request
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.leave-management {
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

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 600;
  color: #333;
}

.filter-select {
  padding: 10px 15px;
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

.leave-type-badge {
  padding: 6px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
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
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 8px 12px;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
}

.btn-approve {
  background: #48bb78;
}

.btn-approve:hover {
  background: #38a169;
}

.btn-reject {
  background: #f56565;
}

.btn-reject:hover {
  background: #e53e3e;
}

.no-data {
  text-align: center;
  padding: 50px;
  color: #999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  min-width: 500px;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal h2 {
  margin: 0 0 20px 0;
  font-size: 22px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

textarea.form-input {
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
</style>