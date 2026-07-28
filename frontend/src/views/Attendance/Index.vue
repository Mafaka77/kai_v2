<template>
  <MainLayout>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden space-y-0">
      
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-slate-800">Attendance Log Book</h2>
          <p class="text-xs text-slate-400 mt-0.5">Track daily employee attendance, late arrivals, active leaves, and absences.</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Date Filter Selector -->
          <div>
            <input 
              v-model="selectedDate" 
              type="date" 
              @change="setDate(selectedDate)"
              class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 shadow-xs"
            />
          </div>

          <!-- Office Filter Dropdown -->
          <div v-if="offices.length > 0">
            <select 
              v-model="selectedOfficeId" 
              @change="setOffice(selectedOfficeId)"
              class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 shadow-xs"
            >
              <option value="">All Offices</option>
              <option v-for="office in offices" :key="office.id" :value="office.id">
                {{ office.name }}
              </option>
            </select>
          </div>
          
          <button @click="fetchAttendances" class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Filter Tabs / Metrics -->
      <div class="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
        <button 
          @click="setStatusFilter('all')"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
            statusFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          ]"
        >
          <span>All Staff</span>
          <span :class="['px-1.5 py-0.2 rounded-md text-[11px]', statusFilter === 'all' ? 'bg-indigo-500/40 text-white' : 'bg-slate-100 text-slate-700']">
            {{ summary.total || 0 }}
          </span>
        </button>

        <button 
          @click="setStatusFilter('present')"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
            statusFilter === 'present' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500" v-if="statusFilter !== 'present'"></span>
          <span>Present</span>
          <span :class="['px-1.5 py-0.2 rounded-md text-[11px]', statusFilter === 'present' ? 'bg-emerald-500/40 text-white' : 'bg-emerald-50 text-emerald-700']">
            {{ summary.present || 0 }}
          </span>
        </button>

        <button 
          @click="setStatusFilter('late')"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
            statusFilter === 'late' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-amber-500" v-if="statusFilter !== 'late'"></span>
          <span>Late</span>
          <span :class="['px-1.5 py-0.2 rounded-md text-[11px]', statusFilter === 'late' ? 'bg-amber-400/40 text-white' : 'bg-amber-50 text-amber-700']">
            {{ summary.late || 0 }}
          </span>
        </button>

        <button 
          @click="setStatusFilter('absent')"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
            statusFilter === 'absent' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-rose-500" v-if="statusFilter !== 'absent'"></span>
          <span>Absent</span>
          <span :class="['px-1.5 py-0.2 rounded-md text-[11px]', statusFilter === 'absent' ? 'bg-rose-500/40 text-white' : 'bg-rose-50 text-rose-700']">
            {{ summary.absent || 0 }}
          </span>
        </button>

        <button 
          @click="setStatusFilter('leave')"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
            statusFilter === 'leave' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-indigo-500" v-if="statusFilter !== 'leave'"></span>
          <span>On Leave</span>
          <span :class="['px-1.5 py-0.2 rounded-md text-[11px]', statusFilter === 'leave' ? 'bg-indigo-500/40 text-white' : 'bg-indigo-50 text-indigo-700']">
            {{ summary.leave || 0 }}
          </span>
        </button>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto p-6">
        <table class="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Office</th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sign In</th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sign Out</th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-100">
            <tr v-if="loading">
              <td colspan="5" class="px-3 py-8 text-center text-slate-500">Loading attendance records...</td>
            </tr>
            <tr v-else-if="attendances.length === 0">
              <td colspan="5" class="px-3 py-8 text-center text-slate-500">No records found for the selected filter.</td>
            </tr>
            <tr v-else v-for="log in attendances" :key="log.id" class="hover:bg-slate-50 transition-colors">
              <!-- User -->
              <td class="px-3 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-slate-800">{{ log.User?.full_name || 'Unknown' }}</div>
                <div class="text-xs text-slate-500">{{ log.User?.mobile }}</div>
              </td>

              <!-- Office -->
              <td class="px-3 py-4 whitespace-nowrap">
                <div class="text-sm text-slate-600">{{ log.Office?.name || 'Unknown' }}</div>
              </td>

              <!-- Sign In -->
              <td class="px-3 py-4 whitespace-nowrap">
                <template v-if="log.type === 'absent'">
                  <span class="text-xs text-rose-500 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Not Signed In</span>
                </template>
                <template v-else-if="log.type === 'leave'">
                  <span class="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    On Leave ({{ log.leaveType || 'Approved' }})
                  </span>
                </template>
                <template v-else-if="log.signin_at">
                  <div class="text-sm text-slate-800">{{ formatDate(log.signin_at) }}</div>
                  <div class="text-xs text-slate-500">{{ formatTime(log.signin_at) }}</div>
                </template>
                <template v-else>
                  <span class="text-xs text-slate-400">—</span>
                </template>
              </td>

              <!-- Sign Out -->
              <td class="px-3 py-4 whitespace-nowrap">
                <template v-if="log.signout_at">
                  <div class="text-sm text-slate-800">{{ formatDate(log.signout_at) }}</div>
                  <div class="text-xs text-slate-500">{{ formatTime(log.signout_at) }}</div>
                </template>
                <template v-else-if="log.type === 'present' || log.type === 'late'">
                  <span class="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">Pending</span>
                </template>
                <template v-else>
                  <span class="text-xs text-slate-400">—</span>
                </template>
              </td>

              <!-- Status Badge -->
              <td class="px-3 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs',
                  log.type === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  log.type === 'late'    ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  log.type === 'absent'  ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  log.type === 'leave'   ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                           'bg-slate-50 text-slate-700 border-slate-200'
                ]">
                  {{ log.type ? log.type.charAt(0).toUpperCase() + log.type.slice(1) : 'Unknown' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="attendances.length > 0" class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs text-slate-500">
          Showing <span class="font-bold text-slate-700">{{ paginationRange.from }}</span> to 
          <span class="font-bold text-slate-700">{{ paginationRange.to }}</span> of 
          <span class="font-bold text-slate-700">{{ pagination.total }}</span> entries
        </div>

        <div class="flex items-center gap-2">
          <button 
            @click="changePage(pagination.page - 1)"
            :disabled="!pagination.hasPrevPage"
            class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          <span class="text-xs font-bold text-slate-600 px-2">
            Page {{ pagination.page }} of {{ pagination.totalPages || 1 }}
          </span>

          <button 
            @click="changePage(pagination.page + 1)"
            :disabled="!pagination.hasNextPage"
            class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import MainLayout from '../../layouts/MainLayout.vue'
import { useAttendanceStore } from '../../stores/attendance'

const store = useAttendanceStore()

const {
  attendances,
  offices,
  summary,
  loading,
  selectedOfficeId,
  selectedDate,
  statusFilter,
  pagination
} = storeToRefs(store)

const paginationRange = computed(() => {
  if (pagination.value.total === 0) return { from: 0, to: 0 }
  const from = (pagination.value.page - 1) * pagination.value.limit + 1
  const to = Math.min(pagination.value.page * pagination.value.limit, pagination.value.total)
  return { from, to }
})

const parseDate = (dateString) => {
  if (!dateString) return null
  if (dateString instanceof Date) return dateString
  
  if (typeof dateString === 'string') {
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [_, year, month, day, hours, minutes, seconds] = match;
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds)
      );
    }
  }
  
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

const formatDate = (dateString) => {
  const date = parseDate(dateString)
  if (!date) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (dateString) => {
  const date = parseDate(dateString)
  if (!date) return '—'
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  const hoursStr = String(hours).padStart(2, '0')
  return `${hoursStr}:${minutes} ${ampm}`
}

const fetchAttendances = () => store.fetchAttendances()
const setOffice = (id) => store.setOffice(id)
const setDate = (date) => store.setDate(date)
const setStatusFilter = (filter) => store.setStatusFilter(filter)
const changePage = (newPage) => store.changePage(newPage)

onMounted(() => {
  fetchAttendances()
})
</script>
