<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { attendanceAPI } from '@/services/api'

interface AttendanceRecord {
  id: number
  employeeId: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string | null
  status: string
  workHours: number
}

const records = ref<AttendanceRecord[]>([])
const loading = ref(false)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showCheckInModal = ref(false)
const checkInEmployeeId = ref('')

const loadAttendance = async () => {
  loading.value = true
  try {
    const response = await attendanceAPI.getReport(selectedDate.value, selectedDate.value)
    records.value = response.data
  } catch (error) {
    console.error('Failed to load attendance:', error)
  } finally {
    loading.value = false
  }
}

const handleCheckIn = async () => {
  if (!checkInEmployeeId.value) return
  
  try {
    await attendanceAPI.checkIn(checkInEmployeeId.value)
    alert('Check-in successful!')
    showCheckInModal.value = false
    checkInEmployeeId.value = ''
    loadAttendance()
  } catch (error) {
    alert('Check-in failed!')
  }
}

const handleCheckOut = async (employeeId: string) => {
  try {
    await attendanceAPI.checkOut(employeeId)
    alert('Check-out successful!')
    loadAttendance()
  } catch (error) {
    alert('Check-out failed!')
  }
}

onMounted(() => {
  loadAttendance()
})
</script>

<template>
  <div class="attendance">
    <div class="page-header">
      <h1>Attendance Management</h1>
      <button @click="showCheckInModal = true" class="btn-primary">
        ⏰ Check In
      </button>
    </div>

    <!-- Date Filter -->
    <div class="filters">
      <div class="date-picker">
        <label>Date:</label>
        <input
          v-model="selectedDate"
          type="date"
          @change="loadAttendance"
          class="date-input"
        />
      </div>
    </div>

    <!-- Attendance Table -->
    <div class="card">
      <div v-if="loading" class="loading">Loading attendance...</div>
      
      <div v-else>
        <table v-if="records.length > 0">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Work Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td>{{ record.employeeId }}</td>
              <td>{{ record.employeeName }}</td>
              <td>{{ record.date }}</td>
              <td>{{ record.checkIn }}</td>
              <td>{{ record.checkOut || '-' }}</td>
              <td>{{ record.workHours }} hrs</td>
              <td>
                <span :class="['status-badge', record.status.toLowerCase()]">
                  {{ record.status }}
                </span>
              </td>
              <td>
                <button
                  v-if="!record.checkOut"
                  @click="handleCheckOut(record.employeeId)"
                  class="btn-action"
                >
                  Check Out
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="no-data">
          <p>No attendance records for this date</p>
        </div>
      </div>
    </div>

    <!-- Check In Modal -->
    <div v-if="showCheckInModal" class="modal-overlay" @click="showCheckInModal = false">
      <div class="modal" @click.stop>
        <h2>Employee Check In</h2>
        <div class="form-group">
          <label>Employee ID</label>
          <input
            v-model="checkInEmployeeId"
            type="text"
            placeholder="Enter employee ID"
            class="form-input"
          />
        </div>
        <div class="modal-actions">
          <button @click="showCheckInModal = false" class="btn-secondary">
            Cancel
          </button>
          <button @click="handleCheckIn" class="btn-primary">
            Check In
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.attendance {
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
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.filters {
  margin-bottom: 20px;
}

.date-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-picker label {
  font-weight: 600;
  color: #333;
}

.date-input {
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
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

.status-badge.present {
  background: #d4edda;
  color: #155724;
}

.status-badge.late {
  background: #fff3cd;
  color: #856404;
}

.status-badge.absent {
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
}

.btn-action:hover {
  background: #5568d3;
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
  min-width: 400px;
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

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
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

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>