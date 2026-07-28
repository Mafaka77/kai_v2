<template>
  <MainLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">My Attendance History</h1>
        <p class="text-slate-500 mt-1 text-sm">A complete log of your past attendance records.</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <!-- Filters -->
        <div class="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <input
            v-model="fromDate"
            type="date"
            @change="fetchHistory"
            class="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
          <span class="text-xs text-slate-400 font-medium">to</span>
          <input
            v-model="toDate"
            type="date"
            @change="fetchHistory"
            class="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <svg class="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Empty -->
        <div v-else-if="records.length === 0" class="py-20 text-center text-slate-400">
          <p class="font-semibold text-slate-600">No records found for the selected period.</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Office</th>
                <th class="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Sign In</th>
                <th class="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Sign Out</th>
                <th class="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="rec in records" :key="rec.id" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-6 py-4 text-sm text-slate-600">{{ formatDate(rec.signin_at) }}</td>
                <td class="px-6 py-4 text-sm font-medium text-slate-700">{{ rec.Office?.name || '—' }}</td>
                <td class="px-6 py-4 text-sm font-semibold text-slate-800">{{ formatTime(rec.signin_at) }}</td>
                <td class="px-6 py-4">
                  <span v-if="rec.signout_at" class="text-sm font-semibold text-slate-800">{{ formatTime(rec.signout_at) }}</span>
                  <span v-else class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">Pending</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span :class="[
                    'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                    rec.type === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    rec.type === 'late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  ]">
                    {{ rec.type ? rec.type.charAt(0).toUpperCase() + rec.type.slice(1) : '—' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="records.length > 0" class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-xs text-slate-500">
            Showing <span class="font-bold text-slate-700">{{ paginationRange.from }}</span> to
            <span class="font-bold text-slate-700">{{ paginationRange.to }}</span> of
            <span class="font-bold text-slate-700">{{ pagination.total }}</span> entries
          </div>
          <div class="flex items-center gap-2">
            <button @click="changePage(pagination.page - 1)" :disabled="!pagination.hasPrevPage"
              class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
              Previous
            </button>
            <span class="text-xs font-bold text-slate-600 px-2">Page {{ pagination.page }} of {{ pagination.totalPages || 1 }}</span>
            <button @click="changePage(pagination.page + 1)" :disabled="!pagination.hasNextPage"
              class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed">
              Next
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
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

const records = ref([])
const loading = ref(false)

// Default: current month
const now = new Date()
const fromDate = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`)
const toDate = ref(now.toISOString().split('T')[0])

const pagination = ref({
  total: 0, page: 1, limit: 20, totalPages: 1, hasNextPage: false, hasPrevPage: false
})

const paginationRange = computed(() => {
  if (pagination.value.total === 0) return { from: 0, to: 0 }
  const from = (pagination.value.page - 1) * pagination.value.limit + 1
  const to = Math.min(pagination.value.page * pagination.value.limit, pagination.value.total)
  return { from, to }
})

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

const formatDate = (ds) => {
  const d = parseDate(ds)
  return d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
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

const fetchHistory = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.append('from', fromDate.value)
    params.append('to', toDate.value)
    params.append('page', pagination.value.page)
    params.append('limit', pagination.value.limit)
    const res = await api.get(`/my-attendance/history?${params.toString()}`)
    if (res.data?.status === 'success') {
      records.value = res.data.data
      if (res.data.pagination) pagination.value = res.data.pagination
    }
  } catch (err) {
    console.error('Failed to fetch history', err)
  } finally {
    loading.value = false
  }
}

const changePage = (newPage) => {
  if (newPage < 1 || newPage > pagination.value.totalPages) return
  pagination.value.page = newPage
  fetchHistory()
}

onMounted(fetchHistory)
</script>
