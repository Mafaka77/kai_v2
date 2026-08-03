<template>
  <MainLayout>
    <div class="space-y-6">
      
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {{ authStore.user?.full_name || 'User' }} 
          </h1>
          <p class="text-slate-500 text-xs mt-1">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md uppercase text-[10px] mr-1">
              {{ userRole }}
            </span>
            Overview of your attendance management dashboard.
          </p>
        </div>

        <button 
          @click="fetchStats" 
          :disabled="loading"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <svg class="w-4 h-4 text-indigo-600" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Stats</span>
        </button>
      </div>

      <!-- Role-Based Stats Cards -->
      <AdminDashboardStats v-if="userRole === 'Admin'" :stats="stats" :loading="loading" />
      <ManagerDashboardStats v-else-if="userRole === 'Manager'" :stats="stats" :loading="loading" />
      <UserDashboardStats v-else />

      <!-- ADMIN DASHBOARD CHARTS -->
      <OfficeAttendanceChart
        v-if="userRole === 'Admin'"
        :title="`Statewide Office Attendance (${stats.date_label || 'Today'})`"
        :subtitle="`Attendance sign-ins breakdown across system offices (${stats.date_label || 'Today'})`"
        mode="admin"
        :chart-data="stats.office_attendance_chart || []"
      />

      <!-- MANAGER DASHBOARD CHARTS & TABLES -->
      <template v-else-if="userRole === 'Manager'">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left Column: Today Attendance Ratio Donut Chart -->
          <div class="lg:col-span-4">
            <ManagerTodayPieChart 
              :date-label="stats.date_label || 'Today'" 
              :chart-data="stats.today_pie_chart || []" 
            />
          </div>

          <!-- Right Column: Weekly Employee Attendance Breakdown Chart -->
          <div class="lg:col-span-8">
            <OfficeAttendanceChart
              :title="`${stats.office_name || 'Assigned Office'} — Weekly Attendance`"
              subtitle="Current week attendance breakdown per employee (Monday – Today)"
              mode="manager"
              :chart-data="stats.weekly_employee_chart || []"
            />
          </div>
        </div>

        <!-- Staff Attendance Breakdown Table -->
        <ManagerTodayAttendanceTable 
          :users="stats.today_user_attendances || []"
          :office-name="stats.office_name || ''"
          :date-label="stats.date_label || 'Today'"
        />
      </template>

      <!-- REGULAR USER DASHBOARD WELCOME CARD -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-8 flex flex-col items-center justify-center min-h-[250px] text-center space-y-4">
          <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-xs">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900">Workforce System Operational</h3>
            <p class="text-xs text-slate-500 max-w-md mt-1.5 leading-relaxed">
              Real-time attendance logs, appeals, and transfer requests are synchronized across system offices. Select a menu item from the sidebar to manage records.
            </p>
          </div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from './layouts/MainLayout.vue'
import AdminDashboardStats from './components/dashboard/AdminDashboardStats.vue'
import ManagerDashboardStats from './components/dashboard/ManagerDashboardStats.vue'
import UserDashboardStats from './components/dashboard/UserDashboardStats.vue'
import ManagerTodayPieChart from './components/dashboard/ManagerTodayPieChart.vue'
import OfficeAttendanceChart from './components/dashboard/OfficeAttendanceChart.vue'
import ManagerTodayAttendanceTable from './components/dashboard/ManagerTodayAttendanceTable.vue'
import { useAuthStore } from './stores/auth'
import api from './plugins/axios'
import { useUserDashboardStore } from './stores/userDashboard'

const authStore = useAuthStore()
const userDashboardStore = useUserDashboardStore()
const loading = ref(true)
const stats = ref({})

const userRole = computed(() => authStore.role || 'User')

const fetchStats = async () => {
  loading.value = true
  try {
    if (userRole.value === 'User') {
      await userDashboardStore.fetchStats()
    } else {
      const response = await api.get('/dashboard/stats')
      if (response.data && response.data.status === 'success') {
        stats.value = response.data.data
      }
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>
