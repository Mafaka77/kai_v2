<template>
  <MainLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <router-link to="/accounts" class="p-2 text-slate-400 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </router-link>
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Attendance for {{ user?.full_name || 'Loading...' }}</h1>
            <p class="text-slate-500 mt-1 text-sm">View and download attendance history records.</p>
          </div>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <div class="text-sm text-slate-600 font-semibold bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ monthLabel }}
          </div>

          <button 
            @click="openDownloadModal" 
            :disabled="downloading"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg v-if="downloading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download History</span>
          </button>
        </div>
      </div>

      <!-- Monthly Calendar -->
      <UserAttendanceCalendar 
        :attendances="attendances" 
        @change-month="handleMonthChange" 
      />

      <!-- Download History Modal with Duration Selector -->
      <div v-if="showDownloadModal" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden transform transition-all">
          <!-- Modal Header -->
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 text-lg">Download Attendance History</h3>
                <p class="text-xs text-slate-500 font-medium">Export record for {{ user?.full_name || 'Employee' }}</p>
              </div>
            </div>
            <button @click="closeDownloadModal" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body / Duration Selection -->
          <div class="p-6 space-y-4">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Duration</label>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <!-- Preset Duration Options -->
              <div 
                v-for="option in durationOptions" 
                :key="option.id"
                @click="rangeType = option.id"
                class="flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none"
                :class="rangeType === option.id ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold shadow-xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'"
              >
                <input 
                  type="radio" 
                  name="duration" 
                  :value="option.id" 
                  v-model="rangeType" 
                  class="accent-indigo-600 w-4 h-4 cursor-pointer" 
                />
                <div class="flex flex-col min-w-0">
                  <span class="text-sm font-medium leading-tight truncate">{{ option.label }}</span>
                  <span class="text-[11px] text-slate-400 font-normal truncate mt-0.5">{{ option.subtitle }}</span>
                </div>
              </div>
            </div>

            <!-- Custom Date Pickers (Shown when Custom Range is selected) -->
            <div v-if="rangeType === 'custom'" class="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 mt-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">From Date</label>
                <input 
                  type="date" 
                  v-model="customFrom" 
                  class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">To Date</label>
                <input 
                  type="date" 
                  v-model="customTo" 
                  class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
                />
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button 
              @click="closeDownloadModal" 
              class="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              @click="handleDownload" 
              :disabled="downloading || (rangeType === 'custom' && (!customFrom || !customTo))"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <svg v-if="downloading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '../../layouts/MainLayout.vue'
import UserAttendanceCalendar from '../../components/dashboard/UserAttendanceCalendar.vue'
import api from '../../plugins/axios'
import { HOLIDAY_DATES_DD_MM_YYYY as holidaysList } from '../../constants/holidays.js'

const route = useRoute()
const userId = route.params.id
const user = ref(null)
const loading = ref(false)
const downloading = ref(false)
const attendances = ref([])
const showDownloadModal = ref(false)

// Range types: 'this_month' | 'last_month' | '7days' | '30days' | '90days' | 'all' | 'custom'
const rangeType = ref('this_month')
const customFrom = ref('')
const customTo = ref('')

// Current month state
const today = new Date()
const targetMonth = ref(today.getMonth() + 1)
const targetYear = ref(today.getFullYear())

