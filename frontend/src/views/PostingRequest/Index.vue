<template>
  <MainLayout>
    <div class="space-y-8">

      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Office Change Requests</h1>
        <p class="text-slate-500 mt-1 text-sm">
          Review, approve, or reject employee posting-transfer requests for your assigned offices.
        </p>
      </div>

      <!-- Status Tab Filter -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

        <div class="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          <!-- Status Tabs -->
          <div class="flex items-center gap-2">
            <button
              v-for="tab in statusTabs"
              :key="tab.value"
              @click="setStatus(tab.value)"
              :class="[
                'px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2',
                currentStatus === tab.value
                  ? tab.activeClass
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              ]"
            >
              <span class="w-2 h-2 rounded-full" :class="tab.dotClass"></span>
              {{ tab.label }}
              <span
                v-if="tab.value === 'Submitted' && pendingCount > 0"
                class="ml-0.5 inline-flex items-center justify-center w-4 h-4 bg-white/30 text-white text-[10px] font-black rounded-full"
              >
                {{ pendingCount > 9 ? '9+' : pendingCount }}
              </span>
            </button>
          </div>

          <button @click="fetchRequests" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer self-end sm:self-auto">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg class="animate-spin h-10 w-10 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Loading requests...</span>
        </div>

        <!-- Empty -->
        <div v-else-if="requests.length === 0" class="py-24 text-center text-slate-400">
          <svg class="w-16 h-16 mx-auto text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <p class="text-slate-900 font-bold text-lg">No {{ currentStatus }} Requests</p>
          <p class="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            No office change requests with this status for your assigned offices.
          </p>
        </div>

        <!-- Table -->
        <div v-else >
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Employee</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Current Offices</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Requested Office</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Submitted</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider text-center">Status</th>
                  <th v-if="currentStatus === 'Submitted'" class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="req in requests"
                  :key="req.id"
                  class="hover:bg-slate-50/50 transition-colors"
                >
                  <!-- Employee -->
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 font-black text-sm flex items-center justify-center border border-indigo-100 flex-shrink-0">
                        {{ req.User?.full_name?.charAt(0)?.toUpperCase() || 'U' }}
                      </div>
                      <div>
                        <div class="font-bold text-slate-900 text-sm">{{ req.User?.full_name || '—' }}</div>
                        <div class="text-slate-400 text-xs mt-0.5">{{ req.User?.designation || 'Staff' }} · {{ req.User?.employee_no || '—' }}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Current Offices -->
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1.5">
                      <span
                        v-for="office in (req.User?.Offices || [])"
                        :key="office.id"
                        class="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-lg border border-slate-200"
                      >{{ office.name }}</span>
                      <span v-if="!req.User?.Offices?.length" class="text-slate-400 text-xs italic">Unknown</span>
                    </div>
                  </td>

                  <!-- Requested (Target) Office -->
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-lg">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      {{ req.Office?.name || '—' }}
                    </span>
                  </td>

                  <!-- Date -->
                  <td class="px-6 py-4 text-xs text-slate-500 font-medium">
                    {{ formatDate(req.createdAt) }}
                  </td>

                  <!-- Status Badge -->
                  <td class="px-6 py-4 text-center">
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                      :class="statusBadge(req.status)"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(req.status)"></span>
                      {{ req.status }}
                    </span>
                  </td>

                  <!-- Actions (Submitted only) -->
                  <td v-if="currentStatus === 'Submitted'" class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="handleApprove(req.id)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </button>
                      <button
                        @click="openRejectModal(req)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
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
              Showing <span class="font-bold text-slate-700">{{ paginationRange.from }}</span> to
              <span class="font-bold text-slate-700">{{ paginationRange.to }}</span> of
              <span class="font-bold text-slate-700">{{ pagination.total }}</span> requests
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

      <!-- Reject Modal -->
      <div v-if="rejectTarget" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-base font-bold text-slate-900">Reject Request</h3>
            <button @click="rejectTarget = null" class="text-slate-400 hover:text-slate-600 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p class="text-xs text-slate-500">
            Rejecting office change request from
            <span class="font-bold text-slate-800">{{ rejectTarget.User?.full_name }}</span>
            to <span class="font-bold text-slate-800">{{ rejectTarget.Office?.name }}</span>.
          </p>
          <div>
            <label class="block font-semibold text-slate-700 text-xs mb-1.5">Rejection Remark (optional)</label>
            <textarea
              v-model="rejectRemark"
              rows="3"
              placeholder="Reason for rejection..."
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 resize-none"
            ></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button @click="rejectTarget = null" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer">Cancel</button>
            <button @click="handleReject" :disabled="rejecting" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50">
              {{ rejecting ? 'Rejecting...' : 'Confirm Reject' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import MainLayout from '../../layouts/MainLayout.vue'
import { usePostingRequestStore } from '../../stores/postingRequest'
import { useNotificationStore } from '../../stores/notification'
import { useDialogStore } from '../../stores/dialog'

const toast = useNotificationStore()
const dialog = useDialogStore()
const store = usePostingRequestStore()

const {
  requests,
  loading,
  currentStatus,
  pendingCount,
  rejectTarget,
  rejectRemark,
  rejecting,
  pagination
} = storeToRefs(store)

const statusTabs = [
  { value: 'Submitted', label: 'Pending',  activeClass: 'bg-amber-500 text-white shadow-md shadow-amber-100',   dotClass: 'bg-amber-200' },
  { value: 'Approved',  label: 'Approved', activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-100', dotClass: 'bg-emerald-200' },
  { value: 'Rejected',  label: 'Rejected', activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-100',       dotClass: 'bg-rose-200' },
]

const paginationRange = computed(() => {
  if (pagination.value.total === 0) return { from: 0, to: 0 }
  const from = (pagination.value.page - 1) * pagination.value.limit + 1
  const to   = Math.min(pagination.value.page * pagination.value.limit, pagination.value.total)
  return { from, to }
})

const fetchRequests = () => store.fetchRequests()
const fetchPendingCount = () => store.fetchPendingCount()
const setStatus = (val) => store.setStatus(val)
const changePage = (newPage) => store.changePage(newPage)
const handleApprove = async (id) => {
  const ok = await dialog.confirm({
    title: 'Approve Transfer Request',
    message: 'Are you sure you want to approve this office change request? The employee will be reassigned to the new office.',
    type: 'info',
    confirmText: 'Approve'
  })
  if (ok) store.handleApprove(id, toast)
}
const openRejectModal = (req) => store.openRejectModal(req)
const handleReject = () => store.handleReject(toast)

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
  ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—'

onMounted(async () => {
  await fetchRequests()
  await fetchPendingCount()
})
</script>
