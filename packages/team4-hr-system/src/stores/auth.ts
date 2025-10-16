import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'

export interface User {
  id: string
  name: string
  email: string
  role: string
  department?: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('hr_token'))
  
  const isAuthenticated = computed(() => !!token.value)
  
  async function login(email: string, password: string) {
    try {
      const response = await authAPI.login(email, password)
      user.value = response.user
      token.value = response.token
      localStorage.setItem('hr_token', response.token)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }
  
  async function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('hr_token')
  }
  
  async function checkAuth() {
    if (token.value) {
      try {
        const response = await authAPI.getCurrentUser()
        user.value = response.user
      } catch (error) {
        await logout()
      }
    }
  }
  
  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
})