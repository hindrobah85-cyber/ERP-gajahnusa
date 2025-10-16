<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { performanceAPI } from '@/services/api'

interface PerformanceReview {
  id: number
  employeeId: string
  employeeName: string
  reviewDate: string
  rating: number
  comments: string
  reviewerId: string
}

const reviews = ref<PerformanceReview[]>([])
const loading = ref(false)
const showModal = ref(false)

const newReview = ref({
  employeeId: '',
  reviewDate: new Date().toISOString().split('T')[0],
  rating: 3,
  comments: '',
  reviewerId: 'admin'
})

const loadReviews = async () => {
  loading.value = true
  try {
    const response = await performanceAPI.getAll()
    reviews.value = response.data
  } catch (error) {
    console.error('Failed to load performance reviews:', error)
  } finally {
    loading.value = false
  }
}

const createReview = async () => {
  if (!newReview.value.employeeId || !newReview.value.comments) {
    alert('Please fill all required fields')
    return
  }

  try {
    await performanceAPI.create(newReview.value)
    alert('Performance review created successfully!')
    showModal.value = false
    resetForm()
    loadReviews()
  } catch (error) {
    alert('Failed to create performance review!')
  }
}

const resetForm = () => {
  newReview.value = {
    employeeId: '',
    reviewDate: new Date().toISOString().split('T')[0],
    rating: 3,
    comments: '',
    reviewerId: 'admin'
  }
}

const getRatingColor = (rating: number) => {
  if (rating >= 4) return '#48bb78'
  if (rating >= 3) return '#38b2ac'
  if (rating >= 2) return '#ed8936'
  return '#f56565'
}

const getRatingLabel = (rating: number) => {
  if (rating === 5) return 'Outstanding'
  if (rating === 4) return 'Exceeds Expectations'
  if (rating === 3) return 'Meets Expectations'
  if (rating === 2) return 'Needs Improvement'
  return 'Unsatisfactory'
}

onMounted(() => {
  loadReviews()
})
</script>

<template>
  <div class="performance">
    <div class="page-header">
      <h1>Performance Reviews</h1>
      <button @click="showModal = true" class="btn-primary">
        ⭐ New Review
      </button>
    </div>

    <!-- Performance Summary -->
    <div class="summary-cards">
      <div class="summary-card">
        <h3>Total Reviews</h3>
        <p class="amount">{{ reviews.length }}</p>
      </div>
      <div class="summary-card">
        <h3>Average Rating</h3>
        <p class="amount">
          {{ reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0' }}
        </p>
      </div>
      <div class="summary-card">
        <h3>Outstanding</h3>
        <p class="amount">
          {{ reviews.filter(r => r.rating === 5).length }}
        </p>
      </div>
    </div>

    <!-- Reviews Table -->
    <div class="card">
      <div v-if="loading" class="loading">Loading performance reviews...</div>
      
      <div v-else>
        <table v-if="reviews.length > 0">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Review Date</th>
              <th>Rating</th>
              <th>Performance Level</th>
              <th>Comments</th>
              <th>Reviewer</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="review in reviews" :key="review.id">
              <td>{{ review.employeeId }}</td>
              <td>{{ review.employeeName }}</td>
              <td>{{ review.reviewDate }}</td>
              <td>
                <div class="rating-stars">
                  <span v-for="i in 5" :key="i" :class="{ filled: i <= review.rating }">
                    ★
                  </span>
                </div>
              </td>
              <td>
                <span class="rating-badge" :style="{ background: getRatingColor(review.rating) }">
                  {{ getRatingLabel(review.rating) }}
                </span>
              </td>
              <td class="comments-cell">{{ review.comments }}</td>
              <td>{{ review.reviewerId }}</td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="no-data">
          <p>No performance reviews yet</p>
        </div>
      </div>
    </div>

    <!-- Create Review Modal -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal" @click.stop>
        <h2>New Performance Review</h2>
        
        <div class="form-group">
          <label>Employee ID *</label>
          <input v-model="newReview.employeeId" type="text" placeholder="e.g. EMP001" class="form-input" />
        </div>

        <div class="form-group">
          <label>Review Date *</label>
          <input v-model="newReview.reviewDate" type="date" class="form-input" />
        </div>

        <div class="form-group">
          <label>Rating * (1-5)</label>
          <div class="rating-selector">
            <input v-model.number="newReview.rating" type="range" min="1" max="5" step="1" class="rating-slider" />
            <div class="rating-display">
              <div class="rating-stars-large">
                <span v-for="i in 5" :key="i" :class="{ filled: i <= newReview.rating }">
                  ★
                </span>
              </div>
              <p class="rating-label">{{ getRatingLabel(newReview.rating) }}</p>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Comments *</label>
          <textarea 
            v-model="newReview.comments" 
            rows="4" 
            placeholder="Enter detailed performance feedback..."
            class="form-input"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button @click="showModal = false; resetForm()" class="btn-secondary">
            Cancel
          </button>
          <button @click="createReview" class="btn-primary">
            Submit Review
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.performance {
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

.rating-stars {
  display: flex;
  gap: 2px;
  font-size: 18px;
}

.rating-stars span {
  color: #ddd;
}

.rating-stars span.filled {
  color: #ffc107;
}

.rating-badge {
  padding: 6px 12px;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.comments-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
}

textarea.form-input {
  resize: vertical;
}

.rating-selector {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.rating-slider {
  width: 100%;
  height: 8px;
  margin-bottom: 15px;
}

.rating-display {
  text-align: center;
}

.rating-stars-large {
  display: flex;
  justify-content: center;
  gap: 5px;
  font-size: 32px;
  margin-bottom: 10px;
}

.rating-stars-large span {
  color: #ddd;
  transition: color 0.2s;
}

.rating-stars-large span.filled {
  color: #ffc107;
}

.rating-label {
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
  margin: 0;
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