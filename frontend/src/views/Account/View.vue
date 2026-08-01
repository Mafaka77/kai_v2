<template>
  <MainLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <router-link to="/accounts" class="p-2 text-slate-400 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </router-link>
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Attendance for {{ user?.full_name || 'Loading...' }}</h1>
            <p class="text-slate-500 mt-1 text-sm">View weekly attendance record.</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-sm text-slate-500 font-medium bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
            {{ weekLabel }}
          </div>
        </div>
      </div>

      <!-- Monthly Calendar -->
      <UserAttendanceCalendar 
        :attendances="attendances" 
        @change-month="handleMonthChange" 
      />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '../../layouts/MainLayout.vue'
import UserAttendanceCalendar from '../../components/dashboard/UserAttendanceCalendar.vue'
import api from '../../plugins/axios'

const route = useRoute()
const userId = route.params.id
const user = ref(null)
const loading = ref(false)
const attendances = ref([])

// Current month state
const today = new Date()
const targetMonth = ref(today.getMonth() + 1)
const targetYear = ref(today.getFullYear())

const fetchUserData = async () => {
  try {
    const userRes = await api.get(`/accounts/${userId}`)
    if (userRes.data?.status === 'success') {
      user.value = userRes.data.data
    }
  } catch (err) {
    console.error('Failed to fetch user', err)
  }
}

const fetchAttendance = async () => {
  loading.value = true
  try {
    // Determine start and end of the target month
    const from = `${targetYear.value}-${String(targetMonth.value).padStart(2, '0')}-01`
    
    // Get last day of the month
    const lastDay = new Date(targetYear.value, targetMonth.value, 0).getDate()
    const to = `${targetYear.value}-${String(targetMonth.value).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    const res = await api.get(`/attendances/user/${userId}/history?from=${from}&to=${to}&limit=100`)
    if (res.data?.status === 'success') {
      attendances.value = res.data.data || []
    }
  } catch (err) {
    console.error('Failed to fetch attendance history', err)
  } finally {
    loading.value = false
  }
}

const handleMonthChange = (data) => {
  targetMonth.value = data.month
  targetYear.value = data.year
  fetchAttendance()
}

onMounted(() => {
  fetchUserData()
  fetchAttendance()
})
</script>

