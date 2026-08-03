<template>
  <MainLayout>
    <div class="space-y-8">
      
      <!-- Page Header (EHMS Standard) -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Attendance Appeals</h1>
          <p class="text-slate-500 mt-1 text-sm">Review, authorize, or decline employee attendance & tour discrepancy requests.</p>
        </div>
      </div>

      <!-- Stats Grid (Compact EHMS Style with Icons) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <!-- Stat Card 1: Pending -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-20 h-20 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div class="relative z-10 flex justify-between items-start">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Appeals</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-1">{{ pendingCount }}</h3>
              <p class="text-[11px] font-semibold text-amber-600 mt-1.5 flex items-center gap-1.5">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Requires Review
              </p>
            </div>
            <div class="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Stat Card 2: Approved -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div class="relative z-10 flex justify-between items-start">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Appeals</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-1">{{ approvedCount }}</h3>
           
            </div>
            <div class="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Stat Card 3: Rejected -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-20 h-20 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div class="relative z-10 flex justify-between items-start">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected Appeals</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-1">{{ rejectedCount }}</h3>
           
            </div>
            <div class="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

      </div>

      <!-- Main Content Card (EHMS Standard Container) -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        <!-- Filter Tabs & Search Header -->
        <div class="p-6 border-b border-slate-100 bg-slate-50/30 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <!-- Category Tabs -->
            <PillTabs 
              :tabs="tabs" 
              :modelValue="currentTab" 
              @update:modelValue="setTab" 
            />

            <!-- Search Bar & Status Filter -->
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <!-- Status Filter -->
              <div class="relative w-full sm:w-auto min-w-[140px]">
                <select 
                  v-model="statusFilter"
                  @change="setStatusFilter(statusFilter)"
                  class="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-inner appearance-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <!-- Search Bar -->
              <div class="relative w-full lg:w-80">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input 
                  v-model="searchQuery"
                  @input="fetchAppeals"
                  type="text" 
                  placeholder="Search by employee name..." 
                  class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-inner"
                />
              </div>
            </div>

          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg class="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Loading appeals...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="appeals.length === 0" class="p-6 text-center text-slate-500 py-24">
          <svg class="w-16 h-16 mx-auto text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-slate-700 font-semibold text-lg">No appeal records found</p>
          <p class="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            There are no pending or processed appeal requests listed for this category.
          </p>
        </div>

        <!-- EHMS Data Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[22%]">Employee</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[18%]">Office / Placement</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[20%]">Details</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[22%]">Reason</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[10%] text-center">Status</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[8%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="appeal in appeals" 
                :key="appeal.id"
                class="hover:bg-slate-50/50 transition-colors group"
              >
                <!-- Employee Name & Designation -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-indigo-50 flex-shrink-0 flex items-center justify-center text-indigo-600 font-semibold text-sm group-hover:bg-indigo-100 transition-colors">
                      {{ appeal.User?.full_name ? appeal.User.full_name.charAt(0).toUpperCase() : 'U' }}
                    </div>
                    <div>
                      <div class="font-semibold text-slate-900 text-sm">{{ appeal.User?.full_name || 'N/A' }}</div>
                      <div class="text-slate-400 text-xs mt-0.5">{{ appeal.User?.designation || 'Staff Member' }}</div>
                    </div>
                  </div>
                </td>

                <!-- Office / Placement -->
                <td class="px-6 py-4">
                  <span class="text-slate-700 text-sm font-medium">{{ appeal.Office?.name || 'N/A' }}</span>
                </td>

                <!-- Details (Check-in time, date range, etc.) -->
                <td class="px-6 py-4 text-xs">
                  <div v-if="appeal.type === 'late_reason'" class="space-y-1">
                    <span class="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                      {{ appeal.signin_time || 'N/A' }}
                    </span>
                    <div class="text-slate-500 font-medium">{{ formatDate(appeal.start_date) }}</div>
                  </div>
                  <div v-else-if="appeal.type === 'left_early'" class="text-slate-700 font-medium">
                    {{ formatDate(appeal.start_date) }}
                  </div>
                  <div v-else-if="appeal.type === 'on_Duty'" class="text-slate-700 font-medium">
                    {{ formatDate(appeal.start_date) }} - {{ formatDate(appeal.end_date) }}
                  </div>
                </td>

                <!-- Reason -->
                <td class="px-6 py-4">
                  <p class="text-xs text-slate-600 italic line-clamp-2 max-w-xs" :title="appeal.reason">
                    "{{ appeal.reason || 'No description provided.' }}"
                  </p>
                  <span class="text-[10px] text-slate-400 font-medium block mt-1">
                    Submitted {{ formatTimeAgo(appeal.createdAt) }}
                  </span>
                </td>

                <!-- Status Badge -->
                <td class="px-6 py-4 text-center">
                  <span 
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm"
                    :class="[
                      appeal.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : '',
                      appeal.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : '',
                      appeal.status === 'Submitted' ? 'bg-amber-50 text-amber-700 border-amber-200' : '',
                    ]"
                  >
                    <span 
                      class="w-1.5 h-1.5 rounded-full" 
                      :class="[
                        appeal.status === 'Approved' ? 'bg-emerald-500' : '',
                        appeal.status === 'Rejected' ? 'bg-rose-500' : '',
                        appeal.status === 'Submitted' ? 'bg-amber-500 animate-pulse' : '',
                      ]"
                    ></span>
                    {{ appeal.status }}
                  </span>
                </td>

                <!-- Action Buttons -->
                <td class="px-6 py-4 text-center">
                  <div v-if="appeal.status === 'Submitted'" class="flex items-center justify-center gap-2">
                    <!-- Reject -->
                    <button 
                      @click="handleReject(appeal.id)" 
                      :disabled="processingId === appeal.id"
                      class="p-2 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all disabled:opacity-50"
                      title="Reject Appeal"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <!-- Approve -->
                    <button 
                      @click="handleApprove(appeal.id)" 
                      :disabled="processingId === appeal.id"
                      class="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
                      title="Approve Appeal"
                    >
                      <svg v-if="processingId === appeal.id" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                  <div v-else class="text-xs text-slate-400 font-semibold">
                    -
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div v-if="appeals.length > 0" class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-xs text-slate-500">
            Showing <span class="font-bold text-slate-700">{{ paginationRange.from }}</span> to 
            <span class="font-bold text-slate-700">{{ paginationRange.to }}</span> of 
            <span class="font-bold text-slate-700">{{ pagination.total }}</span> entries
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="changePage(pagination.page - 1)"
              :disabled="!pagination.hasPrevPage"
              class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <span class="text-xs font-bold text-slate-600 px-2">
              Page {{ pagination.page }} of {{ pagination.totalPages || 1 }}
            </span>
            <button 
              @click="changePage(pagination.page + 1)"
              :disabled="!pagination.hasNextPage"
              class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              Next
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppealStore } from '../../stores/appeal'
import MainLayout from '../../layouts/MainLayout.vue'
import PillTabs from '../../components/PillTabs.vue'

const store = useAppealStore()
const {
  currentTab,
  appeals,
  searchQuery,
  statusFilter,
  loading,
  processingId,
  pendingCount,
  approvedCount,
  rejectedCount,
  pagination
} = storeToRefs(store)

const paginationRange = computed(() => {
  if (pagination.value.total === 0) return { from: 0, to: 0 }
  const from = (pagination.value.page - 1) * pagination.value.limit + 1
  const to = Math.min(pagination.value.page * pagination.value.limit, pagination.value.total)
  return { from, to }
})

const tabs = [
  { 
    value: 'late_reason', 
    label: 'Late Reason', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>` 
  },
  { 
    value: 'left_early', 
    label: 'Left Early', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>` 
  },
  { 
    value: 'on_Duty', 
    label: 'On Duty (Tour)', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" /></svg>` 
  }
]

const setTab = (tabValue) => store.setTab(tabValue)
const setStatusFilter = (status) => store.setStatusFilter(status)
const fetchAppeals = () => store.fetchAppeals()
const handleApprove = (id) => store.handleApprove(id)
const handleReject = (id) => store.handleReject(id)
const changePage = (newPage) => store.changePage(newPage)

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'some time ago'
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

onMounted(() => {
  fetchAppeals()
})
</script>
