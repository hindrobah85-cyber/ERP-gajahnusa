<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarOpen = ref(true)

const menuItems = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Employees', path: '/employees', icon: '👥' },
  { name: 'Attendance', path: '/attendance', icon: '⏰' },
  { name: 'Payroll', path: '/payroll', icon: '💰' },
  { name: 'Leave Management', path: '/leave', icon: '🏖️' },
  { name: 'Performance', path: '/performance', icon: '📈' },
  { name: 'Reports', path: '/reports', icon: '📄' }
]

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside :class="['sidebar', { collapsed: !sidebarOpen }]">
      <div class="sidebar-header">
        <h2 v-if="sidebarOpen">Gajah Nusa HR</h2>
        <h2 v-else>GN</h2>
      </div>

      <nav class="sidebar-menu">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: route.path === item.path }"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span v-if="sidebarOpen" class="menu-label">{{ item.name }}</span>
        </router-link>
      </nav>

      <button @click="sidebarOpen = !sidebarOpen" class="toggle-btn">
        {{ sidebarOpen ? '◀' : '▶' }}
      </button>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <h1>{{ route.meta.title || 'Dashboard' }}</h1>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="user-name">{{ authStore.user?.name || 'User' }}</span>
            <span class="user-role">{{ authStore.user?.role || 'Staff' }}</span>
          </div>
          <button @click="handleLogout" class="logout-btn">Logout</button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: width 0.3s;
  position: relative;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  font-size: 20px;
  margin: 0;
}

.sidebar-menu {
  padding: 20px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.menu-item.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-left-color: white;
  color: white;
}

.menu-icon {
  font-size: 24px;
  width: 30px;
}

.menu-label {
  margin-left: 15px;
  white-space: nowrap;
}

.toggle-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.user-role {
  font-size: 12px;
  color: #666;
}

.logout-btn {
  padding: 10px 20px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #cc0000;
}

.content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}
</style>