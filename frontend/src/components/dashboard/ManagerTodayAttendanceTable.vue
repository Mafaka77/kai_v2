<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
      <div>
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>👥</span>
          <span>Staff Attendance Breakdown ({{ dateLabel }})</span>
        </h3>
        <p class="text-xs text-slate-400 mt-0.5">
          Real-time sign-in logs for employees in {{ officeName || 'your office' }}
        </p>
      </div>

      <!-- Search & Refresh -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <!-- Search Box -->
        <div class="relative w-full sm:w-48 lg:w-64">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            v-model="search"
            type="text" 
            placeholder="Filter employee..."
            class="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <!-- Refresh Button -->
        <button 
          @click="$emit('refresh')"
          :disabled="loading"
          class="bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 text-slate-700 text-xs font-bold p-2 rounded-xl transition-all cursor-pointer shadow-xs shrink-0 flex items-center justify-center"
        >
          <svg 
            class="w-3.5 h-3.5 text-indigo-600" 
            :class="{ 'animate-spin': loading }" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Filter Buttons / Metrics -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      <button 
        @click="statusFilter = 'All'"
        :class="[
          'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
          statusFilter === 'All' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        ]"
      >
        <span>All Staff</span>
        <span :class="['px-1.5 py-0.2 rounded-md text-[11px]', statusFilter === 'All' ? 'bg-indigo-500/40 text-white' : 'bg-slate-100 text-slate-700']">
          {{ summary.total || 0 }}
        </span>
      </button>

      <button 
        @click="statusFilter = 'Present'"
        :class="[
          'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
          statusFilter === 'Present' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        ]"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-500" v-if="statusFilter !== 'Present'"></span>
        <span>Present</span>
        <span :class="['px-1.5 py-0.2 rounded-md text-[11px]', statusFilter === 'Present' ? 'bg-emerald-500/40 text-white' : 'bg-emerald-50 text-emerald-700']">
          {{ summary.present || 0 }}
        </span>
      </button>

      <button 
        @click="statusFilter = 'Late'"
        :class="[
          'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
          statusFilter === 'Late' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        ]"
      >
        <span class="w-2 h-2 rounded-full bg-amber-500" v-if="statusFilter !== 'Late'"></span>
        <span>Late</span>
        <span :class="['px-1.5 py-0.2 rounded-md text-[11px]', statusFilter === 'Late' ? 'bg-amber-400/40 text-white' : 'bg-amber-50 text-amber-700']">
          {{ summary.late || 0 }}
        </span>
      </button>

      <button 
        @click="statusFilter = 'Absent'"
        :class="[
          'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
          statusFilter === 'Absent' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        ]"
      >
        <span class="w-2 h-2 rounded-full bg-rose-500" v-if="statusFilter !== 'Absent'"></span>
        <span>Absent</span>
        <span :class="['px-1.5 py-0.2 rounded-md text-[11px]', statusFilter === 'Absent' ? 'bg-rose-500/40 text-white' : 'bg-rose-50 text-rose-700']">
          {{ summary.absent || 0 }}
        </span>
      </button>
    </div>

    <!-- Attendance Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs text-slate-600">
        <thead class="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
          <tr>
            <th class="py-3 px-4">Employee</th>
            <th class="py-3 px-4">Designation</th>
            <th class="py-3 px-4">Sign In Time</th>
            <th class="py-3 px-4">Sign Out Time</th>
            <th class="py-3 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading" v-for="n in 5" :key="n" class="animate-pulse">
            <td class="py-3.5 px-4 space-y-1.5">
              <div class="h-3.5 bg-slate-200 rounded-md w-32"></div>
              <div class="h-2.5 bg-slate-100 rounded-md w-20"></div>
            </td>
            <td class="py-3.5 px-4">
              <div class="h-3 bg-slate-200 rounded-md w-24"></div>
            </td>
            <td class="py-3.5 px-4">
              <div class="h-3 bg-slate-100 rounded-md w-16"></div>
            </td>
            <td class="py-3.5 px-4">
              <div class="h-3 bg-slate-100 rounded-md w-16"></div>
            </td>
            <td class="py-3.5 px-4 text-right">
              <div class="h-5 bg-slate-200 rounded-full w-16 ml-auto"></div>
            </td>
          </tr>
          <tr v-else-if="paginatedUsers.length === 0">
            <td colspan="5" class="py-8 text-center text-slate-400 font-medium">
              No staff attendance records found
            </td>
          </tr>
          <tr v-else v-for="user in paginatedUsers" :key="user.id" class="hover:bg-slate-50/80 transition-colors">
            <td class="py-3 px-4">
              <div class="font-bold text-slate-900">{{ user.full_name }}</div>
              <div class="text-[10px] text-slate-400 font-mono">{{ user.mobile || 'No mobile' }}</div>
            </td>
            <td class="py-3 px-4 font-medium text-slate-600">
              {{ user.designation }}
            </td>
            <td class="py-3 px-4 font-semibold text-slate-800">
              <span v-if="user.signin_at" class="flex items-center gap-1 text-slate-700">
                <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatTime(user.signin_at) }}
              </span>
              <span v-else class="text-slate-300 font-mono text-[11px]">—</span>
            </td>
            <td class="py-3 px-4 font-semibold text-slate-800">
              <span v-if="user.signout_at" class="flex items-center gap-1 text-slate-700">
                <svg class="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {{ formatTime(user.signout_at) }}
              </span>
              <span v-else class="text-slate-300 font-mono text-[11px]">—</span>
            </td>
            <td class="py-3 px-4 text-right">
              <span 
                v-if="user.status === 'Present'"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Present
              </span>
              <span 
                v-if="user.status === 'Late'"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Late
              </span>
              <span 
                v-if="user.status === 'Absent'"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                Absent
              </span>

              <div v-if="user.in_remark || user.out_remark" class="flex flex-col gap-0.5 text-[10px] text-slate-500 mt-1 max-w-[180px] ml-auto whitespace-normal">
                <div v-if="user.in_remark" class="truncate text-right" :title="'In: ' + user.in_remark">
                  <span class="font-medium text-slate-400">In:</span> {{ user.in_remark }}
                </div>
                <div v-if="user.out_remark" class="truncate text-right" :title="'Out: ' + user.out_remark">
                  <span class="font-medium text-slate-400">Out:</span> {{ user.out_remark }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination controls -->
    <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4 mt-2">
      <div class="text-xs text-slate-500 text-center sm:text-left">
        Showing <span class="font-semibold text-slate-700">{{ startIndex + 1 }}</span> to 
        <span class="font-semibold text-slate-700">{{ endIndex }}</span> of 
        <span class="font-semibold text-slate-700">{{ totalRecords }}</span> staff members
      </div>
      
      <div class="flex items-center gap-1.5">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button 
          v-for="page in visiblePageNumbers" 
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
            currentPage === page 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          ]"
        >
          {{ page }}
        </button>

        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  users: { type: Array, default: () => [] },
  officeName: { type: String, default: '' },
  dateLabel: { type: String, default: 'Today' },
  loading: { type: Boolean, default: false }
})

