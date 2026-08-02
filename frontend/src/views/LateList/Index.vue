<template>
  <MainLayout>
    <div class="space-y-8">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Late Attendance List</h1>
          <p class="text-slate-500 mt-1 text-sm">
            Employees flagged for 3 or more late check-ins during the current week.
          </p>
        </div>

        <button 
          @click="exportCsv" 
          :disabled="exporting"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <svg v-if="exporting" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export CSV</span>
        </button>
      </div>

      <!-- Main Container Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        <!-- Office Tabs & Search Filter Header -->
        <div class="p-6 border-b border-slate-100 bg-slate-50/30 space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <!-- Office Filter Tabs -->
            <PillTabs 
              :tabs="officeTabs" 
              :modelValue="selectedOffice" 
              @update:modelValue="setOffice" 
            />

            <!-- Search Field -->
            <div class="relative w-full lg:w-80">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                v-model="searchQuery"
                @input="setSearch(searchQuery)"
                type="text" 
                placeholder="Search employee name..." 
                class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>

          </div>
        </div>

        <!-- Loading View -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg class="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Scanning weekly late logs...</span>
        </div>

        <!-- Empty View -->
        <div v-else-if="users.length === 0" class="p-6 text-center text-slate-500 py-24">
          <div class="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
    
          <p class="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            No employees have accumulated 3 or more late check-ins for the selected office in the current week.
          </p>
        </div>

        <!-- Data Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Employee</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Mobile</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Office Placement</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider text-center">Tardy Record (This Week)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="user in users" 
                :key="user.id"
                class="hover:bg-slate-50/50 transition-colors group"
              >
                <!-- Employee -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-50 flex-shrink-0 flex items-center justify-center text-amber-600 font-bold text-sm group-hover:bg-amber-100 transition-colors border border-amber-200/50">
                      {{ user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U' }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-900 text-sm">{{ user.full_name }}</div>
                      <div class="text-slate-400 text-xs mt-0.5">{{ user.designation || 'Staff Member' }}</div>
                    </div>
                  </div>
                </td>

                <!-- Mobile -->
                <td class="px-6 py-4 text-sm text-slate-600 font-medium">
                  {{ user.mobile || '-' }}
                </td>

                <!-- Office Placement Badges -->
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1.5">
                    <span 
                      v-for="office in user.Offices" 
                      :key="office.id"
                      class="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold text-[11px] rounded-lg border border-slate-200/60"
                    >
                      {{ office.name }}
                    </span>
                  </div>
                </td>

                <!-- Late Count Badge -->
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200/80 text-rose-700 font-extrabold text-xs rounded-xl shadow-xs">
                    <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    {{ user.late_days }} Days Late
                  </span>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div v-if="users.length > 0" class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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
import MainLayout from '../../layouts/MainLayout.vue'
import PillTabs from '../../components/PillTabs.vue'
import { useLateListStore } from '../../stores/lateList'

const store = useLateListStore()

const {
  users,
  offices,
  selectedOffice,
  searchQuery,
  loading,
  exporting,
  pagination
} = storeToRefs(store)

const officeTabs = computed(() => {
  const tabs = [{ value: '', label: 'All Offices' }]
  offices.value.forEach(o => {
    tabs.push({ value: o.id.toString(), label: o.name })
  })
  return tabs
})

const paginationRange = computed(() => {
  if (pagination.value.total === 0) return { from: 0, to: 0 }
  const from = (pagination.value.page - 1) * pagination.value.limit + 1
  const to = Math.min(pagination.value.page * pagination.value.limit, pagination.value.total)
  return { from, to }
})

const setOffice = (val) => store.setOffice(val)
const setSearch = (val) => store.setSearch(val)
const changePage = (newPage) => store.changePage(newPage)
const exportCsv = () => store.exportCsv()

onMounted(() => {
  store.fetchList()
})
</script>
