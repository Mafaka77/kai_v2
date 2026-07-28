<template>
  <MainLayout>
    <div class="space-y-8">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Attendance Reports</h1>
          <p class="text-slate-500 mt-1 text-sm">
            Generate and download office-wide attendance logs for customs and payroll processing.
          </p>
        </div>
      </div>

      <!-- Report Generator Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-800">Generate New Report</h2>
              <p class="text-xs text-slate-400">Specify placement office and date range parameters (max 90 days).</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="reportStore.generateReport(toast)" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <!-- Office Dropdown -->
          <div>
            <label class="block font-semibold text-slate-700 text-xs mb-1.5">Target Office *</label>
            <select 
              v-model="reportStore.form.office_id" 
              required
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-medium"
            >
              <option value="" disabled>Select Office...</option>
              <option v-for="office in reportStore.offices" :key="office.id" :value="office.id">
                {{ office.name || office.label }}
              </option>
            </select>
          </div>

          <!-- From Date -->
          <div>
            <label class="block font-semibold text-slate-700 text-xs mb-1.5">From Date *</label>
            <input 
              v-model="reportStore.form.fromDate" 
              type="date" 
              required 
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-medium"
            />
          </div>

          <!-- To Date -->
          <div>
            <label class="block font-semibold text-slate-700 text-xs mb-1.5">To Date *</label>
            <input 
              v-model="reportStore.form.toDate" 
              type="date" 
              required 
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-medium"
            />
          </div>

          <!-- Submit Button -->
          <div>
            <button 
              type="submit" 
              :disabled="reportStore.generating"
              class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg v-if="reportStore.generating" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{{ reportStore.generating ? 'Processing...' : 'Generate Spreadsheet' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Generated Reports List Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        <div class="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Historical Generated Reports</h3>
          <button @click="reportStore.fetchReports()" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <!-- Loading -->
        <div v-if="reportStore.loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium mt-4">Fetching generated reports...</span>
        </div>

        <!-- Empty -->
        <div v-else-if="reportStore.reports.length === 0" class="p-6 text-center text-slate-500 py-24">
          <svg class="w-16 h-16 mx-auto text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-slate-900 font-bold text-lg">No Generated Reports Yet</p>
          <p class="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Use the form above to compile and download your first office attendance spreadsheet.
          </p>
        </div>

        <!-- Data Table -->
        <div v-else>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Report Description</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Generated Date</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider text-center">Status</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr 
                  v-for="report in reportStore.reports" 
                  :key="report.id"
                  class="hover:bg-slate-50/50 transition-colors group"
                >
                  <!-- Report Title / Description -->
                  <td class="px-6 py-4">
                    <div class="font-bold text-slate-900 text-sm">{{ report.title }}</div>
                    <div class="text-slate-400 text-xs mt-0.5">{{ report.description || 'No description' }}</div>
                  </td>

                  <!-- Date -->
                  <td class="px-6 py-4 text-xs font-medium text-slate-600">
                    {{ reportStore.formatDate(report.createdAt) }}
                  </td>

                  <!-- Status Badge -->
                  <td class="px-6 py-4 text-center">
                    <span 
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs"
                      :class="[
                        report.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        report.status === 'Failed'    ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-200'
                      ]"
                    >
                      <span 
                        class="w-1.5 h-1.5 rounded-full" 
                        :class="report.status === 'Completed' ? 'bg-emerald-500' : report.status === 'Failed' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'"
                      ></span>
                      {{ report.status || 'Completed' }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">

                      <!-- Download — hidden when Failed -->
                      <button
                        v-if="report.status !== 'Failed'"
                        @click="reportStore.downloadReport(report, toast)"
                        :disabled="report.status === 'Processing'"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="report.status === 'Processing' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                        :title="report.status === 'Processing' ? 'Still processing...' : 'Download Excel Spreadsheet (.xlsx)'"
                      >
                        <svg v-if="report.status === 'Processing'" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{{ report.status === 'Processing' ? 'Processing...' : 'Download .xlsx' }}</span>
                      </button>

                      <!-- Failed label — shown instead of download when Failed -->
                      <span
                        v-if="report.status === 'Failed'"
                        class="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Generation failed
                      </span>

                      <!-- Delete -->
                      <button
                        @click="reportStore.deleteReport(report.id, toast)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        title="Delete this report record and file"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>

                    </div>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs text-slate-500">
              Showing <span class="font-bold text-slate-700">{{ reportStore.paginationRange.from }}</span> to 
              <span class="font-bold text-slate-700">{{ reportStore.paginationRange.to }}</span> of 
              <span class="font-bold text-slate-700">{{ reportStore.pagination.total }}</span> reports
            </div>

            <div class="flex items-center gap-2">
              <button 
                @click="reportStore.changePage(reportStore.pagination.page - 1)"
                :disabled="!reportStore.pagination.hasPrevPage"
                class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>

              <span class="text-xs font-bold text-slate-600 px-2">
                Page {{ reportStore.pagination.page }} of {{ reportStore.pagination.totalPages || 1 }}
              </span>

              <button 
                @click="reportStore.changePage(reportStore.pagination.page + 1)"
                :disabled="!reportStore.pagination.hasNextPage"
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

    </div>
  </MainLayout>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'
import { useReportStore } from '../../stores/report'
import { useNotificationStore } from '../../stores/notification'

const toast = useNotificationStore()
const reportStore = useReportStore()

onMounted(() => {
  reportStore.fetchReports()
})

onUnmounted(() => {
  reportStore.stopPolling()
})
</script>
