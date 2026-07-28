<template>
  <MainLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">My Attendance</h1>
          <p class="text-slate-500 mt-1 text-sm">Your attendance log for the current week.</p>
        </div>
        <div class="text-sm text-slate-500 font-medium bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
          {{ weekLabel }}
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-24">
        <svg class="animate-spin h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Weekly calendar grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        <div
          v-for="day in weekDays"
          :key="day.date"
          :class="[
            'rounded-2xl border p-4 flex flex-col gap-3 transition-all',
            day.isToday
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100'
              : day.isWeekend
              ? 'bg-slate-50 border-slate-200 opacity-60'
              : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
          ]"
        >
          <!-- Day header -->
          <div class="flex items-center justify-between">
            <div>
              <div :class="['text-xs font-bold uppercase tracking-widest', day.isToday ? 'text-indigo-200' : 'text-slate-400']">
                {{ day.dayLabel }}
              </div>
              <div :class="['text-2xl font-extrabold mt-0.5', day.isToday ? 'text-white' : 'text-slate-800']">
                {{ day.dayNumber }}
              </div>
            </div>

            <!-- Status icon -->
            <div v-if="day.isWeekend" :class="['w-8 h-8 rounded-full flex items-center justify-center', day.isToday ? 'bg-indigo-500' : 'bg-slate-200']">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 0M5 21l14 0" />
              </svg>
            </div>
            <div v-else-if="day.record" :class="[
              'w-8 h-8 rounded-full flex items-center justify-center',
              day.isToday ? 'bg-white/20' : day.record.type === 'late' ? 'bg-amber-100' : 'bg-emerald-100'
            ]">
              <svg :class="['w-4 h-4', day.isToday ? 'text-white' : day.record.type === 'late' ? 'text-amber-600' : 'text-emerald-600']"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div v-else-if="isDatePast(day.date)" :class="['w-8 h-8 rounded-full flex items-center justify-center', day.isToday ? 'bg-white/20' : 'bg-rose-100']">
              <svg :class="['w-4 h-4', day.isToday ? 'text-white' : 'text-rose-500']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div v-else :class="['w-8 h-8 rounded-full flex items-center justify-center', day.isToday ? 'bg-white/20' : 'bg-slate-100']">
              <svg :class="['w-4 h-4', day.isToday ? 'text-indigo-200' : 'text-slate-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <!-- Weekend label -->
          <div v-if="day.isWeekend" :class="['text-xs font-semibold', day.isToday ? 'text-indigo-200' : 'text-slate-400']">
            Weekend
          </div>

          <!-- Attendance data -->
          <div v-else-if="day.record" class="space-y-2 text-xs">
            <div :class="['flex items-center gap-1.5', day.isToday ? 'text-indigo-100' : 'text-slate-500']">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span :class="['font-bold', day.isToday ? 'text-white' : 'text-slate-800']">
                {{ formatTime(day.record.signin_at) }}
              </span>
            </div>
            <div :class="['flex items-center gap-1.5', day.isToday ? 'text-indigo-100' : 'text-slate-500']">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span v-if="day.record.signout_at" :class="['font-bold', day.isToday ? 'text-white' : 'text-slate-800']">
                {{ formatTime(day.record.signout_at) }}
              </span>
              <span v-else :class="['italic', day.isToday ? 'text-indigo-200' : 'text-amber-500']">Pending</span>
            </div>
            <!-- Status badge -->
            <div class="pt-1">
              <span :class="[
                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border',
                day.isToday
                  ? 'bg-white/20 text-white border-white/30'
                  : day.record.type === 'late'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              ]">
                {{ day.record.type ? day.record.type.charAt(0).toUpperCase() + day.record.type.slice(1) : '—' }}
              </span>
            </div>
          </div>

          <!-- No record for a past day -->
          <div v-else-if="isDatePast(day.date)" :class="['text-xs font-semibold', day.isToday ? 'text-indigo-200' : 'text-rose-500']">
            Absent
          </div>

          <!-- Future day -->
          <div v-else :class="['text-xs font-semibold', day.isToday ? 'text-indigo-200' : 'text-slate-400']">
            —
          </div>
        </div>
      </div>

      <!-- Summary row -->
      <div v-if="!loading" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3">
          <div class="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div class="text-xl font-extrabold text-slate-900">{{ summary.present }}</div>
            <div class="text-xs font-semibold text-slate-500">Present</div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3">
          <div class="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div class="text-xl font-extrabold text-slate-900">{{ summary.late }}</div>
            <div class="text-xs font-semibold text-slate-500">Late</div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3">
          <div class="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div class="text-xl font-extrabold text-slate-900">{{ summary.absent }}</div>
            <div class="text-xs font-semibold text-slate-500">Absent</div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3">
          <div class="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <div class="text-xl font-extrabold text-slate-900">{{ summary.total }}</div>
            <div class="text-xs font-semibold text-slate-500">Work Days</div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'
import api from '../../plugins/axios'

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const generateDefaultWeekDays = () => {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sun, 1 = Mon, ...
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay
  const monday = new Date(now)
  monday.setDate(now.getDate() + distanceToMonday)

  const days = []
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayStr = getLocalDateString(now)

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const dayNum = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${dayNum}`
    const dayOfWeek = d.getDay()

    days.push({
      date: dateStr,
      dayLabel: labels[i],
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      record: null
    })
  }
  return days
}

const weekDays = ref(generateDefaultWeekDays())
const loading = ref(false)

const weekLabel = computed(() => {
  if (!weekDays.value.length) return ''
  const first = weekDays.value[0]?.date
  const last = weekDays.value[6]?.date
  if (!first || !last) return ''
  const fmt = (dStr) => {
    const [y, m, d] = dStr.split('-')
    const dt = new Date(+y, +m - 1, +d)
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }
  return `${fmt(first)} — ${fmt(last)}`
})

const summary = computed(() => {
  const workDays = weekDays.value.filter(d => !d.isWeekend)
  const todayStr = getLocalDateString()
  const past = workDays.filter(d => d.date <= todayStr)
  const present = past.filter(d => d.record && d.record.type === 'present').length
  const late = past.filter(d => d.record && d.record.type === 'late').length
  const absent = past.filter(d => !d.record).length
  return { present, late, absent, total: workDays.length }
})

const isDatePast = (dateStr) => {
  return dateStr < getLocalDateString()
}

const parseDate = (ds) => {
  if (!ds) return null
  if (ds instanceof Date) return ds
  if (typeof ds === 'string') {
    const m = ds.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/)
    if (m) return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])
  }
  const d = new Date(ds)
  return isNaN(d.getTime()) ? null : d
}

const formatTime = (ds) => {
  const d = parseDate(ds)
  if (!d) return '—'
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`
}

const fetchMyAttendance = async () => {
  loading.value = true
  try {
    const res = await api.get('/my-attendance')
    if (res.data?.status === 'success' && Array.isArray(res.data.data) && res.data.data.length > 0) {
      weekDays.value = res.data.data
    }
  } catch (err) {
    console.error('Failed to fetch weekly attendance', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchMyAttendance)
</script>
