<template>
  <MainLayout>
    <div class="space-y-6">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Attendance Appeals</h1>
          <p class="text-slate-500 mt-1 text-sm">Submit late reason, left early, or tour/on-duty appeals and view your submission history.</p>
        </div>

        <button 
          @click="openModal" 
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all self-start sm:self-auto cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Submit On Duty Appeal</span>
        </button>
      </div>

      <!-- Main Container Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        <!-- Category Tab Filter -->
        <div class="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between gap-4">
          <PillTabs :tabs="typeTabs" :modelValue="currentType" @update:modelValue="setTab" />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg class="animate-spin h-10 w-10 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Loading your appeals...</span>
        </div>

        <!-- Empty -->
        <div v-else-if="appeals.length === 0" class="py-24 text-center text-slate-400">
          <svg class="w-16 h-16 mx-auto text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-slate-900 font-bold text-lg">No Appeals Submitted</p>
          <p class="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            You have not submitted any appeals in this category yet.
          </p>
        </div>

        <!-- Table -->
        <div v-else>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Office</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Dates / Time</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Reason</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Submitted On</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="appeal in appeals" :key="appeal.id" class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4 text-sm font-medium text-slate-700">
                    {{ appeal.Office?.name || '—' }}
                  </td>
                  <td class="px-6 py-4 text-xs font-semibold text-slate-800">
                    <template v-if="appeal.type === 'on_Duty'">
                      {{ formatDate(appeal.start_date) }} — {{ formatDate(appeal.end_date) }}
                    </template>
                    <template v-else-if="appeal.type === 'late_reason'">
                      <div>{{ formatDate(appeal.start_date) }}</div>
                      <div class="text-amber-600 font-bold text-[11px] mt-0.5">{{ appeal.signin_time || '—' }}</div>
                    </template>
                    <template v-else>
                      {{ formatDate(appeal.start_date) }}
                    </template>
                  </td>
                  <td class="px-6 py-4 text-xs text-slate-600 italic max-w-xs truncate" :title="appeal.reason">
                    "{{ appeal.reason || 'No description provided.' }}"
                  </td>
                  <td class="px-6 py-4 text-xs text-slate-500 font-medium">
                    {{ formatDate(appeal.createdAt) }}
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs" :class="statusBadge(appeal.status)">
                      <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(appeal.status)"></span>
                      {{ appeal.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs text-slate-500">
              Showing <span class="font-bold text-slate-700">{{ paginationRange.from }}</span> to
              <span class="font-bold text-slate-700">{{ paginationRange.to }}</span> of
              <span class="font-bold text-slate-700">{{ pagination.total }}</span> appeals
            </div>
            <div class="flex items-center gap-2">
              <button @click="changePage(pagination.page - 1)" :disabled="!pagination.hasPrevPage"
                class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                Previous
              </button>
              <span class="text-xs font-bold text-slate-600 px-2">Page {{ pagination.page }} of {{ pagination.totalPages || 1 }}</span>
              <button @click="changePage(pagination.page + 1)" :disabled="!pagination.hasNextPage"
                class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed">
                Next
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- New On-Duty Appeal Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-base font-bold text-slate-900">Submit On Duty (Tour) Appeal</h3>
              <p class="text-xs text-slate-400 mt-0.5">Request authorization for official duty / tour attendance.</p>
            </div>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form @submit.prevent="submitAppeal" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 text-xs mb-1.5">Start Date *</label>
                <input v-model="form.start_date" type="date" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 text-xs mb-1.5">End Date *</label>
                <input v-model="form.end_date" type="date" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 text-xs mb-1.5">Reason Description *</label>
              <textarea v-model="form.reason" rows="3" required placeholder="Explain why you are submitting this appeal..." class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 resize-none"></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" @click="closeModal" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer">Cancel</button>
              <button type="submit" :disabled="submitting" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50">
                {{ submitting ? 'Submitting...' : 'Submit Appeal' }}
              </button>
            </div>
          </form>
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
import { useAttendanceAppealStore } from '../../stores/attendanceAppeal'

const store = useAttendanceAppealStore()

const {
  appeals,
  currentType,
  loading,
  submitting,
  showModal,
  form,
  pagination
} = storeToRefs(store)

const typeTabs = [
  { value: 'late_reason', label: 'Late Reason' },
  { value: 'left_early',  label: 'Left Early' },
  { value: 'on_Duty',     label: 'On Duty (Tour)' }
]

const paginationRange = computed(() => {
  if (pagination.value.total === 0) return { from: 0, to: 0 }
  const from = (pagination.value.page - 1) * pagination.value.limit + 1
  const to = Math.min(pagination.value.page * pagination.value.limit, pagination.value.total)
  return { from, to }
})

const statusBadge = (s) => ({
  Submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  Approved:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected:  'bg-rose-50 text-rose-700 border-rose-200',
}[s] || 'bg-slate-100 text-slate-600 border-slate-200')

const statusDot = (s) => ({
  Submitted: 'bg-amber-500 animate-pulse',
  Approved:  'bg-emerald-500',
  Rejected:  'bg-rose-500',
}[s] || 'bg-slate-400')

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—'

const setTab = (val) => store.setTab(val)
const submitAppeal = () => store.submitAppeal()
const changePage = (newPage) => store.changePage(newPage)
const openModal = () => store.openModal()
const closeModal = () => store.closeModal()

onMounted(() => {
  store.fetchMyAppeals()
})
</script>
