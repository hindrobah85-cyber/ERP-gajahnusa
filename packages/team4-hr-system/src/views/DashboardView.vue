<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { employeeAPI, attendanceAPI, payrollAPI, leaveAPI } from '@/services/api'

interface Stats {
  totalEmployees: number
  presentToday: number
  pendingLeave: number
  payrollPending: number
}

const stats = ref<Stats>({
  totalEmployees: 0,
  presentToday: 0,
  pendingLeave: 0,
  payrollPending: 0
})

const recentAttendance = ref<any[]>([])
const upcomingLeaves = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    // Fetch dashboard data
    const [employees, attendance, leave] = await Promise.all([
      employeeAPI.getAll(),
      attendanceAPI.getTodayReport(),
      leaveAPI.getAll()
    ])

    stats.value = {
      totalEmployees: employees.data.length,
      presentToday: attendance.data.present || 0,
      pendingLeave: leave.data.filter((l: any) => l.status === 'pending').length,
      payrollPending: 0
    }

    recentAttendance.value = attendance.data.recent || []
    upcomingLeaves.value = leave.data.filter((l: any) => l.status === 'approved').slice(0, 5)
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="dashboard">
    <div v-if="loading" class="loading">Loading...</div>
    
    <div v-else>
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">👥</div>
          <div class="stat-content">
            <h3>{{ stats.totalEmployees }}</h3>
            <p>Total Employees</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #48bb78;">✅</div>
          <div class="stat-content">
            <h3>{{ stats.presentToday }}</h3>
            <p>Present Today</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #ed8936;">⏳</div>
          <div class="stat-content">
            <h3>{{ stats.pendingLeave }}</h3>
            <p>Pending Leave</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #38b2ac;">💰</div>
          <div class="stat-content">
            <h3>{{ stats.payrollPending }}</h3>
            <p>Payroll Pending</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="content-grid">
        <div class="card">
          <h2>Recent Attendance</h2>
          <div class="table-container">
            <table v-if="recentAttendance.length > 0">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in recentAttendance" :key="record.id">
                  <td>{{ record.employeeName }}</td>
                  <td>{{ record.checkIn }}</td>
                  <td>{{ record.checkOut || '-' }}</td>
                  <td>
                    <span :class="['badge', record.status]">
                      {{ record.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="no-data">No attendance records today</p>
          </div>
        </div>

        <div class="card">
          <h2>Upcoming Leaves</h2>
          <div class="leave-list">
            <div v-if="upcomingLeaves.length > 0">
              <div v-for="leave in upcomingLeaves" :key="leave.id" class="leave-item">
                <div class="leave-info">
                  <strong>{{ leave.employeeName }}</strong>
                  <span>{{ leave.leaveType }}</span>
                </div>
                <div class="leave-dates">
                  {{ leave.startDate }} - {{ leave.endDate }}
                </div>
              </div>
            </div>
            <p v-else class="no-data">No upcoming leaves</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-content h3 {
  font-size: 32px;
  margin: 0 0 5px 0;
  color: #333;
}

.stat-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #f8f9fa;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

th {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

td {
  color: #666;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge.present {
  background: #d4edda;
  color: #155724;
}

.badge.late {
  background: #fff3cd;
  color: #856404;
}

.badge.absent {
  background: #f8d7da;
  color: #721c24;
}

.leave-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.leave-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.leave-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.leave-info strong {
  color: #333;
}

.leave-info span {
  color: #667eea;
  font-size: 14px;
}

.leave-dates {
  color: #666;
  font-size: 13px;
}

.no-data {
  text-align: center;
  padding: 30px;
  color: #999;
}
</style>