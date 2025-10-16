<script setup lang="ts">
import { ref } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title } from 'chart.js'
import { Pie, Bar, Line } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title)

const reportType = ref('attendance')

// Sample data for charts
const attendanceData = {
  labels: ['Present', 'Late', 'Absent', 'Leave'],
  datasets: [{
    data: [85, 10, 3, 2],
    backgroundColor: ['#48bb78', '#ed8936', '#f56565', '#667eea']
  }]
}

const payrollData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Total Payroll (Millions IDR)',
    data: [120, 125, 130, 128, 135, 140],
    backgroundColor: '#667eea'
  }]
}

const performanceData = {
  labels: ['Outstanding', 'Exceeds', 'Meets', 'Needs Improvement'],
  datasets: [{
    data: [15, 35, 45, 5],
    backgroundColor: ['#48bb78', '#38b2ac', '#667eea', '#ed8936']
  }]
}

const departmentData = {
  labels: ['Sales', 'Logistics', 'Finance', 'HR', 'IT', 'Operations'],
  datasets: [{
    label: 'Employees per Department',
    data: [25, 18, 12, 8, 10, 15],
    borderColor: '#764ba2',
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    tension: 0.4
  }]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}

const exportReport = () => {
  alert('Export functionality will be implemented with PDF generation')
}
</script>

<template>
  <div class="reports">
    <div class="page-header">
      <h1>HR Reports & Analytics</h1>
      <button @click="exportReport" class="btn-primary">
        📄 Export PDF
      </button>
    </div>

    <!-- Report Type Selector -->
    <div class="report-selector">
      <button 
        @click="reportType = 'attendance'" 
        :class="['report-btn', { active: reportType === 'attendance' }]"
      >
        📊 Attendance
      </button>
      <button 
        @click="reportType = 'payroll'" 
        :class="['report-btn', { active: reportType === 'payroll' }]"
      >
        💰 Payroll
      </button>
      <button 
        @click="reportType = 'performance'" 
        :class="['report-btn', { active: reportType === 'performance' }]"
      >
        ⭐ Performance
      </button>
      <button 
        @click="reportType = 'department'" 
        :class="['report-btn', { active: reportType === 'department' }]"
      >
        👥 Departments
      </button>
    </div>

    <!-- Charts Container -->
    <div class="charts-grid">
      <!-- Attendance Report -->
      <div v-if="reportType === 'attendance'" class="chart-section">
        <div class="card">
          <h2>Attendance Summary</h2>
          <div class="chart-container">
            <Pie :data="attendanceData" :options="chartOptions" />
          </div>
        </div>
        
        <div class="card">
          <h2>Attendance Statistics</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Average Presence Rate</span>
              <span class="stat-value">85%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Late Arrivals</span>
              <span class="stat-value">10%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Absent Rate</span>
              <span class="stat-value">3%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">On Leave</span>
              <span class="stat-value">2%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payroll Report -->
      <div v-if="reportType === 'payroll'" class="chart-section">
        <div class="card">
          <h2>Monthly Payroll Trends</h2>
          <div class="chart-container">
            <Bar :data="payrollData" :options="chartOptions" />
          </div>
        </div>
        
        <div class="card">
          <h2>Payroll Breakdown</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Total Payroll (June)</span>
              <span class="stat-value">IDR 140M</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Average Salary</span>
              <span class="stat-value">IDR 9.3M</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Allowances</span>
              <span class="stat-value">IDR 28M</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Deductions</span>
              <span class="stat-value">IDR 14M</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Report -->
      <div v-if="reportType === 'performance'" class="chart-section">
        <div class="card">
          <h2>Performance Distribution</h2>
          <div class="chart-container">
            <Pie :data="performanceData" :options="chartOptions" />
          </div>
        </div>
        
        <div class="card">
          <h2>Performance Metrics</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Average Rating</span>
              <span class="stat-value">3.6 / 5</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Outstanding Performers</span>
              <span class="stat-value">15%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Meets Expectations</span>
              <span class="stat-value">45%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Reviews</span>
              <span class="stat-value">88</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Department Report -->
      <div v-if="reportType === 'department'" class="chart-section">
        <div class="card">
          <h2>Employees by Department</h2>
          <div class="chart-container">
            <Line :data="departmentData" :options="chartOptions" />
          </div>
        </div>
        
        <div class="card">
          <h2>Department Overview</h2>
          <div class="department-list">
            <div class="department-item">
              <div class="dept-info">
                <strong>Sales</strong>
                <span>25 employees</span>
              </div>
              <div class="dept-bar">
                <div class="dept-fill" style="width: 100%"></div>
              </div>
            </div>
            <div class="department-item">
              <div class="dept-info">
                <strong>Logistics</strong>
                <span>18 employees</span>
              </div>
              <div class="dept-bar">
                <div class="dept-fill" style="width: 72%"></div>
              </div>
            </div>
            <div class="department-item">
              <div class="dept-info">
                <strong>Finance</strong>
                <span>12 employees</span>
              </div>
              <div class="dept-bar">
                <div class="dept-fill" style="width: 48%"></div>
              </div>
            </div>
            <div class="department-item">
              <div class="dept-info">
                <strong>Operations</strong>
                <span>15 employees</span>
              </div>
              <div class="dept-bar">
                <div class="dept-fill" style="width: 60%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reports {
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

.report-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.report-btn {
  padding: 12px 24px;
  background: white;
  color: #666;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.report-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.report-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.charts-grid {
  display: grid;
  gap: 20px;
}

.chart-section {
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
}

.chart-container {
  height: 300px;
  position: relative;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stat-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.department-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.department-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dept-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dept-info strong {
  color: #333;
  font-size: 16px;
}

.dept-info span {
  color: #666;
  font-size: 14px;
}

.dept-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.dept-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

@media (max-width: 1024px) {
  .chart-section {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>