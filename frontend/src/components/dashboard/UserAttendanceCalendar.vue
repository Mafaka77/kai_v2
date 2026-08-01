<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8 max-w-4xl">
    <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <button @click="prevMonth" class="p-1.5 hover:bg-white hover:shadow-sm rounded cursor-pointer text-slate-500 hover:text-slate-800 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button @click="nextMonth" :disabled="isCurrentMonth" class="p-1.5 hover:bg-white hover:shadow-sm rounded cursor-pointer text-slate-500 hover:text-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div>
          <h3 class="text-base font-black text-slate-800 tracking-tight leading-none">{{ currentMonthName }} {{ currentYear }}</h3>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3 text-[9px] font-bold uppercase tracking-wider">
        <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Present</div>
        <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Late</div>
        <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-rose-500"></span> Absent</div>
        <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-slate-200"></span> Off</div>
      </div>
    </div>
    <div class="p-5 overflow-x-auto">
      <div class="min-w-[400px]">
        <div class="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div class="grid grid-cols-7 gap-2">
          <!-- Empty cells for start of month offset -->
          <div v-for="n in startingBlankDays" :key="'blank-' + n" class="h-12 sm:h-14 rounded-lg bg-transparent"></div>
          
          <!-- Days of the month -->
          <div 
            v-for="day in daysInMonth" 
            :key="day" 
            class="h-12 sm:h-14 rounded-lg flex flex-col items-center justify-center relative transition-all"
            :class="getDayStyles(day)"
          >
            <span class="text-xs sm:text-sm font-bold z-10" :class="getDayTextStyles(day)">{{ day }}</span>
            
            <!-- Mini indicator dot if needed -->
            <div v-if="hasPunchTime(day)" class="absolute bottom-1.5 text-[8px] sm:text-[9px] font-bold z-10 opacity-75">
              {{ formatPunchTime(day) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  attendances: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['change-month'])

const holidays = [
  // 2026
  '01-01-2026', '02-01-2026', '11-01-2026', '26-01-2026', '20-02-2026', '04-03-2026', '13-03-2026', '21-03-2026',
  '26-03-2026', '31-03-2026', '03-04-2026', '14-04-2026', '01-05-2026', '27-05-2026', '15-06-2026', '26-06-2026', '30-06-2026',
  '06-07-2026', '15-08-2026', '26-08-2026', '04-09-2026', '02-10-2026', '20-10-2026', '08-11-2026', '24-11-2026',
  '24-12-2026', '25-12-2026', '26-12-2026', '31-12-2026'
];

const today = new Date()
const viewDate = ref(new Date())

const currentYear = computed(() => viewDate.value.getFullYear())
const currentMonth = computed(() => viewDate.value.getMonth()) // 0-indexed

const currentMonthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleString('default', { month: 'long' })
})

const isCurrentMonth = computed(() => {
  return currentYear.value === today.getFullYear() && currentMonth.value === today.getMonth()
})

const prevMonth = () => {
  viewDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
  emit('change-month', { month: currentMonth.value + 1, year: currentYear.value })
}

const nextMonth = () => {
  if (isCurrentMonth.value) return
  viewDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
  emit('change-month', { month: currentMonth.value + 1, year: currentYear.value })
}

// Number of days in the current month
const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

// Day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
const startingBlankDays = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const getAttendanceForDay = (day) => {
  if (!props.attendances) return null;
  return props.attendances.find(a => {
    const d = new Date(a.signin_at)
    return d.getDate() === day && d.getMonth() === currentMonth.value && d.getFullYear() === currentYear.value
  })
}

const isHoliday = (day) => {
  const d = String(day).padStart(2, '0')
  const m = String(currentMonth.value + 1).padStart(2, '0')
  const y = currentYear.value
  return holidays.includes(`${d}-${m}-${y}`)
}

const isWeekend = (day) => {
  const dayOfWeek = new Date(currentYear.value, currentMonth.value, day).getDay()
  return dayOfWeek === 0 || dayOfWeek === 6
}

const getDayStatus = (day) => {
  const dateObj = new Date(currentYear.value, currentMonth.value, day)
  
  // Future dates
  if (dateObj > today) return 'future'
  
  // Holidays & Weekends
  if (isHoliday(day) || isWeekend(day)) return 'off'

  const attendance = getAttendanceForDay(day)
  
  if (attendance) {
    return attendance.type === 'late' ? 'late' : 'present'
  }

  // If it's today and they haven't punched yet, mark absent
  if (dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear()) {
    return 'absent'
  }

  // Past dates without attendance on a working day
  return 'absent'
}

const getDayStyles = (day) => {
  const status = getDayStatus(day)
  switch (status) {
    case 'present': return 'bg-emerald-50 border border-emerald-400 shadow-[0_1px_2px_rgba(16,185,129,0.1)]'
    case 'late': return 'bg-amber-50 border border-amber-300 shadow-[0_1px_2px_rgba(245,158,11,0.1)]'
    case 'absent': return 'bg-rose-50/50 border border-rose-200'
    case 'off': return 'bg-slate-50 border border-slate-100 opacity-70'
    case 'future': return 'bg-transparent border border-dashed border-slate-200 opacity-40'
    default: return ''
  }
}

const getDayTextStyles = (day) => {
  const status = getDayStatus(day)
  switch (status) {
    case 'present': return 'text-emerald-700'
    case 'late': return 'text-amber-700'
    case 'absent': return 'text-rose-500'
    case 'off': return 'text-slate-400'
    case 'future': return 'text-slate-300'
    default: return 'text-slate-700'
  }
}

const hasPunchTime = (day) => {
  return ['present', 'late'].includes(getDayStatus(day))
}

const formatPunchTime = (day) => {
  const attendance = getAttendanceForDay(day)
  if (!attendance) return ''
  return new Date(attendance.signin_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
</script>