defineEmits(['refresh'])

const search = ref('')
const statusFilter = ref('All')
const currentPage = ref(1)
const pageSize = ref(10)

const summary = computed(() => {
  const counts = {
    total: props.users.length,
    present: 0,
    late: 0,
    absent: 0
  }
  props.users.forEach(u => {
    if (u.status === 'Present') counts.present++
    else if (u.status === 'Late') counts.late++
    else if (u.status === 'Absent') counts.absent++
  })
  return counts
})

const filteredUsers = computed(() => {
  let list = [...props.users]

  // Apply status filter
  if (statusFilter.value !== 'All') {
    list = list.filter(u => u.status === statusFilter.value)
  }

  // Apply search query filter
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(u => 
      u.full_name?.toLowerCase().includes(q) ||
      u.designation?.toLowerCase().includes(q)
    )
  }

  // Sort: Earliest sign-in first, followed by employees who haven't signed in
  list.sort((a, b) => {
    if (a.signin_at && b.signin_at) {
      return new Date(a.signin_at) - new Date(b.signin_at)
    }
    if (a.signin_at && !b.signin_at) return -1
    if (!a.signin_at && b.signin_at) return 1
    return (a.full_name || '').localeCompare(b.full_name || '')
  })

  return list
})

// Reset page to 1 when search query changes
watch(search, () => {
  currentPage.value = 1
})

// Reset page to 1 when status filter changes
watch(statusFilter, () => {
  currentPage.value = 1
})

// Reset page to 1 if props data changes
watch(() => props.users, () => {
  currentPage.value = 1
})

const totalRecords = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, totalRecords.value))

const paginatedUsers = computed(() => {
  return filteredUsers.value.slice(startIndex.value, startIndex.value + pageSize.value)
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const goToPage = (page) => {
  currentPage.value = page
}

const visiblePageNumbers = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const formatTime = (dt) => {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
</script>