const monthLabel = computed(() => {
  const date = new Date(targetYear.value, targetMonth.value - 1, 1)
  return date.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const durationOptions = computed(() => {
  const now = new Date()
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthName = lastMonthDate.toLocaleString('default', { month: 'short', year: 'numeric' })
  const currentMonthName = now.toLocaleString('default', { month: 'short', year: 'numeric' })

  return [
    { id: 'this_month', label: 'This Month', subtitle: currentMonthName },
    { id: 'last_month', label: 'Last Month', subtitle: lastMonthName },
    { id: '7days', label: 'Last 7 Days', subtitle: 'Past week records' },
    { id: '30days', label: 'Last 30 Days', subtitle: 'Past 30 days records' },
    { id: '90days', label: 'Last 90 Days', subtitle: 'Quarterly history' },
    { id: 'all', label: 'All Time', subtitle: 'Complete history' },
    { id: 'custom', label: 'Custom Range', subtitle: 'Pick start & end dates' },
  ]
})

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
    const from = `${targetYear.value}-${String(targetMonth.value).padStart(2, '0')}-01`
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

const openDownloadModal = () => {
  const year = targetYear.value
  const monthStr = String(targetMonth.value).padStart(2, '0')
  const lastDay = new Date(year, targetMonth.value, 0).getDate()
  customFrom.value = `${year}-${monthStr}-01`
  customTo.value = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`
  rangeType.value = 'this_month'
  showDownloadModal.value = true
}

const closeDownloadModal = () => {
  showDownloadModal.value = false
}

const formatDate = (dateObj) => {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const handleDownload = async () => {
  downloading.value = true
  try {
    const params = new URLSearchParams()
    let filenameSuffix = 'history'
    const now = new Date()

    if (rangeType.value === 'this_month') {
      const year = now.getFullYear()
      const monthStr = String(now.getMonth() + 1).padStart(2, '0')
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
      const from = `${year}-${monthStr}-01`
      const to = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`
      params.append('from', from)
      params.append('to', to)
      filenameSuffix = `${year}_${monthStr}`
    } else if (rangeType.value === 'last_month') {
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const year = prevMonthDate.getFullYear()
      const monthStr = String(prevMonthDate.getMonth() + 1).padStart(2, '0')
      const lastDay = new Date(year, prevMonthDate.getMonth() + 1, 0).getDate()
      const from = `${year}-${monthStr}-01`
      const to = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`
      params.append('from', from)
      params.append('to', to)
      filenameSuffix = `${year}_${monthStr}`
    } else if (rangeType.value === '7days') {
      const past = new Date(now)
      past.setDate(now.getDate() - 7)
      const from = formatDate(past)
      const to = formatDate(now)
      params.append('from', from)
      params.append('to', to)
      filenameSuffix = `last_7_days`
    } else if (rangeType.value === '30days') {
      const past = new Date(now)
      past.setDate(now.getDate() - 30)
      const from = formatDate(past)
      const to = formatDate(now)
      params.append('from', from)
      params.append('to', to)
      filenameSuffix = `last_30_days`
    } else if (rangeType.value === '90days') {
      const past = new Date(now)
      past.setDate(now.getDate() - 90)
      const from = formatDate(past)
      const to = formatDate(now)
      params.append('from', from)
      params.append('to', to)
      filenameSuffix = `last_90_days`
    } else if (rangeType.value === 'custom' && customFrom.value && customTo.value) {
      params.append('from', customFrom.value)
      params.append('to', customTo.value)
      filenameSuffix = `${customFrom.value}_to_${customTo.value}`
    } else if (rangeType.value === 'all') {
      filenameSuffix = 'all_time'
    }

    const queryString = params.toString() ? `?${params.toString()}` : ''
    const response = await api.get(`/attendances/user/${userId}/export${queryString}`, {
      responseType: 'blob'
    })

    const safeUserName = (user.value?.full_name || 'employee')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
    
    const fileName = `attendance_history_${safeUserName}_${filenameSuffix}.csv`

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    closeDownloadModal()
  } catch (error) {
    console.error('Failed to download employee attendance history', error)
    fallbackClientDownload()
  } finally {
    downloading.value = false
  }
}



const fallbackClientDownload = () => {
  try {
    let csvContent = 'Date,Day,Employee Name,Designation,Office,Status,Sign In Time,Sign Out Time\n'
    const name = user.value?.full_name || 'Employee'

    const year = targetYear.value
    const month = targetMonth.value
    const daysCount = new Date(year, month, 0).getDate()
    const todayStr = new Date().toISOString().split('T')[0]

    const attMap = new Map()
    if (attendances.value) {
      attendances.value.forEach(att => {
        if (att.signin_at) {
          const dStr = new Date(att.signin_at).toISOString().split('T')[0]
          attMap.set(dStr, att)
        }
      })
    }

    for (let day = 1; day <= daysCount; day++) {
      const dateObj = new Date(year, month - 1, day)
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const formattedHoliday = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
      const dayOfWeek = dateObj.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const isHoliday = holidaysList.includes(formattedHoliday)

      const att = attMap.get(dateStr)

      let status = 'ABSENT'
      let signin = '-'
      let signout = '-'
      let office = user.value?.Offices?.[0]?.name || '-'

      if (att) {
        status = (att.type || 'PRESENT').toUpperCase()
        signin = att.signin_at ? new Date(att.signin_at).toLocaleTimeString('en-IN') : '-'
        signout = att.signout_at ? new Date(att.signout_at).toLocaleTimeString('en-IN') : '-'
        if (att.Office?.name) office = att.Office.name
      } else if (isHoliday) {
        status = 'HOLIDAY'
      } else if (isWeekend) {
        status = 'WEEKEND'
      } else if (dateStr > todayStr) {
        status = 'UPCOMING'
      } else {
        status = 'ABSENT'
      }

      csvContent += `"${dateStr}","${dayName}","${name}","${user.value?.designation || 'Staff'}","${office}","${status}","${signin}","${signout}"\n`
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `attendance_history_${(name).toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    closeDownloadModal()
  } catch (err) {
    console.error('Client download failed', err)
  }
}

onMounted(() => {
  fetchUserData()
  fetchAttendance()
})
</script>
