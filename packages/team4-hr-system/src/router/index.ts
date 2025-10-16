import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue')
        },
        {
          path: 'employees',
          name: 'employees',
          component: () => import('@/views/EmployeesView.vue')
        },
        {
          path: 'employees/:id',
          name: 'employee-detail',
          component: () => import('@/views/EmployeeDetailView.vue')
        },
        {
          path: 'attendance',
          name: 'attendance',
          component: () => import('@/views/AttendanceView.vue')
        },
        {
          path: 'payroll',
          name: 'payroll',
          component: () => import('@/views/PayrollView.vue')
        },
        {
          path: 'leave',
          name: 'leave',
          component: () => import('@/views/LeaveManagementView.vue')
        },
        {
          path: 'performance',
          name: 'performance',
          component: () => import('@/views/PerformanceView.vue')
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/views/ReportsView.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router