<template>
  <MainLayout>
    <div class="space-y-8">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">E-Leave Directory</h1>
          <p class="text-slate-500 mt-1 text-sm">
            View and manage officials who are marked on official leave today.
          </p>
        </div>
      </div>

      <!-- Main Filter Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        <!-- Search and Office Filter Section -->
        <div class="p-6 border-b border-slate-100 bg-slate-50/30">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="relative w-full md:w-80">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                v-model="searchQuery" 
                @input="handleSearch" 
                type="text" 
                placeholder="Search officials on leave..." 
                class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>

            <button 
              @click="fetchLeaves" 
              class="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-all cursor-pointer self-end md:self-auto"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Directory
            </button>
          </div>
        </div>

        <!-- Table / Empty State / Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg class="animate-spin h-10 w-10 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Loading leave directory...</span>
        </div>

        <div v-else-if="leaves.length === 0" class="py-24 text-center text-slate-400">
          <svg class="w-16 h-16 mx-auto text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-slate-900 font-bold text-lg">No Officials on Leave Today</p>
          <p class="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            No official leaves overlapping today are recorded for the selected office placement.
          </p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[30%]">Official</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[25%]">Office Placement</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[20%] text-center">Leave Category</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[25%] text-right">Duration & Count</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="item in leaves" 
                :key="item.id" 
                class="hover:bg-slate-50/50 transition-colors group"
              >
                <!-- Official Info -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0 border border-indigo-100">
                      {{ item.full_name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-slate-800">{{ item.full_name }}</div>
                      <div class="text-[11px] text-slate-400 mt-0.5">{{ item.designation || 'Staff' }} · {{ item.mobile }}</div>
                    </div>
                  </div>
                </td>

                <!-- Office Placement -->
                <td class="px-6 py-4">
                  <span class="text-sm text-slate-600 font-semibold">{{ item.office?.name || 'N/A' }}</span>
                </td>

                <!-- Leave Category Badge -->
                <td class="px-6 py-4 text-center">
                  <span 
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700 shadow-xs uppercase tracking-wider"
                  >
                    {{ item.leave?.leaveType || 'Official Leave' }}
                  </span>
                </td>

                <!-- Date Duration -->
                <td class="px-6 py-4 text-right">
                  <div class="text-sm font-bold text-slate-800">
                    {{ formatDate(item.leave?.start_date) }} - {{ formatDate(item.leave?.end_date) }}
                  </div>
                  <div class="text-[11px] text-slate-400 font-semibold mt-0.5">
                    {{ item.leave?.no_of_days || 0 }} day{{ item.leave?.no_of_days === 1 ? '' : 's' }} total
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div v-if="leaves.length > 0" class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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

    </div>
  </MainLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import MainLayout from '../../layouts/MainLayout.vue'
import { useLeaveStore } from '../../stores/leave'

const store = useLeaveStore()

const {
  leaves,
  offices,
  loading,
  selectedOfficeId,
  searchQuery,
  pagination
} = storeToRefs(store)

const paginationRange = computed(() => {
  if (pagination.value.total === 0) return { from: 0, to: 0 }
  const from = (pagination.value.page - 1) * pagination.value.limit + 1
  const to = Math.min(pagination.value.page * pagination.value.limit, pagination.value.total)
  return { from, to }
})

const fetchLeaves = () => store.fetchLeaves()
const setOffice = (id) => store.setOffice(id)
const handleSearch = () => store.handleSearch()
const changePage = (newPage) => store.changePage(newPage)

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchLeaves()
})
</script>
