<template>
  <MainLayout>
    <div class="space-y-8 max-w-7xl mx-auto">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Holiday & Event Calendar</h1>
          <p class="text-slate-500 mt-1 text-sm">Official public holidays, restricted holidays, and calendar schedule.</p>
        </div>
      </div>

      <!-- Color Legend Bar -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-700">
          <div class="flex items-center gap-2">
            <span class="w-3.5 h-3.5 rounded-md bg-rose-500 shadow-xs shadow-rose-200"></span>
            <span>Sunday (Red)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3.5 h-3.5 rounded-md bg-rose-600 shadow-xs shadow-rose-200"></span>
            <span>Public / General Holiday (Red)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3.5 h-3.5 rounded-md bg-blue-600 shadow-xs shadow-blue-200"></span>
            <span>Restricted Holiday (Blue)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-xs shadow-emerald-200"></span>
            <span>Today</span>
          </div>
        </div>

        <div class="text-xs font-medium text-slate-500">
          Official Government Calendar
        </div>
      </div>

      <!-- Main Layout: Grid Calendar + Side List -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Calendar Card (Left 2 cols) -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          <!-- Calendar Header & Navigation -->
          <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button @click="prevMonth" class="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-600 transition-colors" title="Previous Month">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button @click="goToToday" class="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors">
                  Today
                </button>
                <button @click="nextMonth" class="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-600 transition-colors" title="Next Month">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              <h2 class="text-lg font-black text-slate-900 tracking-tight">
                {{ monthNames[currentMonth] }} {{ currentYear }}
              </h2>
            </div>

            <!-- Month / Year Selector Pickers -->
            <div class="flex items-center gap-2">
              <select 
                v-model="currentMonth" 
                class="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option v-for="(mName, idx) in monthNames" :key="idx" :value="idx">
                  {{ mName }}
                </option>
              </select>

              <select 
                v-model="currentYear" 
                class="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option v-for="y in yearList" :key="y" :value="y">
                  {{ y }}
                </option>
              </select>
            </div>
          </div>

          <!-- Calendar Grid -->
          <div class="p-5">
            <!-- Day Labels (Sun in RED) -->
            <div class="grid grid-cols-7 gap-2 mb-3 text-center">
              <div class="text-xs font-black uppercase tracking-wider text-rose-600 py-1 bg-rose-50/60 rounded-lg">Sun</div>
              <div class="text-xs font-black uppercase tracking-wider text-slate-400 py-1">Mon</div>
              <div class="text-xs font-black uppercase tracking-wider text-slate-400 py-1">Tue</div>
              <div class="text-xs font-black uppercase tracking-wider text-slate-400 py-1">Wed</div>
              <div class="text-xs font-black uppercase tracking-wider text-slate-400 py-1">Thu</div>
              <div class="text-xs font-black uppercase tracking-wider text-slate-400 py-1">Fri</div>
              <div class="text-xs font-black uppercase tracking-wider text-slate-400 py-1">Sat</div>
            </div>

            <!-- Date Cells Grid -->
            <div class="grid grid-cols-7 gap-2">
              <!-- Empty blank cells before start of month -->
              <div v-for="n in startingBlankDays" :key="'blank-' + n" class="h-24 rounded-xl bg-slate-50/30 border border-dashed border-slate-100"></div>

              <!-- Month Days -->
              <div 
                v-for="day in daysInMonth" 
                :key="day"
                class="h-24 rounded-xl p-1.5 border transition-all flex flex-col justify-between relative group"
                :class="getDayCardClasses(day)"
              >
                <!-- Day Number Header -->
                <div class="flex items-center justify-between">
                  <span 
                    class="text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                    :class="getDayNumberClasses(day)"
                  >
                    {{ day }}
                  </span>

                  <span v-if="isToday(day)" class="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500 text-white shadow-2xs">
                    Today
                  </span>
                </div>

                <!-- Holiday Badge / Tag if any -->
                <div class="space-y-1 overflow-hidden my-auto">
                  <template v-if="getHolidaysForDay(day).length > 0">
                    <div 
                      v-for="h in getHolidaysForDay(day)" 
                      :key="h.id"
                      class="px-2 py-1 rounded-lg text-[10px] font-bold leading-snug truncate flex items-center gap-1 shadow-2xs"
                      :class="h.type === 'restricted' ? 'bg-blue-600 text-white border border-blue-700' : 'bg-rose-600 text-white border border-rose-700'"
                      :title="h.title + ' (' + (h.type === 'restricted' ? 'Restricted Holiday' : 'Holiday') + ')'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-white shrink-0"></span>
                      <span class="truncate">{{ h.title }}</span>
                    </div>
                  </template>
                  <template v-else-if="isSunday(day)">
                    <div class="px-1.5 py-0.5 rounded text-[10px] font-bold text-rose-600 bg-rose-100/70 border border-rose-200/80 text-center">
                      Sunday
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Monthly Holiday Summary & List -->
        <div class="space-y-6">
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 class="font-bold text-slate-900 text-base">Holidays in {{ monthNames[currentMonth] }}</h3>
                <p class="text-xs text-slate-500 font-medium mt-0.5">{{ currentMonthHolidays.length }} holiday(s) listed</p>
              </div>

              <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                {{ currentYear }}
              </span>
            </div>

            <!-- List of Holidays for Current Month -->
            <div v-if="currentMonthHolidays.length === 0" class="text-center py-8 text-slate-400">
              <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-xs font-semibold">No holidays listed for this month.</p>
            </div>

            <div v-else class="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              <div 
                v-for="item in currentMonthHolidays" 
                :key="item.id"
                class="p-3.5 rounded-xl border transition-all"
                :class="item.type === 'restricted' ? 'bg-blue-50/40 border-blue-200' : 'bg-rose-50/40 border-rose-200'"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="space-y-1">
                    <span 
                      class="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md text-white shadow-2xs"
                      :class="item.type === 'restricted' ? 'bg-blue-600' : 'bg-rose-600'"
                    >
                      {{ item.type === 'restricted' ? 'Restricted Holiday' : 'Public Holiday' }}
                    </span>
                    <h4 class="font-bold text-slate-900 text-sm leading-snug">
                      {{ item.title }}
                    </h4>
                    <p class="text-xs font-medium text-slate-500">
                      {{ formatDateReadable(item.date) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'
import { DEFAULT_HOLIDAYS } from '../../constants/holidays.js'

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const todayObj = new Date()
const currentMonth = ref(todayObj.getMonth()) // 0-indexed
const currentYear = ref(todayObj.getFullYear())

const yearList = computed(() => {
  const years = []
  for (let y = 2024; y <= 2030; y++) {
    years.push(y)
  }
  return years
})

// Read-only static holidays from repository
const holidays = ref(DEFAULT_HOLIDAYS)

// Calendar Month Math
const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const startingBlankDays = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const goToToday = () => {
  currentMonth.value = todayObj.getMonth()
  currentYear.value = todayObj.getFullYear()
}

const getFormattedDateStr = (day) => {
  const mStr = String(currentMonth.value + 1).padStart(2, '0')
  const dStr = String(day).padStart(2, '0')
  return `${currentYear.value}-${mStr}-${dStr}`
}

const isSunday = (day) => {
  const dayOfWeek = new Date(currentYear.value, currentMonth.value, day).getDay()
  return dayOfWeek === 0
}

const isToday = (day) => {
  return (
    day === todayObj.getDate() &&
    currentMonth.value === todayObj.getMonth() &&
    currentYear.value === todayObj.getFullYear()
  )
}

const getHolidaysForDay = (day) => {
  const dStr = getFormattedDateStr(day)
  return holidays.value.filter(h => h.date === dStr)
}

// Dynamic styling for day cards on calendar grid
const getDayCardClasses = (day) => {
  const dayHolidays = getHolidaysForDay(day)
  const sunday = isSunday(day)
  const today = isToday(day)

  const hasPublicHoliday = dayHolidays.some(h => h.type === 'holiday')
  const hasRestrictedHoliday = dayHolidays.some(h => h.type === 'restricted')

  if (hasPublicHoliday || (sunday && !hasRestrictedHoliday)) {
    // Red styling for Public Holiday / Sunday
    return 'bg-rose-50/70 border-rose-300/80 shadow-2xs'
  }
  
  if (hasRestrictedHoliday) {
    // Blue styling for Restricted Holiday
    return 'bg-blue-50/70 border-blue-300/80 shadow-2xs'
  }

  if (today) {
    return 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
  }

  return 'bg-white border-slate-200/80'
}

const getDayNumberClasses = (day) => {
  const sunday = isSunday(day)
  const today = isToday(day)
  const dayHolidays = getHolidaysForDay(day)
  const hasPublicHoliday = dayHolidays.some(h => h.type === 'holiday')
  const hasRestrictedHoliday = dayHolidays.some(h => h.type === 'restricted')

  if (today) {
    return 'bg-emerald-600 text-white'
  }

  if (sunday || hasPublicHoliday) {
    // Sunday or Public Holiday in RED
    return 'text-rose-600 font-black'
  }

  if (hasRestrictedHoliday) {
    // Restricted Holiday in BLUE
    return 'text-blue-600 font-black'
  }

  return 'text-slate-700 font-bold'
}

// List of holidays for current active month
const currentMonthHolidays = computed(() => {
  const prefix = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`
  return holidays.value
    .filter(h => h.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date))
})

const formatDateReadable = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
